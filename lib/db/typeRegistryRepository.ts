import {
  ITEM_STORE_NAME,
  TYPE_REGISTRY_STORE_NAME,
  getDatabase,
} from "@/lib/db/indexedDb";
import type {
  LocalItem,
  LocalTypeRegistryEntry,
  SyncState,
  TypeRegistryKind,
} from "@/lib/items/itemTypes";
import {
  sortTypeRegistryEntries,
  validateTypeRegistryName,
} from "@/lib/registry/typeRegistryModel";
import { createTimestamp } from "@/lib/utils/datetime";
import { createItemId } from "@/lib/utils/ids";

export async function getAllTypeRegistryEntries() {
  const database = await getDatabase();
  const entries = await database.getAll(TYPE_REGISTRY_STORE_NAME);
  return sortTypeRegistryEntries(entries);
}

export async function getTypeRegistryEntriesByKind(kind: TypeRegistryKind) {
  const database = await getDatabase();
  const entries = await database.getAllFromIndex(
    TYPE_REGISTRY_STORE_NAME,
    "by-kind",
    kind,
  );

  return sortTypeRegistryEntries(
    entries.filter((entry) => !entry.needsRemoteDelete),
  );
}

export async function saveTypeRegistryEntry(entry: LocalTypeRegistryEntry) {
  const database = await getDatabase();
  await database.put(TYPE_REGISTRY_STORE_NAME, entry);
  return entry;
}

export async function removeTypeRegistryEntry(id: string) {
  const database = await getDatabase();
  await database.delete(TYPE_REGISTRY_STORE_NAME, id);
}

export async function getTypeRegistryEntriesBySyncState(syncState: SyncState) {
  const database = await getDatabase();
  return database.getAllFromIndex(
    TYPE_REGISTRY_STORE_NAME,
    "by-sync-state",
    syncState,
  );
}

export async function setTypeRegistryEntrySynced(
  id: string,
  syncedAt: string,
  userId: string,
) {
  const database = await getDatabase();
  const entry = await database.get(TYPE_REGISTRY_STORE_NAME, id);

  if (!entry) {
    return;
  }

  await database.put(TYPE_REGISTRY_STORE_NAME, {
    ...entry,
    lastSyncedAt: syncedAt,
    needsRemoteCreate: false,
    needsRemoteDelete: false,
    needsRemoteUpdate: false,
    syncErrorMessage: null,
    syncState: "synced",
    userId,
  });
}

export async function setTypeRegistryEntrySyncError(id: string, message: string) {
  const database = await getDatabase();
  const entry = await database.get(TYPE_REGISTRY_STORE_NAME, id);

  if (!entry) {
    return;
  }

  await database.put(TYPE_REGISTRY_STORE_NAME, {
    ...entry,
    syncErrorMessage: message,
    syncState: "sync_error",
  });
}

function getMutationSyncFlags(entry: LocalTypeRegistryEntry) {
  if (entry.needsRemoteCreate) {
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

function getEntriesForKind(
  entries: LocalTypeRegistryEntry[],
  kind: TypeRegistryKind,
) {
  return entries.filter((entry) => entry.kind === kind && !entry.needsRemoteDelete);
}

export async function createTypeRegistryEntry(input: {
  kind: TypeRegistryKind;
  name: string;
  userId: string;
}) {
  const database = await getDatabase();
  const entries = await database.getAll(TYPE_REGISTRY_STORE_NAME);
  const name = validateTypeRegistryName({
    existingNames: getEntriesForKind(entries, input.kind).map((entry) => entry.name),
    name: input.name,
  });
  const timestamp = createTimestamp();
  const entry: LocalTypeRegistryEntry = {
    createdAt: timestamp,
    id: createItemId(),
    kind: input.kind,
    lastSyncedAt: null,
    name,
    needsRemoteCreate: true,
    needsRemoteDelete: false,
    needsRemoteUpdate: false,
    syncErrorMessage: null,
    syncState: "pending_sync",
    updatedAt: timestamp,
    userId: input.userId,
  };

  await database.put(TYPE_REGISTRY_STORE_NAME, entry);
  return entry;
}

export async function renameTypeRegistryEntry(input: {
  id: string;
  kind: TypeRegistryKind;
  name: string;
}) {
  const database = await getDatabase();
  const transaction = database.transaction(
    [TYPE_REGISTRY_STORE_NAME, ITEM_STORE_NAME],
    "readwrite",
  );
  const typeStore = transaction.objectStore(TYPE_REGISTRY_STORE_NAME);
  const itemStore = transaction.objectStore(ITEM_STORE_NAME);
  const [entry, entries, items] = await Promise.all([
    typeStore.get(input.id),
    typeStore.getAll(),
    itemStore.getAll(),
  ]);

  if (!entry) {
    throw new Error("Type was not found.");
  }

  const name = validateTypeRegistryName({
    existingNames: getEntriesForKind(entries, input.kind).map((candidate) => candidate.name),
    name: input.name,
    originalName: entry.name,
  });
  const timestamp = createTimestamp();
  const syncFlags = getMutationSyncFlags(entry);

  await typeStore.put({
    ...entry,
    ...syncFlags,
    name,
    syncErrorMessage: null,
    syncState: "pending_sync",
    updatedAt: timestamp,
  });

  await Promise.all(
    items
      .filter((item) => item.kind === input.kind && item.type === entry.name)
      .map((item) =>
        itemStore.put({
          ...item,
          needsRemoteUpdate: !item.needsRemoteCreate,
          syncErrorMessage: null,
          syncState: "pending_sync",
          type: name,
          updatedAt: timestamp,
        } satisfies LocalItem),
      ),
  );

  await transaction.done;
}

export async function deleteTypeRegistryEntry(input: {
  id: string;
  kind: TypeRegistryKind;
  reassignmentName?: string;
}) {
  const database = await getDatabase();
  const transaction = database.transaction(
    [TYPE_REGISTRY_STORE_NAME, ITEM_STORE_NAME],
    "readwrite",
  );
  const typeStore = transaction.objectStore(TYPE_REGISTRY_STORE_NAME);
  const itemStore = transaction.objectStore(ITEM_STORE_NAME);
  const [entry, entries, items] = await Promise.all([
    typeStore.get(input.id),
    typeStore.getAll(),
    itemStore.getAll(),
  ]);

  if (!entry) {
    throw new Error("Type was not found.");
  }

  const affectedItems = items.filter(
    (item) =>
      item.kind === input.kind &&
      item.type === entry.name &&
      !item.isTrashed &&
      !item.needsRemoteDelete,
  );
  const timestamp = createTimestamp();

  if (affectedItems.length > 0) {
    if (!input.reassignmentName) {
      throw new Error("Choose a replacement type before deleting this type.");
    }

    if (
      input.reassignmentName.toLocaleLowerCase() === entry.name.toLocaleLowerCase()
    ) {
      throw new Error("Choose a different replacement type.");
    }

    const targetName = entries.some(
      (candidate) =>
        candidate.kind === input.kind &&
        candidate.name.toLocaleLowerCase() ===
          input.reassignmentName?.toLocaleLowerCase(),
    )
      ? input.reassignmentName
      : validateTypeRegistryName({
          existingNames: getEntriesForKind(entries, input.kind).map(
            (candidate) => candidate.name,
          ),
          name: input.reassignmentName,
        });

    const hasTarget = entries.some(
      (candidate) =>
        candidate.kind === input.kind &&
        candidate.name.toLocaleLowerCase() === targetName.toLocaleLowerCase(),
    );

    if (!hasTarget) {
      await typeStore.put({
        createdAt: timestamp,
        id: createItemId(),
        kind: input.kind,
        lastSyncedAt: null,
        name: targetName,
        needsRemoteCreate: true,
        needsRemoteDelete: false,
        needsRemoteUpdate: false,
        syncErrorMessage: null,
        syncState: "pending_sync",
        updatedAt: timestamp,
        userId: entry.userId,
      } satisfies LocalTypeRegistryEntry);
    }

    await Promise.all(
      affectedItems.map((item) =>
        itemStore.put({
          ...item,
          needsRemoteUpdate: !item.needsRemoteCreate,
          syncErrorMessage: null,
          syncState: "pending_sync",
          type: targetName,
          updatedAt: timestamp,
        } satisfies LocalItem),
      ),
    );
  }

  await typeStore.put({
    ...entry,
    needsRemoteCreate: false,
    needsRemoteDelete: true,
    needsRemoteUpdate: false,
    syncErrorMessage: null,
    syncState: "pending_sync",
    updatedAt: timestamp,
  });
  await transaction.done;
}
