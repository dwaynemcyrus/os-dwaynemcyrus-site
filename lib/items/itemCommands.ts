import { createItem, markItemTrashed } from "@/lib/db/itemRepository";
import { notifyItemsChanged } from "@/lib/items/itemEvents";
import {
  DEFAULT_ITEM_STATUS,
  DEFAULT_ITEM_TYPE,
  DEFAULT_SYNC_STATE,
  LOCAL_USER_ID,
  type CreateLocalItemInput,
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
    id: createItemId(),
    isTrashed: false,
    lastSyncedAt: null,
    needsRemoteCreate: true,
    needsRemoteUpdate: false,
    status: DEFAULT_ITEM_STATUS,
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

export function retryFailedSync() {
  return runSyncQueue("retry");
}
