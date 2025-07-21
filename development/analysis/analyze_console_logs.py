import os
import json

REPORTS_DIR = "C:/Users/pc/teste/reports"
CONSOLE_LOG_FILENAME = "console_logs.json"

def analyze_console_logs():
    """Analyzes all console logs and summarizes errors and warnings."""
    summary = {
        "total_pages_with_logs": 0,
        "errors_by_url": {},
        "warnings_by_url": {},
        "total_errors": 0,
        "total_warnings": 0
    }

    for page_dir in os.listdir(REPORTS_DIR):
        page_path = os.path.join(REPORTS_DIR, page_dir)
        if os.path.isdir(page_path):
            log_path = os.path.join(page_path, CONSOLE_LOG_FILENAME)
            if os.path.exists(log_path):
                summary["total_pages_with_logs"] += 1
                with open(log_path, "r", encoding="utf-8") as f:
                    logs = json.load(f)
                
                current_url = "N/A" # Placeholder, actual URL is not in console_logs.json directly
                # We can infer the URL from the directory name, but for now, use N/A
                # A more robust solution would be to pass the URL to run_diagnostics_for_url
                # and save it in the console_logs.json itself.
                # For now, we'll use the directory name as a proxy for the URL.
                current_url = page_dir.replace("_", "/") # Simple conversion, might not be perfect

                for log_entry in logs:
                    log_type = log_entry.get("type")
                    log_text = log_entry.get("text")

                    if log_type == "error":
                        summary["total_errors"] += 1
                        if current_url not in summary["errors_by_url"]:
                            summary["errors_by_url"][current_url] = []
                        summary["errors_by_url"][current_url].append(log_text)
                    elif log_type == "warning":
                        summary["total_warnings"] += 1
                        if current_url not in summary["warnings_by_url"]:
                            summary["warnings_by_url"][current_url] = []
                        summary["warnings_by_url"][current_url].append(log_text)
    return summary

if __name__ == "__main__":
    analysis_results = analyze_console_logs()
    
    print("--- Console Log Analysis Summary ---")
    print(f"Total Pages with Logs: {analysis_results['total_pages_with_logs']}")
    print(f"Total Errors: {analysis_results['total_errors']}")
    print(f"Total Warnings: {analysis_results['total_warnings']}\n")

    if analysis_results["errors_by_url"]:
        print("Errors by URL:")
        for url, errors in analysis_results["errors_by_url"].items():
            print(f"  URL: {url}")
            for error in errors:
                print(f"    - {error}")
        print("\n")

    if analysis_results["warnings_by_url"]:
        print("Warnings by URL:")
        for url, warnings in analysis_results["warnings_by_url"].items():
            print(f"  URL: {url}")
            for warning in warnings:
                print(f"    - {warning}")
        print("\n")

    # Save summary to a file
    with open(os.path.join(REPORTS_DIR, "console_log_summary.json"), "w", encoding="utf-8") as f:
        json.dump(analysis_results, f, ensure_ascii=False, indent=2)
    print(f"Full console log analysis summary saved to {os.path.join(REPORTS_DIR, 'console_log_summary.json')}")
