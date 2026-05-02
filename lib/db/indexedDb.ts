import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { LocalItem, LocalTypeRegistryEntry } from "@/lib/items/itemTypes";

const DATABASE_NAME = "psa-capture";
const DATABASE_VERSION = 3;
const ITEM_STORE_NAME = "items";
const TYPE_REGISTRY_STORE_NAME = "typeRegistry";

export type PsaCaptureDb = DBSchema & {
  [ITEM_STORE_NAME]: {
    key: string;
    value: LocalItem;
    indexes: {
      "by-created-at": string;
      "by-sync-state": LocalItem["syncState"];
      "by-trash-state": LocalItem["isTrashed"];
    };
  };
  [TYPE_REGISTRY_STORE_NAME]: {
    key: string;
    value: LocalTypeRegistryEntry;
    indexes: {
      "by-kind": LocalTypeRegistryEntry["kind"];
      "by-sync-state": LocalTypeRegistryEntry["syncState"];
      "by-user-kind": [string, LocalTypeRegistryEntry["kind"]];
    };
  };
};

let databasePromise: Promise<IDBPDatabase<PsaCaptureDb>> | null = null;

function createDatabase() {
  return openDB<PsaCaptureDb>(DATABASE_NAME, DATABASE_VERSION, {
    upgrade(database, _oldVersion, _newVersion, transaction) {
      const store = database.objectStoreNames.contains(ITEM_STORE_NAME)
        ? transaction.objectStore(ITEM_STORE_NAME)
        : database.createObjectStore(ITEM_STORE_NAME, {
            keyPath: "id",
          });

      if (!store.indexNames.contains("by-created-at")) {
        store.createIndex("by-created-at", "createdAt");
      }

      if (!store.indexNames.contains("by-sync-state")) {
        store.createIndex("by-sync-state", "syncState");
      }

      if (!store.indexNames.contains("by-trash-state")) {
        store.createIndex("by-trash-state", "isTrashed");
      }

      const typeStore = database.objectStoreNames.contains(TYPE_REGISTRY_STORE_NAME)
        ? transaction.objectStore(TYPE_REGISTRY_STORE_NAME)
        : database.createObjectStore(TYPE_REGISTRY_STORE_NAME, {
            keyPath: "id",
          });

      if (!typeStore.indexNames.contains("by-kind")) {
        typeStore.createIndex("by-kind", "kind");
      }

      if (!typeStore.indexNames.contains("by-sync-state")) {
        typeStore.createIndex("by-sync-state", "syncState");
      }

      if (!typeStore.indexNames.contains("by-user-kind")) {
        typeStore.createIndex("by-user-kind", ["userId", "kind"]);
      }
    },
  });
}

export function getDatabase() {
  if (!databasePromise) {
    databasePromise = createDatabase();
  }

  return databasePromise;
}

export { ITEM_STORE_NAME, TYPE_REGISTRY_STORE_NAME };
