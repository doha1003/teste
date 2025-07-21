import xml.etree.ElementTree as ET
import os
import json
import subprocess
from multiprocessing import Pool
from playwright.sync_api import sync_playwright

# Define base paths and output directories
PROJECT_ROOT = "C:/Users/pc/teste"
SITEMAP_PATH = os.path.join(PROJECT_ROOT, "sitemap.xml")
REPORTS_DIR = os.path.join(PROJECT_ROOT, "reports")

def parse_sitemap(sitemap_path):
    """Parses the sitemap.xml and returns a list of URLs."""
    urls = []
    tree = ET.parse(sitemap_path)
    root = tree.getroot()
    # Namespace for sitemap elements
    namespace = {'sitemap': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
    for url_element in root.findall('sitemap:url', namespace):
        loc = url_element.find('sitemap:loc', namespace)
        if loc is not None:
            urls.append(loc.text) # Use the original URL directly
    return urls

def run_diagnostics_for_url(url):
    """Runs Playwright and Lighthouse diagnostics for a single URL."""
    # Create a sanitized directory name for the URL
    # Replace non-alphanumeric characters with underscores, limit length
    sanitized_url_path = url.replace("https://doha.kr/", "").replace("/", "_").replace(".html", "").strip("_")
    if not sanitized_url_path: # For the root URL
        sanitized_url_path = "index"
    
    output_dir = os.path.join(REPORTS_DIR, sanitized_url_path)
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"Starting diagnostics for: {url} in {output_dir}")

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()

            # Set up event listeners for console logs and network requests
            console_logs = []
            network_requests = []

            page.on("console", lambda msg: console_logs.append({"type": msg.type, "text": msg.text}))
            page.on("request", lambda request: network_requests.append({"url": request.url, "method": request.method, "resource_type": request.resource_type}))
            page.on("response", lambda response: network_requests.append({"url": response.url, "status": response.status, "headers": response.all_headers()}))

            page.goto(url, wait_until="networkidle")

            # 1. Capture Screenshots (Desktop and Mobile)
            page.set_viewport_size({"width": 1920, "height": 1080}) # Desktop
            page.screenshot(path=os.path.join(output_dir, "screenshot_desktop.png"), full_page=True)
            
            page.set_viewport_size({"width": 375, "height": 812}) # Mobile (iPhone X)
            page.screenshot(path=os.path.join(output_dir, "screenshot_mobile.png"), full_page=True)

            # 2. Save Console Logs
            with open(os.path.join(output_dir, "console_logs.json"), "w", encoding="utf-8") as f:
                json.dump(console_logs, f, ensure_ascii=False, indent=2)

            # 3. Save Network Traffic
            with open(os.path.join(output_dir, "network_traffic.json"), "w", encoding="utf-8") as f:
                json.dump(network_requests, f, ensure_ascii=False, indent=2)

            # 4. Save DOM Snapshot
            with open(os.path.join(output_dir, "dom_snapshot.html"), "w", encoding="utf-8") as f:
                f.write(page.content())

            browser.close()

        # 5. Run Lighthouse Audit
        lighthouse_report_path = os.path.join(output_dir, "lighthouse_report.json")
        # Use --output=json for machine-readable output
        # Use --output-path to specify the output file
        # Use --chrome-flags="--headless=new" to ensure headless mode
        lighthouse_command = [
            "lighthouse",
            url,
            f"--output=json",
            f"--output-path={lighthouse_report_path}",
            "--chrome-flags=\"--headless=new --disable-gpu --no-sandbox\"", # Ensure headless and avoid common issues
            "--quiet" # Suppress verbose output
        ]
        
        print(f"Running Lighthouse for {url}...")
        # Execute Lighthouse command
        result = subprocess.run(lighthouse_command, capture_output=True, text=True, shell=True)
        
        if result.returncode != 0:
            print(f"Lighthouse for {url} failed with error:\n{result.stderr}")
        else:
            print(f"Lighthouse report saved to {lighthouse_report_path}")

    except Exception as e:
        print(f"Error processing {url}: {e}")

def main():
    """Main function to orchestrate the website diagnostics."""
    os.makedirs(REPORTS_DIR, exist_ok=True)
    
    urls_to_diagnose = parse_sitemap(SITEMAP_PATH)
    print(f"Found {len(urls_to_diagnose)} URLs to diagnose.")

    # For initial testing, you might want to limit the number of processes or URLs
    # num_processes = os.cpu_count() # Use all available CPU cores
    num_processes = 4 # As suggested in the prompt for parallel screenshotting example
    
    print(f"Starting parallel diagnostics with {num_processes} processes...")
    with Pool(num_processes) as pool:
        pool.map(run_diagnostics_for_url, urls_to_diagnose)
    
    print("All diagnostics completed.")

if __name__ == "__main__":
    main()