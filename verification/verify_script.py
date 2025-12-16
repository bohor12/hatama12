from playwright.sync_api import sync_playwright

def verify_profile_and_browse():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Update port to 3003
        base_url = "http://localhost:3003"

        # 1. Login/Register
        import random
        rand_id = random.randint(1000, 9999)
        email = f"testver{rand_id}@example.com"

        page.goto(f"{base_url}/register")
        page.fill("input[type='email']", email)
        page.fill("input[type='password']", "password123")
        page.click("button[type='submit']")

        # Manually wait and check URL
        page.wait_for_timeout(3000)

        if "/browse" not in page.url:
             page.goto(f"{base_url}/browse")

        # 2. Go to Browse
        page.wait_for_selector("text=Moški", timeout=10000)

        # Take screenshot of Browse
        page.screenshot(path="verification/browse_initial.png")

        # 3. Simulate Swipe
        if page.is_visible("text=Ni več oseb"):
            print("No users to swipe.")
        else:
            # Swipe
            page.wait_for_timeout(1000)

            # Click Cross
            page.click("button.text-red-500")
            page.wait_for_timeout(1000) # Wait for animation
            page.screenshot(path="verification/browse_after_swipe.png")
            print("Swiped successfully.")

            if not page.is_visible("text=Ni več oseb"):
                # Force click on the last link
                links = page.locator("a[href^='/users/']").all()
                if links:
                    last_link = links[-1]
                    try:
                        last_link.click(timeout=5000)
                    except:
                        # Sometimes overlay or animation issues. Force force.
                        last_link.click(force=True)

                    # 4. Verify Profile Page
                    page.wait_for_url("**/users/**", timeout=10000)
                    page.wait_for_selector("text=Ni zame", timeout=10000)
                    page.screenshot(path="verification/profile_page.png")
                    print("Profile page verified.")
                else:
                    print("No info link found.")

        browser.close()

if __name__ == "__main__":
    verify_profile_and_browse()
