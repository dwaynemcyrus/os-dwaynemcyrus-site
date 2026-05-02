import {
  createTypeRegistryEntry,
  deleteTypeRegistryEntry,
  getAllTypeRegistryEntries,
  renameTypeRegistryEntry,
  saveTypeRegistryEntry,
} from "@/lib/db/typeRegistryRepository";
import { notifyItemsChanged } from "@/lib/items/itemEvents";
import { LOCAL_USER_ID, type TypeRegistryKind } from "@/lib/items/itemTypes";
import { createSeedTypeRegistryEntries } from "@/lib/registry/typeRegistryModel";
import { getSessionUserId } from "@/lib/supabase/auth";
import { runSyncQueue } from "@/lib/sync/syncQueue";

async function getRegistryUserId() {
  return (await getSessionUserId()) ?? LOCAL_USER_ID;
}

export async function ensureSeedTypeRegistry() {
  const userId = await getRegistryUserId();
  const existingEntries = await getAllTypeRegistryEntries();
  const seedEntries = createSeedTypeRegistryEntries({
    existingEntries,
    userId,
  });

  for (const entry of seedEntries) {
    await saveTypeRegistryEntry(entry);
  }

  if (seedEntries.length > 0) {
    notifyItemsChanged();
    void runSyncQueue("type-registry");
  }
}

export async function addTypeRegistryEntry(kind: TypeRegistryKind, name: string) {
  const entry = await createTypeRegistryEntry({
    kind,
    name,
    userId: await getRegistryUserId(),
  });

  notifyItemsChanged();
  void runSyncQueue("type-registry");

  return entry;
}

export async function renameTypeRegistry(id: string, kind: TypeRegistryKind, name: string) {
  await renameTypeRegistryEntry({ id, kind, name });
  notifyItemsChanged();
  void runSyncQueue("type-registry");
}

export async function deleteTypeRegistry(
  id: string,
  kind: TypeRegistryKind,
  reassignmentName?: string,
) {
  await deleteTypeRegistryEntry({ id, kind, reassignmentName });
  notifyItemsChanged();
  void runSyncQueue("type-registry");
}
