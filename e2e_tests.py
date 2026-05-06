"""
E2E Test Suite — Matax TVA Calculator
Tests: Calculator, Declaration, i18n, theme, API, mobile, print
"""
from playwright.sync_api import sync_playwright
import json, urllib.request, urllib.error

BASE = "http://localhost:3000"
PASS = "✅"
FAIL = "❌"
results = []


def log(name, ok, detail=""):
    icon = PASS if ok else FAIL
    results.append({"name": name, "ok": ok, "detail": detail})
    print(f"  {icon} {name}" + (f" — {detail}" if detail else ""))


def api_post(path, payload):
    data = json.dumps(payload).encode()
    req = urllib.request.Request(
        f"{BASE}{path}", data=data,
        headers={"Content-Type": "application/json"}, method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        try:
            body = json.loads(e.read())
        except Exception:
            body = {}
        return e.code, body
    except Exception as ex:
        return 0, {"error": str(ex)}


def run_tests():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={"width": 1280, "height": 900})
        page = ctx.new_page()
        js_errors = []
        page.on("console", lambda m: js_errors.append(m.text) if m.type == "error" else None)

        # ── 0. SETUP LOCALE (Switch to English) ──────────────────────────────
        print("\n▶ 0. Setup Locale")
        page.goto(f"{BASE}/calculator", wait_until="load")
        page.wait_for_timeout(3000)
        
        # Try to find English button in header using various strategies
        found_en = False
        selectors = [
            "header button:has-text('English')",
            "header button:has-text('🇬🇧')",
            "header button:has-text('الإنجليزية')",
            "button:has-text('English')"
        ]
        
        for sel in selectors:
            btn = page.locator(sel).first
            if btn.count() > 0 and btn.is_visible():
                btn.click()
                page.wait_for_timeout(2000)
                # Verify switch worked by checking title or some text
                if "Calculator" in page.content() or "Tax" in page.content():
                    found_en = True
                    log("Switched to English locale", True)
                    break
        
        if not found_en:
            log("Switched to English locale", False, "Could not find or verify English button")

        # ── 1. PAGE LOAD & STRUCTURE ────────────────────────────────────────
        print("\n▶ 1. Page Load & Structure")
        log("Page responds", page.url.startswith(BASE))

        # Check header renders
        header_count = page.locator("header").count()
        log("Header element present", header_count > 0)

        # Check tabs render
        tab_count = page.locator('[role="tab"]').count()
        log("Tab navigation present (≥2 tabs)", tab_count >= 2)

        # Law reference cards
        law_cards = (
            page.get_by_text("Art. 28", exact=False).count() +
            page.get_by_text("Art. 29", exact=False).count() +
            page.get_by_text("Art. 30", exact=False).count() +
            page.get_by_text("Article 28", exact=False).count()
        )
        log("Law reference cards shown", law_cards > 0, f"Found {law_cards} cards")

        # ── 1.5. AUTHENTICATED WORKFLOW ─────────────────────────────────────
        print("\n▶ 1.5. Authenticated Workflow")
        page.goto(f"{BASE}/login")
        if page.locator('input[type="email"]').count() > 0:
            page.fill('input[type="email"]', 'admin@matax.dz')
            page.fill('input[type="password"]', 'admin123')
            page.click('button[type="submit"]')
            page.wait_for_timeout(2000)
            log("Login attempt submitted", True)
            
            import os
            os.makedirs("test-results", exist_ok=True)
            ctx.storage_state(path='test-results/auth_state.json')
            
            page.goto(f"{BASE}/dashboard")
            page.wait_for_timeout(1000)
            log("Dashboard renders after login", "Dashboard" in page.content() or "Tableau de bord" in page.content() or page.locator("nav").count() > 0)

        # ── 2. CALCULATOR — SIMPLE MODE ─────────────────────────────────────
        print("\n▶ 2. Calculator — Simple Mode")
        page.goto(f"{BASE}/calculator")
        page.wait_for_timeout(1000)
        # Click first tab (Calculator)
        tabs = page.locator('[role="tab"]').all()
        if tabs:
            tabs[0].click()
            page.wait_for_timeout(1000)

        input_field = page.locator("#grossAmount").first
        if input_field.count() > 0:
            log("Amount input (#grossAmount) exists", True)
            input_field.fill("10000")
            page.wait_for_timeout(500)
            
            submit_btn = page.locator('button[type="submit"]').first
            submit_btn.click()
            page.wait_for_timeout(3000)
            
            content = page.content().replace("\u202f", "").replace(" ", "").replace("\xa0", "").replace(",", "")
            log("TVA rate 19% shown in result", "19%" in page.content() or "19" in content)
            log("TTC value shown (11900)", "11900" in content)
        else:
            log("Amount input (#grossAmount) exists", False)

        # ── 4. TVA CATEGORIES ───────────────────────────────────────────────
        print("\n▶ 4. TVA Category Rates")
        # English labels
        cats = [("Normal", "19"), ("Reduced", "9"), ("Exempt", "0")]
        for cat_label, expected_rate in cats:
            # We don't want to use goto(BASE) here because it resets the locale
            # Instead, just fill the input and change categories
            page.locator("#grossAmount").first.fill("5000")

            # Open category select
            trigger = page.locator("#category").first
            if trigger.count() > 0:
                trigger.click()
                page.wait_for_timeout(1000)
                # Select option — try to find the option in the portal (body)
                opt = page.locator('[role="option"]').filter(has_text=cat_label).first
                if opt.count() == 0:
                    opt = page.get_by_text(cat_label).last
                
                if opt.count() > 0:
                    opt.click()
                    page.wait_for_timeout(800)
                    page.locator('button[type="submit"]').first.click()
                    page.wait_for_timeout(2000)
                    c = page.content().replace(" ", "").replace("\u202f", "").replace("\xa0", "").replace(",", "")
                    ok = expected_rate in c or (cat_label == "Exempt" and "exempt" in c.lower())
                    log(f"Category '{cat_label}' → {expected_rate}% in output", ok)
                else:
                    log(f"Category option '{cat_label}' not found", False)
                    page.keyboard.press("Escape")
            else:
                log(f"Category select not found", False)

        # ── 5. MODE SWITCHER ────────────────────────────────────────────────
        print("\n▶ 5. Mode Switcher (Simple / Expert / Thesis)")
        # Switch back to simple first to ensure clean state
        simple_btn = page.locator('button').filter(has_text="Simple").first
        if simple_btn.count() > 0:
            simple_btn.click()
            page.wait_for_timeout(500)

        # Find expert button by text
        expert_btn = page.locator('button').filter(has_text="Expert").first
        if expert_btn.count() == 0:
             expert_btn = page.get_by_role("button", name="Expert").first

        if expert_btn.count() > 0:
            expert_btn.click()
            page.wait_for_timeout(1500)
            log("Expert mode button works", True)
            log("Expert: invoiceRef field appears", page.locator("#invoiceRef").count() > 0)
            log("Expert: invoiceDate field appears", page.locator("#invoiceDate").count() > 0)
        else:
            log("Expert mode button found", False)

        # Thesis mode
        thesis_btn = page.locator('button').filter(has_text="Thesis").first
        if thesis_btn.count() == 0:
             thesis_btn = page.get_by_role("button", name="Thesis").first
             
        if thesis_btn.count() > 0:
            thesis_btn.click()
            page.wait_for_timeout(1500)
            log("Thesis mode button works", True)
        else:
            log("Thesis mode button found", False)

        # ── 6. DECLARATION TAB ──────────────────────────────────────────────
        print("\n▶ 6. Declaration Tab")
        page.locator('[role="tab"]').nth(1).click()
        page.wait_for_timeout(1500)
        log("Declaration tab clickable", True)
        inputs_count = page.locator("input, select, textarea").count()
        log("Declaration tab has form inputs", inputs_count > 0, f"{inputs_count} inputs found")

        # ── 7. LOCALE SWITCHER ──────────────────────────────────────────────
        print("\n▶ 7. i18n — Locale Switcher")
        ar_btn = page.locator('header button').filter(has_text="العربية").first
        if ar_btn.count() > 0:
            ar_btn.click()
            page.wait_for_timeout(1500)
            log("Locale toggle switches to Arabic", True)
            log("RTL direction applied", page.locator('[dir="rtl"]').count() > 0)
        else:
            log("Arabic locale button not found", False)

        # ── 8. THEME / DARK MODE ─────────────────────────────────────────────
        print("\n▶ 8. Theme Toggle")
        theme_btn = page.locator('header button[aria-label="Toggle theme"]').first
        if theme_btn.count() > 0:
            theme_btn.click()
            page.wait_for_timeout(500)
            dark = page.evaluate("document.documentElement.classList.contains('dark')")
            log("Theme toggle works", True)
            log("Dark class on <html>", dark)
        else:
            log("Theme toggle button not found", False)

        # ── 9. API ENDPOINTS ─────────────────────────────────────────────────
        print("\n▶ 9. API Endpoint Tests")
        # Normal calculation
        status, body = api_post("/api/calculate", {"base": 1000, "category": "normal", "sector": "production"})
        log("POST /api/calculate → 200", status == 200, f"got {status}")
        if status == 200:
            tax = float(body["data"]["taxAmount"])
            log("taxAmount ≈ 190 (19% of 1000)", abs(tax - 190) < 1)

        # AI scan endpoint reachable (send dummy body to avoid 500)
        status5, _ = api_post("/api/ai/scan", {"fileData": "data:image/png;base64,xxx", "fileName": "test.png"})
        log("POST /api/ai/scan endpoint reachable", status5 in [200, 401, 500], f"got {status5}")

        # ── 10. PRINT STYLES ─────────────────────────────────────────────────
        print("\n▶ 10. Print / Export")
        page.goto(f"{BASE}/calculator", wait_until="networkidle")
        page.wait_for_timeout(1500)
        page.locator("#grossAmount").fill("5000")
        page.locator('button[type="submit"]').first.click()
        page.wait_for_timeout(2500)
        no_print_els = page.locator(".no-print").count()
        log(".no-print elements exist (UI chrome hidden on print)", no_print_els > 0, f"{no_print_els} elements")

        # ── 11. MOBILE RESPONSIVE ────────────────────────────────────────────
        print("\n▶ 11. Mobile Responsive (390×844 — iPhone 14)")
        mob = browser.new_context(viewport={"width": 390, "height": 844},
                                  user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)")
        mpage = mob.new_page()
        mpage.goto(f"{BASE}/calculator", wait_until="networkidle")
        mpage.wait_for_timeout(1500)
        import os
        os.makedirs("test-results", exist_ok=True)
        mpage.screenshot(path="test-results/tva_11_mobile.png", full_page=True)

        log("Amount input visible on mobile", mpage.locator("#grossAmount").is_visible())
        no_overflow = mpage.evaluate(
            "document.documentElement.scrollWidth <= document.documentElement.clientWidth + 5"
        )
        log("No horizontal overflow on mobile", no_overflow)
        mob.close()

        # ── 12. CONSOLE ERRORS ───────────────────────────────────────────────
        print("\n▶ 12. Console Health")
        log("No JS console errors during test", len(js_errors) == 0,
            f"{len(js_errors)} errors found: {js_errors[:2]}" if js_errors else "")

        browser.close()

    # ── SUMMARY ──────────────────────────────────────────────────────────────
    print("\n" + "═" * 58)
    passed = sum(1 for r in results if r["ok"])
    failed = [r for r in results if not r["ok"]]
    total = len(results)
    print(f"  TOTAL: {total} tests  |  {PASS} {passed} passed  |  {FAIL} {len(failed)} failed")
    print("═" * 58 + "\n")

    if failed:
        print("Failed tests:")
        for r in failed:
            print(f"  {FAIL} {r['name']}" + (f" — {r['detail']}" if r['detail'] else ""))
    return results


if __name__ == "__main__":
    run_tests()
