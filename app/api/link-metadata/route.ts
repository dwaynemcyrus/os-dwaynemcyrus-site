import dns from "node:dns/promises";
import net from "node:net";
import { NextResponse } from "next/server";
import { deriveUrlFallbackTitle } from "@/lib/items/itemPresentation";

export const runtime = "nodejs";

const HTTP_PROTOCOLS = new Set(["http:", "https:"]);

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) =>
      String.fromCharCode(Number.parseInt(code, 16)),
    )
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function parseMetaAttributes(tag: string) {
  const attributes = new Map<string, string>();
  const attributePattern = /([^\s=/>]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g;
  let match = attributePattern.exec(tag);

  while (match) {
    const [, rawName, , doubleQuotedValue, singleQuotedValue, bareValue] = match;
    attributes.set(
      rawName.toLowerCase(),
      decodeHtmlEntities((doubleQuotedValue ?? singleQuotedValue ?? bareValue ?? "").trim()),
    );
    match = attributePattern.exec(tag);
  }

  return attributes;
}

function extractMetaContent(html: string, key: string) {
  const tags = html.match(/<meta\s+[^>]*>/gi) ?? [];

  for (const tag of tags) {
    const attributes = parseMetaAttributes(tag);

    if (attributes.get("property") === key || attributes.get("name") === key) {
      const content = attributes.get("content");

      if (content) {
        return content;
      }
    }
  }

  return null;
}

function extractTitleFromHtml(html: string) {
  const metaTitle =
    extractMetaContent(html, "og:title") ?? extractMetaContent(html, "twitter:title");

  if (metaTitle) {
    return metaTitle.trim();
  }

  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);

  if (!titleMatch?.[1]) {
    return null;
  }

  return decodeHtmlEntities(titleMatch[1]).replace(/\s+/g, " ").trim();
}

function normalizeExternalUrl(input: string | null) {
  if (!input) {
    return null;
  }

  try {
    const url = new URL(input);

    if (!HTTP_PROTOCOLS.has(url.protocol)) {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

function isPrivateIpv4(address: string) {
  const parts = address.split(".").map((value) => Number.parseInt(value, 10));

  if (parts.length !== 4 || parts.some(Number.isNaN)) {
    return false;
  }

  const [first, second] = parts;

  return (
    first === 10 ||
    first === 127 ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
}

function isPrivateIpv6(address: string) {
  const normalized = address.toLowerCase();

  return (
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe80:") ||
    normalized.startsWith("::ffff:127.") ||
    normalized.startsWith("::ffff:10.") ||
    normalized.startsWith("::ffff:192.168.") ||
    /^::ffff:172\.(1[6-9]|2\d|3[0-1])\./.test(normalized)
  );
}

function isPrivateAddress(address: string) {
  const version = net.isIP(address);

  if (version === 4) {
    return isPrivateIpv4(address);
  }

  if (version === 6) {
    return isPrivateIpv6(address);
  }

  return false;
}

async function assertPublicUrl(url: URL) {
  const hostname = url.hostname.toLowerCase();

  if (hostname === "localhost" || hostname.endsWith(".local")) {
    throw new Error("Only public URLs are supported.");
  }

  if (net.isIP(hostname) && isPrivateAddress(hostname)) {
    throw new Error("Only public URLs are supported.");
  }

  const addresses = await dns.lookup(hostname, { all: true, verbatim: true });

  if (addresses.length === 0 || addresses.some((entry) => isPrivateAddress(entry.address))) {
    throw new Error("Only public URLs are supported.");
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedUrl = normalizeExternalUrl(searchParams.get("url"));

  if (!requestedUrl) {
    return NextResponse.json({ error: "Invalid URL." }, { status: 400 });
  }

  try {
    await assertPublicUrl(requestedUrl);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Only public URLs are supported.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    const response = await fetch(requestedUrl, {
      headers: {
        accept: "text/html,application/xhtml+xml",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error("Could not fetch link metadata.");
    }

    const html = await response.text();
    const title = extractTitleFromHtml(html);

    return NextResponse.json({
      normalizedUrl: requestedUrl.toString(),
      sourceHost: requestedUrl.hostname.replace(/^www\./, ""),
      title: title && title.length > 0 ? title : deriveUrlFallbackTitle(requestedUrl.toString()),
    });
  } catch {
    return NextResponse.json({
      normalizedUrl: requestedUrl.toString(),
      sourceHost: requestedUrl.hostname.replace(/^www\./, ""),
      title: null,
    });
  }
}
