/* =============================================================================
   Buho — Shared JavaScript
   Injects header nav, manages dropdown, reads BUHO_CATEGORIES config.
   No external deps. Vanilla JS only.
   ============================================================================= */

/* ---------------------------------------------------------------------------
   CONFIG — Register categories & tools here.
   One entry per category folder. Each tool maps to an .html file inside.
   When adding a new tool, add it here AND add a link in index.html grid.
   --------------------------------------------------------------------------- */
var BUHO_CATEGORIES = [
  {
    name: "PDF Tools",
    folder: "PDF-Tools",
    tools: [
      { name: "Merge PDF to PNG", file: "MergePDFtoPNG.html" }
    ]
  },
  {
    name: "Reader",
    folder: "Annas-Voice",
    tools: [
      { name: "Anna's Voice", file: "annas-voice.html" }
    ]
  },
  {
    name: "About",
    folder: "",
    tools: [
      { name: "GitHub", url: "https://github.com/iharshgandhi/Buho" },
      { name: "Harsh Gandhi", url: "https://harshgandhi.com" }
    ]
  }
];

/* ---------------------------------------------------------------------------
   Detect current page type
   --------------------------------------------------------------------------- */
var BUHO_IS_INDEX = (function () {
  var path = window.location.pathname;
  var isIndex = path.endsWith("index.html") || path.endsWith("/") || path === "";
  return isIndex;
})();

/* ---------------------------------------------------------------------------
   Build top bar HTML
   --------------------------------------------------------------------------- */
function buhoBuildTopbar() {
  var catBtnClass = "buho-topbar__cat-btn";
  var catBtnText = "Tools";

  var html = '';
  html += '<header class="buho-topbar">';
  html += '  <div class="buho-topbar__left">';
  html += '    <a href="' + buhoGetHomeURL() + '" class="buho-topbar__logo" aria-label="Buho Home">';
  html += '      <span class="buho-topbar__logo-owl" aria-hidden="true">🦉</span>';
  html += '      <span>Buho</span>';
  html += '    </a>';
  html += '  </div>';
  html += '  <div class="buho-topbar__right">';
  html += '    <button class="' + catBtnClass + '" id="buho-cat-btn" aria-haspopup="true" aria-expanded="false">';
  html += '      <span>' + catBtnText + '</span>';
  html += '      <span class="buho-topbar__cat-arrow" aria-hidden="true">▼</span>';
  html += '    </button>';
  html += '    <div class="buho-dropdown" id="buho-dropdown" role="menu" aria-label="Tool categories">';
  html +=        buhoBuildDropdownContent();
  html += '    </div>';
  html += '  </div>';
  html += '</header>';
  return html;
}

/* ---------------------------------------------------------------------------
   Build dropdown menu content from BUHO_CATEGORIES
   --------------------------------------------------------------------------- */
function buhoBuildDropdownContent() {
  if (!BUHO_CATEGORIES.length) {
    return '<div class="buho-dropdown__empty">No tools yet. Coming soon!</div>';
  }

  var html = '';
  for (var c = 0; c < BUHO_CATEGORIES.length; c++) {
    var cat = BUHO_CATEGORIES[c];
    html += '<div class="buho-dropdown__category" role="group" aria-label="' + buhoEscapeHTML(cat.name) + '">';
    html += '  <span class="buho-dropdown__cat-name">' + buhoEscapeHTML(cat.name) + '</span>';
    for (var t = 0; t < cat.tools.length; t++) {
      var tool = cat.tools[t];
      var href = tool.url || buhoGetHomeURL() + cat.folder + "/" + tool.file;
      var target = tool.url ? ' target="_blank" rel="noopener"' : '';
      html += '  <a href="' + href + '" class="buho-dropdown__tool-link" role="menuitem"' + target + '>' + buhoEscapeHTML(tool.name) + '</a>';
    }
    html += '</div>';
  }
  return html;
}

/* ---------------------------------------------------------------------------
   Build sub-bar (tool name display)
   --------------------------------------------------------------------------- */
function buhoBuildSubbar() {
  var toolName = buhoGetToolName();
  var hiddenClass = BUHO_IS_INDEX ? " buho-subbar--hidden" : "";
  var html = '';
  html += '<div class="buho-subbar' + hiddenClass + '" id="buho-subbar">';
  html += '  <span class="buho-subbar__tool-name">' + buhoEscapeHTML(toolName) + '</span>';
  html += '</div>';
  return html;
}

/* ---------------------------------------------------------------------------
   Derive tool name from page <title>
   Strips " - Buho" suffix if present
   --------------------------------------------------------------------------- */
function buhoGetToolName() {
  var title = document.title || "";
  title = title.replace(/\s*[-–—|]\s*Buho\s*$/i, "").trim();
  return title || "Buho";
}

/* ---------------------------------------------------------------------------
   Get relative path to home (index.html)
   --------------------------------------------------------------------------- */
function buhoGetHomeURL() {
  if (BUHO_IS_INDEX) return "./";
  // Tool pages are one level deep (category/tool.html), so go up one level
  return "../";
}

/* ---------------------------------------------------------------------------
   Escape HTML entities
   --------------------------------------------------------------------------- */
function buhoEscapeHTML(str) {
  var div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

/* ---------------------------------------------------------------------------
   Inject header into page
   --------------------------------------------------------------------------- */
function buhoInjectHeader() {
  var topbar = buhoBuildTopbar();
  var subbar = buhoBuildSubbar();

  // Prepend subbar first, then topbar — so DOM order ends up: topbar, subbar, ...
  var body = document.body;
  body.insertAdjacentHTML("afterbegin", subbar);
  body.insertAdjacentHTML("afterbegin", topbar);
}

/* ---------------------------------------------------------------------------
   Dropdown toggle logic
   --------------------------------------------------------------------------- */
function buhoInitDropdown() {
  var btn = document.getElementById("buho-cat-btn");
  var dropdown = document.getElementById("buho-dropdown");
  if (!btn || !dropdown) return;

  btn.addEventListener("click", function (e) {
    e.stopPropagation();
    var isOpen = dropdown.classList.toggle("buho-dropdown--open");
    btn.classList.toggle("buho-topbar__cat-btn--open", isOpen);
    btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  // Close on outside click
  document.addEventListener("click", function (e) {
    if (!btn.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove("buho-dropdown--open");
      btn.classList.remove("buho-topbar__cat-btn--open");
      btn.setAttribute("aria-expanded", "false");
    }
  });

  // Close on Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      dropdown.classList.remove("buho-dropdown--open");
      btn.classList.remove("buho-topbar__cat-btn--open");
      btn.setAttribute("aria-expanded", "false");
      btn.focus();
    }
  });
}

/* ---------------------------------------------------------------------------
   Render category cards on index page
   --------------------------------------------------------------------------- */
function buhoRenderCategoryCards() {
  var container = document.getElementById("buho-categories-grid");
  if (!container) return;

  if (!BUHO_CATEGORIES.length) {
    container.innerHTML = ''
      + '<div class="buho-empty">'
      + '  <span class="buho-empty__icon" aria-hidden="true">📦</span>'
      + '  <p class="buho-empty__text">No tools installed yet.</p>'
      + '  <p style="margin-top:8px;color:var(--buho-fg-lo);font-size:var(--buho-fs-sm)">'
      + '    Check <code>_framework/FRAMEWORK.md</code> to add your first tool.'
      + '  </p>'
      + '</div>';
    return;
  }

  var html = '';
  for (var c = 0; c < BUHO_CATEGORIES.length; c++) {
    var cat = BUHO_CATEGORIES[c];
    html += '<div class="buho-category-card">';
    html += '  <h2 class="buho-category-card__name">' + buhoEscapeHTML(cat.name) + '</h2>';
    if (!cat.tools.length) {
      html += '  <p class="buho-category-card__empty">No tools in this category yet.</p>';
    } else {
      for (var t = 0; t < cat.tools.length; t++) {
        var tool = cat.tools[t];
        var href = cat.folder + "/" + tool.file;
        html += '  <a href="' + href + '" class="buho-category-card__tool">' + buhoEscapeHTML(tool.name) + '</a>';
      }
    }
    html += '</div>';
  }
  container.innerHTML = html;
}

/* ---------------------------------------------------------------------------
   Init — called automatically on DOMContentLoaded
   --------------------------------------------------------------------------- */
function buhoInit() {
  buhoInjectHeader();
  buhoInitDropdown();
  if (BUHO_IS_INDEX) {
    buhoRenderCategoryCards();
  }
}

document.addEventListener("DOMContentLoaded", buhoInit);
