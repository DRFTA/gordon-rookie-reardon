const yearGrid = document.querySelector("#yearGrid");
const timelineEl = document.querySelector("#timeline");

let data = [];

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[m]));
}

function sortByDateAsc(items) {
  return [...items].sort((a, b) => a.dateISO.localeCompare(b.dateISO));
}

function uniqYears(items) {
  return [...new Set(items.map(x => x.year))].sort((a, b) => a - b);
}

function labelMonth(item) {
  return item.label || `${item.monthName} ${item.day}`;
}

function stripLeadingSlash(path) {
  return String(path || "").replace(/^\//, "");
}

function renderTimeline(items) {
  timelineEl.innerHTML = "";

  const grouped = sortByDateAsc(items);
  grouped.forEach((item) => {
    const el = document.createElement("div");
    el.className = "timeline-item";

    const imgSrc = stripLeadingSlash(item.image || (item.filename ? `assets/images/years/${item.year}/${item.filename}` : ""));

    el.innerHTML = `
      <div class="timeline-card">
        <div class="year-badge">${escapeHtml(item.dateISO)}</div>
        <h3>${escapeHtml(labelMonth(item))}</h3>
        <p>${escapeHtml(item.filename || "")}</p>
        <img
          src="${imgSrc}"
          alt="${escapeHtml(item.filename || `Newspaper image ${item.year}`)}"
          loading="lazy"
          style="width: 100%; height: auto; border-radius: 8px;"
          onerror="this.style.display='none'"
        />
      </div>
    `;

    timelineEl.appendChild(el);
  });
}

function renderYearGrid(items) {
  const years = uniqYears(items);

  yearGrid.innerHTML = "";

  const all = document.createElement("a");
  all.href = "timeline.html";
  all.dataset.year = "all";
  all.textContent = "All";
  all.classList.add("active");
  yearGrid.appendChild(all);

  years.forEach((y) => {
    const a = document.createElement("a");
    a.href = `timeline.html?year=${encodeURIComponent(String(y))}`;
    a.dataset.year = String(y);
    a.textContent = String(y);
    yearGrid.appendChild(a);
  });
}

function applyYearFromURL() {
  const url = new URL(window.location.href);
  const year = url.searchParams.get("year");
  const yearStr = year ? String(year) : "all";

  const filtered = (yearStr === "all")
    ? data
    : data.filter(x => String(x.year) === yearStr);

  renderTimeline(filtered);

  const links = yearGrid.querySelectorAll("a");
  links.forEach((a) => a.classList.toggle("active", a.dataset.year === yearStr));
}

(async function init() {
  const res = await fetch("./data/articles.json", { cache: "no-store" });
  data = await res.json();

  renderYearGrid(data);
  applyYearFromURL();

  window.addEventListener("popstate", applyYearFromURL);
})();
