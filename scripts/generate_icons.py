import math
from PIL import Image, ImageDraw, ImageFilter

def create_yclick_icon(size=1024, padding_ratio=0.12, bg_color=(36, 76, 62, 255), is_transparent=False):
    # Scale up for high quality anti-aliasing
    scale = 2
    actual_size = size * scale
    
    if is_transparent:
        img = Image.new("RGBA", (actual_size, actual_size), (0, 0, 0, 0))
    else:
        img = Image.new("RGBA", (actual_size, actual_size), bg_color)
        
    draw = ImageDraw.Draw(img)
    
    cx = actual_size // 2
    cy = actual_size // 2
    
    # Calculate bounds based on padding
    pad = int(actual_size * padding_ratio)
    w = actual_size - 2 * pad
    h = actual_size - 2 * pad
    
    # Draw soft ambient glow around the emblem
    glow_color = (60, 115, 95, 120)
    draw.ellipse([cx - int(w*0.38), cy - int(h*0.38), cx + int(w*0.38), cy + int(h*0.38)], fill=glow_color)
    
    # House geometry
    # Peak
    roof_peak_y = pad + int(h * 0.16)
    roof_left_x = pad + int(w * 0.14)
    roof_right_x = actual_size - pad - int(w * 0.14)
    roof_eaves_y = pad + int(h * 0.44)
    
    wall_left_x = pad + int(w * 0.22)
    wall_right_x = actual_size - pad - int(w * 0.22)
    wall_bottom_y = actual_size - pad - int(h * 0.14)
    
    stroke_w = int(actual_size * 0.042)
    
    white = (255, 255, 255, 255)
    accent_amber = (245, 158, 11, 255) # Warm golden light
    subtle_mint = (237, 244, 238, 255)
    
    # 1. House Roof (thick architectural lines with rounded joints)
    draw.line([(roof_left_x, roof_eaves_y), (cx, roof_peak_y), (roof_right_x, roof_eaves_y)], fill=white, width=stroke_w, joint="curve")
    
    # Roof apex chimney / camera flash accent on left roof
    chimney_x = cx - int(w * 0.20)
    chimney_top = roof_peak_y + int(h * 0.04)
    chimney_bot = roof_peak_y + int(h * 0.18)
    draw.line([(chimney_x, chimney_top), (chimney_x, chimney_bot)], fill=white, width=int(stroke_w * 0.8))
    
    # 2. House Body (Walls and Floor)
    wall_radius = int(actual_size * 0.06)
    draw.line([(wall_left_x, roof_eaves_y + int(stroke_w*0.2)), (wall_left_x, wall_bottom_y - wall_radius)], fill=white, width=stroke_w)
    draw.line([(wall_right_x, roof_eaves_y + int(stroke_w*0.2)), (wall_right_x, wall_bottom_y - wall_radius)], fill=white, width=stroke_w)
    
    # Bottom floor line with rounded corners
    draw.line([(wall_left_x, wall_bottom_y), (wall_right_x, wall_bottom_y)], fill=white, width=stroke_w)
    draw.arc([wall_left_x, wall_bottom_y - 2*wall_radius, wall_left_x + 2*wall_radius, wall_bottom_y], 90, 180, fill=white, width=stroke_w)
    draw.arc([wall_right_x - 2*wall_radius, wall_bottom_y - 2*wall_radius, wall_right_x, wall_bottom_y], 0, 90, fill=white, width=stroke_w)
    
    # 3. Camera / Lens Viewfinder ("YClick") in center of house
    camera_cy = cy + int(h * 0.10)
    lens_r_outer = int(w * 0.19)
    lens_r_inner = int(w * 0.12)
    lens_r_center = int(w * 0.065)
    
    # Outer lens circle ring
    draw.ellipse([cx - lens_r_outer, camera_cy - lens_r_outer, cx + lens_r_outer, camera_cy + lens_r_outer], outline=white, width=int(stroke_w * 0.95))
    
    # Inner lens ring
    draw.ellipse([cx - lens_r_inner, camera_cy - lens_r_inner, cx + lens_r_inner, camera_cy + lens_r_inner], outline=white, width=int(stroke_w * 0.65))
    
    # Center core lens pupil (Warm Golden Amber = "Click" / "Inspiration")
    draw.ellipse([cx - lens_r_center, camera_cy - lens_r_center, cx + lens_r_center, camera_cy + lens_r_center], fill=accent_amber)
    
    # Camera Shutter dot (Top right of the lens)
    dot_x = cx + int(lens_r_outer * 0.72)
    dot_y = camera_cy - int(lens_r_outer * 0.72)
    dot_r = int(actual_size * 0.022)
    draw.ellipse([dot_x - dot_r, dot_y - dot_r, dot_x + dot_r, dot_y + dot_r], fill=white)
    
    # Spatial Spark / Dimension grid ticks (4 subtle alignment crosshairs)
    tick_len = int(actual_size * 0.035)
    # top tick
    draw.line([(cx, camera_cy - lens_r_outer - tick_len - int(stroke_w*0.3)), (cx, camera_cy - lens_r_outer - int(stroke_w*0.3))], fill=white, width=int(stroke_w*0.5))
    # bottom tick
    draw.line([(cx, camera_cy + lens_r_outer + int(stroke_w*0.3)), (cx, camera_cy + lens_r_outer + tick_len + int(stroke_w*0.3))], fill=white, width=int(stroke_w*0.5))
    # left tick
    draw.line([(cx - lens_r_outer - tick_len - int(stroke_w*0.3), camera_cy), (cx - lens_r_outer - int(stroke_w*0.3), camera_cy)], fill=white, width=int(stroke_w*0.5))
    # right tick
    draw.line([(cx + lens_r_outer + int(stroke_w*0.3), camera_cy), (cx + lens_r_outer + tick_len + int(stroke_w*0.3), camera_cy)], fill=white, width=int(stroke_w*0.5))
    
    # High-quality supersampling downscale
    final_img = img.resize((size, size), Image.Resampling.LANCZOS)
    return final_img

# 1. Main App Icon (1024x1024, Full bleed Forest Green with comfortable emblem margin)
main_icon = create_yclick_icon(size=1024, padding_ratio=0.14, bg_color=(36, 76, 62, 255))
main_icon.save("assets/icon.png", "PNG")
print("Saved assets/icon.png")

# 2. Splash Icon (1024x1024, Transparent background with white & amber emblem)
splash_icon = create_yclick_icon(size=1024, padding_ratio=0.18, is_transparent=True)
splash_icon.save("assets/splash-icon.png", "PNG")
print("Saved assets/splash-icon.png")

# 3. Android Adaptive Foreground (Safe Area ~30% padding)
android_fg = create_yclick_icon(size=1024, padding_ratio=0.25, is_transparent=True)
android_fg.save("assets/android-icon-foreground.png", "PNG")
print("Saved assets/android-icon-foreground.png")

# 4. Android Adaptive Background (Solid Forest Green)
android_bg = Image.new("RGBA", (1024, 1024), (36, 76, 62, 255))
android_bg.save("assets/android-icon-background.png", "PNG")
print("Saved assets/android-icon-background.png")

# 5. Favicon (64x64)
favicon = main_icon.resize((64, 64), Image.Resampling.LANCZOS)
favicon.save("assets/favicon.png", "PNG")
print("Saved assets/favicon.png")
