import { useSyncExternalStore } from "react";

const MOBILE_QUERY = "(max-width: 699px)";

export function useIsMobile() {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(MOBILE_QUERY);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(MOBILE_QUERY).matches,
  );
}
