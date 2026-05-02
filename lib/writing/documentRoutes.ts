import { ROUTES } from "@/lib/constants/routes";
import type { LocalItem } from "@/lib/items/itemTypes";

export function getOriginalRouteForItem(item: LocalItem) {
  if (item.status === "waiting") {
    return ROUTES.waiting;
  }

  if (item.startAt !== null || item.endAt !== null) {
    return ROUTES.calendar;
  }

  if (item.kind === "capture" && item.status === "incubate") {
    return ROUTES.incubate;
  }

  if (item.kind === "action" && item.type === "task") {
    return ROUTES.tasks;
  }

  if (item.kind === "action" && item.type === "project") {
    return ROUTES.projects;
  }

  if (item.kind === "reference") {
    return ROUTES.reference;
  }

  return ROUTES.writing;
}
