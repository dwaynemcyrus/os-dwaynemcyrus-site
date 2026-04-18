import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { LocalItem } from "@/lib/items/itemTypes";

const DATABASE_NAME = "psa-capture";
const DATABASE_VERSION = 1;
const ITEM_STORE_NAME = "items";

type PsaCaptureDb = DBSchema & {
  [ITEM_STORE_NAME]: {
    key: string;
    value: LocalItem;
    indexes: {
      "by-created-at": string;
      "by-sync-state": LocalItem["syncState"];
      "by-trash-state": LocalItem["isTrashed"];
    };
  };
};

let databasePromise: Promise<IDBPDatabase<PsaCaptureDb>> | null = null;

function createDatabase() {
  return openDB<PsaCaptureDb>(DATABASE_NAME, DATABASE_VERSION, {
    upgrade(database) {
      const store = database.createObjectStore(ITEM_STORE_NAME, {
        keyPath: "id",
      });

      store.createIndex("by-created-at", "createdAt");
      store.createIndex("by-sync-state", "syncState");
      store.createIndex("by-trash-state", "isTrashed");
    },
  });
}

export function getDatabase() {
  if (!databasePromise) {
    databasePromise = createDatabase();
  }

  return databasePromise;
}

export { ITEM_STORE_NAME };
