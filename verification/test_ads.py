from playwright.sync_api import sync_playwright

def verify_ads_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a mobile viewport as this is a mobile-first app
        context = browser.new_context(viewport={"width": 375, "height": 812})
        page = context.new_page()

        # Login first (mock token cookie)
        # Assuming we can access the page without login or simple login logic
        # Actually /ads is protected for POST but GET is maybe public?
        # Let's check api logic. GET is public.
        # But UI has "Nov Oglas" button which is visible always but submitting requires auth.
        # Let's verify the UI structure first.

        try:
            page.goto("http://localhost:3000/ads")

            # 1. Verify Header
            print("Verifying Header...")
            page.wait_for_selector("text=Ideje & Zmenki")

            # 2. Verify Category Filters
            print("Verifying Filters...")
            page.wait_for_selector("text=Vse")
            page.wait_for_selector("text=Splošno")
            page.wait_for_selector("text=Zmenek")
            page.wait_for_selector("text=Večerja")

            # 3. Verify Create Button opens form
            print("Verifying Create Form...")
            # Click the "+" button
            page.click("button.bg-purple-600")

            # Check for new fields
            page.wait_for_selector("text=Kategorija")
            page.wait_for_selector("select")
            page.wait_for_selector("input[type='datetime-local']")

            # Take screenshot of the form
            page.screenshot(path="verification/ads_form.png")
            print("Screenshot saved to verification/ads_form.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_ads_ui()
