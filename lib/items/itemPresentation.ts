const HTTP_PROTOCOLS = new Set(["http:", "https:"]);

export type DerivedItemPresentation = {
  body: string | null;
  firstLineUrl: string | null;
  rawFirstLine: string;
  titleFallback: string;
};

function getMeaningfulLines(content: string) {
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function normalizeHttpUrl(value: string) {
  try {
    const url = new URL(value);

    if (!HTTP_PROTOCOLS.has(url.protocol)) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

export function deriveUrlFallbackTitle(urlValue: string) {
  const normalizedUrl = normalizeHttpUrl(urlValue);

  if (!normalizedUrl) {
    return urlValue;
  }

  const url = new URL(normalizedUrl);
  const hostname = url.hostname.replace(/^www\./, "");
  const pathname = decodeURIComponent(url.pathname).replace(/\/$/, "");

  if (!pathname || pathname === "/") {
    return hostname;
  }

  return `${hostname}${pathname}`;
}

export function deriveItemPresentation(content: string): DerivedItemPresentation {
  const lines = getMeaningfulLines(content);
  const [rawFirstLine = ""] = lines;

  if (!rawFirstLine) {
    return {
      body: null,
      firstLineUrl: null,
      rawFirstLine: "",
      titleFallback: "",
    };
  }

  const firstLineUrl = normalizeHttpUrl(rawFirstLine);
  const remainingBody = lines.slice(1).join("\n\n").trim();

  if (firstLineUrl) {
    return {
      body: [rawFirstLine, remainingBody].filter(Boolean).join("\n\n"),
      firstLineUrl,
      rawFirstLine,
      titleFallback: deriveUrlFallbackTitle(rawFirstLine),
    };
  }

  return {
    body: remainingBody || null,
    firstLineUrl: null,
    rawFirstLine,
    titleFallback: rawFirstLine,
  };
}
