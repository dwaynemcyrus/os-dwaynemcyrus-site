"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { AuthGate } from "@/components/auth/AuthGate";
import { AppShell } from "@/components/app-shell/AppShell";
import { EmptyState } from "@/components/items/EmptyState";
import { BackButton } from "@/components/navigation/BackButton";
import { SyncStatusBar } from "@/components/sync/SyncStatusBar";
import { WritingEditor } from "@/components/writing/WritingEditor";
import { WritingMenu } from "@/components/writing/WritingMenu";
import { LABELS } from "@/lib/constants/labels";
import { deriveItemPresentation } from "@/lib/items/itemPresentation";
import { useRefreshSync, useSyncStatus } from "@/lib/hooks/useSyncStatus";
import { useWritingItem } from "@/lib/hooks/useWritingItem";
import { useWritingItems } from "@/lib/hooks/useWritingItems";
import { useRetrySync } from "@/lib/hooks/useRetrySync";
import { getOriginalRouteForItem } from "@/lib/writing/documentRoutes";

type WritingMode = "markdown" | "read" | "write";

export default function WritingItemPage() {
  const params = useParams<{ itemId: string }>();
  const itemId = typeof params.itemId === "string" ? params.itemId : "";
  const { item, isLoading } = useWritingItem(itemId);
  const { items } = useWritingItems();
  const { isSyncing, label } = useSyncStatus();
  const refreshSync = useRefreshSync();
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mode, setMode] = useState<WritingMode>("write");
  const [saveSignal, setSaveSignal] = useState(0);

  useRetrySync();

  return (
    <AuthGate>
      <AppShell
        fabDisabled={!isDirty || isSaving}
        fabLabel={LABELS.save}
        headerLeft={<BackButton href="/writing" />}
        headerRight={
          item ? (
            <WritingMenu
              mode={mode}
              onModeChange={setMode}
              originalRoute={getOriginalRouteForItem(item)}
            />
          ) : null
        }
        onFabPress={() => setSaveSignal((current) => current + 1)}
        title={item ? deriveItemPresentation(item.content).titleFallback : LABELS.writing}
      >
        <SyncStatusBar
          label={label}
          onRefresh={refreshSync}
          refreshDisabled={isSyncing}
          showRefresh={true}
        />
        {isLoading ? null : item ? (
          <WritingEditor
            key={`${item.id}:${item.updatedAt}`}
            allItems={items}
            item={item}
            mode={mode}
            onDirtyChange={setIsDirty}
            onModeChange={setMode}
            onSavingChange={setIsSaving}
            saveSignal={saveSignal}
          />
        ) : (
          <EmptyState label={LABELS.emptyWritingState} />
        )}
      </AppShell>
    </AuthGate>
  );
}
