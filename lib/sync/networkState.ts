export function isOnline() {
  if (typeof navigator === "undefined") {
    return true;
  }

  return navigator.onLine;
}

export function subscribeToNetworkChanges(listener: (isOnline: boolean) => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  function handleChange() {
    listener(isOnline());
  }

  window.addEventListener("online", handleChange);
  window.addEventListener("offline", handleChange);

  return () => {
    window.removeEventListener("online", handleChange);
    window.removeEventListener("offline", handleChange);
  };
}
