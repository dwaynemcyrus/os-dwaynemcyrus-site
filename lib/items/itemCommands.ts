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
  DEFAULT_SYNC_STATE,
  LOCAL_USER_ID,
  type CreateLocalItemInput,
  type ItemStatus,
  type ItemSubtype,
  type ItemType,
} from "@/lib/items/itemTypes";
import { getSessionUserId } from "@/lib/supabase/auth";
import { runSyncQueue } from "@/lib/sync/syncQueue";
import { createTimestamp } from "@/lib/utils/datetime";
import { normalizeCaptureContent } from "@/lib/utils/guards";
import { createItemId } from "@/lib/utils/ids";

export async function createCapturedItem({ content }: CreateLocalItemInput) {
  const timestamp = createTimestamp();
  const userId = (await getSessionUserId()) ?? LOCAL_USER_ID;

  const item = await createItem({
    content: normalizeCaptureContent(content),
    createdAt: timestamp,
    deviceCreatedAt: timestamp,
    deviceUpdatedAt: timestamp,
    endAt: null,
    id: createItemId(),
    isTrashed: false,
    lastSyncedAt: null,
    needsRemoteCreate: true,
    needsRemoteDelete: false,
    needsRemoteUpdate: false,
    startAt: null,
    status: DEFAULT_ITEM_STATUS,
    subtype: null,
    syncErrorMessage: null,
    syncState: DEFAULT_SYNC_STATE,
    trashedAt: null,
    type: DEFAULT_ITEM_TYPE,
    updatedAt: timestamp,
    userId,
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
  decision: "incubate" | "media" | "project" | "reference" | "task" | "trash";
  endAt?: string | null;
  id: string;
  nextActionContent?: string;
  startAt?: string | null;
  status?: ItemStatus;
  subtype?: ItemSubtype | null;
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
  patch: {
    content: string;
    endAt?: string | null;
    isTrashed: boolean;
    startAt?: string | null;
    status?: ItemStatus;
    subtype?: ItemSubtype | null;
    trashedAt: string | null;
    type?: ItemType;
  },
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

export async function processInboxItem(outcome: ProcessingOutcome) {
  const { content, decision, endAt, id, nextActionContent, startAt, status, subtype } = outcome;
  const normalizedContent = normalizeCaptureContent(content);

  if (decision === "trash") {
    return updateItemForProcessing(id, {
      content: normalizedContent,
      isTrashed: true,
      trashedAt: createTimestamp(),
    });
  }

  if (decision === "task") {
    return updateItemForProcessing(id, {
      content: normalizedContent,
      endAt: endAt ?? null,
      isTrashed: false,
      startAt: startAt ?? null,
      status: status ?? DEFAULT_ITEM_STATUS,
      trashedAt: null,
      type: "task",
    });
  }

  if (decision === "project") {
    const result = await updateItemForProcessing(id, {
      content: normalizedContent,
      isTrashed: false,
      trashedAt: null,
      type: "project",
    });

    if (nextActionContent && nextActionContent.trim().length > 0) {
      const timestamp = createTimestamp();
      const userId = (await getSessionUserId()) ?? LOCAL_USER_ID;

      await createItem({
        content: normalizeCaptureContent(nextActionContent),
        createdAt: timestamp,
        deviceCreatedAt: timestamp,
        deviceUpdatedAt: timestamp,
        endAt: null,
        id: createItemId(),
        isTrashed: false,
        lastSyncedAt: null,
        needsRemoteCreate: true,
        needsRemoteDelete: false,
        needsRemoteUpdate: false,
        startAt: null,
        status: DEFAULT_ITEM_STATUS,
        subtype: null,
        syncErrorMessage: null,
        syncState: DEFAULT_SYNC_STATE,
        trashedAt: null,
        type: "task",
        updatedAt: timestamp,
        userId,
      });

      notifyItemsChanged();
      void runSyncQueue("process");
    }

    return result;
  }

  if (decision === "reference") {
    return updateItemForProcessing(id, {
      content: normalizedContent,
      isTrashed: false,
      subtype: subtype ?? null,
      trashedAt: null,
      type: "reference",
    });
  }

  if (decision === "media") {
    return updateItemForProcessing(id, {
      content: normalizedContent,
      isTrashed: false,
      subtype: subtype ?? null,
      trashedAt: null,
      type: "media",
    });
  }

  // incubate
  return updateItemForProcessing(id, {
    content: normalizedContent,
    isTrashed: false,
    trashedAt: null,
    type: "incubate",
  });
}

export function retryFailedSync() {
  return runSyncQueue("retry");
}
