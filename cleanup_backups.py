#!/usr/bin/env python3
"""
loadComponents 수정 스크립트가 만든 백업 파일들을 정리하는 스크립트
"""

import os
import glob
from datetime import datetime

ROOT_DIR = r"C:\Users\pc\teste"

def cleanup_backups():
    """백업 파일들을 찾아서 삭제 여부를 묻는 함수"""
    # 백업 파일 패턴
    backup_pattern = os.path.join(ROOT_DIR, "**", "*.html.backup_*")
    
    # 백업 파일 찾기
    backup_files = glob.glob(backup_pattern, recursive=True)
    
    if not backup_files:
        print("백업 파일이 없습니다.")
        return
    
    print(f"총 {len(backup_files)}개의 백업 파일을 찾았습니다:")
    print("-" * 80)
    
    for i, file in enumerate(backup_files, 1):
        rel_path = os.path.relpath(file, ROOT_DIR)
        file_size = os.path.getsize(file) / 1024  # KB
        print(f"{i:3d}. {rel_path} ({file_size:.1f} KB)")
    
    print("-" * 80)
    print("\n백업 파일을 삭제하시겠습니까?")
    print("1. 모든 백업 파일 삭제")
    print("2. 취소 (아무것도 삭제하지 않음)")
    
    # 자동으로 삭제 진행
    choice = "1"  # input("선택 (1 또는 2): ")
    
    if choice == "1":
        print("\n백업 파일 삭제 중...")
        deleted = 0
        errors = 0
        
        for file in backup_files:
            try:
                os.remove(file)
                deleted += 1
                print(f"  [삭제] {os.path.basename(file)}")
            except Exception as e:
                errors += 1
                print(f"  [오류] {os.path.basename(file)}: {str(e)}")
        
        print(f"\n삭제 완료: {deleted}개 파일")
        if errors > 0:
            print(f"오류 발생: {errors}개 파일")
    else:
        print("\n백업 파일 삭제를 취소했습니다.")

if __name__ == "__main__":
    print("=" * 80)
    print("백업 파일 정리 스크립트")
    print("=" * 80)
    cleanup_backups()
    print("\n완료되었습니다.")