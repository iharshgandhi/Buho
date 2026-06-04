# Buho Framework — Guide for AI Agents

This file tells future AI coding agents how to work with the Buho project.
Follow these rules. Keep the codebase consistent.

## Project Overview

Buho is a static web app library. Browser-based tools, one per HTML page.
Hosted on GitHub Pages. **No server-side code.** Vanilla HTML, CSS, JS only.
Domain: `buho.co.in` → points to `index.html`.

## File Structure

```
Buho/
├── index.html                  ← Landing page (home)
├── .gitignore                  ← Git ignore rules (update when needed)
├── _framework/
│   ├── buho.css                ← Shared styles (do NOT edit casually)
│   ├── buho.js                 ← Shared JS: header nav, config, init
│   ├── TOOL_TEMPLATE.html      ← Copy this to start a new tool
│   └── FRAMEWORK.md            ← This file
├── category-name/              ← One folder per tool category
│   └── tool-name.html          ← Individual tool page
└── another-category/
    └── another-tool.html
```

## How to Add a New Tool

### Step 1: Create the tool page

1. Copy `_framework/TOOL_TEMPLATE.html` into the appropriate category folder.
   - Example: `text-tools/json-formatter.html`
2. Rename the file. Use **kebab-case** (lowercase, hyphens).
3. Edit the `<title>` tag: `Tool Name - Buho`
4. Add your tool's HTML inside `<main class="buho-content">`.
5. If tool needs custom styles, add a `<style>` block in `<head>` AFTER the buho.css link.
6. If tool needs custom JS, add a `<script>` block at the bottom AFTER the buho.js script.
7. Use the CSS utility classes from `buho.css` (e.g., `.buho-textarea`, `.buho-btn`).
8. Keep everything in a single HTML file. No separate CSS/JS files per tool.

### Step 2: Register the tool in config

Open `_framework/buho.js`. Find the `BUHO_CATEGORIES` array.
Add your tool to the correct category, or create a new category if needed.

```js
var BUHO_CATEGORIES = [
  {
    name: "Text Tools",
    folder: "text-tools",
    tools: [
      { name: "JSON Formatter", file: "json-formatter.html" },
      { name: "Your New Tool", file: "your-new-tool.html" }  // ← add here
    ]
  }
];
```

### Step 3: Add link on landing page

No extra step needed. The `index.html` category grid auto-renders from `BUHO_CATEGORIES`.

### Step 4: Update .gitignore if needed

If your tool generates or uses any of these, add entries to `.gitignore`:
- Large binary assets (images, audio, video) that are outputs, not source
- Generated/cached files
- User data files
- Python `__pycache__/`, `*.pyc` (already covered)

Example: If a tool writes `output/` folder → add `category-name/output/` to `.gitignore`.

Do NOT ignore: source HTML/CSS/JS files, small icon SVGs, framework files.

## Design Rules

| Rule | Value |
|------|-------|
| Theme | Solarized Light (`#fdf6e3` bg, `#657b83` text) |
| Font | System font stack (see `--buho-font` in buho.css) |
| Monospace | System mono stack for code/input (`--buho-font-mono`) |
| Accent | `#268bd2` (blue) for links, buttons, focus |
| Mobile-first | Min tap target 44px, base font 16px, test at 375px width |
| Dependencies | **Zero.** No CDN, no npm, no frameworks. Vanilla only. |
| Browser target | Modern evergreen browsers (Chrome, Firefox, Safari, Edge) |
| Accessibility | Use semantic HTML. Label form inputs. Use `aria-*` on interactive elements. |
| Spacing | Use `--buho-space-*` CSS variables. Base unit is 8px. |
| File naming | kebab-case for all folders and files |

## CSS Variables Available

See `_framework/buho.css` for the full palette. Key variables:

```css
var(--buho-bg)        /* #fdf6e3 — page background */
var(--buho-bg-hi)     /* #eee8d5 — elevated / card background */
var(--buho-fg)        /* #657b83 — body text */
var(--buho-fg-hi)     /* #586e75 — headings */
var(--buho-fg-lo)     /* #93a1a1 — secondary text */
var(--buho-blue)      /* #268bd2 — links, primary */
var(--buho-green)     /* #859900 — success */
var(--buho-red)       /* #dc322f — error */
var(--buho-orange)    /* #cb4b16 — warning */
```

## Available CSS Utility Classes

- `.buho-content` — Scrollable content area (mandatory on every tool page)
- `.buho-content__inner` — Max-width centered wrapper
- `.buho-textarea` — Styled textarea for code/input
- `.buho-btn` — Primary button
- `.buho-btn--outline` — Outline button variant
- `.buho-tool-section` — Section wrapper with bottom margin
- `.buho-tool-section__title` — Section heading
- `.buho-sr-only` — Screen-reader-only text

## Do NOT Do

- Do NOT add external CDN links (no Bootstrap, Tailwind CDN, Google Fonts, etc.)
- Do NOT use JavaScript frameworks (React, Vue, jQuery, etc.)
- Do NOT edit `buho.css` or `buho.js` unless fixing a framework bug
- Do NOT change the header layout structure
- Do NOT add server-side code (PHP, Node servers, etc.)
- Do NOT remove `<!DOCTYPE html>` or `<meta viewport>` from tool pages
- Do NOT use inline styles — use `<style>` block in `<head>` or utility classes

## Quick Reference for Adding Tools

```
1. cp _framework/TOOL_TEMPLATE.html category-folder/tool-name.html
2. Edit <title>
3. Add tool HTML in <main class="buho-content">
4. Add tool to BUHO_CATEGORIES in _framework/buho.js
5. Update .gitignore if tool generates files
6. Test: open tool-name.html in browser, verify header loads, verify dropdown works
7. Commit
```
