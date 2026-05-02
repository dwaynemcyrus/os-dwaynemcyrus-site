export const DEFAULT_ITEM_KIND = "capture";
export const DEFAULT_ITEM_TYPE = null;
export const DEFAULT_ITEM_STATUS = "later";
export const DEFAULT_SYNC_STATE = "pending_sync";
export const LOCAL_USER_ID = "local-user";
export const WRITING_OS_TYPES = [
  "capture",
  "contact",
  "creation",
  "essay",
  "habit",
  "interaction",
  "link",
  "literature",
  "quote",
  "slip",
  "task",
  "project",
  "reference",
] as const;
export const WRITING_OS_STATUSES = [
  "active",
  "complete",
  "incubate",
  "later",
  "paused",
  "waiting",
] as const;
export const WRITING_ITEM_SUBTYPES = [
  "article",
  "book",
  "note",
  "podcast",
  "video",
] as const;
export const ACTION_ITEM_TYPES = ["habit", "project", "task"] as const;
export const ITEM_KINDS = ["action", "capture", "creation", "reference"] as const;
export const TYPE_REGISTRY_KINDS = ["creation", "log", "reference"] as const;
export const SEEDED_TYPE_REGISTRY = [
  { kind: "reference", name: "contact" },
  { kind: "reference", name: "link" },
  { kind: "reference", name: "literature" },
  { kind: "reference", name: "quote" },
  { kind: "reference", name: "slip" },
  { kind: "creation", name: "essay" },
  { kind: "log", name: "interaction" },
] as const satisfies ReadonlyArray<{
  kind: TypeRegistryKind;
  name: string;
}>;

export type ItemKind = (typeof ITEM_KINDS)[number];
export type ActionItemType = (typeof ACTION_ITEM_TYPES)[number];
export type TypeRegistryKind = (typeof TYPE_REGISTRY_KINDS)[number];
export type ItemType = string;

export type ItemSubtype = "article" | "book" | "note" | "podcast" | "video";

export type ItemStatus =
  | "active"
  | "complete"
  | "incubate"
  | "later"
  | "paused"
  | "waiting";

export type SyncState = "pending_sync" | "sync_error" | "synced";

export type ItemMetadata = Record<string, unknown>;

export type LocalItem = {
  archivedAt: string | null;
  completedAt: string | null;
  content: string;
  createdAt: string;
  delegatedTo: string | null;
  deviceCreatedAt: string;
  deviceUpdatedAt: string;
  documentFrontmatter: string | null;
  endAt: string | null;
  id: string;
  incubatedAt: string | null;
  isArchived: boolean;
  isTrashed: boolean;
  kind: ItemKind;
  lastSyncedAt: string | null;
  metadata: ItemMetadata;
  needsRemoteCreate: boolean;
  needsRemoteDelete: boolean;
  needsRemoteUpdate: boolean;
  parentId: string | null;
  startAt: string | null;
  status: ItemStatus;
  subtype: ItemSubtype | null;
  syncErrorMessage: string | null;
  syncState: SyncState;
  trashedAt: string | null;
  type: ItemType | null;
  updatedAt: string;
  userId: string;
  waitingReason: string | null;
};

export type CreateLocalItemInput = {
  content: string;
};

export type LocalTypeRegistryEntry = {
  createdAt: string;
  id: string;
  kind: TypeRegistryKind;
  lastSyncedAt: string | null;
  name: string;
  needsRemoteCreate: boolean;
  needsRemoteDelete: boolean;
  needsRemoteUpdate: boolean;
  syncErrorMessage: string | null;
  syncState: SyncState;
  updatedAt: string;
  userId: string;
};

export function normalizeItemKind(value: string | null | undefined): ItemKind {
  switch (value) {
    case "action":
    case "capture":
    case "creation":
    case "reference":
      return value;
    default:
      return "capture";
  }
}

export function normalizeTypeRegistryKind(
  value: string | null | undefined,
): TypeRegistryKind | null {
  switch (value) {
    case "creation":
    case "log":
    case "reference":
      return value;
    default:
      return null;
  }
}

export function normalizeItemType(value: string | null | undefined): ItemType | null {
  if (!value || value === "unknown") {
    return null;
  }

  switch (value) {
    case "content":
    case "idea":
    case "journal":
    case "media":
    case "reference":
      return value;
    case "habit":
    case "project":
    case "task":
      return value;
    case "someday":
    case "incubate":
      return null;
    default:
      return value.trim() || null;
  }
}

export function normalizeItemSubtype(value: string | null | undefined): ItemSubtype | null {
  switch (value) {
    case "article":
    case "book":
    case "note":
    case "podcast":
    case "video":
      return value;
    default:
      return null;
  }
}

export function normalizeItemStatus(value: string | null | undefined): ItemStatus {
  switch (value) {
    case "active":
    case "complete":
    case "incubate":
    case "later":
    case "paused":
    case "waiting":
      return value;
    case "backlog":
    default:
      return "later";
  }
}

export function isActionItemType(value: string | null | undefined): value is ActionItemType {
  return ACTION_ITEM_TYPES.includes(value as ActionItemType);
}

export function normalizeMetadata(value: unknown): ItemMetadata {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as ItemMetadata;
  }

  return {};
}

export function normalizeTypeName(value: string) {
  return value.trim();
}

export function canonicalizeTypeName(value: string) {
  return normalizeTypeName(value).toLocaleLowerCase();
}

export function deriveV8FieldsFromLegacyType(input: {
  status?: string | null;
  subtype?: string | null;
  type?: string | null;
}) {
  const legacyType = input.type ?? "unknown";
  const subtype = normalizeItemSubtype(input.subtype);
  const status = normalizeItemStatus(input.status);
  const legacyMetadata =
    legacyType === "unknown" && subtype === null
      ? {}
      : {
          legacySubtype: subtype,
          legacyType,
        };

  if (legacyType === "task" || legacyType === "project") {
    return {
      kind: "action" as const,
      metadata: legacyMetadata,
      status,
      type: legacyType,
    };
  }

  if (legacyType === "incubate" || legacyType === "someday") {
    return {
      kind: "capture" as const,
      metadata: legacyMetadata,
      status: "incubate" as const,
      type: null,
    };
  }

  if (legacyType === "reference") {
    return {
      kind: "reference" as const,
      metadata: legacyMetadata,
      status,
      type:
        subtype === "book" || subtype === "article"
          ? "literature"
          : subtype === "note"
            ? "slip"
            : "link",
    };
  }

  if (legacyType === "media") {
    return {
      kind: "reference" as const,
      metadata: legacyMetadata,
      status,
      type: subtype === "book" || subtype === "article" ? "literature" : "link",
    };
  }

  if (legacyType === "content" || legacyType === "idea" || legacyType === "journal") {
    return {
      kind: "creation" as const,
      metadata: legacyMetadata,
      status,
      type: "essay",
    };
  }

  return {
    kind: "capture" as const,
    metadata: legacyMetadata,
    status: status === "incubate" ? "incubate" : "later",
    type: null,
  };
}
