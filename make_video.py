#!/usr/bin/env python3
"""
Видеопоздравление для Светланы Третьяковой
в стиле советских комедий
"""

import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import random
import math
import os

# ── настройки ──────────────────────────────────────────────────────────────
W, H = 1280, 720
FPS = 24
FONT_SERIF  = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
FONT_SANS   = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
OUTPUT_FILE = "/home/user/veechka911/svetlana_birthday.mp4"

PHOTO_DIR = "/home/user/veechka911/photos"   # положите сюда фото если есть


def load_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()


def grain(img, strength=18):
    arr = np.array(img).astype(np.int16)
    noise = np.random.randint(-strength, strength, arr.shape, dtype=np.int16)
    arr = np.clip(arr + noise, 0, 255).astype(np.uint8)
    return Image.fromarray(arr)


def vignette(img, strength=0.55):
    w, h = img.size
    arr = np.array(img).astype(np.float32)
    Y, X = np.ogrid[:h, :w]
    cx, cy = w / 2, h / 2
    dist = np.sqrt(((X - cx) / cx) ** 2 + ((Y - cy) / cy) ** 2)
    mask = 1 - np.clip(dist * strength, 0, 1)
    for c in range(arr.shape[2]):
        arr[:, :, c] *= mask
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))


def scratches(img, n=4):
    draw = ImageDraw.Draw(img)
    w, h = img.size
    for _ in range(n):
        x = random.randint(0, w)
        alpha = random.randint(60, 160)
        draw.line([(x, 0), (x + random.randint(-8, 8), h)],
                  fill=(200, 200, 180, alpha), width=1)
    return img


def bw_frame(img):
    gray = img.convert("L")
    sepia = Image.new("RGB", gray.size)
    for px in range(gray.width * gray.height):
        x, y = px % gray.width, px // gray.width
        v = gray.getpixel((x, y))
        r = min(255, int(v * 1.08))
        g = min(255, int(v * 0.95))
        b = min(255, int(v * 0.82))
        sepia.putpixel((x, y), (r, g, b))
    return sepia


def wrap_text(text, font, max_width, draw):
    words = text.split()
    lines, line = [], ""
    for w in words:
        test = (line + " " + w).strip()
        bbox = draw.textbbox((0, 0), test, font=font)
        if bbox[2] - bbox[0] <= max_width:
            line = test
        else:
            if line:
                lines.append(line)
            line = w
    if line:
        lines.append(line)
    return lines


def draw_centered_text(img, text, font, y_center, color=(255, 240, 200),
                        shadow=True, max_width=None):
    draw = ImageDraw.Draw(img)
    w, h = img.size
    mw = max_width or (w - 80)
    lines = wrap_text(text, font, mw, draw)
    line_h = font.size + 10
    total_h = len(lines) * line_h
    y = y_center - total_h // 2
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font)
        tw = bbox[2] - bbox[0]
        x = (w - tw) // 2
        if shadow:
            draw.text((x + 3, y + 3), line, font=font, fill=(0, 0, 0, 180))
        draw.text((x, y), line, font=font, fill=color)
        y += line_h
    return img


def black_bg():
    return Image.new("RGB", (W, H), (8, 8, 8))


def cream_bg():
    img = Image.new("RGB", (W, H), (245, 235, 200))
    draw = ImageDraw.Draw(img)
    for i in range(0, H, 4):
        alpha = random.randint(0, 8)
        draw.line([(0, i), (W, i)], fill=(220, 210, 175, alpha))
    return img


def soviet_title_card(title_lines, sub="", duration_sec=4):
    frames = []
    n = int(duration_sec * FPS)
    font_big  = load_font(FONT_SERIF, 68)
    font_med  = load_font(FONT_SERIF, 40)
    font_sub  = load_font(FONT_SANS,  28)

    for i in range(n):
        t = i / FPS
        fade_in  = min(1.0, t / 0.6)
        fade_out = min(1.0, (duration_sec - t) / 0.5)
        alpha    = fade_in * fade_out

        img = black_bg()
        draw = ImageDraw.Draw(img)

        # верхняя и нижняя рамки
        draw.rectangle([(0, 0), (W, 6)],   fill=(180, 150, 80))
        draw.rectangle([(0, H-6), (W, H)], fill=(180, 150, 80))

        y = H // 2 - (len(title_lines) * 78) // 2
        for j, line in enumerate(title_lines):
            font = font_big if j == 0 else font_med
            bbox = draw.textbbox((0, 0), line, font=font)
            tw = bbox[2] - bbox[0]
            x = (W - tw) // 2
            c = int(255 * alpha)
            gold = (c, int(230 * alpha), int(100 * alpha))
            draw.text((x + 3, y + 3), line, font=font, fill=(0, 0, 0))
            draw.text((x, y), line, font=font, fill=gold)
            y += font.size + 14

        if sub:
            bbox = draw.textbbox((0, 0), sub, font=font_sub)
            tw = bbox[2] - bbox[0]
            x = (W - tw) // 2
            c2 = int(200 * alpha)
            draw.text((x, H - 100), sub, font=font_sub,
                      fill=(c2, c2, int(c2 * 0.85)))

        img = grain(img)
        frames.append(np.array(img))
    return frames


def intertitle(text, bg_color=(230, 215, 170), duration_sec=3.5):
    frames = []
    n = int(duration_sec * FPS)
    font = load_font(FONT_SERIF, 54)

    for i in range(n):
        t = i / FPS
        fade = min(1.0, t / 0.5) * min(1.0, (duration_sec - t) / 0.4)

        img = Image.new("RGB", (W, H), bg_color)
        draw = ImageDraw.Draw(img)

        # рамка как в немом кино
        draw.rectangle([(20, 20), (W-20, H-20)], outline=(100, 80, 40), width=4)
        draw.rectangle([(30, 30), (W-30, H-30)], outline=(140, 110, 60), width=2)

        c = int(255 * fade)
        text_color = (int(60 * (1-fade)) + int(c * 0.3),
                      int(40 * (1-fade)),
                      int(10 * (1-fade)))

        draw_centered_text(img, text, font, H // 2,
                           color=(50, 30, 10), shadow=False)

        img = grain(img, 10)
        frames.append(np.array(img))
    return frames


def color_slide(text, sub="", bg=(20, 60, 120), duration_sec=4.0,
                text_color=(255, 230, 100), show_balloons=False):
    frames = []
    n = int(duration_sec * FPS)
    font_big = load_font(FONT_SERIF, 62)
    font_sub = load_font(FONT_SANS,  34)

    balloons = [(random.randint(50, W-50), H + random.randint(0, 200),
                 random.choice([(255,80,80),(80,200,80),(80,120,255),
                                (255,200,0),(200,80,200)]),
                 random.uniform(0.5, 1.5))
                for _ in range(12)]

    for i in range(n):
        t = i / FPS
        fade = min(1.0, t / 0.7) * min(1.0, (duration_sec - t) / 0.5)

        img = Image.new("RGB", (W, H), bg)
        draw = ImageDraw.Draw(img)

        if show_balloons:
            for bx, by, bc, speed in balloons:
                cy = by - int(t * speed * 120)
                if cy > -60:
                    draw.ellipse([(bx-20, cy-30), (bx+20, cy+30)], fill=bc)
                    draw.line([(bx, cy+30), (bx + random.randint(-10,10), cy+70)],
                              fill=(200,200,200), width=1)

        c = int(255 * fade)
        col = tuple(int(x * fade) for x in text_color)
        draw_centered_text(img, text, font_big, H // 2 - (30 if sub else 0),
                           color=col)
        if sub:
            col2 = tuple(int(x * fade) for x in (255, 255, 255))
            draw_centered_text(img, sub, font_sub, H // 2 + 80, color=col2)

        img = grain(img, 6)
        frames.append(np.array(img))
    return frames


def photo_slide(photo_path, caption="", duration_sec=5.0):
    frames = []
    n = int(duration_sec * FPS)
    font = load_font(FONT_SERIF, 36)
    font_cap = load_font(FONT_SANS, 28)

    try:
        photo = Image.open(photo_path).convert("RGB")
    except Exception:
        return []

    # вписываем в кадр
    pw, ph = photo.size
    scale = min(W / pw, H / ph)
    nw, nh = int(pw * scale), int(ph * scale)
    photo = photo.resize((nw, nh), Image.LANCZOS)

    bg = Image.new("RGB", (W, H), (10, 10, 10))
    offset_x = (W - nw) // 2
    offset_y = (H - nh) // 2
    bg.paste(photo, (offset_x, offset_y))
    bg = vignette(bg)

    for i in range(n):
        t = i / FPS
        fade = min(1.0, t / 0.8) * min(1.0, (duration_sec - t) / 0.6)

        img = bg.copy()
        img = grain(img, 12)
        img = scratches(img, 2)

        if caption:
            draw = ImageDraw.Draw(img)
            draw.rectangle([(0, H-70), (W, H)], fill=(0, 0, 0, 160))
            bbox = draw.textbbox((0, 0), caption, font=font_cap)
            tw = bbox[2] - bbox[0]
            c = int(220 * fade)
            draw.text(((W - tw)//2, H - 55), caption, font=font_cap,
                      fill=(c, c, int(c * 0.85)))

        frames.append(np.array(img))
    return frames


def make_transition(f_last, f_first, dur=0.5):
    frames = []
    n = int(dur * FPS)
    for i in range(n):
        alpha = i / n
        frame = (f_last * (1 - alpha) + f_first * alpha).astype(np.uint8)
        frames.append(frame)
    return frames


def build_video():
    from moviepy import ImageSequenceClip

    all_frames = []

    # ── СЦЕНА 1: советская заставка ────────────────────────────────────────
    all_frames += soviet_title_card(
        ["МОСФИЛЬМ", "представляет"],
        sub="при поддержке всех друзей",
        duration_sec=4.0
    )

    # переход
    if all_frames:
        last = all_frames[-1]
        first_next = np.array(black_bg())
        all_frames += make_transition(last, first_next)

    # ── СЦЕНА 2: название фильма ────────────────────────────────────────────
    all_frames += soviet_title_card(
        ["«СВЕТЛАНА", "И ЕЁ ВОЛШЕБНЫЙ ЮБИЛЕЙ»"],
        sub="комедия в одном действии",
        duration_sec=5.0
    )

    if all_frames:
        all_frames += make_transition(all_frames[-1], np.array(black_bg()))

    # ── СЦЕНА 3: интертитр 1 ───────────────────────────────────────────────
    all_frames += intertitle(
        "Давным-давно, в один прекрасный день,\n"
        "на свет появилась женщина\n"
        "необыкновенной красоты и ума.",
        duration_sec=4.0
    )

    # ── СЦЕНА 4: фото (если есть) ──────────────────────────────────────────
    photos = []
    if os.path.isdir(PHOTO_DIR):
        for f in sorted(os.listdir(PHOTO_DIR)):
            if f.lower().endswith((".jpg", ".jpeg", ".png")):
                photos.append(os.path.join(PHOTO_DIR, f))

    captions = [
        "Светлана — солнце нашей компании!",
        "Красота + мудрость = Светлана",
        "Юбилей — это когда опыт зашкаливает!",
        "Такое счастье — знать этого человека!",
        "Вместе — лучшая команда!",
    ]

    for idx, photo_path in enumerate(photos[:5]):
        cap = captions[idx % len(captions)]
        pf = photo_slide(photo_path, caption=cap, duration_sec=4.5)
        if pf:
            if all_frames:
                all_frames += make_transition(all_frames[-1], pf[0])
            all_frames += pf

    # ── СЦЕНА 5: цитата Гайдая ────────────────────────────────────────────
    if all_frames:
        all_frames += make_transition(all_frames[-1], np.array(black_bg()))

    all_frames += intertitle(
        "— Красота — страшная сила!\n— Особенно когда она именинница!",
        bg_color=(235, 220, 185),
        duration_sec=4.0
    )

    # ── СЦЕНА 6: поздравление ─────────────────────────────────────────────
    if all_frames:
        all_frames += make_transition(all_frames[-1],
                                      np.full((H, W, 3), (15, 50, 100), np.uint8))

    all_frames += color_slide(
        "С ЮБИЛЕЕМ,\nСВЕТЛАНА ТРЕТЬЯКОВА!",
        sub="Пусть каждый день будет как\nлюбимая советская комедия — смешно и со смыслом!",
        bg=(15, 50, 100),
        text_color=(255, 220, 80),
        show_balloons=True,
        duration_sec=5.0
    )

    # ── СЦЕНА 7: от друзей ────────────────────────────────────────────────
    if all_frames:
        all_frames += make_transition(all_frames[-1],
                                      np.full((H, W, 3), (80, 30, 80), np.uint8))

    all_frames += color_slide(
        "Будь здорова, счастлива\nи неотразима!",
        sub="С любовью — твои друзья ❤",
        bg=(80, 30, 80),
        text_color=(255, 200, 220),
        show_balloons=True,
        duration_sec=5.0
    )

    # ── СЦЕНА 8: финальная заставка ───────────────────────────────────────
    if all_frames:
        all_frames += make_transition(all_frames[-1], np.array(black_bg()))

    all_frames += soviet_title_card(
        ["КОНЕЦ"],
        sub="...хотя такая история — бесконечна!",
        duration_sec=3.5
    )

    # ── рендер ────────────────────────────────────────────────────────────
    print(f"Всего кадров: {len(all_frames)}")
    print(f"Длительность: {len(all_frames)/FPS:.1f} сек")
    print("Рендеринг видео...")

    clip = ImageSequenceClip(all_frames, fps=FPS)
    clip.write_videofile(OUTPUT_FILE, codec="libx264", audio=False,
                         fps=FPS, logger="bar")
    print(f"\nГотово: {OUTPUT_FILE}")


if __name__ == "__main__":
    build_video()
