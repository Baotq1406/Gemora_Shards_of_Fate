const preview = new URLSearchParams(window.location.search).get("preview");
if (
  import.meta.env.DEV &&
  (preview === "create-player" || preview === "home")
) {
  void import("./preview/player-preview").then(({ startPlayerPreview }) => {
    startPlayerPreview(preview);
  });
} else {
  void import("./main");
}
