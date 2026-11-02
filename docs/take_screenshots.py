import os
import subprocess
import time

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
OUT_DIR = r"c:\Users\ManikandanSoundar\OneDrive - Adeahub\Personal Work\spotlight-biriyani-full-kit\spotlight-biriyani\docs\screenshots"
os.makedirs(OUT_DIR, exist_ok=True)

SCREENS = [
    ("http://localhost:8080/", "01_homepage.png"),
    ("http://localhost:8080/branches", "02_branches_radar.png"),
    ("http://localhost:8080/login", "03_login_portal.png"),
    ("http://localhost:8080/app/billing", "04_billing_pos.png"),
    ("http://localhost:8080/app", "05_executive_dashboard.png"),
    ("http://localhost:8080/app/stock", "06_stock_ledger.png"),
    ("http://localhost:8080/app/reports", "07_reports_forecast.png"),
    ("http://localhost:8080/app/settings", "08_branch_settings.png"),
]

for url, filename in SCREENS:
    out_path = os.path.join(OUT_DIR, filename)
    print(f"Capturing {filename} from {url}...")
    cmd = [
        CHROME,
        "--headless",
        "--disable-gpu",
        "--virtual-time-budget=2500",
        "--window-size=1280,820",
        f"--screenshot={out_path}",
        url
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if os.path.exists(out_path):
        print(f" -> OK: {filename} ({os.path.getsize(out_path)} bytes)")
    else:
        print(f" -> FAILED to generate {filename}")

print("All screen captures finished!")
