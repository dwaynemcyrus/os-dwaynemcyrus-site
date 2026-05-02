import { parseDocument, stringify } from "yaml";
import {
  WRITING_ITEM_SUBTYPES,
  WRITING_OS_STATUSES,
  WRITING_OS_TYPES,
  type ItemKind,
  type ItemStatus,
  type ItemSubtype,
} from "@/lib/items/itemTypes";
import type { LocalItem } from "@/lib/items/itemTypes";

const FRONTMATTER_DELIMITER = "---";

type ParsedDocumentParts = {
  body: string;
  documentFrontmatter: string | null;
};

type OsFrontmatter = {
  endAt: string | null;
  kind: ItemKind;
  startAt: string | null;
  status: ItemStatus;
  subtype: ItemSubtype | null;
  type: (typeof WRITING_OS_TYPES)[number];
};

type ParsedWritingDocument = {
  content: string;
  documentFrontmatter: string;
  os: OsFrontmatter;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeDocumentBody(body: string) {
  return body.replace(/^\r?\n/, "");
}

function splitRawWritingDocument(rawDocument: string): ParsedDocumentParts {
  const match = rawDocument.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);

  if (!match) {
    return {
      body: rawDocument,
      documentFrontmatter: null,
    };
  }

  return {
    body: normalizeDocumentBody(rawDocument.slice(match[0].length)),
    documentFrontmatter: match[1],
  };
}

function createSeedFrontmatter(item: LocalItem) {
  return stringify({
    os: {
      endAt: item.endAt,
      kind: item.kind,
      startAt: item.startAt,
      status: item.status,
      subtype: item.subtype,
      type: item.type ?? "capture",
    },
  }).trimEnd();
}

function validateOsFrontmatter(osValue: unknown): OsFrontmatter {
  if (!isRecord(osValue)) {
    throw new Error("The `os` frontmatter block is required.");
  }

  const type = osValue.type;
  const kind = osValue.kind;
  const status = osValue.status;
  const subtype = osValue.subtype;
  const startAt = osValue.startAt;
  const endAt = osValue.endAt;

  if (typeof type !== "string" || !WRITING_OS_TYPES.includes(type as never)) {
    throw new Error("`os.type` must be a built-in writing destination.");
  }

  if (
    kind !== undefined &&
    kind !== "action" &&
    kind !== "capture" &&
    kind !== "creation" &&
    kind !== "reference"
  ) {
    throw new Error("`os.kind` must be a supported kind.");
  }

  if (
    typeof status !== "string" ||
    !WRITING_OS_STATUSES.includes(status as never)
  ) {
    throw new Error("`os.status` must be a supported status.");
  }

  if (
    subtype !== null &&
    subtype !== undefined &&
    (typeof subtype !== "string" || !WRITING_ITEM_SUBTYPES.includes(subtype as never))
  ) {
    throw new Error("`os.subtype` must be a supported subtype or null.");
  }

  if (startAt !== null && startAt !== undefined && typeof startAt !== "string") {
    throw new Error("`os.startAt` must be a string or null.");
  }

  if (endAt !== null && endAt !== undefined && typeof endAt !== "string") {
    throw new Error("`os.endAt` must be a string or null.");
  }

  return {
    endAt: endAt ?? null,
    kind: (kind ?? deriveKindFromWritingType(type)) as ItemKind,
    startAt: startAt ?? null,
    status: status as ItemStatus,
    subtype: (subtype ?? null) as ItemSubtype | null,
    type: type as (typeof WRITING_OS_TYPES)[number],
  };
}

function deriveKindFromWritingType(type: unknown): ItemKind {
  if (type === "task" || type === "project" || type === "habit") {
    return "action";
  }

  if (type === "capture") {
    return "capture";
  }

  if (type === "creation") {
    return "creation";
  }

  return "reference";
}

export function serializeWritingDocument(item: LocalItem) {
  const frontmatter = item.documentFrontmatter ?? createSeedFrontmatter(item);
  const body = item.content;

  return `${FRONTMATTER_DELIMITER}\n${frontmatter}\n${FRONTMATTER_DELIMITER}\n\n${body}`;
}

export function getWritingDocumentBody(rawDocument: string) {
  return splitRawWritingDocument(rawDocument).body;
}

export function updateWritingDocumentBody(
  rawDocument: string,
  nextBody: string,
) {
  const { documentFrontmatter } = splitRawWritingDocument(rawDocument);

  if (documentFrontmatter === null) {
    return nextBody;
  }

  return `${FRONTMATTER_DELIMITER}\n${documentFrontmatter}\n${FRONTMATTER_DELIMITER}\n\n${nextBody}`;
}

export function parseWritingDocumentForSave(
  rawDocument: string,
): ParsedWritingDocument {
  const { body, documentFrontmatter } = splitRawWritingDocument(rawDocument);

  if (documentFrontmatter === null) {
    throw new Error("A document frontmatter block is required.");
  }

  const document = parseDocument(documentFrontmatter, {
    prettyErrors: true,
    strict: false,
    uniqueKeys: false,
  });

  if (document.errors.length > 0) {
    throw new Error(document.errors[0]?.message ?? "The document frontmatter is invalid.");
  }

  const frontmatter = document.toJS();

  if (!isRecord(frontmatter)) {
    throw new Error("The document frontmatter must be a YAML object.");
  }

  return {
    content: body.trim(),
    documentFrontmatter,
    os: validateOsFrontmatter(frontmatter.os),
  };
}
