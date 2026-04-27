import { ROUTES } from "@/lib/constants/routes";
import type { LocalItem } from "@/lib/items/itemTypes";

export function getOriginalRouteForItem(item: LocalItem) {
  if (item.status === "waiting") {
    return ROUTES.waiting;
  }

  if (item.startAt !== null || item.endAt !== null) {
    return ROUTES.calendar;
  }

  switch (item.type) {
    case "task":
      return ROUTES.tasks;
    case "project":
      return ROUTES.projects;
    case "reference":
      return ROUTES.reference;
    case "media":
      return ROUTES.media;
    case "incubate":
      return ROUTES.incubate;
    default:
      return ROUTES.writing;
  }
}
