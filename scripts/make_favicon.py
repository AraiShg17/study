#!/usr/bin/env python3
"""ABC を顔に見立てた favicon を生成する。
A=左目 / C=右目 / B=口（横に倒す）。アプリのブルー基調に合わせる。
高解像度で描いて縮小し、輪郭を滑らかにする。
"""
import os
from PIL import Image, ImageDraw, ImageFont

ASSETS = os.path.join(os.path.dirname(__file__), "..", "assets")
FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Black.ttf"

PRIMARY_TOP = (91, 140, 255)
PRIMARY_BOT = (46, 78, 200)
WHITE = (255, 255, 255, 255)


def vgradient(size, top, bottom):
    img = Image.new("RGB", (size, size), top)
    px = img.load()
    for y in range(size):
        t = y / (size - 1)
        px_row = (
            int(top[0] + (bottom[0] - top[0]) * t),
            int(top[1] + (bottom[1] - top[1]) * t),
            int(top[2] + (bottom[2] - top[2]) * t),
        )
        for x in range(size):
            px[x, y] = px_row
    return img.convert("RGBA")


def letter_img(char, font_size, angle=0):
    """1文字を透明背景に描き、内容に合わせて切り抜いて返す。任意で回転。"""
    font = ImageFont.truetype(FONT_BOLD, font_size)
    tmp = Image.new("RGBA", (font_size * 2, font_size * 2), (0, 0, 0, 0))
    d = ImageDraw.Draw(tmp)
    d.text((font_size // 2, font_size // 2), char, font=font, fill=WHITE)
    bbox = tmp.getbbox()
    cropped = tmp.crop(bbox)
    if angle:
        cropped = cropped.rotate(angle, expand=True, resample=Image.BICUBIC)
    return cropped


def paste_center(base, piece, cx, cy):
    """piece の中心が (cx, cy) に来るように貼る。"""
    x = int(cx - piece.width / 2)
    y = int(cy - piece.height / 2)
    base.alpha_composite(piece, (x, y))


def make_face(size):
    img = vgradient(size, PRIMARY_TOP, PRIMARY_BOT)
    # うっすら明るい丸（顔の輪郭）
    overlay = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    pad = int(size * 0.10)
    d.ellipse([pad, pad, size - pad, size - pad], fill=(255, 255, 255, 26))
    img = Image.alpha_composite(img, overlay)

    eye = int(size * 0.27)
    mouth = int(size * 0.34)
    a = letter_img("A", eye, angle=-10)  # 左目（内側へ傾ける）
    c = letter_img("C", eye, angle=10)   # 右目
    b = letter_img("B", mouth, angle=-90)  # 横に倒して口に
    # 口を横に広げて笑顔っぽく
    b = b.resize((int(b.width * 1.5), b.height), Image.LANCZOS)

    paste_center(img, a, size * 0.355, size * 0.40)  # 左目
    paste_center(img, c, size * 0.645, size * 0.40)  # 右目
    paste_center(img, b, size * 0.50, size * 0.68)   # 口
    return img


def main():
    hi = make_face(512)
    favicon = hi.resize((196, 196), Image.LANCZOS)
    favicon.save(os.path.join(ASSETS, "favicon.png"))
    print("wrote assets/favicon.png (face)")


if __name__ == "__main__":
    main()
