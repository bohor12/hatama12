from playwright.sync_api import Page, expect, sync_playwright
import time
import os

def verify_chat_ui(page: Page):
  # Use port 3000 (it seems it freed up)
  base_url = "http://localhost:3000"

  # 1. Register to get access
  page.goto(f"{base_url}/register")

  try:
      # Use random email to avoid duplicate key error if re-running
      import random
      page.fill('input[type="email"]', f'verify_chat_{random.randint(1,100000)}@example.com')
      page.fill('input[type="password"]', 'password123')

      # Use specific locator for the submit button
      page.locator('button[type="submit"]').click()
      page.wait_for_timeout(3000) # Wait for auth and redirect
  except Exception as e:
      print(f"Registration step failed: {e}")

  # 2. Go to Browse
  page.goto(f"{base_url}/browse?gender=F")
  page.wait_for_timeout(2000)

  # 3. Simulate clicking Info to go to profile (or just navigate directly if we can't find a user)
  # But we don't know the ID of a user.
  # Let's try to mock creating a user first? No, too complex.
  # Let's assume there is at least one user or the mock data.

  # Actually, since I can't easily seed data, I will visit a non-existent user profile
  # or rely on the mock data if any.
  # But wait, I can visit the chat page directly with a fake ID to see the UI.

  fake_id = "test-user-id"
  page.goto(f"{base_url}/messages/chat/{fake_id}")
  page.wait_for_timeout(2000)

  # Take screenshot of Chat
  os.makedirs("verification_output", exist_ok=True)
  page.screenshot(path="verification_output/chat_ui.png")
  print("Chat screenshot taken.")

if __name__ == "__main__":
  with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    try:
      verify_chat_ui(page)
    except Exception as e:
        print(f"Test failed: {e}")
    finally:
      browser.close()
