#!/usr/bin/env python3
import json
import sys
import io

if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

with open('complete_review_report.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print("🔍 doha.kr 전체 검증 결과 요약")
print("=" * 60)
print(f"총 검사 항목: {data['summary']['total_checks']}개")
print(f"통과 항목: {data['summary']['passed_checks']}개")
print(f"실패 항목: {data['summary']['failed_checks']}개")
print(f"전체 통과율: {data['summary']['pass_rate']:.1f}%")
print()
print("📊 카테고리별 통과율:")
for category, stats in data['category_stats'].items():
    rate = (stats['passed'] / stats['total'] * 100) if stats['total'] > 0 else 0
    print(f"  • {category}: {rate:.1f}% ({stats['passed']}/{stats['total']})")

# 가장 문제가 많은 항목들
print("\n❌ 주요 실패 항목:")
failed_items = {}
for page, results in data['detailed_results'].items():
    for category, checks in results.items():
        if isinstance(checks, dict):
            for check, passed in checks.items():
                if not passed:
                    if check not in failed_items:
                        failed_items[check] = 0
                    failed_items[check] += 1

sorted_failures = sorted(failed_items.items(), key=lambda x: x[1], reverse=True)
for item, count in sorted_failures[:10]:
    print(f"  • {item}: {count}개 페이지에서 실패")