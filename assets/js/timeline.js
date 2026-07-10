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
  // your JSON has monthName; your examples also use "July 8" style labels
  return item.label || `${item.monthName} ${item.day}`;
}

function renderTimeline(items) {
  timelineEl.innerHTML = "";

  const grouped = sortByDateAsc(items);
  grouped.forEach((item) => {
    const el = document.createElement("div");
    el.className = "timeline-item";

    el.innerHTML = `
      <div class="timeline-card">
        <div class="year-badge">${escapeHtml(item.dateISO)}</div>
        <h3>${escapeHtml(labelMonth(item))}</h3>
        <p>${escapeHtml(item.filename || "")}</p>
      </div>
    `;

    timelineEl.appendChild(el);
  });
}

function setActiveYear(year) {
  const links = yearGrid.querySelectorAll("a");
  links.forEach(a => a.classList.toggle("active", a.dataset.year === String(year)));
}

function renderYearGrid(items) {
  const years = uniqYears(items);

  yearGrid.innerHTML = "";

  // Year "all"
  const all = document.createElement("a");
  all.href = "#";
  all.dataset.year = "all";
  all.textContent = "All";
  all.className = "active";
  all.addEventListener("click", (e) => {
    e.preventDefault();
    setActiveYear("all");
    renderTimeline(data);
  });
  yearGrid.appendChild(all);

  years.forEach((y) => {
    const a = document.createElement("a");
    a.href = "#";
    a.dataset.year = String(y);
    a.textContent = String(y);
    a.addEventListener("click", (e) => {
      e.preventDefault();
      setActiveYear(y);
      renderTimeline(data.filter(x => String(x.year) === String(y)));
    });
    yearGrid.appendChild(a);
  });
}

(async function init() {
  const res = await fetch("./data/articles.json", { cache: "no-store" });
  data = await res.json();

  renderYearGrid(data);
  renderTimeline(data);
})();
