"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import type { LocalItem } from "@/lib/items/itemTypes";
import { TextButton } from "@/components/primitives/TextButton";
import { LABELS } from "@/lib/constants/labels";
import { saveWritingDocument } from "@/lib/items/itemCommands";
import {
  getWritingDocumentBody,
  serializeWritingDocument,
  updateWritingDocumentBody,
} from "@/lib/writing/documentModel";
import { buildWritingLinkTargets, renderWritingMarkdown } from "@/lib/writing/markdown";
import styles from "./WritingEditor.module.css";

type WritingMode = "markdown" | "read" | "write";

type WritingEditorProps = {
  allItems: LocalItem[];
  item: LocalItem;
  mode: WritingMode;
  onDirtyChange?: (isDirty: boolean) => void;
  onModeChange?: (mode: WritingMode) => void;
  onSavingChange?: (isSaving: boolean) => void;
  saveSignal: number;
};

export function WritingEditor({
  allItems,
  item,
  mode,
  onDirtyChange,
  onModeChange,
  onSavingChange,
  saveSignal,
}: WritingEditorProps) {
  const serializedDocument = useMemo(() => serializeWritingDocument(item), [item]);
  const [documentDraft, setDocumentDraft] = useState(serializedDocument);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const isDirty = documentDraft !== serializedDocument;
  const body = useMemo(() => getWritingDocumentBody(documentDraft), [documentDraft]);
  const linkTargets = useMemo(() => buildWritingLinkTargets(allItems), [allItems]);
  const renderedHtml = useMemo(
    () => renderWritingMarkdown(body, linkTargets),
    [body, linkTargets],
  );

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    onSavingChange?.(isSaving);
  }, [isSaving, onSavingChange]);

  useEffect(() => {
    if (saveSignal === 0 || !isDirty || isSaving) {
      return;
    }

    let cancelled = false;

    async function save() {
      setIsSaving(true);
      setErrorMessage(null);

      try {
        await saveWritingDocument(item.id, documentDraft);
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : "Save failed.");
        }
      } finally {
        if (!cancelled) {
          setIsSaving(false);
        }
      }
    }

    void save();

    return () => {
      cancelled = true;
    };
  }, [documentDraft, isDirty, isSaving, item.id, saveSignal]);

  function handleBodyChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setDocumentDraft(updateWritingDocumentBody(documentDraft, event.target.value));
    setErrorMessage(null);
  }

  function handleDocumentChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setDocumentDraft(event.target.value);
    setErrorMessage(null);
  }

  return (
    <div className={styles.editor}>
      <div className={styles.editor__modes}>
        <TextButton onPress={() => onModeChange?.("write")} variant={mode === "write" ? "primary" : "secondary"}>
          {LABELS.write}
        </TextButton>
        <TextButton onPress={() => onModeChange?.("read")} variant={mode === "read" ? "primary" : "secondary"}>
          {LABELS.read}
        </TextButton>
      </div>
      {mode === "markdown" ? (
        <textarea
          className={styles.editor__textarea}
          onChange={handleDocumentChange}
          spellCheck={false}
          value={documentDraft}
        />
      ) : mode === "read" ? (
        <article
          className={styles.editor__read}
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
      ) : (
        <textarea
          className={styles.editor__textarea}
          onChange={handleBodyChange}
          spellCheck={true}
          value={body}
        />
      )}
      {errorMessage ? <p className={styles.editor__error}>{errorMessage}</p> : null}
      {isSaving ? <p className={styles.editor__status}>{LABELS.saving}</p> : null}
    </div>
  );
}
