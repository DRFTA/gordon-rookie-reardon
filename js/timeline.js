// assets/js/timeline.js

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

// FIXED: Proper path handling
function getImagePath(item) {
  if (!item.image) return "";
  
  // Remove leading slash if present
  let path = item.image.replace(/^\//, "");
  
  // If path already starts with assets/, keep it
  if (path.startsWith("assets/")) {
    return path;
  }
  
  // If path starts with images/, add assets/ prefix
  if (path.startsWith("images/")) {
    return `assets/${path}`;
  }
  
  // Otherwise, construct from year
  if (item.year && item.filename) {
    return `assets/images/years/${item.year}/${item.filename}`;
  }
  
  return path;
}

function renderTimeline(items) {
  if (!timelineEl) return;
  timelineEl.innerHTML = "";

  if (!items || items.length === 0) {
    timelineEl.innerHTML = `
      <div class="timeline-item">
        <div class="timeline-card" style="text-align: center; padding: 40px;">
          <h3 style="color: var(--text2);">No articles found for this year.</h3>
        </div>
      </div>`;
    return;
  }

  const grouped = sortByDateAsc(items);
  grouped.forEach((item) => {
    const el = document.createElement("div");
    el.className = "timeline-item";

    const imgPath = getImagePath(item);
    const altText = escapeHtml(item.filename || `Newspaper image ${item.year}`);

    el.innerHTML = `
      <div class="timeline-card">
        <div class="year-badge">${escapeHtml(item.dateISO)}</div>
        <h3>${escapeHtml(labelMonth(item))}</h3>
        <p>${escapeHtml(item.headline || item.filename || "Article")}</p>
        ${imgPath ? `<img
          src="${imgPath}"
          alt="${altText}"
          loading="lazy"
          style="width: 100%; height: auto; border-radius: 8px; margin-top: 10px;"
          onerror="this.style.display='none'"
        />` : ''}
      </div>
    `;

    timelineEl.appendChild(el);
  });
}

function renderYearGrid(items) {
  if (!yearGrid) return;
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

// FIXED: Better data loading with multiple path attempts
async function loadData() {
  // Try multiple possible paths
  const paths = [
    "./data/articles.json",
    "../data/articles.json",
    "data/articles.json",
    "/data/articles.json"
  ];
  
  for (const path of paths) {
    try {
      console.log(`Attempting to load data from: ${path}`);
      const res = await fetch(path, { cache: "no-store" });
      
      if (res.ok) {
        const jsonData = await res.json();
        console.log(`✅ Data loaded successfully from: ${path}`);
        return jsonData;
      }
    } catch (e) {
      console.log(`❌ Failed to load from: ${path}`);
    }
  }
  
  throw new Error("Could not load articles.json from any path");
}

(async function init() {
  try {
    // Try to load the data
    data = await loadData();
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error("No data loaded or empty data array");
    }
    
    console.log(`✅ Loaded ${data.length} articles`);
    
    renderYearGrid(data);
    applyYearFromURL();

    window.addEventListener("popstate", applyYearFromURL);
  } catch (error) {
    console.error("Failed to load timeline data:", error);
    if (timelineEl) {
      timelineEl.innerHTML = `
        <div class="timeline-item">
          <div class="timeline-card" style="text-align: center; padding: 40px;">
            <h3 style="color: var(--gold);">⚠️ Error Loading Data</h3>
            <p style="color: var(--text2);">Could not load timeline data.</p>
            <p style="font-size: 0.8rem; color: var(--text2); margin-top: 10px;">
              Error: ${error.message}
            </p>
            <p style="font-size: 0.8rem; color: var(--text2); margin-top: 5px;">
              Please make sure <code style="background: var(--card); padding: 2px 8px; border-radius: 4px;">data/articles.json</code> exists.
            </p>
          </div>
        </div>
      `;
    }
    
    // Also show empty year grid
    if (yearGrid) {
      yearGrid.innerHTML = `<a href="#" style="opacity: 0.5; cursor: default;">No data</a>`;
    }
  }
})();
