from playwright.sync_api import sync_playwright

def verify_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # 1. Login (Mocking cookies or using UI)
        # Since I cannot easily set cookies without knowing the structure perfectly, I will try to use the UI login if possible,
        # OR I can try to access public pages like /ads.
        # However, ads creation requires login.
        # Let's see if /ads is public. The code says GET /api/ads is public, but the page might not be.
        # Wait, the page app/ads/page.tsx fetches /api/ads.

        # Let's try to verify the Ads page UI elements (Category selector) which should be visible even if empty or logged out (if page allows).
        # Actually app/ads/page.tsx doesn't check for auth on render, only on "Create".

        print("Navigating to Ads page...")
        page.goto("http://localhost:3000/ads")
        page.wait_for_load_state("networkidle")

        # Check for Category buttons
        print("Checking for categories...")
        page.wait_for_selector("text=Splošno")
        page.wait_for_selector("text=Zmenek")

        # Screenshot Ads
        page.screenshot(path="verification/ads_page.png")
        print("Ads page screenshot saved.")

        # Navigate to Profile (Requires Login) - This is hard to verify without a mock user.
        # I will skip profile verification via Playwright for now unless I can seed a user and login.
        # But I can verify the Ads UI changes I made.

        browser.close()

if __name__ == "__main__":
    verify_frontend()
