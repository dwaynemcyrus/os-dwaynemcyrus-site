import { describe, expect, it } from "vitest";
import {
  createSeedTypeRegistryEntries,
  validateTypeRegistryName,
} from "@/lib/registry/typeRegistryModel";
import type { LocalTypeRegistryEntry } from "@/lib/items/itemTypes";

function entry(name: string, kind: LocalTypeRegistryEntry["kind"]) {
  return {
    createdAt: "2026-05-02T00:00:00.000Z",
    id: `${kind}-${name}`,
    kind,
    lastSyncedAt: null,
    name,
    needsRemoteCreate: false,
    needsRemoteDelete: false,
    needsRemoteUpdate: false,
    syncErrorMessage: null,
    syncState: "synced",
    updatedAt: "2026-05-02T00:00:00.000Z",
    userId: "user-1",
  } satisfies LocalTypeRegistryEntry;
}

describe("validateTypeRegistryName", () => {
  it("rejects blank and padded names", () => {
    expect(() =>
      validateTypeRegistryName({ existingNames: [], name: "" }),
    ).toThrow("required");
    expect(() =>
      validateTypeRegistryName({ existingNames: [], name: " link " }),
    ).toThrow("leading or trailing");
  });

  it("enforces case-insensitive uniqueness within a kind", () => {
    expect(() =>
      validateTypeRegistryName({
        existingNames: ["Link"],
        name: "link",
      }),
    ).toThrow("unique");
  });

  it("allows a rename to keep the same casing target", () => {
    expect(
      validateTypeRegistryName({
        existingNames: ["Link"],
        name: "link",
        originalName: "Link",
      }),
    ).toBe("link");
  });
});

describe("createSeedTypeRegistryEntries", () => {
  it("creates missing seeds as pending local sync entries", () => {
    const seeds = createSeedTypeRegistryEntries({
      existingEntries: [entry("link", "reference")],
      userId: "user-1",
    });

    expect(seeds).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "reference",
          name: "contact",
          needsRemoteCreate: true,
          syncState: "pending_sync",
          userId: "user-1",
        }),
        expect.objectContaining({
          kind: "creation",
          name: "essay",
          needsRemoteCreate: true,
          syncState: "pending_sync",
          userId: "user-1",
        }),
      ]),
    );
    expect(seeds.some((seed) => seed.kind === "reference" && seed.name === "link"))
      .toBe(false);
  });
});
