"use client";

import { useEffect, useState } from "react";

type LinkMetadataResponse = {
  normalizedUrl: string;
  sourceHost: string;
  title: string | null;
};

const metadataCache = new Map<string, string | null>();
const pendingRequests = new Map<string, Promise<string | null>>();

async function fetchLinkMetadataTitle(url: string) {
  const response = await fetch(`/api/link-metadata?url=${encodeURIComponent(url)}`);

  if (!response.ok) {
    throw new Error("Could not fetch link metadata.");
  }

  const payload = (await response.json()) as LinkMetadataResponse;
  return payload.title;
}

function getOrCreatePendingRequest(url: string) {
  const existingRequest = pendingRequests.get(url);

  if (existingRequest) {
    return existingRequest;
  }

  const request = fetchLinkMetadataTitle(url)
    .then((title) => {
      metadataCache.set(url, title);
      return title;
    })
    .catch(() => {
      metadataCache.set(url, null);
      return null;
    })
    .finally(() => {
      pendingRequests.delete(url);
    });

  pendingRequests.set(url, request);
  return request;
}

export function useLinkMetadata(url: string | null) {
  const [resolvedMetadata, setResolvedMetadata] = useState<{
    title: string | null;
    url: string;
  } | null>(() =>
    url && metadataCache.has(url)
      ? {
          title: metadataCache.get(url) ?? null,
          url,
        }
      : null,
  );

  useEffect(() => {
    if (!url || metadataCache.has(url)) {
      return;
    }

    let cancelled = false;

    void getOrCreatePendingRequest(url).then((resolvedTitle) => {
      if (!cancelled) {
        setResolvedMetadata({
          title: resolvedTitle,
          url,
        });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return {
    title:
      !url
        ? null
        : metadataCache.has(url)
          ? metadataCache.get(url) ?? null
          : resolvedMetadata?.url === url
            ? resolvedMetadata.title
            : null,
  };
}
