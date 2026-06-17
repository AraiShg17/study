#!/usr/bin/env python3
"""アプリのアイコン一式を生成する。テーマ（ダーク＋ブルー）に合わせた 'ABC' マーク。

生成物:
  assets/icon.png            1024x1024  iOS/Android アプリアイコン（全面・不透明）
  assets/adaptive-icon.png   1024x1024  Android アダプティブ前景（透明・セーフゾーン内）
  assets/splash-icon.png     1024x1024  スプラッシュ用マーク（透明）
  assets/favicon.png          196x196   Web ファビコン
  assets/apple-touch-icon.png 180x180   Apple Touch アイコン（全面・不透明）
"""
import os
from PIL import Image, ImageDraw, ImageFont

ASSETS = os.path.join(os.path.dirname(__file__), "..", "assets")

PRIMARY_TOP = (91, 140, 255)   # #5b8cff
PRIMARY_BOT = (46, 78, 200)    # 深いブルー
WHITE = (255, 255, 255)
DARK = (15, 17, 21)            # #0f1115 テーマ背景

FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Black.ttf"


def vgradient(size, top, bottom):
    """縦方向グラデーションの正方形画像を作る。"""
    img = Image.new("RGB", (size, size), top)
    px = img.load()
    for y in range(size):
        t = y / (size - 1)
        r = int(top[0] + (bottom[0] - top[0]) * t)
        g = int(top[1] + (bottom[1] - top[1]) * t)
        b = int(top[2] + (bottom[2] - top[2]) * t)
        for x in range(size):
            px[x, y] = (r, g, b)
    return img


def draw_mark(img, text, color, font_path, frac=0.5):
    """中央に太字テキストを描く。frac は文字高さの目安（画像サイズ比）。"""
    size = img.size[0]
    draw = ImageDraw.Draw(img)
    fs = int(size * frac)
    font = ImageFont.truetype(font_path, fs)
    # テキストの実バウンディングボックスで正確に中央寄せ
    bbox = draw.textbbox((0, 0), text, font=font)
    w = bbox[2] - bbox[0]
    h = bbox[3] - bbox[1]
    x = (size - w) / 2 - bbox[0]
    y = (size - h) / 2 - bbox[1]
    draw.text((x, y), text, font=font, fill=color)
    return img


def rounded_card(img, color, inset_frac, radius_frac):
    """中央にうっすら濃いカードを敷いて奥行きを出す。"""
    size = img.size[0]
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    inset = int(size * inset_frac)
    r = int(size * radius_frac)
    d.rounded_rectangle([inset, inset, size - inset, size - inset], radius=r, fill=color)
    return Image.alpha_composite(img.convert("RGBA"), overlay)


def save(img, name):
    path = os.path.join(ASSETS, name)
    img.save(path)
    print("wrote", os.path.relpath(path))


def make_full(size, text, frac):
    """全面（不透明）アイコン。"""
    img = vgradient(size, PRIMARY_TOP, PRIMARY_BOT)
    img = rounded_card(img, (255, 255, 255, 28), 0.16, 0.16)
    img = img.convert("RGB")
    draw_mark(img, text, WHITE, FONT_BOLD, frac=frac)
    return img


def make_transparent_mark(size, text, frac, bg=None):
    """透明背景にマークだけ（任意で円/角丸の下地）。"""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    if bg is not None:
        d = ImageDraw.Draw(img)
        pad = int(size * 0.18)
        r = int(size * 0.20)
        d.rounded_rectangle([pad, pad, size - pad, size - pad], radius=r, fill=bg)
    draw_mark(img, text, WHITE, FONT_BOLD, frac=frac)
    return img


def main():
    # メインアイコン（全面）
    save(make_full(1024, "ABC", 0.40), "icon.png")
    # Apple Touch アイコン
    save(make_full(180, "ABC", 0.40), "apple-touch-icon.png")
    # ファビコン（小さいので 'A' 一文字で視認性確保）
    save(make_full(196, "A", 0.62), "favicon.png")
    # Android アダプティブ前景（セーフゾーン内に小さめ・透明）
    save(make_transparent_mark(1024, "ABC", 0.30), "adaptive-icon.png")
    # スプラッシュ（透明・マークのみ）
    save(make_transparent_mark(1024, "ABC", 0.34), "splash-icon.png")


if __name__ == "__main__":
    main()
