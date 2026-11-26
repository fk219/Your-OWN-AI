/* Light/dark theme switch. No React dependency; safe in every Vite app. */
(() => {
  const KEY = "theme";
  const root = document.documentElement;
  let button = null;

  const read = () => {
    const query = new URLSearchParams(window.location.search).get("theme");
    if (query === "light" || query === "dark") return query;
    try {
      const stored = localStorage.getItem(KEY);
      if (stored === "light" || stored === "dark") return stored;
    } catch {}
    return root.dataset.theme === "light" ? "light" : "dark";
  };

  const icon = (name) =>
    name === "sun"
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.6 6.6 0 0 0 9.8 9.8Z"></path></svg>';

  const label = (theme) => (theme === "dark" ? "Switch to light theme" : "Switch to dark theme");

  const apply = (theme) => {
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    try {
      localStorage.setItem(KEY, theme);
    } catch {}
    if (button) {
      button.innerHTML = icon(theme === "dark" ? "sun" : "moon");
      button.setAttribute("aria-label", label(theme));
      button.title = label(theme);
    }
  };

  const mount = () => {
    if (document.querySelector(".theme-toggle")) return;

    const style = document.createElement("style");
    style.textContent = `
      .theme-toggle {
        position: fixed;
        right: max(16px, env(safe-area-inset-right));
        bottom: var(--theme-toggle-bottom, max(16px, env(safe-area-inset-bottom)));
        z-index: 2147483000;
        width: 42px;
        height: 42px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
        border: 1px solid transparent;
        cursor: pointer;
        -webkit-backdrop-filter: blur(14px);
        backdrop-filter: blur(14px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
        transition: transform 160ms ease, background-color 160ms ease, color 160ms ease, border-color 160ms ease;
      }
      html[data-theme="light"] .theme-toggle {
        background: rgba(255, 255, 255, 0.84);
        color: #1b1b1b;
        border-color: rgba(20, 20, 20, 0.14);
      }
      html[data-theme="dark"] .theme-toggle {
        background: rgba(18, 20, 24, 0.84);
        color: #f4f1ea;
        border-color: rgba(255, 255, 255, 0.18);
      }
      .theme-toggle:hover { transform: translateY(-2px); }
      .theme-toggle:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
      @media (prefers-reduced-motion: reduce) {
        .theme-toggle { transition: none; }
        .theme-toggle:hover { transform: none; }
      }
      @media (max-width: 480px) {
        .theme-toggle { width: 40px; height: 40px; }
      }
    `;
    document.head.appendChild(style);

    button = document.createElement("button");
    button.type = "button";
    button.className = "theme-toggle";
    apply(read());
    document.body.appendChild(button);

    button.addEventListener("click", () => {
      apply(root.dataset.theme === "dark" ? "light" : "dark");
    });
  };

  apply(read());
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }

  window.addEventListener("storage", (event) => {
    if (event.key === KEY && (event.newValue === "light" || event.newValue === "dark")) {
      apply(event.newValue);
    }
  });
})();
