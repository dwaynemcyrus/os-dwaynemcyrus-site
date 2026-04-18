const ITEM_CHANGE_EVENT = "items:changed";

export function notifyItemsChanged() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(ITEM_CHANGE_EVENT));
}

export function subscribeToItemChanges(listener: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener(ITEM_CHANGE_EVENT, listener);

  return () => {
    window.removeEventListener(ITEM_CHANGE_EVENT, listener);
  };
}
