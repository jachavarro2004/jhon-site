// Jhon's landing page: the film plays in place (with the Spanish subtitles on
// request), the install panels become tabs, and the commands copy. Without
// JavaScript the page still works: the links open the film, both install
// panels show, and the video loads nothing until its own play control.
(() => {
  document.documentElement.classList.add("js");

  // The film: "Watch the presentation" and "With Spanish subtitles" play it here.
  const film = document.getElementById("film");
  const setSpanish = (on) => {
    for (const t of film.textTracks) if (t.language === "es") t.mode = on ? "showing" : "disabled";
  };
  for (const a of document.querySelectorAll("[data-play]")) {
    a.addEventListener("click", (e) => {
      if (!film || typeof film.play !== "function") return;
      e.preventDefault();
      setSpanish(a.dataset.play === "es");
      film.scrollIntoView({ block: "center" });
      film.focus({ preventScroll: true });
      const p = film.play();
      if (p && p.catch) p.catch(() => {});
    });
  }

  // The install panels, as tabs (WAI-ARIA tabs, automatic activation).
  const tablist = document.querySelector(".tabs");
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  const select = (tab, focus) => {
    for (const t of tabs) {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    }
    if (focus) tab.focus();
  };
  tablist.hidden = false;
  select(navigator.userAgent.includes("Windows") ? tabs[1] : tabs[0], false);
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => select(t, false));
    t.addEventListener("keydown", (e) => {
      const n = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (n === undefined) return;
      e.preventDefault();
      select(tabs[(n + tabs.length) % tabs.length], true);
    });
  });

  // Copy the shown panel's commands, one per line, without prompts or comments.
  const copy = document.getElementById("copy");
  const status = document.getElementById("copy-status");
  const note = status.innerHTML;
  if (navigator.clipboard && window.isSecureContext) {
    copy.hidden = false;
    copy.addEventListener("click", async () => {
      const panel = document.querySelector('[role="tabpanel"]:not([hidden])');
      const text = [...panel.querySelectorAll("[data-cmd]")].map((c) => c.textContent).join("\n");
      try {
        await navigator.clipboard.writeText(text + "\n");
        status.textContent = "Copied. Paste the commands into a terminal.";
      } catch {
        status.textContent = "Could not copy; select the commands instead.";
      }
      setTimeout(() => { status.innerHTML = note; }, 4000);
    });
  }
})();
