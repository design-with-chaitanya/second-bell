(function () {
  const root = document.documentElement;
  root.classList.add("js");

  const logo = document.querySelector(".site-header .brand img");
  if (logo) {
    const fallback = logo.parentElement.querySelector(".brand-fallback");
    const showFallback = () => {
      logo.hidden = true;
      if (fallback) fallback.hidden = false;
    };
    logo.addEventListener("error", showFallback);
    if (logo.complete && logo.naturalWidth === 0) showFallback();
  }

  const year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());

  // Mobile menu
  const menu = document.getElementById("menu");
  const openBtn = document.querySelector(".menu-btn");
  const closeBtn = document.querySelector(".menu-close");

  const focusable = () =>
    menu ? [...menu.querySelectorAll("a, button")].filter((el) => !el.hasAttribute("disabled")) : [];

  const lockBackground = (open) => {
    document.querySelectorAll("body > :not(#menu)").forEach((el) => {
      if (open) el.setAttribute("inert", "");
      else el.removeAttribute("inert");
    });
  };

  const setMenu = (open, returnFocus = true) => {
    if (!menu || !openBtn) return;
    menu.classList.toggle("is-open", open);
    openBtn.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.classList.toggle("menu-open", open);
    if (open) {
      menu.removeAttribute("hidden");
      lockBackground(true);
      (closeBtn || focusable()[0])?.focus();
    } else {
      lockBackground(false);
      menu.setAttribute("hidden", "");
      if (returnFocus) openBtn.focus({ preventScroll: true });
    }
  };

  openBtn?.addEventListener("click", () => setMenu(!menu.classList.contains("is-open")));
  closeBtn?.addEventListener("click", () => setMenu(false));
  menu?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false, false)));

  document.addEventListener("keydown", (e) => {
    if (!menu?.classList.contains("is-open")) return;
    if (e.key === "Escape") {
      e.preventDefault();
      setMenu(false);
      return;
    }
    if (e.key !== "Tab") return;
    const items = focusable();
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  window.matchMedia("(min-width: 1280px)").addEventListener("change", (event) => {
    if (event.matches && menu?.classList.contains("is-open")) setMenu(false, false);
  });

  // Header gains a soft shadow once the page scrolls.
  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Tabs: the homepage domain explorer. Without JS every panel stays visible.
  document.querySelectorAll("[data-switcher]").forEach((rootEl) => {
    const tabs = [...rootEl.querySelectorAll('[role="tab"]')];
    const panels = [...rootEl.querySelectorAll('[role="tabpanel"]')];
    if (!tabs.length) return;
    const select = (tab, focus, init = false) => {
      tabs.forEach((item) => {
        const on = item === tab;
        item.setAttribute("aria-selected", on ? "true" : "false");
        item.tabIndex = on ? 0 : -1;
      });
      panels.forEach((panel) => {
        panel.hidden = panel.id !== tab.getAttribute("aria-controls");
      });
      if (focus) tab.focus();
      if (!init) tab.parentElement.scrollTo({ left: tab.offsetLeft - 16, behavior: "smooth" });
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => select(tab, false));
      tab.addEventListener("keydown", (event) => {
        const keys = { ArrowRight: index + 1, ArrowDown: index + 1, ArrowLeft: index - 1, ArrowUp: index - 1, Home: 0, End: tabs.length - 1 };
        if (!(event.key in keys)) return;
        event.preventDefault();
        select(tabs[(keys[event.key] + tabs.length) % tabs.length], true);
      });
    });
    select(tabs.find((t) => t.getAttribute("aria-selected") === "true") || tabs[0], false, true);
  });

  // The contact section has its own WhatsApp button, so the floating one steps aside there.
  const wa = document.querySelector(".whatsapp");
  const contact = document.getElementById("contact");
  if (wa && contact && "IntersectionObserver" in window) {
    new IntersectionObserver(
      (entries) => entries.forEach((entry) => wa.classList.toggle("is-hidden", entry.isIntersecting)),
      { threshold: 0.05 }
    ).observe(contact);
  }

  // Enquiry form: validate, then open a pre-filled email.
  const form = document.querySelector("[data-form]");
  if (!form) return;

  const rules = [
    ["name", "Enter your full name.", (v) => v.trim().length > 1],
    ["school", "Enter your school name.", (v) => v.trim().length > 1],
    ["email", "Enter a valid email address.", (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())],
    ["phone", "Enter a phone number with at least 8 digits.", (v) => (v.match(/\d/g) || []).length >= 8],
  ];

  const fieldOf = (name) => form.querySelector(`[name="${name}"]`);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const status = form.querySelector("[data-status]");
    if (status) status.textContent = "";
    let first = null;
    const values = {};
    rules.forEach(([name, message, ok]) => {
      const input = fieldOf(name);
      const err = form.querySelector(`#err-${name}`);
      const value = input ? String(input.value || "") : "";
      values[name] = value.trim();
      input?.removeAttribute("aria-invalid");
      if (err) err.textContent = "";
      if (!input || ok(value)) return;
      input.setAttribute("aria-invalid", "true");
      if (err) err.textContent = message;
      if (!first) first = input;
    });
    if (first) {
      first.focus();
      return;
    }
    const message = String(fieldOf("message")?.value || "").trim();
    const body = [
      `Full name: ${values.name}`,
      `School: ${values.school}`,
      `Email: ${values.email}`,
      `Phone: ${values.phone}`,
      "",
      "What we'd like to discuss:",
      message || "(not provided)",
    ].join("\n");
    const href = `mailto:connect@recoup.health?subject=${encodeURIComponent(
      "Discussing Second Bell for " + values.school
    )}&body=${encodeURIComponent(body)}`;
    if (status) status.textContent = "Opening your email app with your enquiry to connect@recoup.health.";
    window.location.href = href;
  });
})();
