#!/usr/bin/env python3
"""
IntersectionObserver 중복 스크립트 제거
"""

import os
import re
from bs4 import BeautifulSoup
import shutil

def fix_intersection_observer_duplicates():
    """IntersectionObserver 중복 제거"""
    filepath = 'tests/teto-egen/start.html'
    
    if not os.path.exists(filepath):
        print(f"[ERROR] {filepath} 파일을 찾을 수 없습니다.")
        return
    
    # 백업 생성
    backup_path = filepath + '.backup_intersection_fix'
    shutil.copy2(filepath, backup_path)
    print(f"[INFO] 백업 생성: {backup_path}")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    soup = BeautifulSoup(content, 'html.parser')
    
    # 모든 script 태그 찾기
    all_scripts = soup.find_all('script')
    
    # IntersectionObserver를 포함하는 스크립트 찾기
    intersection_scripts = []
    for script in all_scripts:
        if script.string and 'IntersectionObserver' in script.string:
            intersection_scripts.append(script)
    
    print(f"[INFO] {len(intersection_scripts)}개의 IntersectionObserver 스크립트 발견")
    
    if len(intersection_scripts) > 1:
        # 첫 번째 스크립트를 기준으로 통합
        main_script = intersection_scripts[0]
        
        # 모든 광고 컨테이너 ID 수집
        ad_container_ids = []
        for script in intersection_scripts:
            # 각 스크립트에서 광고 컨테이너 ID 추출
            matches = re.findall(r"getElementById\('([^']+)'\)", script.string)
            ad_container_ids.extend(matches)
        
        print(f"[INFO] 발견된 광고 컨테이너 ID: {ad_container_ids}")
        
        # 통합된 스크립트 생성
        unified_script = """
if ('IntersectionObserver' in window) {
    const adObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                const container = entry.target;
                const adClass = container.dataset.adClass || 'adsbygoogle';
                const adSlot = container.dataset.adSlot || '8646407138';
                const adFormat = container.dataset.adFormat || 'auto';
                
                container.innerHTML = `<ins class="${adClass}"
                     style="display:block"
                     data-ad-client="ca-pub-7905640648499222"
                     data-ad-slot="${adSlot}"
                     data-ad-format="${adFormat}"
                     data-full-width-responsive="true"></ins>`;
                
                (adsbygoogle = window.adsbygoogle || []).push({});
                adObserver.unobserve(container);
            }
        });
    }, { rootMargin: '100px' });
    
    // 모든 광고 컨테이너 관찰
"""
        
        # 각 컨테이너 ID에 대한 관찰 코드 추가
        for container_id in ad_container_ids:
            unified_script += f"""
    const container_{container_id.replace('-', '_')} = document.getElementById('{container_id}');
    if (container_{container_id.replace('-', '_')}) {{
        adObserver.observe(container_{container_id.replace('-', '_')});
    }}
"""
        
        unified_script += "\n}"
        
        # 첫 번째 스크립트를 통합된 버전으로 교체
        main_script.string = unified_script
        
        # 나머지 중복 스크립트 제거
        removed_count = 0
        for i, script in enumerate(intersection_scripts):
            if i > 0:  # 첫 번째를 제외한 나머지
                script.decompose()
                removed_count += 1
        
        print(f"[INFO] {removed_count}개의 중복 스크립트 제거됨")
        
        # 광고 컨테이너에 data 속성 추가
        for container_id in ad_container_ids:
            container = soup.find(id=container_id)
            if container:
                # 각 광고 위치에 맞는 속성 설정
                if 'header' in container_id:
                    container['data-ad-slot'] = '8646407138'
                    container['data-ad-format'] = 'auto'
                elif 'middle' in container_id:
                    container['data-ad-slot'] = '7333325461'
                    container['data-ad-format'] = 'rectangle'
                elif 'footer' in container_id:
                    container['data-ad-slot'] = '1080998783'
                    container['data-ad-format'] = 'auto'
        
        # 파일 저장
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(str(soup.prettify()))
        
        print("[SUCCESS] 중복 스크립트가 성공적으로 통합되었습니다.")
        
        # 검증
        with open(filepath, 'r', encoding='utf-8') as f:
            new_content = f.read()
        
        new_soup = BeautifulSoup(new_content, 'html.parser')
        new_intersection_scripts = []
        for script in new_soup.find_all('script'):
            if script.string and 'IntersectionObserver' in script.string:
                new_intersection_scripts.append(script)
        
        print(f"\n[VERIFY] 수정 후 IntersectionObserver 스크립트 개수: {len(new_intersection_scripts)}개")
        
        if len(new_intersection_scripts) == 1:
            print("[SUCCESS] 중복이 성공적으로 제거되었습니다!")
        else:
            print("[WARNING] 여전히 중복이 있습니다.")
    else:
        print("[INFO] 중복된 IntersectionObserver 스크립트가 없습니다.")

if __name__ == "__main__":
    fix_intersection_observer_duplicates()