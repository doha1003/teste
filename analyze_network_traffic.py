import os
import json

REPORTS_DIR = "C:/Users/pc/teste/reports"
NETWORK_TRAFFIC_FILENAME = "network_traffic.json"

def analyze_network_traffic():
    """Analyzes all network traffic logs and summarizes failed requests."""
    summary = {
        "total_pages_with_traffic": 0,
        "failed_requests_by_url": {},
        "total_failed_requests": 0
    }

    for page_dir in os.listdir(REPORTS_DIR):
        page_path = os.path.join(REPORTS_DIR, page_dir)
        if os.path.isdir(page_path):
            traffic_path = os.path.join(page_path, NETWORK_TRAFFIC_FILENAME)
            if os.path.exists(traffic_path):
                summary["total_pages_with_traffic"] += 1
                with open(traffic_path, "r", encoding="utf-8") as f:
                    traffic_logs = json.load(f)
                
                current_url_prefix = page_dir.replace("_", "/") # Simple conversion

                for entry in traffic_logs:
                    # Look for response entries with status codes
                    if "status" in entry and entry["status"] >= 400:
                        summary["total_failed_requests"] += 1
                        request_info = {
                            "url": entry.get("url", "N/A"),
                            "status": entry.get("status", "N/A"),
                            "method": entry.get("method", "N/A") # Method might not be present in response entry
                        }
                        if current_url_prefix not in summary["failed_requests_by_url"]:
                            summary["failed_requests_by_url"][current_url_prefix] = []
                        summary["failed_requests_by_url"][current_url_prefix].append(request_info)
    return summary

if __name__ == "__main__":
    analysis_results = analyze_network_traffic()
    
    print("--- Network Traffic Analysis Summary ---")
    print(f"Total Pages with Traffic Logs: {analysis_results['total_pages_with_traffic']}")
    print(f"Total Failed Requests: {analysis_results['total_failed_requests']}\n")

    if analysis_results["failed_requests_by_url"]:
        print("Failed Requests by URL:")
        for url_prefix, requests in analysis_results["failed_requests_by_url"].items():
            print(f"  Page Prefix: {url_prefix}")
            for req in requests:
                print(f"    - URL: {req['url']}, Status: {req['status']}, Method: {req['method']}")
        print("\n")

    # Save summary to a file
    with open(os.path.join(REPORTS_DIR, "network_traffic_summary.json"), "w", encoding="utf-8") as f:
        json.dump(analysis_results, f, ensure_ascii=False, indent=2)
    print(f"Full network traffic analysis summary saved to {os.path.join(REPORTS_DIR, 'network_traffic_summary.json')}")
