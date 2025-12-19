
from playwright.sync_api import sync_playwright

def verify_ads_page():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Create context with storage state to simulate login if necessary,
        # or just hit the page if public. Ads API checks for token, but maybe we can bypass for viewing?
        # Actually API needs token for POST, but GET?
        # GET /api/ads: "const token = req.cookies.get('token')?.value;" is NOT checked in GET.
        # Wait, let's check the code for GET.

        # In app/api/ads/route.ts:
        # POST checks for token.
        # GET does NOT check for token explicitly in the code I saw earlier.
        # "const ads = await prisma.ad.findMany..."

        # So we can view ads without login.

        page = browser.new_page()
        page.goto("http://localhost:3000/ads")

        # Wait for content to load
        page.wait_for_selector("h1")

        # Check Title
        title = page.locator("h1").text_content()
        print(f"Page Title: {title}")

        # Check Filters
        filters = page.locator("button.rounded-full").all_text_contents()
        print(f"Filters found: {filters}")

        # Check for our seeded ads
        # "Kino Zmenek - 50% popust" [MOVIE]
        if page.get_by_text("Kino Zmenek").is_visible():
            print("Found Kino Zmenek ad")

        # Take screenshot
        page.screenshot(path="verification/ads_page.png", full_page=True)

        browser.close()

if __name__ == "__main__":
    verify_ads_page()
