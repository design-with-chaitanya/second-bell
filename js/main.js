(function () {
  const root = document.documentElement;
  root.classList.add("js");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const logo = document.querySelector(".brand-logo");
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

  const bar = document.querySelector("[data-progress]");
  if (bar) {
    let ticking = false;
    const paint = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      bar.style.transform = "scaleX(" + p + ")";
      ticking = false;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(paint);
    };
    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
  }

  const menu = document.getElementById("menu");
  const openBtn = document.querySelector(".menu-btn");
  const closeBtn = document.querySelector(".menu-close");

  const focusable = () =>
    menu
      ? [...menu.querySelectorAll("a, button")].filter((el) => !el.hasAttribute("disabled"))
      : [];

  const lockBackground = (open) => {
    document.querySelectorAll("body > :not(#menu)").forEach((el) => {
      if (open) el.setAttribute("inert", "");
      else el.removeAttribute("inert");
    });
  };

  const setMenu = (open) => {
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
      openBtn.focus();
    }
  };

  openBtn?.addEventListener("click", () => setMenu(!menu.classList.contains("is-open")));
  closeBtn?.addEventListener("click", () => setMenu(false));
  menu?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

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

  const desktop = window.matchMedia("(min-width: 960px)");
  desktop.addEventListener("change", (event) => {
    if (event.matches && menu?.classList.contains("is-open")) setMenu(false);
  });

  document.querySelectorAll("[data-switcher]").forEach((rootEl) => {
    const tabs = [...rootEl.querySelectorAll('[role="tab"]')];
    const panels = [...rootEl.querySelectorAll('[role="tabpanel"]')];
    if (!tabs.length) return;

    const select = (tab, focus) => {
      tabs.forEach((item) => {
        const on = item === tab;
        item.setAttribute("aria-selected", on ? "true" : "false");
        item.tabIndex = on ? 0 : -1;
      });
      panels.forEach((panel) => {
        panel.hidden = panel.id !== tab.getAttribute("aria-controls");
      });
      if (focus) tab.focus();
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => select(tab, false));
      tab.addEventListener("keydown", (event) => {
        const key = event.key;
        let next = null;
        if (key === "ArrowDown" || key === "ArrowRight") next = tabs[(index + 1) % tabs.length];
        if (key === "ArrowUp" || key === "ArrowLeft") next = tabs[(index - 1 + tabs.length) % tabs.length];
        if (key === "Home") next = tabs[0];
        if (key === "End") next = tabs[tabs.length - 1];
        if (!next) return;
        event.preventDefault();
        select(next, true);
      });
    });
  });

  const chapters = [...document.querySelectorAll(".nav-primary a")].filter((link) => {
    const href = link.getAttribute("href") || "";
    return href.startsWith("#");
  });
  if (chapters.length && "IntersectionObserver" in window) {
    const pairs = chapters
      .map((link) => [document.getElementById(link.getAttribute("href").slice(1)), link])
      .filter((pair) => pair[0]);
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        chapters.forEach((link) => link.removeAttribute("aria-current"));
        const match = pairs.find((pair) => pair[0] === visible.target);
        if (match) match[1].setAttribute("aria-current", "true");
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.2, 0.6] }
    );
    pairs.forEach((pair) => io.observe(pair[0]));
  }

  const dock = document.querySelector(".dock");
  const hero = document.querySelector(".hero");
  const talk = document.getElementById("talk");
  const narrow = window.matchMedia("(max-width: 420px)");
  if (dock && hero && "IntersectionObserver" in window) {
    let heroOn = true;
    let talkOn = false;
    const sync = () => {
      dock.classList.toggle("is-on", narrow.matches && !heroOn && !talkOn);
    };
    const watch = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === hero) heroOn = entry.isIntersecting;
          if (entry.target === talk) talkOn = entry.isIntersecting;
        });
        sync();
      },
      { threshold: 0.12 }
    );
    watch.observe(hero);
    if (talk) watch.observe(talk);
    narrow.addEventListener("change", sync);
    sync();
  }

  const wa = document.querySelector(".whatsapp");
  const enrollForm = document.querySelector(".form");
  if (wa && enrollForm) {
    const placeWidget = () => {
      const rect = enrollForm.getBoundingClientRect();
      const size = 48;
      const margin = 16;
      const rightSlot = {
        top: window.innerHeight - margin - size,
        bottom: window.innerHeight - margin,
        left: window.innerWidth - margin - size,
        right: window.innerWidth - margin,
      };
      const leftSlot = {
        top: rightSlot.top,
        bottom: rightSlot.bottom,
        left: margin,
        right: margin + size,
      };
      const hits = (slot) =>
        rect.top < slot.bottom &&
        rect.bottom > slot.top &&
        rect.left < slot.right &&
        rect.right > slot.left;
      const coverRight = hits(rightSlot);
      const coverLeft = hits(leftSlot);
      wa.classList.toggle("is-left", coverRight && !coverLeft);
      wa.classList.toggle("is-raised", coverRight && coverLeft);
    };
    placeWidget();
    window.addEventListener("scroll", placeWidget, { passive: true });
    window.addEventListener("resize", placeWidget);
  }

  const score = document.querySelector("[data-score]");
  if (score && !reduced && "IntersectionObserver" in window) {
    const target = Number(score.getAttribute("data-score")) || 85;
    const count = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        count.disconnect();
        const from = Math.max(0, target - 18);
        const start = performance.now();
        const tick = (now) => {
          const t = Math.min(1, (now - start) / 650);
          const eased = 1 - Math.pow(1 - t, 3);
          score.textContent = String(Math.round(from + (target - from) * eased));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.6 }
    );
    count.observe(score);
  }

  const revealItems = [...document.querySelectorAll("[data-reveal]")];
  if (revealItems.length && !reduced && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        const groups = new Map();
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const key = entry.target.parentElement;
          const list = groups.get(key) || [];
          list.push(entry.target);
          groups.set(key, list);
        });
        groups.forEach((nodes) => {
          nodes.sort((a, b) => revealItems.indexOf(a) - revealItems.indexOf(b));
          nodes.forEach((node, index) => {
            node.style.setProperty("--reveal-delay", index * 80 + "ms");
            node.classList.add("is-in");
            revealObserver.unobserve(node);
          });
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 }
    );
    revealItems.forEach((el) => revealObserver.observe(el));
  } else {
    revealItems.forEach((el) => el.classList.add("is-in"));
  }

  const form = document.querySelector("[data-form]");
  if (!form) return;

  const rules = [
    ["name", "Enter your full name.", (v) => v.trim().length > 1],
    ["school", "Enter your organisation or school.", (v) => v.trim().length > 1],
    ["email", "Enter a valid email address.", (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())],
    ["phone", "Enter a phone number.", (v) => (v.match(/\d/g) || []).length >= 8],
    ["message", "Tell us about your school.", (v) => v.trim().length > 1],
  ];

  const fieldOf = (name) => form.querySelector(`[name="${name}"]`);

  const clearErrors = () => {
    rules.forEach(([name]) => {
      const input = fieldOf(name);
      const err = form.querySelector(`#err-${name}`);
      if (!input || !err) return;
      input.removeAttribute("aria-invalid");
      err.textContent = "";
    });
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearErrors();
    const status = form.querySelector("[data-status]");
    if (status) status.textContent = "";
    let first = null;
    const values = {};
    rules.forEach(([name, message, ok]) => {
      const input = fieldOf(name);
      const err = form.querySelector(`#err-${name}`);
      const value = input ? String(input.value || "") : "";
      values[name] = value.trim();
      if (!input || ok(value)) return;
      input.setAttribute("aria-invalid", "true");
      if (err) err.textContent = message;
      if (!first) first = input;
    });
    if (first) {
      first.focus();
      return;
    }
    const body = [
      `Full name: ${values.name}`,
      `Organisation / school: ${values.school}`,
      `Email: ${values.email}`,
      `Phone: ${values.phone}`,
      "",
      "About your school:",
      values.message,
    ].join("\n");
    const href = `mailto:connect@recoup.health?subject=${encodeURIComponent("Enroll a school in Second Bell")}&body=${encodeURIComponent(body)}`;
    if (status) status.textContent = "Opening your email to connect@recoup.health.";
    window.location.href = href;
  });
})();
