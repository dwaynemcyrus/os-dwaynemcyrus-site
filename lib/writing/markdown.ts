import { marked } from "marked";
import { getWritingItemRoute } from "@/lib/constants/routes";
import { deriveItemPresentation } from "@/lib/items/itemPresentation";
import type { LocalItem } from "@/lib/items/itemTypes";

type WritingLinkTarget = {
  href: string;
  title: string;
};

function normalizeWikiTarget(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function buildWritingLinkTargets(items: LocalItem[]) {
  const targets = new Map<string, WritingLinkTarget[]>();

  for (const item of items) {
    const title = deriveItemPresentation(item.content).titleFallback;
    const key = normalizeWikiTarget(title);
    const entries = targets.get(key) ?? [];

    entries.push({
      href: getWritingItemRoute(item.id),
      title,
    });

    targets.set(key, entries);
  }

  return targets;
}

export function renderWritingMarkdown(
  markdown: string,
  linkTargets: Map<string, WritingLinkTarget[]>,
) {
  const withResolvedWikiLinks = markdown.replace(/\[\[([^[\]]+)\]\]/g, (match, rawTarget) => {
    const key = normalizeWikiTarget(rawTarget);
    const matches = linkTargets.get(key);

    if (!matches || matches.length !== 1) {
      return match;
    }

    const [resolved] = matches;
    return `[${resolved.title}](${resolved.href})`;
  });

  return marked.parse(withResolvedWikiLinks, {
    async: false,
    gfm: true,
  }) as string;
}
