import {
  createItem,
  getItemById,
  markItemPendingRemoteDelete,
  markItemTrashed,
  removeItem,
  updateItem,
} from "@/lib/db/itemRepository";
import { notifyItemsChanged } from "@/lib/items/itemEvents";
import {
  DEFAULT_ITEM_STATUS,
  DEFAULT_ITEM_TYPE,
  DEFAULT_ITEM_KIND,
  DEFAULT_SYNC_STATE,
  LOCAL_USER_ID,
  type CreateLocalItemInput,
  type ItemKind,
  type ItemMetadata,
  type ItemStatus,
} from "@/lib/items/itemTypes";
import { parseWritingDocumentForSave } from "@/lib/writing/documentModel";
import { getSessionUserId } from "@/lib/supabase/auth";
import { runSyncQueue } from "@/lib/sync/syncQueue";
import { createTimestamp } from "@/lib/utils/datetime";
import { normalizeCaptureContent } from "@/lib/utils/guards";
import { createItemId } from "@/lib/utils/ids";

export async function createCapturedItem({ content }: CreateLocalItemInput) {
  const timestamp = createTimestamp();
  const userId = (await getSessionUserId()) ?? LOCAL_USER_ID;

  const item = await createItem({
    archivedAt: null,
    completedAt: null,
    content: normalizeCaptureContent(content),
    createdAt: timestamp,
    delegatedTo: null,
    deviceCreatedAt: timestamp,
    deviceUpdatedAt: timestamp,
    documentFrontmatter: null,
    endAt: null,
    id: createItemId(),
    incubatedAt: null,
    isArchived: false,
    isTrashed: false,
    kind: DEFAULT_ITEM_KIND,
    lastSyncedAt: null,
    metadata: {},
    needsRemoteCreate: true,
    needsRemoteDelete: false,
    needsRemoteUpdate: false,
    parentId: null,
    startAt: null,
    status: DEFAULT_ITEM_STATUS,
    subtype: null,
    syncErrorMessage: null,
    syncState: DEFAULT_SYNC_STATE,
    trashedAt: null,
    type: DEFAULT_ITEM_TYPE,
    updatedAt: timestamp,
    userId,
    waitingReason: null,
  });

  notifyItemsChanged();
  void runSyncQueue("capture");

  return item;
}

export async function trashItem(id: string) {
  const item = await markItemTrashed(id, createTimestamp());

  notifyItemsChanged();
  void runSyncQueue("trash");

  return item;
}

export async function hardDeleteItem(id: string) {
  const item = await getItemById(id);

  if (!item) {
    throw new Error("The item was not found.");
  }

  if (!item.isTrashed) {
    throw new Error("Only trashed items can be deleted permanently.");
  }

  if (item.needsRemoteCreate && !item.lastSyncedAt) {
    await removeItem(id);
    notifyItemsChanged();
    return;
  }

  await markItemPendingRemoteDelete(id, createTimestamp());

  notifyItemsChanged();
  void runSyncQueue("delete");
}

export type ProcessingOutcome = {
  content: string;
  delegatedTo?: string | null;
  decision:
    | "completed-task"
    | "creation"
    | "dated-task"
    | "delegated-task"
    | "habit"
    | "incubate"
    | "project"
    | "reference"
    | "task"
    | "trash"
    | "waiting-task";
  endAt?: string | null;
  id: string;
  metadata?: ItemMetadata;
  startAt?: string | null;
  status?: ItemStatus;
  type?: string | null;
  waitingReason?: string | null;
};

function getMutationSyncFlags(item: Awaited<ReturnType<typeof getItemById>>) {
  if (!item) {
    throw new Error("The item was not found.");
  }

  if (item.needsRemoteCreate) {
    return {
      needsRemoteCreate: true,
      needsRemoteUpdate: false,
    };
  }

  return {
    needsRemoteCreate: false,
    needsRemoteUpdate: true,
  };
}

async function updateItemForProcessing(
  id: string,
  patch: Partial<{
    completedAt: string | null;
    content: string;
    delegatedTo: string | null;
    endAt: string | null;
    incubatedAt: string | null;
    isTrashed: boolean;
    kind: ItemKind;
    metadata: ItemMetadata;
    startAt: string | null;
    status: ItemStatus;
    trashedAt: string | null;
    type: string | null;
    waitingReason: string | null;
  }>,
) {
  const timestamp = createTimestamp();
  const item = await getItemById(id);
  const syncFlags = getMutationSyncFlags(item);

  const nextItem = await updateItem(id, {
    ...patch,
    ...syncFlags,
    needsRemoteDelete: false,
    syncErrorMessage: null,
    syncState: "pending_sync",
    updatedAt: timestamp,
  });

  notifyItemsChanged();
  void runSyncQueue("process");

  return nextItem;
}

export async function updateCaptureContent(id: string, content: string) {
  const normalizedContent = normalizeCaptureContent(content);

  return updateItemForProcessing(id, {
    content: normalizedContent,
  });
}

function assertProcessableCapture(item: Awaited<ReturnType<typeof getItemById>>) {
  if (!item) {
    throw new Error("The item was not found.");
  }

  if (item.kind !== "capture" || item.isTrashed || item.needsRemoteDelete) {
    throw new Error("This item was processed elsewhere.");
  }
}

export async function processInboxItem(outcome: ProcessingOutcome) {
  const {
    content,
    decision,
    delegatedTo,
    endAt,
    id,
    metadata,
    startAt,
    type,
    waitingReason,
  } = outcome;
  const normalizedContent = normalizeCaptureContent(content);
  const currentItem = await getItemById(id);
  assertProcessableCapture(currentItem);
  const timestamp = createTimestamp();

  if (decision === "trash") {
    return updateItemForProcessing(id, {
      content: normalizedContent,
      isTrashed: true,
      trashedAt: timestamp,
    });
  }

  if (decision === "incubate") {
    return updateItemForProcessing(id, {
      content: normalizedContent,
      incubatedAt: timestamp,
      status: "incubate",
    });
  }

  if (decision === "habit") {
    return updateItemForProcessing(id, {
      content: normalizedContent,
      endAt: endAt ?? null,
      kind: "action",
      metadata: metadata ?? {},
      startAt: startAt ?? null,
      status: "later",
      type: "habit",
    });
  }

  if (decision === "project") {
    return updateItemForProcessing(id, {
      content: normalizedContent,
      endAt: endAt ?? null,
      kind: "action",
      startAt: startAt ?? null,
      status: waitingReason ? "waiting" : "later",
      type: "project",
      waitingReason: waitingReason ?? null,
    });
  }

  if (decision === "completed-task") {
    return updateItemForProcessing(id, {
      completedAt: timestamp,
      content: normalizedContent,
      kind: "action",
      status: "complete",
      type: "task",
    });
  }

  if (decision === "delegated-task") {
    return updateItemForProcessing(id, {
      content: normalizedContent,
      delegatedTo: delegatedTo ?? "",
      kind: "action",
      status: "waiting",
      type: "task",
    });
  }

  if (decision === "waiting-task") {
    return updateItemForProcessing(id, {
      content: normalizedContent,
      kind: "action",
      status: "waiting",
      type: "task",
      waitingReason: waitingReason ?? "",
    });
  }

  if (decision === "dated-task") {
    return updateItemForProcessing(id, {
      content: normalizedContent,
      endAt: endAt ?? null,
      kind: "action",
      startAt: startAt ?? null,
      status: "later",
      type: "task",
    });
  }

  if (decision === "task") {
    return updateItemForProcessing(id, {
      content: normalizedContent,
      kind: "action",
      status: "later",
      type: "task",
    });
  }

  if (decision === "reference") {
    if (!type) {
      throw new Error("Choose a reference type.");
    }

    return updateItemForProcessing(id, {
      content: normalizedContent,
      kind: "reference",
      status: "later",
      type,
    });
  }

  if (decision === "creation") {
    if (!type) {
      throw new Error("Choose a creation type.");
    }

    return updateItemForProcessing(id, {
      content: normalizedContent,
      endAt: endAt ?? null,
      kind: "creation",
      startAt: startAt ?? null,
      status: waitingReason ? "waiting" : "later",
      type,
      waitingReason: waitingReason ?? null,
    });
  }

  throw new Error("Unsupported processing decision.");
}

export function retryFailedSync() {
  return runSyncQueue("retry");
}

export async function saveWritingDocument(
  id: string,
  rawDocument: string,
) {
  const item = await getItemById(id);

  if (!item) {
    throw new Error("The item was not found.");
  }

  const parsed = parseWritingDocumentForSave(rawDocument);
  const timestamp = createTimestamp();
  const syncFlags = getMutationSyncFlags(item);

  const nextItem = await updateItem(id, {
    content: parsed.content,
    deviceUpdatedAt: timestamp,
    documentFrontmatter: parsed.documentFrontmatter,
    endAt: parsed.os.endAt,
    kind: parsed.os.kind,
    startAt: parsed.os.startAt,
    status: parsed.os.status,
    subtype: parsed.os.subtype,
    syncErrorMessage: null,
    syncState: "pending_sync",
    type: parsed.os.type,
    updatedAt: timestamp,
    ...syncFlags,
  });

  notifyItemsChanged();
  void runSyncQueue("process");

  return nextItem;
}
