import os
import json
from pathlib import Path

def analyze_performance():
    """doha.kr 웹사이트의 성능을 상세 분석"""
    
    base_dir = Path("C:/Users/pc/teste/development/reports/page-reports")
    
    # 분석할 주요 페이지들
    target_pages = {
        "index": "메인 페이지",
        "tests_mbti_test": "MBTI 테스트",
        "tools_text-counter": "텍스트 카운터",
        "fortune_saju": "사주 페이지",
        "fortune_daily": "일일 운세"
    }
    
    results = {
        "performance_scores": {},
        "resource_analysis": {},
        "core_web_vitals": {},
        "optimization_recommendations": []
    }
    
    for page_id, page_name in target_pages.items():
        page_dir = base_dir / page_id
        
        # Lighthouse 보고서 분석
        lighthouse_path = page_dir / "lighthouse_report.json"
        if lighthouse_path.exists():
            with open(lighthouse_path, 'r', encoding='utf-8') as f:
                lighthouse_data = json.load(f)
                
                # 성능 점수 추출
                categories = lighthouse_data.get('categories', {})
                performance_score = categories.get('performance', {}).get('score', 0) * 100
                
                results["performance_scores"][page_name] = {
                    "score": performance_score,
                    "url": lighthouse_data.get('finalUrl', '')
                }
                
                # Core Web Vitals 추출
                audits = lighthouse_data.get('audits', {})
                
                # LCP
                lcp = audits.get('largest-contentful-paint', {})
                lcp_value = lcp.get('numericValue', 0) / 1000  # ms to seconds
                
                # CLS
                cls = audits.get('cumulative-layout-shift', {})
                cls_value = cls.get('numericValue', 0)
                
                # FID/INP
                inp = audits.get('interaction-to-next-paint', {})
                inp_value = inp.get('numericValue', 0)
                
                results["core_web_vitals"][page_name] = {
                    "LCP": f"{lcp_value:.2f}s",
                    "CLS": f"{cls_value:.3f}",
                    "INP": f"{inp_value:.0f}ms"
                }
                
                # 리소스 분석 추출
                network_records = audits.get('network-requests', {}).get('details', {}).get('items', [])
                
                # 리소스 타입별 분석
                resource_summary = {
                    "total_size": 0,
                    "total_requests": len(network_records),
                    "by_type": {}
                }
                
                for record in network_records:
                    resource_type = record.get('resourceType', 'Other')
                    size = record.get('transferSize', 0)
                    
                    if resource_type not in resource_summary["by_type"]:
                        resource_summary["by_type"][resource_type] = {
                            "count": 0,
                            "size": 0
                        }
                    
                    resource_summary["by_type"][resource_type]["count"] += 1
                    resource_summary["by_type"][resource_type]["size"] += size
                    resource_summary["total_size"] += size
                
                results["resource_analysis"][page_name] = resource_summary
        
        # 네트워크 트래픽 분석
        network_path = page_dir / "network_traffic.json"
        if network_path.exists():
            with open(network_path, 'r', encoding='utf-8') as f:
                network_data = json.load(f)
                
                # 큰 리소스 찾기
                large_resources = []
                for req in network_data:
                    if req.get('url', '').endswith('manseryeok-database.js'):
                        large_resources.append({
                            "url": req.get('url'),
                            "type": "만세력 데이터베이스",
                            "issue": "38MB의 매우 큰 JavaScript 파일"
                        })
    
    # 최적화 권장사항 생성
    recommendations = []
    
    # 만세력 DB 최적화
    if any("사주" in page for page in results["performance_scores"].keys()):
        recommendations.append({
            "priority": "높음",
            "issue": "만세력 데이터베이스 (38MB)",
            "impact": "사주 페이지 로딩 시간 10초 이상 증가",
            "solution": [
                "1. 서버 사이드 API로 전환하여 필요한 데이터만 요청",
                "2. IndexedDB를 활용한 점진적 로딩 및 캐싱",
                "3. Web Worker를 사용한 백그라운드 로딩",
                "4. 날짜 범위별로 분할된 청크 파일 생성"
            ]
        })
    
    # LCP 최적화
    for page, vitals in results["core_web_vitals"].items():
        lcp_value = float(vitals["LCP"].replace("s", ""))
        if lcp_value > 2.5:
            recommendations.append({
                "priority": "높음",
                "issue": f"{page} LCP 초과 ({vitals['LCP']})",
                "impact": "사용자 체감 로딩 속도 저하",
                "solution": [
                    "1. 주요 이미지에 loading='eager' 및 fetchpriority='high' 속성 추가",
                    "2. Critical CSS 인라인화",
                    "3. 웹폰트 preload 추가",
                    "4. 서버 응답 시간 개선"
                ]
            })
    
    # 리소스 최적화
    for page, analysis in results["resource_analysis"].items():
        total_mb = analysis["total_size"] / (1024 * 1024)
        if total_mb > 3:
            recommendations.append({
                "priority": "중간",
                "issue": f"{page} 총 리소스 크기 과다 ({total_mb:.1f}MB)",
                "impact": "모바일 환경에서 로딩 지연",
                "solution": [
                    "1. 이미지 최적화 (WebP 포맷 사용)",
                    "2. JavaScript 번들 크기 축소",
                    "3. 불필요한 폰트 제거",
                    "4. Gzip/Brotli 압축 활성화"
                ]
            })
    
    results["recommendations"] = recommendations
    
    return results

if __name__ == "__main__":
    analysis = analyze_performance()
    
    print("=== doha.kr 웹사이트 성능 분석 결과 ===\n")
    
    print("1. 성능 점수:")
    for page, data in analysis["performance_scores"].items():
        print(f"   - {page}: {data['score']:.0f}점")
    
    print("\n2. Core Web Vitals:")
    for page, vitals in analysis["core_web_vitals"].items():
        print(f"   - {page}:")
        print(f"     · LCP: {vitals['LCP']} (목표: < 2.5s)")
        print(f"     · CLS: {vitals['CLS']} (목표: < 0.1)")
        print(f"     · INP: {vitals['INP']} (목표: < 200ms)")
    
    print("\n3. 리소스 분석:")
    for page, analysis in analysis["resource_analysis"].items():
        total_mb = analysis["total_size"] / (1024 * 1024)
        print(f"   - {page}: 총 {total_mb:.1f}MB, {analysis['total_requests']}개 요청")
        
        # 타입별 상위 3개만 표시
        sorted_types = sorted(
            analysis["by_type"].items(), 
            key=lambda x: x[1]["size"], 
            reverse=True
        )[:3]
        
        for resource_type, data in sorted_types:
            size_mb = data["size"] / (1024 * 1024)
            print(f"     · {resource_type}: {size_mb:.1f}MB ({data['count']}개)")
    
    print("\n4. 최적화 권장사항:")
    for i, rec in enumerate(analysis["recommendations"], 1):
        print(f"\n   권장사항 {i} [우선순위: {rec['priority']}]")
        print(f"   문제: {rec['issue']}")
        print(f"   영향: {rec['impact']}")
        print(f"   해결방안:")
        for solution in rec['solution']:
            print(f"      {solution}")
    
    # 결과를 JSON 파일로 저장
    output_path = Path("C:/Users/pc/teste/development/reports/performance_analysis_detailed.json")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(analysis, f, ensure_ascii=False, indent=2)
    
    print(f"\n상세 분석 결과가 {output_path}에 저장되었습니다.")