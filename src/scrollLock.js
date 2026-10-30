let locks = 0;

// Several layers (drawer, help, submit overlay) can ask for the page to stop
// scrolling at once; it only unlocks when the last one lets go.
export function lockScroll() {
  if (locks++ === 0) document.documentElement.classList.add("scroll-locked");
  return () => {
    if (--locks === 0) {
      document.documentElement.classList.remove("scroll-locked");
    }
  };
}
