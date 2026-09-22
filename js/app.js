(() => {
  "use strict";

  const PRIO = {
    critical: { label: "Критический", color: "error" },
    high: { label: "Высокий", color: "warning" },
    medium: { label: "Средний", color: "brand" },
    low: { label: "Низкий", color: "neutral" },
  };

  const STATUS = {
    new: { label: "Новая", color: "brand" },
    assigned: { label: "Назначена", color: "brand" },
    in_progress: { label: "В работе", color: "warning" },
    done: { label: "Выполнена", color: "success" },
  };

  const COLUMNS = ["new", "assigned", "in_progress", "done"];

  const SCREENS = {
    dashboard: { title: "Дашборд", sub: "Обзор по всем объектам" },
    requests: { title: "Заявки", sub: "Управление обращениями" },
    chats: { title: "Чаты", sub: "Сообщения по домам" },
    buildings: { title: "Дома", sub: "Список домов УК" },
    faq: { title: "Общие вопросы (FAQ)", sub: "База ответов для бота MAX" },
    staff: { title: "Сотрудники", sub: "Команда и исполнители" },
    calendar: { title: "Календарь", sub: "Заявки и задачи по дням" },
    tasks: { title: "Задачи", sub: "Внутренние задачи команды" },
    analytics: { title: "Аналитика", sub: "Показатели по заявкам" },
    documents: { title: "Документы", sub: "Архив документов" },
    tariffs: { title: "Тарифы", sub: "Планы подписки" },
  };

  let tickets = [
    {
      id: "t1",
      num: "#12038",
      title: "Нет света в подъезде №2",
      desc: "Нет света в подъезде №2",
      resident: "Ирина К.",
      address: "Ленина 12",
      building: "ул. Ленина, 12",
      apt: "—",
      phone: "—",
      assignee: "Дмитрий Д.",
      category: "электрика",
      source: "MAX",
      created: "15.07 · 14:20",
      priority: "high",
      status: "in_progress",
      tags: ["электрика"],
    },
    {
      id: "t2",
      num: "#12035",
      title: "Замена лампы, 3 этаж",
      desc: "Замена лампы, 3 этаж",
      resident: "Пётр С.",
      address: "Ленина 12",
      building: "ул. Ленина, 12",
      apt: "—",
      phone: "—",
      assignee: "БотДиспетчер",
      category: "освещение",
      source: "MAX",
      created: "14.07 · 11:05",
      priority: "low",
      status: "done",
      tags: ["освещение"],
    },
    {
      id: "t3",
      num: "#12040",
      title: "Шум от насосной станции",
      desc: "Шум от насосной станции",
      resident: "Анна М.",
      address: "Ленина 12",
      building: "ул. Ленина, 12",
      apt: "—",
      phone: "—",
      assignee: "Алексей Н.",
      category: "шум",
      source: "MAX",
      created: "15.07 · 09:12",
      priority: "medium",
      status: "assigned",
      tags: ["шум"],
    },
    {
      id: "t4",
      num: "#12042",
      title: "Протечка стояка, кв. 47",
      desc: "Протечка стояка, кв. 47",
      resident: "Сергей В.",
      address: "Парусная 12к1",
      building: "ЖК «Алые Паруса», корп. 1",
      apt: "47",
      phone: "—",
      assignee: null,
      category: "сантехника",
      source: "MAX",
      created: "15.07 · 19:46",
      priority: "critical",
      status: "new",
      tags: ["сантехника"],
    },
  ];

  let selectedId = null;
  let currentScreen = "dashboard";
  let currentView = "kanban";
  let currentPrio = "all";

  const cabinetNav = document.getElementById("cabinetNav");
  const pageTitle = document.getElementById("pageTitle");
  const pageSub = document.getElementById("pageSub");
  const viewTabs = document.getElementById("viewTabs");
  const prioTabs = document.getElementById("prioTabs");
  const kanbanView = document.getElementById("kanbanView");
  const tableView = document.getElementById("tableView");
  const gridView = document.getElementById("gridView");
  const tableBody = document.getElementById("tableBody");
  const drawer = document.getElementById("ticketDrawer");
  const drawerClose = document.getElementById("drawerClose");
  const drawerStages = document.getElementById("drawerStages");
  const siteNav = document.getElementById("nav");
  const navToggle = document.getElementById("navToggle");
  const yearEl = document.getElementById("year");

  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  function setNavOpen(open) {
    siteNav?.classList.toggle("is-open", open);
    navToggle?.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.classList.toggle("nav-open", open);
  }

  navToggle?.addEventListener("click", () => {
    const open = !siteNav?.classList.contains("is-open");
    setNavOpen(open);
  });

  siteNav?.querySelectorAll("a, button").forEach((link) => {
    link.addEventListener("click", () => {
      setNavOpen(false);
    });
  });

  document.addEventListener("click", (e) => {
    if (!siteNav?.classList.contains("is-open")) return;
    const target = e.target;
    if (!(target instanceof Node)) return;
    if (siteNav.contains(target) || navToggle?.contains(target)) return;
    setNavOpen(false);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1024 && siteNav?.classList.contains("is-open")) {
      setNavOpen(false);
    }
  });

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function badge(color, text) {
    return `<span class="hd-badge hd-badge--${color}">${escapeHtml(text)}</span>`;
  }

  function initialsOf(name) {
    const parts = String(name).trim().split(/\s+/).slice(0, 2);
    return parts.map((p) => p[0]).join("").toUpperCase() || "?";
  }

  const AVATAR_PALETTE = ["#2553e0", "#1f8a4c", "#c47f0b", "#7a5bd6", "#0e8a8a", "#cc2f2d"];

  function avatar(name, size = 24) {
    if (!name) return "";
    const bg = AVATAR_PALETTE[(name.charCodeAt(0) || 0) % AVATAR_PALETTE.length];
    const fontSize = Math.round(size * 0.4);
    return `<span class="hd-avatar" style="width:${size}px;height:${size}px" title="${escapeHtml(name)}">
      <span class="hd-avatar__circle" style="background:${bg};font-size:${fontSize}px">${escapeHtml(initialsOf(name))}</span>
    </span>`;
  }

  function filteredTickets() {
    if (currentPrio === "all") return tickets;
    return tickets.filter((t) => t.priority === currentPrio);
  }

  function setScreen(id) {
    if (!SCREENS[id]) return;
    currentScreen = id;
    closeDrawer(false);

    cabinetNav?.querySelectorAll(".app-sidebar__link").forEach((btn) => {
      btn.classList.toggle("app-sidebar__link--active", btn.getAttribute("data-screen") === id);
    });

    document.querySelectorAll("[data-screen-panel]").forEach((panel) => {
      panel.classList.toggle("is-active", panel.getAttribute("data-screen-panel") === id);
    });

    if (pageTitle) pageTitle.textContent = SCREENS[id].title;
    if (pageSub) pageSub.textContent = SCREENS[id].sub;

    if (id === "requests") renderRequests();
  }

  function setView(view) {
    currentView = view;
    viewTabs?.querySelectorAll("[data-view]").forEach((btn) => {
      btn.classList.toggle("hd-tabs__tab--active", btn.getAttribute("data-view") === view);
    });
    renderRequests();
  }

  function setPrio(prio) {
    currentPrio = prio;
    prioTabs?.querySelectorAll("[data-prio]").forEach((btn) => {
      btn.classList.toggle("hd-tabs__tab--active", btn.getAttribute("data-prio") === prio);
    });
    renderRequests();
  }

  function updatePrioCounts() {
    const map = { all: tickets.length, critical: 0, high: 0, medium: 0, low: 0 };
    tickets.forEach((t) => {
      map[t.priority] += 1;
    });
    const set = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = String(value);
    };
    set("prioAll", map.all);
    set("prioCritical", map.critical);
    set("prioHigh", map.high);
    set("prioMedium", map.medium);
    set("prioLow", map.low);
  }

  function renderKanban(list) {
    if (!kanbanView) return;
    COLUMNS.forEach((status) => {
      const colList = kanbanView.querySelector(`[data-list="${status}"]`);
      const count = kanbanView.querySelector(`[data-count="${status}"]`);
      if (!colList) return;
      colList.innerHTML = "";
      const items = list.filter((t) => t.status === status);
      if (count) count.textContent = String(items.length);
      items.forEach((ticket) => {
        const card = document.createElement("button");
        card.type = "button";
        card.className = `ticket-card ticket-card--${ticket.priority}`;
        if (selectedId === ticket.id) card.classList.add("is-selected");
        const tags = (ticket.tags || []).slice(0, 3);
        card.innerHTML = `
          ${ticket.priority === "critical" ? '<span class="ticket-card__emergency"></span>' : ""}
          <div class="ticket-card__top">
            <span class="ticket-card__num">${escapeHtml(ticket.num)}</span>
            <div class="ticket-card__badges">${badge(PRIO[ticket.priority].color, PRIO[ticket.priority].label)}</div>
          </div>
          <p class="ticket-card__title">${escapeHtml(ticket.title)}</p>
          ${
            tags.length
              ? `<div class="ticket-card__tags">${tags
                  .map((tag) => `<span class="ticket-card__tag">${escapeHtml(tag)}</span>`)
                  .join("")}</div>`
              : ""
          }
          <div class="ticket-card__foot">
            <span class="ticket-card__resident">${escapeHtml(ticket.resident)}</span>
            <div class="ticket-card__meta">${avatar(ticket.assignee, 24)}</div>
          </div>
        `;
        card.addEventListener("click", () => openDrawer(ticket.id));
        colList.appendChild(card);
      });
    });
  }

  function renderTable(list) {
    if (!tableBody) return;
    tableBody.innerHTML = "";
    list.forEach((ticket) => {
      const tr = document.createElement("tr");
      if (selectedId === ticket.id) tr.classList.add("is-selected");
      if (ticket.priority === "critical") tr.classList.add("is-critical");
      if (ticket.priority === "high") tr.classList.add("is-high");
      tr.innerHTML = `
        <td><span class="table-num">${ticket.num}</span></td>
        <td>${escapeHtml(ticket.title)}</td>
        <td>${badge(PRIO[ticket.priority].color, PRIO[ticket.priority].label)}</td>
        <td>${badge(STATUS[ticket.status].color, STATUS[ticket.status].label)}</td>
        <td>${escapeHtml(ticket.resident)}</td>
      `;
      tr.addEventListener("click", () => openDrawer(ticket.id));
      tableBody.appendChild(tr);
    });
  }

  function renderGrid(list) {
    if (!gridView) return;
    gridView.innerHTML = "";
    list.forEach((ticket) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = `ticket-grid-card ticket-grid-card--${ticket.priority}`;
      if (selectedId === ticket.id) card.classList.add("is-selected");
      card.innerHTML = `
        ${ticket.priority === "critical" ? '<span class="ticket-card__emergency"></span>' : ""}
        <div class="ticket-grid-card__top">
          <span class="ticket-grid-card__id">
            <span class="ticket-card__num">${ticket.num}</span>
            ${badge(STATUS[ticket.status].color, STATUS[ticket.status].label)}
          </span>
          ${badge(PRIO[ticket.priority].color, PRIO[ticket.priority].label)}
        </div>
        <p class="ticket-grid-card__title">${escapeHtml(ticket.title)}</p>
        <div class="ticket-grid-card__loc">${escapeHtml(ticket.address)}</div>
        <div class="ticket-grid-card__foot">
          <span>${escapeHtml(ticket.resident)}</span>
        </div>
      `;
      card.addEventListener("click", () => openDrawer(ticket.id));
      gridView.appendChild(card);
    });
  }

  function renderRequests() {
    updatePrioCounts();
    const list = filteredTickets();

    if (kanbanView) kanbanView.hidden = currentView !== "kanban";
    if (tableView) tableView.hidden = currentView !== "table";
    if (gridView) gridView.hidden = currentView !== "grid";

    if (currentView === "kanban") renderKanban(list);
    if (currentView === "table") renderTable(list);
    if (currentView === "grid") renderGrid(list);
  }

  function openDrawer(id) {
    const ticket = tickets.find((t) => t.id === id);
    if (!ticket || !drawer) return;
    selectedId = id;
    drawer.hidden = false;

    const setText = (elId, value) => {
      const el = document.getElementById(elId);
      if (el) el.textContent = value;
    };
    setText("drawerNum", ticket.num);
    setText("drawerTitle", ticket.title);
    setText("drawerDesc", ticket.desc || ticket.title);

    const statusBadge = document.getElementById("drawerStatusBadge");
    if (statusBadge) {
      statusBadge.className = `hd-badge hd-badge--${STATUS[ticket.status].color}`;
      statusBadge.textContent = STATUS[ticket.status].label;
    }
    const prioBadge = document.getElementById("drawerPrioBadge");
    if (prioBadge) {
      prioBadge.className = `hd-badge hd-badge--${PRIO[ticket.priority].color}`;
      prioBadge.textContent = PRIO[ticket.priority].label;
    }

    const facts = document.getElementById("drawerFacts");
    if (facts) {
      const rows = [
        ["Категория", ticket.category || (ticket.tags && ticket.tags[0]) || "—"],
        ["Источник", ticket.source || "MAX"],
        ["Сообщение MAX", "link"],
        ["Дом", ticket.building || ticket.address || "—"],
        ["Квартира", ticket.apt || "—"],
        ["Житель", ticket.resident || "—"],
        ["Телефон", ticket.phone || "—"],
        ["Создана", ticket.created || "—"],
      ];
      facts.innerHTML = rows
        .map(([label, value]) => {
          const content =
            value === "link"
              ? `<a class="ticket-link" href="#" onclick="return false">Открыть в MAX</a>`
              : escapeHtml(value);
          return `<div class="fact-grid__cell"><div class="fact-grid__label">${escapeHtml(
            label,
          )}</div><div class="fact-grid__value">${content}</div></div>`;
        })
        .join("");
    }

    const timeline = document.getElementById("drawerTimeline");
    if (timeline) {
      timeline.innerHTML = `
        <div class="timeline__row">
          <div class="timeline__rail"><span class="timeline__dot"></span></div>
          <div class="timeline__content">
            <div class="timeline__label">Обращение получено из «MAX»</div>
            <div class="timeline__who">${escapeHtml(ticket.created || "")}</div>
          </div>
        </div>
      `;
    }

    const assign = document.getElementById("drawerAssign");
    if (assign) {
      assign.textContent = ticket.assignee
        ? `Исполнитель: ${ticket.assignee}`
        : "Назначить исполнителя";
    }

    drawerStages?.querySelectorAll(".ticket-stages__btn").forEach((btn) => {
      btn.classList.toggle(
        "ticket-stages__btn--active",
        btn.getAttribute("data-status") === ticket.status,
      );
    });

    renderRequests();
  }

  function closeDrawer(rerender = true) {
    selectedId = null;
    if (drawer) drawer.hidden = true;
    if (rerender && currentScreen === "requests") renderRequests();
  }

  cabinetNav?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-screen]");
    if (!btn) return;
    setScreen(btn.getAttribute("data-screen") || "requests");
  });

  viewTabs?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-view]");
    if (!btn) return;
    setView(btn.getAttribute("data-view") || "kanban");
  });

  prioTabs?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-prio]");
    if (!btn) return;
    setPrio(btn.getAttribute("data-prio") || "all");
  });

  drawerClose?.addEventListener("click", () => closeDrawer());

  drawer?.addEventListener("click", (e) => {
    if (e.target === drawer) closeDrawer();
  });

  drawerStages?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-status]");
    if (!btn || !selectedId) return;
    const status = btn.getAttribute("data-status");
    if (!status || !STATUS[status]) return;
    tickets = tickets.map((t) => (t.id === selectedId ? { ...t, status } : t));
    openDrawer(selectedId);
  });

  document.querySelectorAll(".dynamics-chart__tabs").forEach((tabs) => {
    tabs.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-period]");
      if (!btn) return;
      tabs.querySelectorAll("[data-period]").forEach((tab) => {
        tab.classList.toggle("is-active", tab === btn);
      });
    });
  });

  const demoFrame = document.getElementById("demoFrame");
  const demoExpand = document.getElementById("demoExpand");
  const demoClose = document.getElementById("demoClose");

  function setDemoExpanded(open) {
    if (!demoFrame) return;
    demoFrame.classList.toggle("is-expanded", open);
    document.body.classList.toggle("demo-expanded", open);
    if (demoClose) demoClose.hidden = !open;
    if (!open) closeDrawer(false);
  }

  demoExpand?.addEventListener("click", () => setDemoExpanded(true));
  demoClose?.addEventListener("click", () => setDemoExpanded(false));

  window.addEventListener("resize", () => {
    if (window.innerWidth <= 720 && demoFrame?.classList.contains("is-expanded")) {
      setDemoExpanded(false);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (drawer && !drawer.hidden) {
      closeDrawer();
      return;
    }
    if (demoFrame?.classList.contains("is-expanded")) {
      setDemoExpanded(false);
    }
  });

  setScreen("dashboard");

  /* Soft decorative ball: always left → right, fades out and restarts */
  (function initHeroWave() {
    const path = document.getElementById("heroWavePath");
    const ball = document.getElementById("heroWaveBall");
    const svg = path?.ownerSVGElement;
    if (!path || !ball || !svg) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = 32000;
    let start = performance.now();
    let pathLen = 0;
    let svgW = 0;
    let svgH = 0;
    const vb = svg.viewBox.baseVal;
    const vbW = vb.width || 1200;
    const vbH = vb.height || 400;

    function measure() {
      pathLen = path.getTotalLength();
      svgW = svg.clientWidth;
      svgH = svg.clientHeight;
    }

    function opacityFor(t) {
      if (t < 0.06) return t / 0.06;
      if (t > 0.9) return (1 - t) / 0.1;
      return 1;
    }

    function place(t) {
      if (!pathLen || !svgW) return;
      const pt = path.getPointAtLength(t * pathLen);
      const x = (pt.x / vbW) * svgW;
      const y = (pt.y / vbH) * svgH;
      ball.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      ball.style.opacity = String(opacityFor(t));
    }

    measure();
    place(0);

    if (reduceMotion) {
      place(0.45);
      ball.style.opacity = "1";
      return;
    }

    function tick(now) {
      const t = ((now - start) % duration) / duration;
      place(t);
      requestAnimationFrame(tick);
    }

    window.addEventListener("resize", measure);
    requestAnimationFrame(tick);
  })();

  /* Hero KPI count-up + chart draw with synced tip */
  (function initHeroStats() {
    const root = document.querySelector(".hero-stats");
    if (!root) return;

    const nodes = [...root.querySelectorAll("[data-count]")];
    const line = document.getElementById("heroChartLine");
    const dot = document.getElementById("heroChartDot");
    const area = root.querySelector(".hero-chart__area");
    const svg = line?.ownerSVGElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function setFinal(el) {
      const target = Number(el.dataset.count) || 0;
      const suffix = el.dataset.suffix || "";
      el.textContent = `${target}${suffix}`;
    }

    function animateCount(el) {
      const target = Number(el.dataset.count) || 0;
      const suffix = el.dataset.suffix || "";
      if (reduceMotion) {
        setFinal(el);
        return;
      }
      const duration = 1400;
      const start = performance.now();

      function frame(now) {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = `${Math.round(target * eased)}${suffix}`;
        if (t < 1) requestAnimationFrame(frame);
      }

      requestAnimationFrame(frame);
    }

    function easeOut(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function runChart() {
      if (!line || !dot || !svg) return;

      const vb = svg.viewBox.baseVal;
      const vbX = vb.x || 0;
      const vbY = vb.y || 0;
      const vbW = vb.width || 388;
      const vbH = vb.height || 120;
      const len = line.getTotalLength();

      function clearDash() {
        line.style.strokeDasharray = "none";
        line.style.strokeDashoffset = "0";
      }

      function place(progress) {
        const pt = line.getPointAtLength(Math.min(1, progress) * len);
        const pad = 6;
        const x = Math.max(
          pad,
          Math.min(svg.clientWidth - pad, ((pt.x - vbX) / vbW) * svg.clientWidth)
        );
        const y = Math.max(
          pad,
          Math.min(svg.clientHeight - pad, ((pt.y - vbY) / vbH) * svg.clientHeight)
        );
        dot.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
        line.style.strokeDasharray = String(len);
        line.style.strokeDashoffset = String(len * (1 - Math.min(1, progress)));
      }

      if (reduceMotion) {
        clearDash();
        place(1);
        clearDash();
        dot.style.opacity = "1";
        area?.classList.add("is-visible");
        return;
      }

      const duration = 1400;
      const start = performance.now();
      place(0);
      dot.style.opacity = "1";

      function frame(now) {
        const t = Math.min(1, (now - start) / duration);
        place(easeOut(t));
        if (t < 1) {
          requestAnimationFrame(frame);
          return;
        }
        clearDash();
        area?.classList.add("is-visible");
      }

      requestAnimationFrame(frame);
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        nodes.forEach(animateCount);
        runChart();
        io.disconnect();
      },
      { threshold: 0.35 }
    );

    io.observe(root);

    /* Pointer tilt on stable wrapper — avoids edge flicker from 3D hitbox */
    (function initHeroTilt() {
      const zone = document.getElementById("heroStatsTilt");
      const card = root;
      if (!zone || !card) return;

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const finePointer = window.matchMedia("(pointer: fine)").matches;
      if (reduceMotion || !finePointer) return;

      const maxTilt = 8;
      const restX = 2;
      const restY = -4;
      const ease = 0.14;
      let rect = null;
      let raf = 0;
      let active = false;
      let targetX = restX;
      let targetY = restY;
      let curX = restX;
      let curY = restY;

      function measure() {
        rect = zone.getBoundingClientRect();
      }

      function setTransform(x, y) {
        card.style.transform = `rotateX(${x.toFixed(2)}deg) rotateY(${y.toFixed(2)}deg)`;
      }

      function tick() {
        curX += (targetX - curX) * ease;
        curY += (targetY - curY) * ease;
        setTransform(curX, curY);

        const still =
          active || Math.abs(targetX - curX) > 0.02 || Math.abs(targetY - curY) > 0.02;
        if (still) {
          raf = requestAnimationFrame(tick);
          return;
        }
        raf = 0;
        setTransform(restX, restY);
        curX = restX;
        curY = restY;
      }

      function ensureLoop() {
        if (!raf) raf = requestAnimationFrame(tick);
      }

      function onEnter() {
        measure();
        active = true;
        card.classList.remove("is-leaving");
        card.classList.add("is-tilting");
        ensureLoop();
      }

      function onMove(e) {
        if (!active) onEnter();
        if (!rect || !rect.width) measure();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        // Soft falloff near edges — no hard clamp snap
        const nx = Math.min(1, Math.max(0, px));
        const ny = Math.min(1, Math.max(0, py));
        const edge =
          Math.min(nx, 1 - nx, ny, 1 - ny) / 0.18;
        const strength = Math.min(1, Math.max(0.25, edge));
        targetY = (nx - 0.5) * maxTilt * 2 * strength;
        targetX = (0.5 - ny) * maxTilt * 2 * strength;
        ensureLoop();
      }

      function onLeave() {
        active = false;
        targetX = restX;
        targetY = restY;
        card.classList.remove("is-tilting");
        card.classList.add("is-leaving");
        ensureLoop();
      }

      zone.addEventListener("pointerenter", onEnter);
      zone.addEventListener("pointermove", onMove);
      zone.addEventListener("pointerleave", onLeave);
      window.addEventListener("resize", () => {
        if (active) measure();
      });
    })();
  })();

  /* Smooth FAQ accordion (marketing section) */
  (function initFaqAccordion() {
    const root = document.getElementById("faqList");
    if (!root) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const items = [...root.querySelectorAll("details.faq-item")];

    items.forEach((details) => {
      const summary = details.querySelector("summary");
      const panel = details.querySelector(".faq-item__panel");
      if (!summary || !panel) return;

      // Keep CSS grid animation in sync via class (works while closing too)
      if (details.open) details.classList.add("is-open");

      summary.addEventListener("click", (e) => {
        if (reduceMotion) return;

        e.preventDefault();
        const willOpen = !details.classList.contains("is-open");

        if (willOpen) {
          details.open = true;
          // force reflow so 0fr → 1fr transitions
          panel.getBoundingClientRect();
          details.classList.add("is-open");
          return;
        }

        details.classList.remove("is-open");
        let closed = false;
        const finishClose = () => {
          if (closed) return;
          closed = true;
          panel.removeEventListener("transitionend", onEnd);
          details.open = false;
        };
        const onEnd = (ev) => {
          if (ev.target !== panel) return;
          finishClose();
        };
        panel.addEventListener("transitionend", onEnd);
        window.setTimeout(finishClose, 400);
      });
    });
  })();

  /* Lead modal → AiDispather /api/leads */
  (function initLeadModal() {
    const modal = document.getElementById("leadModal");
    const form = document.getElementById("leadForm");
    if (!modal || !form) return;

    /** Override: <meta name="leads-api-base" content="https://…/api"> or window.LEADS_API_BASE */
    const metaApi = document
      .querySelector('meta[name="leads-api-base"]')
      ?.getAttribute("content")
      ?.trim();
    const host = window.location.hostname;
    const isLocalHost =
      host === "localhost" ||
      host === "127.0.0.1" ||
      window.location.protocol === "file:";
    const defaultApi = isLocalHost
      ? "http://localhost:4000/api"
      : "https://test.domcrm.tech/api";
    const LEADS_API_BASE = (
      window.LEADS_API_BASE ||
      metaApi ||
      defaultApi
    ).replace(/\/$/, "");

    const formView = modal.querySelector('[data-lead-view="form"]');
    const successView = modal.querySelector('[data-lead-view="success"]');
    const tariffInput = document.getElementById("leadTariff");
    const tariffLabels = modal.querySelectorAll(
      "#leadTariffLabel, [data-lead-tariff-label]"
    );
    const successTariff = document.getElementById("leadSuccessTariff");
    const submitBtn = form.querySelector(".lead-form__submit");
    const formNote = form.querySelector(".lead-form__note");
    const openers = document.querySelectorAll("[data-lead-open]");
    const defaultNote = formNote?.textContent || "";

    const TARIFF_LABELS = {
      trial: "Пробный период",
      standard: "Стандартный",
      full_access: "Полный доступ",
    };

    const fields = {
      name: document.getElementById("leadName"),
      company: document.getElementById("leadCompany"),
      phone: document.getElementById("leadPhone"),
      email: document.getElementById("leadEmail"),
    };

    function setView(view) {
      const isForm = view === "form";
      if (formView) formView.hidden = !isForm;
      if (successView) successView.hidden = isForm;
    }

    function clearFieldError(name) {
      const input = fields[name];
      const field = input?.closest(".lead-field");
      const error = form.querySelector(`[data-error-for="${name}"]`);
      if (field) field.classList.remove("is-invalid");
      if (input) input.removeAttribute("aria-invalid");
      if (error) {
        error.hidden = true;
        error.textContent = "";
      }
    }

    function clearErrors() {
      Object.keys(fields).forEach(clearFieldError);
      if (formNote) {
        formNote.textContent = defaultNote;
        formNote.classList.remove("lead-form__note--error");
      }
    }

    function showError(name, message) {
      const input = fields[name];
      const field = input?.closest(".lead-field");
      const error = form.querySelector(`[data-error-for="${name}"]`);
      if (field) field.classList.add("is-invalid");
      if (input) input.setAttribute("aria-invalid", "true");
      if (error) {
        error.hidden = false;
        error.textContent = message;
      }
    }

    function showFormError(message) {
      if (!formNote) {
        window.alert(message);
        return;
      }
      formNote.textContent = message;
      formNote.classList.add("lead-form__note--error");
    }

    /** Same rules as AiDispather normalizePhone → +79XXXXXXXXX */
    function normalizePhone(raw) {
      const digits = String(raw || "").replace(/\D/g, "");
      let national = digits;
      if (
        national.length === 11 &&
        (national.startsWith("7") || national.startsWith("8"))
      ) {
        national = national.slice(1);
      }
      if (!/^9\d{9}$/.test(national)) return null;
      return `+7${national}`;
    }

    function formatPhoneInput(raw) {
      let digits = String(raw || "").replace(/\D/g, "");
      if (!digits) return "";

      if (digits.startsWith("8")) digits = "7" + digits.slice(1);
      if (!digits.startsWith("7")) digits = "7" + digits;
      digits = digits.slice(0, 11);

      const rest = digits.slice(1);
      let formatted = "+7";
      if (rest.length > 0) formatted += " " + rest.slice(0, 3);
      if (rest.length > 3) formatted += " " + rest.slice(3, 6);
      if (rest.length > 6) formatted += "-" + rest.slice(6, 8);
      if (rest.length > 8) formatted += "-" + rest.slice(8, 10);
      return formatted;
    }

    function fieldError(name) {
      const value = fields[name]?.value.trim() || "";

      if (name === "name") {
        if (!value) return "Укажите имя";
        if (value.length < 2) return "Укажите имя (минимум 2 символа)";
        return "";
      }
      if (name === "company") {
        if (!value) return "Укажите название компании";
        if (value.length < 2) return "Укажите название компании";
        return "";
      }
      if (name === "phone") {
        if (!value) return "Укажите телефон";
        if (!normalizePhone(value)) return "Телефон в формате +7 9XX XXX-XX-XX";
        return "";
      }
      if (name === "email") {
        if (!value) return "Укажите email";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return "Введите корректный email";
        }
        return "";
      }
      return "";
    }

    function validateField(name, { force = false } = {}) {
      const input = fields[name];
      if (!input) return true;

      const value = input.value.trim();
      const wasInvalid = input.closest(".lead-field")?.classList.contains(
        "is-invalid"
      );

      // Empty: clear until blur/submit unless already marked invalid
      if (!value && !force && !wasInvalid) {
        clearFieldError(name);
        return true;
      }

      const message = fieldError(name);
      if (message) {
        showError(name, message);
        return false;
      }
      clearFieldError(name);
      return true;
    }

    function validate() {
      let ok = true;
      let firstInvalid = null;

      Object.keys(fields).forEach((name) => {
        const fieldOk = validateField(name, { force: true });
        if (!fieldOk) {
          ok = false;
          if (!firstInvalid) firstInvalid = fields[name];
        }
      });

      if (firstInvalid) firstInvalid.focus();
      return ok;
    }

    Object.entries(fields).forEach(([name, input]) => {
      if (!input) return;

      input.addEventListener("blur", () => {
        validateField(name, { force: true });
      });

      input.addEventListener("input", () => {
        if (name === "phone") {
          const formatted = formatPhoneInput(input.value);
          if (input.value !== formatted) {
            input.value = formatted;
          }
        }

        const field = input.closest(".lead-field");
        if (field?.classList.contains("is-invalid")) {
          validateField(name);
        }
      });
    });

    function setSubmitting(busy) {
      if (!submitBtn) return;
      submitBtn.disabled = busy;
      submitBtn.setAttribute("aria-busy", busy ? "true" : "false");
      submitBtn.textContent = busy ? "Отправляем…" : "Отправить";
    }

    async function parseApiError(res) {
      try {
        const data = await res.json();
        if (typeof data?.message === "string") return data.message;
        if (Array.isArray(data?.message)) return data.message.join(". ");
      } catch {
        /* ignore */
      }
      if (res.status === 401 || res.status === 403) {
        return "Сервер отклонил запрос. Нужна настройка публичного доступа на API.";
      }
      if (res.status === 503) {
        return "Почта на сервере ещё не настроена. Попробуйте позже.";
      }
      return "Не удалось отправить заявку. Попробуйте позже.";
    }

    async function submitLead(tariffId, contacts) {
      const isTrial = tariffId === "trial";
      const path = isTrial ? "/leads/trial-request" : "/leads/tariff-request";
      const body = isTrial
        ? contacts
        : {
            ...contacts,
            tariffId,
            tariffName: TARIFF_LABELS[tariffId] || tariffId,
          };

      const res = await fetch(`${LEADS_API_BASE}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(await parseApiError(res));
      }
    }

    function openModal(tariffId) {
      const id = TARIFF_LABELS[tariffId] ? tariffId : "trial";
      if (tariffInput) tariffInput.value = id;
      tariffLabels.forEach((el) => {
        el.textContent = TARIFF_LABELS[id];
      });
      if (successTariff) successTariff.textContent = TARIFF_LABELS[id];
      clearErrors();
      form.reset();
      if (tariffInput) tariffInput.value = id;
      setSubmitting(false);
      setView("form");
      modal.hidden = false;
      document.body.classList.add("lead-modal-open");
      window.setTimeout(() => fields.name?.focus(), 50);
    }

    function closeModal() {
      modal.hidden = true;
      document.body.classList.remove("lead-modal-open");
      clearErrors();
      setSubmitting(false);
      setView("form");
    }

    openers.forEach((btn) => {
      btn.addEventListener("click", () => {
        openModal(btn.getAttribute("data-tariff") || "trial");
      });
    });

    modal.querySelectorAll("[data-lead-close]").forEach((el) => {
      el.addEventListener("click", closeModal);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modal.hidden) closeModal();
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (formNote) {
        formNote.textContent = defaultNote;
        formNote.classList.remove("lead-form__note--error");
      }
      if (!validate() || submitBtn?.disabled) return;

      const tariff = tariffInput?.value || "trial";
      const phone = normalizePhone(fields.phone.value);
      if (!phone) {
        showError("phone", "Телефон в формате +7 9XX XXX-XX-XX");
        fields.phone?.focus();
        return;
      }

      const contacts = {
        name: fields.name.value.trim(),
        companyName: fields.company.value.trim(),
        phone,
        email: fields.email.value.trim(),
      };

      setSubmitting(true);
      try {
        await submitLead(tariff, contacts);
        if (successTariff) {
          successTariff.textContent = TARIFF_LABELS[tariff] || tariff;
        }
        if (typeof window.ym === "function") {
          window.ym(112716961, "reachGoal", "zayavka_success");
        }
        setView("success");
      } catch (err) {
        showFormError(
          err instanceof Error ? err.message : "Не удалось отправить заявку."
        );
      } finally {
        setSubmitting(false);
      }
    });
  })();

  /* Feature cards: staggered reveal on scroll */
  (() => {
    const grid = document.querySelector(".feature-grid");
    if (!grid) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    grid.classList.add("feature-grid--reveal");

    if (reduceMotion) {
      grid.classList.add("is-inview");
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        grid.classList.add("is-inview");
        io.disconnect();
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );

    io.observe(grid);
  })();
})();
