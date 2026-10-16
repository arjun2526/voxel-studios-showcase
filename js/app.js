const CATALOG_URL = "apps.json";
const PLATFORM_NAMES = { windows: "Windows", macos: "macOS" };
const PLATFORM_SHORT = { windows: "WIN / W", macos: "MAC / M" };

document.querySelectorAll("[data-year]").forEach((node) => { node.textContent = new Date().getFullYear(); });

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

function formatDate(value, options = { year: "numeric", month: "short", day: "numeric" }) {
  const date = new Date(`${value || ""}T00:00:00`);
  return Number.isNaN(date.getTime()) ? "Date not set" : new Intl.DateTimeFormat("en", options).format(date);
}

function latestRelease(app) {
  return [...(app.releases || [])].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))[0] || null;
}

function localAsset(value) {
  const candidate = typeof value === "string" ? value : (value?.src || value?.url || "");
  return safeHref(candidate);
}

function appArtwork(app, index = "01", detail = false) {
  const screenshots = Array.isArray(app.screenshots) ? app.screenshots : [];
  const screenshot = screenshots.find((entry) => localAsset(entry));
  const src = localAsset(screenshot);
  const alt = typeof screenshot === "object" && screenshot?.alt ? screenshot.alt : `${app.name || "App"} screenshot`;
  const icon = localAsset(app.icon);
  const iconMarkup = icon
    ? `<img class="app-icon-image" src="${escapeHtml(icon)}" alt="" loading="lazy" data-asset-preview><span class="app-icon-empty" aria-label="App icon not added"><span>ICON</span><small>ADD IN JSON</small></span>`
    : `<span class="app-icon-empty" aria-label="App icon not added"><span>ICON</span><small>ADD IN JSON</small></span>`;
  return `<div class="app-card-visual ${detail ? "detail-app-visual" : ""} ${src ? "has-preview" : "no-preview"}">
    <div class="card-topline"><span class="card-serial">VS / ${escapeHtml(String(index).padStart(2, "0"))}</span>${app.demo ? '<span class="demo-badge">DEMO ENTRY</span>' : ""}</div>
    <div class="screenshot-empty"><span>APP SCREENSHOT</span><strong>Your app screenshot<br>goes here.</strong><small>Add a real image path in apps.json</small></div>
    ${src ? `<img class="app-screenshot" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" data-asset-preview>` : ""}
    <div class="app-card-icon ${icon ? "has-icon" : ""}">${iconMarkup}</div>
  </div>`;
}

function platformChips(platforms = []) {
  return platforms.map((platform) => `<span class="platform-chip">${escapeHtml(PLATFORM_SHORT[platform] || platform.toUpperCase())}</span>`).join("");
}

function hasAnyInstaller(app) {
  return (app.releases || []).some((release) => (release.downloads || []).some((item) => item.status === "available" && Boolean(safeHref(item.downloadUrl))));
}

function safeHref(value) {
  const href = String(value || "").trim();
  if (!href || href.startsWith("//")) return "";
  if (/^https?:\/\//i.test(href) || href.startsWith("/") || /^(?:\.\.\/|\.\/)?[A-Za-z0-9][A-Za-z0-9._/%-]*(?:[?#][A-Za-z0-9._~!$&'()*+,;=:@/?%-]*)?$/.test(href)) return href;
  return "";
}

function appCard(app, index) {
  const release = latestRelease(app);
  const href = `app-detail.html?app=${encodeURIComponent(app.id || "")}`;
  const availability = hasAnyInstaller(app)
    ? '<span>Installer available</span><span class="pending-mark">↘ READY</span>'
    : '<span>Release history listed</span><span class="pending-mark">INSTALLER PENDING</span>';
  return `<article class="app-card" data-reveal>
    <a href="${href}" aria-label="View ${escapeHtml(app.name)} releases">${appArtwork(app, index)}
    <div class="card-body">
      <div class="card-kicker"><span class="category">${escapeHtml(app.category || "Application")}</span><span>${app.demo ? "SAMPLE DATA" : "VOXEL / APP"}</span></div>
      <div class="card-title-row"><h3 class="card-title">${escapeHtml(app.name || "Untitled app")}</h3><span class="card-open" aria-hidden="true">↗</span></div>
      <p class="card-tagline">${escapeHtml(app.tagline || "Explore the app and its release history.")}</p>
      <hr class="card-divider">
      <div class="card-meta-row"><span class="platform-list" aria-label="Supported platforms">${platformChips(app.platforms)}</span><span class="latest-release">LATEST <strong>${release ? `v${escapeHtml(release.version || "—")}` : "—"}</strong>${release ? ` · ${escapeHtml(formatDate(release.date, { month: "short", year: "numeric" }))}` : ""}</span></div>
      <div class="card-availability">${availability}</div>
    </div></a>
  </article>`;
}

function initCatalog(data) {
  const grid = document.querySelector("#app-grid");
  if (!grid) return;
  const apps = Array.isArray(data.apps) ? data.apps : [];
  const search = document.querySelector("#app-search");
  const sort = document.querySelector("#app-sort");
  const resultCopy = document.querySelector("#results-copy");
  const filterButtons = [...document.querySelectorAll("[data-platform-filter]")];
  let activePlatform = "all";

  document.querySelector("[data-app-count]").textContent = String(apps.length).padStart(2, "0");
  document.querySelector('[data-filter-count="all"]').textContent = String(apps.length).padStart(2, "0");
  for (const platform of ["windows", "macos"]) {
    const count = apps.filter((app) => (app.platforms || []).includes(platform)).length;
    document.querySelector(`[data-filter-count="${platform}"]`).textContent = String(count).padStart(2, "0");
  }

  function update() {
    const query = (search.value || "").trim().toLowerCase();
    const filtered = apps.filter((app) => {
      const matchesPlatform = activePlatform === "all" || (app.platforms || []).includes(activePlatform);
      const haystack = [app.name, app.tagline, app.description, app.category].join(" ").toLowerCase();
      return matchesPlatform && haystack.includes(query);
    });
    const sorted = [...filtered];
    if (sort.value === "name") sorted.sort((a, b) => String(a.name).localeCompare(String(b.name)));
    if (sort.value === "updated") sorted.sort((a, b) => String(latestRelease(b)?.date || "").localeCompare(String(latestRelease(a)?.date || "")));
    if (sort.value === "featured") sorted.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
    resultCopy.textContent = `${String(sorted.length).padStart(2, "0")} ${sorted.length === 1 ? "app" : "apps"} / ${activePlatform === "all" ? "all platforms" : PLATFORM_NAMES[activePlatform]}`;
    grid.innerHTML = sorted.length ? sorted.map((app, index) => appCard(app, index + 1)).join("") : `<div class="empty-state"><strong>No apps found.</strong><p>Try another search or platform filter.</p></div>`;
    grid.setAttribute("aria-busy", "false");
    observeReveals(grid);
    attachPreviewFallbacks(grid);
  }

  filterButtons.forEach((button) => button.addEventListener("click", () => {
    activePlatform = button.dataset.platformFilter;
    filterButtons.forEach((item) => { const selected = item === button; item.classList.toggle("is-selected", selected); item.setAttribute("aria-pressed", String(selected)); });
    update();
  }));
  search.addEventListener("input", update);
  sort.addEventListener("change", update);
  document.addEventListener("keydown", (event) => {
    if (event.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) { event.preventDefault(); search.focus(); }
  });
  update();
}

function downloadControl(item, supportedPlatform) {
  const platform = item?.platform || supportedPlatform;
  const href = item ? safeHref(item.downloadUrl) : "";
  const available = item?.status === "available" && href;
  if (available) {
    const external = /^https?:\/\//i.test(href);
    const fileName = escapeHtml(item.filename || "");
    return `<div class="download-row"><span class="download-platform">${escapeHtml(PLATFORM_NAMES[platform] || platform)}<small>${fileName || "Installer ready"}</small></span><a class="download-button" href="${escapeHtml(href)}"${fileName ? ` download="${fileName}"` : " download"}${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>Download ↘</a></div>`;
  }
  const state = item?.status === "planned" ? "Planned" : item?.status === "unavailable" ? "Unavailable" : "Installer not uploaded";
  const note = item?.status === "planned" ? "Platform release planned" : item?.status === "unavailable" ? "No installer for this release" : "Add an installer URL in apps.json to enable";
  return `<div class="download-row"><span class="download-platform">${escapeHtml(PLATFORM_NAMES[platform] || platform)}<small>${escapeHtml(state)}</small></span><button class="download-button" type="button" disabled>${escapeHtml(state)}</button><p class="download-note">${escapeHtml(note)}</p></div>`;
}

function releaseCard(release, index, supportedPlatforms) {
  const downloads = Array.isArray(release.downloads) ? release.downloads : [];
  const rows = supportedPlatforms.map((platform) => {
    const item = downloads.find((entry) => entry.platform === platform);
    return downloadControl(item, platform);
  }).join("");
  const changes = (release.changes || []).map((change) => `<li>${escapeHtml(change)}</li>`).join("");
  return `<article class="release-card" data-reveal>
    <div class="release-primary"><span class="release-index">${String(index).padStart(2, "0")}</span><div><h3 class="release-version">v${escapeHtml(release.version || "—")}</h3><p class="release-name">${escapeHtml(release.name || "Release")}</p><span class="release-date">${escapeHtml(formatDate(release.date))}<span class="release-status">${escapeHtml(release.status || "Release")}</span></span></div></div>
    <div><p class="release-summary">${escapeHtml(release.summary || "Release information is being prepared.")}</p>${changes ? `<ul class="change-list">${changes}</ul>` : ""}</div>
    <div class="platform-downloads">${rows || '<p class="download-note">No platforms configured for this release.</p>'}</div>
  </article>`;
}

function initDetail(data) {
  const root = document.querySelector("#detail-root");
  if (!root) return;
  const params = new URLSearchParams(window.location.search);
  const app = (data.apps || []).find((entry) => entry.id === params.get("app"));
  root.setAttribute("aria-busy", "false");
  if (!app) {
    document.title = "App not found — VOXEL STUDIOS";
    root.innerHTML = `<section class="not-found"><div class="eyebrow"><span class="eyebrow-line"></span> RELEASE ARCHIVE / 404</div><h1>Nothing here yet.</h1><p>This app could not be found in the catalog. Head back to the collection to find another project.</p><a class="text-link" href="index.html#catalog">← Browse all apps</a></section>`;
    return;
  }
  document.title = `${app.name} — VOXEL STUDIOS`;
  const releases = [...(app.releases || [])].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  const supportedPlatforms = Array.isArray(app.platforms) ? app.platforms : [];
  const firstRelease = releases[0];
  root.innerHTML = `<div class="detail-content">
    <a class="back-link" href="index.html#catalog"><span>←</span> Back to all apps</a>
    <section class="detail-hero">
      <div class="detail-copy"><div class="eyebrow"><span class="eyebrow-line"></span> ${escapeHtml(app.category || "VOXEL / APPLICATION")}</div>${app.demo ? '<span class="detail-demo-note">Sample app · replace before publishing</span>' : ""}<h1 class="detail-title">${escapeHtml(app.name || "Untitled app")}</h1><p class="detail-tagline">${escapeHtml(app.tagline || "")}</p><p class="detail-description">${escapeHtml(app.description || "App description coming soon.")}</p></div>
      <div>${appArtwork(app, "01", true)}<dl class="detail-meta"><div><dt>Latest version</dt><dd>${firstRelease ? `v${escapeHtml(firstRelease.version || "—")}` : "Not released"}</dd></div><div><dt>Latest update</dt><dd>${firstRelease ? escapeHtml(formatDate(firstRelease.date)) : "—"}</dd></div><div><dt>Platforms</dt><dd>${supportedPlatforms.map((p) => escapeHtml(PLATFORM_NAMES[p] || p)).join(" · ") || "TBA"}</dd></div><div><dt>Requirements</dt><dd>${supportedPlatforms.map((p) => escapeHtml(app.requirements?.[p] || "Details TBA")).join(" · ") || "Details TBA"}</dd></div></dl></div>
    </section>
    <section class="release-section"><div class="release-heading"><div><div class="eyebrow"><span class="eyebrow-line"></span> The changelog / ${String(releases.length).padStart(2, "0")}</div><h2>Every version.<br><span class="muted-heading">One timeline.</span></h2></div><p>Release notes and platform installers live here. Download controls only activate when a release has a valid installer link.</p></div>
      <div class="release-list">${releases.length ? releases.map((release, index) => releaseCard(release, index + 1, supportedPlatforms)).join("") : '<div class="empty-state"><strong>No releases yet.</strong><p>Add release records to this app in apps.json.</p></div>'}</div>
    </section>
  </div>`;
  observeReveals(root);
  attachPreviewFallbacks(root);
}

function attachPreviewFallbacks(root = document) {
  root.querySelectorAll("img[data-asset-preview]").forEach((image) => {
    const frame = image.closest(".app-card-visual");
    const failed = () => {
      image.remove();
      if (image.classList.contains("app-icon-image")) image.closest(".app-card-icon")?.classList.remove("has-icon");
      else if (frame) frame.classList.add("no-preview");
    };
    image.addEventListener("load", () => {
      if (image.classList.contains("app-screenshot") && frame) frame.classList.add("preview-ready");
    }, { once: true });
    image.addEventListener("error", failed, { once: true });
    if (image.complete) {
      if (image.naturalWidth === 0) failed();
      else if (image.classList.contains("app-screenshot") && frame) frame.classList.add("preview-ready");
    }
  });
}

function initStudio(studio = {}) {
  const socials = studio.socials || {};
  document.querySelectorAll('[data-social="instagram"]').forEach((link) => { if (safeHref(socials.instagram)) link.href = socials.instagram; });
  document.querySelectorAll('[data-social="x"]').forEach((link) => { if (safeHref(socials.x)) link.href = socials.x; });
  const discordHandle = String(socials.discordHandle || "voxel_studio").replace(/^@/, "");
  document.querySelectorAll("[data-copy-discord]").forEach((button) => {
    button.title = `Copy Discord handle @${discordHandle}`;
    button.setAttribute("aria-label", `Copy Discord handle @${discordHandle}`);
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(discordHandle);
        button.classList.add("is-copied");
        button.dataset.originalLabel ||= button.querySelector("span")?.textContent || "Discord";
        const label = button.querySelector("span");
        if (label) label.textContent = "Copied @voxel_studio";
        window.setTimeout(() => { button.classList.remove("is-copied"); if (label) label.textContent = button.dataset.originalLabel; }, 1700);
      } catch {
        button.title = `Discord handle: @${discordHandle}`;
      }
    });
  });
}

let revealObserver;
function observeReveals(root = document) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    root.querySelectorAll("[data-reveal]").forEach((item) => item.classList.add("is-revealed"));
    return;
  }
  if (!("IntersectionObserver" in window)) {
    root.querySelectorAll("[data-reveal]").forEach((item) => item.classList.add("is-revealed"));
    return;
  }
  document.documentElement.classList.add("js-reveal-ready");
  revealObserver ||= new IntersectionObserver((entries, observer) => entries.forEach((entry) => {
    if (entry.isIntersecting) { entry.target.classList.add("is-revealed"); observer.unobserve(entry.target); }
  }), { threshold: 0.12, rootMargin: "0px 0px -36px 0px" });
  root.querySelectorAll("[data-reveal]:not(.is-revealed)").forEach((item) => revealObserver.observe(item));
}

function initScrollProgress() {
  const progress = document.createElement("div");
  progress.className = "scroll-progress";
  progress.setAttribute("aria-hidden", "true");
  document.body.append(progress);
  let ticking = false;
  const update = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
      ticking = false;
    });
  };
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
}

async function loadCatalog() {
  if (!document.querySelector("#app-grid") && !document.querySelector("#detail-root")) return;
  try {
    const response = await fetch(CATALOG_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`Catalog request failed (${response.status})`);
    const data = await response.json();
    initStudio(data.studio || {});
    initCatalog(data);
    initDetail(data);
  } catch (error) {
    const grid = document.querySelector("#app-grid");
    const detailRoot = document.querySelector("#detail-root");
    if (grid) {
      grid.setAttribute("aria-busy", "false");
      grid.innerHTML = '<div class="empty-state"><strong>Catalog unavailable.</strong><p>Serve this folder from a local web server so the page can load apps.json.</p></div>';
      document.querySelector("#results-copy").textContent = "Unable to load collection";
    }
    if (detailRoot) {
      detailRoot.setAttribute("aria-busy", "false");
      detailRoot.innerHTML = '<section class="not-found"><div class="eyebrow"><span class="eyebrow-line"></span> RELEASE ARCHIVE</div><h1>Catalog unavailable.</h1><p>Run this folder through a local web server so the page can read apps.json.</p><a class="text-link" href="index.html">← Back to the homepage</a></section>';
    }
    console.error("Could not load apps.json", error);
  }
}

loadCatalog();
initScrollProgress();
observeReveals();
