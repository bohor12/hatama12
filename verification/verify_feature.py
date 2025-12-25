from playwright.sync_api import sync_playwright

def verify_likes_page():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # Navigate to home
        page.goto("http://localhost:3000")
        
        # Take screenshot of login/home
        page.screenshot(path="verification/home.png")
        
        # Navigate to likes-you page (now that it exists)
        page.goto("http://localhost:3000/likes-you")
        page.screenshot(path="verification/likes_you.png")
        
        # Navigate to profile page
        page.goto("http://localhost:3000/profile")
        page.screenshot(path="verification/profile.png")
        
        browser.close()

if __name__ == "__main__":
    verify_likes_page()
