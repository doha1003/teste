import os
import json

REPORTS_DIR = "C:/Users/pc/teste/reports"
LIGHTHOUSE_REPORT_FILENAME = "lighthouse_report.json"

def analyze_lighthouse_reports():
    """Analyzes all Lighthouse reports and summarizes key metrics."""
    summary = {
        "total_pages_audited": 0,
        "pages_below_threshold": {
            "performance": [],
            "accessibility": [],
            "best_practices": [],
            "seo": [],
            "pwa": []
        },
        "overall_scores": {
            "performance": {"sum": 0, "count": 0},
            "accessibility": {"sum": 0, "count": 0},
            "best_practices": {"sum": 0, "count": 0},
            "seo": {"sum": 0, "count": 0},
            "pwa": {"sum": 0, "count": 0}
        },
        "core_web_vitals_issues": []
    }

    threshold = 0.90 # 90% score

    for page_dir in os.listdir(REPORTS_DIR):
        page_path = os.path.join(REPORTS_DIR, page_dir)
        if os.path.isdir(page_path):
            report_path = os.path.join(page_path, LIGHTHOUSE_REPORT_FILENAME)
            if os.path.exists(report_path):
                summary["total_pages_audited"] += 1
                with open(report_path, "r", encoding="utf-8") as f:
                    report = json.load(f)
                
                # Extract URL
                url = report.get("finalUrl", "N/A")

                # Extract scores
                categories = report.get("categories", {})
                for category_name, category_data in categories.items():
                    # Convert category name to match the summary dictionary keys
                    # e.g., "best-practices" -> "best_practices"
                    formatted_category_name = category_name.replace("-", "_")
                    
                    # Ensure the formatted_category_name exists in summary before accessing
                    if formatted_category_name not in summary["overall_scores"]:
                        summary["overall_scores"][formatted_category_name] = {"sum": 0, "count": 0}
                        summary["pages_below_threshold"][formatted_category_name] = []

                    score = category_data.get("score")
                    if score is not None:
                        score_percentage = score * 100
                        summary["overall_scores"][formatted_category_name]["sum"] += score_percentage
                        summary["overall_scores"][formatted_category_name]["count"] += 1
                        
                        if score < threshold:
                            summary["pages_below_threshold"][formatted_category_name].append(f"{url} ({score_percentage:.0f}%)")

                # Extract Core Web Vitals issues
                audits = report.get("audits", {})
                # LCP
                lcp_audit = audits.get("largest-contentful-paint")
                if lcp_audit and lcp_audit.get("score") < 1: # Score 1 means passing
                    summary["core_web_vitals_issues"].append(f"{url}: LCP - {lcp_audit.get('displayValue', 'N/A')}")
                # CLS
                cls_audit = audits.get("cumulative-layout-shift")
                if cls_audit and cls_audit.get("score") < 1:
                    summary["core_web_vitals_issues"].append(f"{url}: CLS - {cls_audit.get('displayValue', 'N/A')}")
                # FID (or INP for newer Lighthouse versions)
                fid_audit = audits.get("first-input-delay")
                if fid_audit and fid_audit.get("score") < 1:
                    summary["core_web_vitals_issues"].append(f"{url}: FID - {fid_audit.get('displayValue', 'N/A')}")
                
                inp_audit = audits.get("interaction-to-next-paint")
                if inp_audit and inp_audit.get("score") < 1:
                    summary["core_web_vitals_issues"].append(f"{url}: INP - {inp_audit.get('displayValue', 'N/A')}")


    # Calculate averages
    for category, data in summary["overall_scores"].items():
        if data["count"] > 0:
            data["average"] = data["sum"] / data["count"]
        else:
            data["average"] = 0

    return summary

if __name__ == "__main__":
    analysis_results = analyze_lighthouse_reports()
    
    print("--- Lighthouse Report Analysis Summary ---")
    print(f"Total Pages Audited: {analysis_results['total_pages_audited']}\n")

    print("Average Scores:")
    for category, data in analysis_results["overall_scores"].items():
        print(f"  {category.replace('_', ' ').title()}: {data['average']:.2f}%")
    print("\n")

    print(f"Pages below {int(analysis_results['overall_scores']['performance']['average'])}% threshold (Performance, Accessibility, Best Practices, SEO):")
    for category, pages in analysis_results["pages_below_threshold"].items():
        if pages:
            print(f"  {category.replace('_', ' ').title()}:")
            for page in pages:
                print(f"    - {page}")
    print("\n")

    if analysis_results["core_web_vitals_issues"]:
        print("Core Web Vitals Issues:")
        for issue in analysis_results["core_web_vitals_issues"]:
            print(f"  - {issue}")
    else:
        print("No significant Core Web Vitals issues found across audited pages.")

    # Save summary to a file
    with open(os.path.join(REPORTS_DIR, "lighthouse_summary.json"), "w", encoding="utf-8") as f:
        json.dump(analysis_results, f, ensure_ascii=False, indent=2)
    print(f"\nFull Lighthouse analysis summary saved to {os.path.join(REPORTS_DIR, 'lighthouse_summary.json')}")