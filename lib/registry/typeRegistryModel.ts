import {
  canonicalizeTypeName,
  normalizeTypeName,
  SEEDED_TYPE_REGISTRY,
  type LocalTypeRegistryEntry,
  type TypeRegistryKind,
} from "@/lib/items/itemTypes";
import { createTimestamp } from "@/lib/utils/datetime";
import { createItemId } from "@/lib/utils/ids";

export type TypeRegistryValidationInput = {
  existingNames: string[];
  name: string;
  originalName?: string;
};

export function validateTypeRegistryName({
  existingNames,
  name,
  originalName,
}: TypeRegistryValidationInput) {
  const normalizedName = normalizeTypeName(name);

  if (normalizedName.length === 0) {
    throw new Error("Type name is required.");
  }

  if (normalizedName !== name) {
    throw new Error("Type name cannot have leading or trailing spaces.");
  }

  const canonicalName = canonicalizeTypeName(normalizedName);
  const canonicalOriginalName = originalName
    ? canonicalizeTypeName(originalName)
    : null;
  const hasDuplicate = existingNames.some(
    (existingName) =>
      canonicalizeTypeName(existingName) === canonicalName &&
      canonicalizeTypeName(existingName) !== canonicalOriginalName,
  );

  if (hasDuplicate) {
    throw new Error("Type names must be unique within this section.");
  }

  return normalizedName;
}

export function sortTypeRegistryEntries<T extends { name: string }>(entries: T[]) {
  return [...entries].sort((left, right) =>
    left.name.localeCompare(right.name, undefined, {
      sensitivity: "base",
    }),
  );
}

export function createSeedTypeRegistryEntries(input: {
  existingEntries: LocalTypeRegistryEntry[];
  userId: string;
}) {
  const existing = new Set(
    input.existingEntries.map((entry) =>
      `${entry.userId}:${entry.kind}:${canonicalizeTypeName(entry.name)}`,
    ),
  );
  const timestamp = createTimestamp();

  return SEEDED_TYPE_REGISTRY.flatMap((seed) => {
    const key = `${input.userId}:${seed.kind}:${canonicalizeTypeName(seed.name)}`;

    if (existing.has(key)) {
      return [];
    }

    return [
      {
        createdAt: timestamp,
        id: createItemId(),
        kind: seed.kind,
        lastSyncedAt: null,
        name: seed.name,
        needsRemoteCreate: true,
        needsRemoteDelete: false,
        needsRemoteUpdate: false,
        syncErrorMessage: null,
        syncState: "pending_sync",
        updatedAt: timestamp,
        userId: input.userId,
      } satisfies LocalTypeRegistryEntry,
    ];
  });
}

export function isTypeRegistryKind(value: string): value is TypeRegistryKind {
  return value === "creation" || value === "log" || value === "reference";
}
