"use client";

import { useState } from "react";
import { TextButton } from "@/components/primitives/TextButton";
import { LABELS } from "@/lib/constants/labels";
import { useTypeRegistry } from "@/lib/hooks/useTypeRegistry";
import type {
  LocalTypeRegistryEntry,
  TypeRegistryKind,
} from "@/lib/items/itemTypes";
import {
  addTypeRegistryEntry,
  deleteTypeRegistry,
  renameTypeRegistry,
} from "@/lib/registry/typeRegistryCommands";
import styles from "./TypeSettingsPanel.module.css";

const SECTIONS = [
  { kind: "reference", title: "Reference Types" },
  { kind: "creation", title: "Creation Types" },
  { kind: "log", title: "Log Types" },
] as const;

type EditingState =
  | { id: string; kind: TypeRegistryKind; mode: "rename"; value: string }
  | { kind: TypeRegistryKind; mode: "add"; value: string }
  | null;

type DeleteState = {
  entry: LocalTypeRegistryEntry;
  reassignmentName: string;
} | null;

export function TypeSettingsPanel() {
  const { counts, entries, isLoading } = useTypeRegistry();
  const [deleteState, setDeleteState] = useState<DeleteState>(null);
  const [editing, setEditing] = useState<EditingState>(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function submitEditing() {
    if (!editing) {
      return;
    }

    setErrorMessage("");

    try {
      if (editing.mode === "add") {
        await addTypeRegistryEntry(editing.kind, editing.value);
      } else {
        await renameTypeRegistry(editing.id, editing.kind, editing.value);
      }

      setEditing(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not save type.");
    }
  }

  async function confirmDelete(entry: LocalTypeRegistryEntry) {
    const count = counts[entry.kind].get(entry.name);
    const itemCount = (count?.activeCount ?? 0) + (count?.archivedCount ?? 0);

    if (itemCount > 0) {
      setDeleteState({
        entry,
        reassignmentName: "",
      });
      return;
    }

    setErrorMessage("");

    try {
      await deleteTypeRegistry(entry.id, entry.kind);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not delete type.");
    }
  }

  async function submitDeleteReassignment() {
    if (!deleteState) {
      return;
    }

    setErrorMessage("");

    try {
      await deleteTypeRegistry(
        deleteState.entry.id,
        deleteState.entry.kind,
        deleteState.reassignmentName,
      );
      setDeleteState(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not delete type.");
    }
  }

  return (
    <section className={styles.typesPanel}>
      <div className={styles.typesPanel__copy}>
        <p className={styles.typesPanel__eyebrow}>Types</p>
        <p className={styles.typesPanel__message}>
          Manage custom reference, creation, and log types.
        </p>
      </div>

      {SECTIONS.map((section) => {
        const sectionEntries = entries.filter((entry) => entry.kind === section.kind);

        return (
          <div className={styles.typesPanel__section} key={section.kind}>
            <div className={styles.typesPanel__sectionHeader}>
              <p className={styles.typesPanel__title}>{section.title}</p>
              <TextButton
                onPress={() =>
                  setEditing({ kind: section.kind, mode: "add", value: "" })
                }
                variant="secondary"
              >
                + Add type
              </TextButton>
            </div>

            {editing?.mode === "add" && editing.kind === section.kind ? (
              <InlineTypeInput
                onCancel={() => setEditing(null)}
                onChange={(value) => setEditing({ ...editing, value })}
                onSubmit={() => void submitEditing()}
                value={editing.value}
              />
            ) : null}

            {isLoading ? null : sectionEntries.length > 0 ? (
              <div className={styles.typesPanel__list}>
                {sectionEntries.map((entry) => {
                  const count = counts[entry.kind].get(entry.name);
                  const activeCount = count?.activeCount ?? 0;
                  const archivedCount = count?.archivedCount ?? 0;
                  const countLabel =
                    archivedCount > 0
                      ? `${activeCount} (${archivedCount})`
                      : String(activeCount);

                  return (
                    <div className={styles.typesPanel__row} key={entry.id}>
                      {editing?.mode === "rename" && editing.id === entry.id ? (
                        <InlineTypeInput
                          onCancel={() => setEditing(null)}
                          onChange={(value) => setEditing({ ...editing, value })}
                          onSubmit={() => void submitEditing()}
                          value={editing.value}
                        />
                      ) : (
                        <>
                          <div className={styles.typesPanel__rowCopy}>
                            <p>{entry.name}</p>
                            <p className={styles.typesPanel__hint}>
                              {countLabel} · Metadata templates coming soon
                            </p>
                          </div>
                          <div className={styles.typesPanel__rowActions}>
                            <TextButton
                              onPress={() =>
                                setEditing({
                                  id: entry.id,
                                  kind: entry.kind,
                                  mode: "rename",
                                  value: entry.name,
                                })
                              }
                              variant="secondary"
                            >
                              Edit
                            </TextButton>
                            <TextButton
                              onPress={() => void confirmDelete(entry)}
                              variant="danger"
                            >
                              Delete
                            </TextButton>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className={styles.typesPanel__hint}>
                No types yet. Add one to get started.
              </p>
            )}
          </div>
        );
      })}

      {deleteState ? (
        <div className={styles.typesPanel__dialog}>
          <p className={styles.typesPanel__title}>
            Reassign items using {deleteState.entry.name}
          </p>
          <label className={styles.typesPanel__field}>
            <span>Replacement type</span>
            <input
              className={styles.typesPanel__input}
              onChange={(event) =>
                setDeleteState({
                  ...deleteState,
                  reassignmentName: event.target.value,
                })
              }
              value={deleteState.reassignmentName}
            />
          </label>
          <div className={styles.typesPanel__rowActions}>
            <TextButton onPress={() => setDeleteState(null)} variant="secondary">
              Cancel
            </TextButton>
            <TextButton onPress={() => void submitDeleteReassignment()}>
              Reassign and delete
            </TextButton>
          </div>
        </div>
      ) : null}

      {errorMessage ? <p className={styles.typesPanel__error}>{errorMessage}</p> : null}
    </section>
  );
}

function InlineTypeInput({
  onCancel,
  onChange,
  onSubmit,
  value,
}: {
  onCancel: () => void;
  onChange: (value: string) => void;
  onSubmit: () => void;
  value: string;
}) {
  return (
    <div className={styles.typesPanel__inline}>
      <input
        autoFocus={true}
        className={styles.typesPanel__input}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            onSubmit();
          }

          if (event.key === "Escape") {
            onCancel();
          }
        }}
        value={value}
      />
      <TextButton onPress={onSubmit}>{LABELS.save}</TextButton>
      <TextButton onPress={onCancel} variant="secondary">
        Cancel
      </TextButton>
    </div>
  );
}
