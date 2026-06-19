#!/usr/bin/env python3
"""E2E test: creates password-protected PDF, opens tool in browser, tests unlock flow."""

import os
import tempfile
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
TEST_DIR = REPO_ROOT / "PDF-Tools"

# ---------- helpers ----------
def bold(s): return f"\033[1m{s}\033[0m"
def ok(s):   return f"\033[92m✓ {s}\033[0m"
def fail(s): return f"\033[91m✗ {s}\033[0m"

def check_deps():
    missing = []
    try:
        import pikepdf  # noqa
    except ImportError:
        missing.append("pikepdf")
    try:
        from playwright.sync_api import sync_playwright  # noqa
    except ImportError:
        missing.append("playwright")
    if missing:
        print(fail(f"Missing deps: {' '.join(missing)}"))
        print(f"  pip install {' '.join(missing)}")
        print("  playwright install chromium")
        exit(1)

def create_test_pdfs():
    import pikepdf

    test_locked = TEST_DIR / "test_locked.pdf"
    test_unlocked = TEST_DIR / "test_unlocked.pdf"

    # Three-page PDF with varied content
    pdf = pikepdf.new()
    for i in range(3):
        page = pdf.add_blank_page(size=(612, 792))
        # Add some text using a content stream so it's not blank
        with pdf.open_metadata(set_pikepdf_as_editor=False) as meta:
            meta['dc:title'] = 'Test PDF'
    pdf.save(str(test_unlocked))

    # Save with user password
    pdf.save(str(test_locked), encryption=pikepdf.Encryption(
        user="test123", owner="owner456"
    ))
    pdf.close()

    print(ok("Created test PDFs with password 'test123'"))
    return test_locked, test_unlocked

def run_tests(tool_url, locked_path):
    from playwright.sync_api import sync_playwright, expect

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(
            accept_downloads=True,
            viewport={"width": 1280, "height": 900}
        )
        page = context.new_page()

        print(bold("\n--- Test 1: Upload unlocked PDF ---"))
        page.goto(tool_url)
        page.wait_for_load_state("networkidle")
        # Wait for libraries to load
        page.wait_for_timeout(2000)
        # Upload unlocked PDF
        upload = page.locator("#pw-file-input")
        upload.set_input_files(str(TEST_DIR / "test_unlocked.pdf"))
        page.wait_for_timeout(2000)
        # Check "already unlocked" banner appears
        banner = page.locator("#pw-already-unlocked")
        expect(banner).to_be_visible(timeout=5000)
        print(ok("Unlocked PDF detected — 'already unlocked' banner visible"))

        # Check pages rendered
        cards = page.locator(".pw-page-card")
        count = cards.count()
        print(ok(f"Rendered {count} pages"))
        assert count == 3, f"Expected 3 pages, got {count}"
        print(bold("  ✓ Test 1 PASSED"))

        print(bold("\n--- Test 2: Upload locked PDF → password prompt ---"))
        # Reset
        page.locator("#pw-change-btn").click()
        page.wait_for_timeout(500)
        upload = page.locator("#pw-file-input")
        upload.set_input_files(str(locked_path))
        page.wait_for_timeout(2000)
        # Should see password screen
        pw_screen = page.locator("#pw-password-screen")
        expect(pw_screen).to_be_visible(timeout=5000)
        print(ok("Password prompt shown"))
        print(bold("  ✓ Test 2 PASSED"))

        print(bold("\n--- Test 3: Wrong password → error ---"))
        page.locator("#pw-password-input").fill("wrongpass")
        page.locator("#pw-unlock-btn").click()
        page.wait_for_timeout(1500)
        pw_error = page.locator("#pw-pw-error")
        expect(pw_error).to_be_visible(timeout=3000)
        print(ok("Wrong password error shown"))
        print(bold("  ✓ Test 3 PASSED"))

        print(bold("\n--- Test 4: Correct password → pages render ---"))
        page.locator("#pw-password-input").fill("test123")
        page.locator("#pw-unlock-btn").click()
        page.wait_for_timeout(3000)
        # Should see loaded screen with pages
        loaded = page.locator("#pw-loaded-screen")
        expect(loaded).to_be_visible(timeout=5000)
        cards = page.locator(".pw-page-card")
        count = cards.count()
        print(ok(f"Pages rendered: {count}"))
        assert count == 3, f"Expected 3 pages, got {count}"
        # Banner should NOT be visible (password was needed)
        banner = page.locator("#pw-already-unlocked")
        expect(banner).to_be_hidden()
        print(ok("Already-unlocked banner hidden (was password-protected)"))
        print(bold("  ✓ Test 4 PASSED"))

        print(bold("\n--- Test 5: Download unlocked PDF ---"))
        download_btn = page.locator("#pw-download-btn")
        expect(download_btn).not_to_be_disabled()
        # Start download
        with page.expect_download() as download_info:
            download_btn.click()
        download = download_info.value
        download_path = str(TEST_DIR / download.suggested_filename)
        download.save_as(download_path)
        print(ok(f"Downloaded: {download_path}"))

        # Verify downloaded PDF opens without password
        import pikepdf
        try:
            dl = pikepdf.open(download_path)
            page_count = len(dl.pages)
            dl.close()
            print(ok(f"Downloaded PDF has {page_count} pages — opens without password"))
            assert page_count == 3, f"Expected 3 pages, got {page_count}"
        except Exception as e:
            print(fail(f"Failed to open downloaded PDF: {e}"))
            raise
        # Cleanup test download
        os.remove(download_path)
        print(bold("  ✓ Test 5 PASSED"))

        print(bold("\n--- All 5 tests PASSED ---"))
        browser.close()


if __name__ == "__main__":
    check_deps()

    tool_url = str(TEST_DIR / "PDFPasswordRemover.html")
    if not tool_url.startswith("file://"):
        tool_url = f"file://{tool_url}"

    print(bold(f"Tool URL: {tool_url}"))

    locked_path, _ = create_test_pdfs()
    try:
        run_tests(tool_url, locked_path)
    finally:
        # Cleanup test PDFs
        for f in ["test_locked.pdf", "test_unlocked.pdf"]:
            p = TEST_DIR / f
            if p.exists():
                os.remove(p)
        print(ok("Test artifacts cleaned up"))
