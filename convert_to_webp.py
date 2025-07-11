#!/usr/bin/env python3
"""
WebP Image Converter for doha.kr optimization
Converts JPG/PNG images to WebP format with compression
"""

import os
from PIL import Image
import sys

def convert_to_webp(input_path, output_path, quality=80):
    """Convert image to WebP format with optimization"""
    try:
        with Image.open(input_path) as img:
            # Convert to RGB if necessary (for PNG with transparency)
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')
            
            # Save as WebP with compression
            img.save(output_path, 'WebP', quality=quality, optimize=True)
            
            # Get file sizes for comparison
            original_size = os.path.getsize(input_path)
            webp_size = os.path.getsize(output_path)
            compression_ratio = ((original_size - webp_size) / original_size) * 100
            
            print(f"✅ {os.path.basename(input_path)} -> {os.path.basename(output_path)}")
            print(f"   Original: {original_size:,} bytes")
            print(f"   WebP: {webp_size:,} bytes")
            print(f"   Saved: {compression_ratio:.1f}%")
            
            return True
            
    except Exception as e:
        print(f"❌ Error converting {input_path}: {e}")
        return False

def main():
    images_dir = "images"
    
    if not os.path.exists(images_dir):
        print(f"❌ Images directory '{images_dir}' not found")
        return
    
    # List of image files to convert
    image_files = [
        "egen-female-card.jpg",
        "egen-male-card.jpg", 
        "teto-female-card.jpg",
        "teto-male-card.jpg"
    ]
    
    print("🚀 Starting WebP conversion...")
    print("=" * 50)
    
    converted_count = 0
    total_original_size = 0
    total_webp_size = 0
    
    for filename in image_files:
        input_path = os.path.join(images_dir, filename)
        
        if not os.path.exists(input_path):
            print(f"⚠️  File not found: {filename}")
            continue
            
        # Create WebP filename
        name, ext = os.path.splitext(filename)
        webp_filename = f"{name}.webp"
        output_path = os.path.join(images_dir, webp_filename)
        
        # Get original size
        original_size = os.path.getsize(input_path)
        total_original_size += original_size
        
        # Convert to WebP
        if convert_to_webp(input_path, output_path, quality=85):
            converted_count += 1
            webp_size = os.path.getsize(output_path)
            total_webp_size += webp_size
            print()
    
    # Summary
    print("=" * 50)
    print(f"📊 Conversion Summary:")
    print(f"   Files converted: {converted_count}")
    print(f"   Total original size: {total_original_size:,} bytes")
    print(f"   Total WebP size: {total_webp_size:,} bytes")
    
    if total_original_size > 0:
        total_savings = ((total_original_size - total_webp_size) / total_original_size) * 100
        print(f"   Total space saved: {total_savings:.1f}%")
    
    print("\n🎯 Next steps:")
    print("   1. Update HTML files to use .webp images")
    print("   2. Add fallback support for older browsers")
    print("   3. Test image loading on different devices")

if __name__ == "__main__":
    main()