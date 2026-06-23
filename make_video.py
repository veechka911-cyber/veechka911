#!/usr/bin/env python3
"""
Видеопоздравление для Светланы Третьяковой с юбилеем.
Душевное, с юмором — от друзей. В стиле советских комедий.

- заставка «Мосфильм» и название фильма
- интертитры в духе немого кино и цитаты из советских комедий
- фотографии с эффектом плавного движения (Ken Burns) и подписями
- нежная синтезированная музыка-шкатулка
"""

import os
import math
import random
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

# ── настройки ──────────────────────────────────────────────────────────────
W, H = 1280, 720
FPS = 24
SR = 44100  # частота звука

FONT_SERIF = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
FONT_SANS  = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
FONT_SANSB = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"

PHOTO_DIR   = "/home/user/veechka911/photos"
OUTPUT_FILE = "/home/user/veechka911/svetlana_birthday.mp4"

random.seed(7)


def load_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()


# ── эффекты «старой плёнки» ─────────────────────────────────────────────────
def grain(img, strength=10):
    arr = np.array(img).astype(np.int16)
    noise = np.random.randint(-strength, strength + 1, arr.shape[:2], dtype=np.int16)
    noise = noise[:, :, None]
    arr = np.clip(arr + noise, 0, 255).astype(np.uint8)
    return Image.fromarray(arr)


def vignette(img, strength=0.6):
    w, h = img.size
    arr = np.array(img).astype(np.float32)
    Y, X = np.ogrid[:h, :w]
    cx, cy = w / 2, h / 2
    dist = np.sqrt(((X - cx) / cx) ** 2 + ((Y - cy) / cy) ** 2)
    mask = 1 - np.clip((dist - 0.4) * strength, 0, 0.6)
    arr *= mask[:, :, None]
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))


def scratches(img, n=2):
    img = img.copy()
    draw = ImageDraw.Draw(img)
    w, h = img.size
    for _ in range(n):
        if random.random() < 0.5:
            continue
        x = random.randint(0, w)
        a = random.randint(40, 110)
        draw.line([(x, 0), (x + random.randint(-6, 6), h)],
                  fill=(220, 215, 190), width=1)
    return img


# ── работа с текстом ────────────────────────────────────────────────────────
def wrap_text(text, font, max_width, draw):
    lines = []
    for paragraph in text.split("\n"):
        words = paragraph.split()
        line = ""
        for w in words:
            test = (line + " " + w).strip()
            if draw.textlength(test, font=font) <= max_width:
                line = test
            else:
                if line:
                    lines.append(line)
                line = w
        lines.append(line)
    return lines


def draw_text_block(img, text, font, y_center, color=(255, 240, 205),
                    shadow=(0, 0, 0), max_width=None, line_gap=12, anchor_top=False):
    draw = ImageDraw.Draw(img)
    mw = max_width or (W - 120)
    lines = wrap_text(text, font, mw, draw)
    line_h = font.size + line_gap
    total = len(lines) * line_h
    y = y_center if anchor_top else (y_center - total // 2)
    for line in lines:
        tw = draw.textlength(line, font=font)
        x = (W - tw) // 2
        if shadow:
            draw.text((x + 3, y + 3), line, font=font, fill=shadow)
        draw.text((x, y), line, font=font, fill=color)
        y += line_h
    return total


def fade_factor(t, dur, fin=0.6, fout=0.5):
    return min(1.0, t / fin) * min(1.0, max(0.0, (dur - t) / fout))


# ── сцены ──────────────────────────────────────────────────────────────────
def black_bg():
    return Image.new("RGB", (W, H), (8, 8, 8))


def title_card(lines, sub="", dur=4.0, big=70, med=42):
    frames = []
    n = int(dur * FPS)
    f_big = load_font(FONT_SERIF, big)
    f_med = load_font(FONT_SERIF, med)
    f_sub = load_font(FONT_SANS, 28)
    for i in range(n):
        t = i / FPS
        a = fade_factor(t, dur)
        img = black_bg()
        draw = ImageDraw.Draw(img)
        draw.rectangle([(0, 0), (W, 6)], fill=(int(170*a), int(140*a), int(70*a)))
        draw.rectangle([(0, H-6), (W, H)], fill=(int(170*a), int(140*a), int(70*a)))
        total_h = 0
        for j, ln in enumerate(lines):
            total_h += (f_big.size if j == 0 else f_med.size) + 18
        y = (H - total_h) // 2
        for j, ln in enumerate(lines):
            font = f_big if j == 0 else f_med
            tw = draw.textlength(ln, font=font)
            x = (W - tw) // 2
            gold = (int(255*a), int(225*a), int(110*a))
            draw.text((x+3, y+3), ln, font=font, fill=(0, 0, 0))
            draw.text((x, y), ln, font=font, fill=gold)
            y += font.size + 18
        if sub:
            tw = draw.textlength(sub, font=f_sub)
            c = int(205 * a)
            draw.text(((W - tw)//2, H - 96), sub, font=f_sub,
                      fill=(c, c, int(c*0.8)))
        frames.append(np.array(grain(img, 8)))
    return frames


def intertitle(text, dur=4.0, bg=(232, 217, 175), size=46):
    frames = []
    n = int(dur * FPS)
    font = load_font(FONT_SERIF, size)
    for i in range(n):
        t = i / FPS
        a = fade_factor(t, dur)
        base = Image.new("RGB", (W, H), tuple(int(c) for c in bg))
        draw = ImageDraw.Draw(base)
        draw.rectangle([(24, 24), (W-24, H-24)], outline=(110, 85, 45), width=4)
        draw.rectangle([(34, 34), (W-34, H-34)], outline=(150, 120, 65), width=2)
        # маленькие уголки-звёздочки
        for cx, cy in [(60, 60), (W-60, 60), (60, H-60), (W-60, H-60)]:
            draw.ellipse([(cx-4, cy-4), (cx+4, cy+4)], fill=(150, 120, 65))
        draw_text_block(base, text, font, H // 2, color=(45, 28, 12), shadow=None)
        # затемнение для fade
        if a < 1.0:
            ov = Image.new("RGB", (W, H), (0, 0, 0))
            base = Image.blend(base, ov, 1 - a)
        frames.append(np.array(grain(base, 6)))
    return frames


def color_slide(text, sub="", bg=(18, 52, 105), dur=4.5,
                text_color=(255, 222, 90), balloons=True, size=58):
    frames = []
    n = int(dur * FPS)
    f_big = load_font(FONT_SERIF, size)
    f_sub = load_font(FONT_SANS, 32)
    blist = [(random.randint(60, W-60), H + random.randint(20, 320),
              random.choice([(235,80,80),(90,190,90),(90,120,235),
                             (240,190,40),(200,90,190),(240,140,60)]),
              random.uniform(0.6, 1.6)) for _ in range(14)]
    for i in range(n):
        t = i / FPS
        a = fade_factor(t, dur, 0.7, 0.5)
        img = Image.new("RGB", (W, H), bg)
        draw = ImageDraw.Draw(img)
        if balloons:
            for bx, by, bc, sp in blist:
                cy = int(by - t * sp * 130)
                if -70 < cy < H + 70:
                    col = tuple(int(c) for c in bc)
                    draw.ellipse([(bx-22, cy-30), (bx+22, cy+30)], fill=col)
                    draw.polygon([(bx-4, cy+28), (bx+4, cy+28), (bx, cy+36)], fill=col)
                    draw.line([(bx, cy+36), (bx+random.randint(-8,8), cy+78)],
                              fill=(210, 210, 210), width=1)
        col = tuple(int(c * a) for c in text_color)
        h_used = draw_text_block(img, text, f_big, H // 2 - (38 if sub else 0), color=col)
        if sub:
            col2 = tuple(int(c * a) for c in (255, 255, 255))
            draw_text_block(img, sub, f_sub, H // 2 + h_used // 2 + 12, color=col2)
        frames.append(np.array(grain(img, 5)))
    return frames


def cover_resize(photo, tw, th):
    pw, ph = photo.size
    scale = max(tw / pw, th / ph)
    nw, nh = int(pw * scale) + 1, int(ph * scale) + 1
    img = photo.resize((nw, nh), Image.LANCZOS)
    left = (nw - tw) // 2
    top = (nh - th) // 2
    return img.crop((left, top, left + tw, top + th))


def contain_size(photo, maxw, maxh):
    pw, ph = photo.size
    scale = min(maxw / pw, maxh / ph)
    return int(pw * scale), int(ph * scale)


def photo_slide(path, caption="", dur=4.2, zoom_to=1.07):
    frames = []
    n = int(dur * FPS)
    try:
        photo = Image.open(path).convert("RGB")
    except Exception:
        return []
    photo = ImageEnhance.Color(photo).enhance(1.06)
    photo = ImageEnhance.Contrast(photo).enhance(1.03)

    # размытый фон (один раз)
    bg = cover_resize(photo, W, H).filter(ImageFilter.GaussianBlur(22))
    bg = ImageEnhance.Brightness(bg).enhance(0.55)

    # передний план — вписанный, с запасом под подпись
    fw, fh = contain_size(photo, W - 80, H - 150)
    fg_base = photo.resize((fw, fh), Image.LANCZOS)

    f_cap = load_font(FONT_SANSB, 34)
    pan = random.choice([-1, 1]) * 14  # лёгкий горизонтальный дрейф

    for i in range(n):
        t = i / FPS
        prog = i / max(1, n - 1)
        a = fade_factor(t, dur, 0.7, 0.6)

        frame = bg.copy()
        # Ken Burns: плавный зум переднего плана
        z = 1.0 + (zoom_to - 1.0) * prog
        zw, zh = int(fw * z), int(fh * z)
        fg = fg_base.resize((zw, zh), Image.LANCZOS)
        ox = (W - zw) // 2 + int(pan * prog)
        oy = (H - 150 - zh) // 2 + 20
        frame.paste(fg, (ox, oy))

        frame = vignette(frame, 0.5)

        # подпись на полупрозрачной плашке
        if caption:
            draw = ImageDraw.Draw(frame, "RGBA")
            bar_h = 84
            draw.rectangle([(0, H - bar_h), (W, H)], fill=(0, 0, 0, 150))
            draw.rectangle([(0, H - bar_h), (W, H - bar_h + 3)],
                           fill=(190, 155, 80, 220))
            lines = wrap_text(caption, f_cap, W - 100, draw)
            ch = len(lines) * (f_cap.size + 6)
            y = H - bar_h + (bar_h - ch) // 2
            for ln in lines:
                tw = draw.textlength(ln, font=f_cap)
                x = (W - tw) // 2
                draw.text((x+2, y+2), ln, font=f_cap, fill=(0, 0, 0, 200))
                draw.text((x, y), ln, font=f_cap, fill=(255, 244, 210, 255))
                y += f_cap.size + 6

        frame = grain(frame, 7)
        frame = scratches(frame, 2)

        if a < 1.0:
            ov = Image.new("RGB", (W, H), (0, 0, 0))
            frame = Image.blend(frame.convert("RGB"), ov, 1 - a)
        frames.append(np.array(frame.convert("RGB")))
    return frames


def crossfade(a_frames, b_frames, dur=0.5):
    """плавный переход между двумя сценами (берёт хвост a и голову b)"""
    n = int(dur * FPS)
    n = min(n, len(a_frames), len(b_frames))
    if n == 0:
        return a_frames + b_frames
    out = a_frames[:-n]
    a_tail = a_frames[-n:]
    b_head = b_frames[:n]
    for i in range(n):
        alpha = (i + 1) / (n + 1)
        blended = (a_tail[i].astype(np.float32) * (1 - alpha) +
                   b_head[i].astype(np.float32) * alpha).astype(np.uint8)
        out.append(blended)
    out.extend(b_frames[n:])
    return out


# ── музыка (весёлая полька / марш в стиле советских комедий) ─────────────────
def note(freq, dur, sr=SR, kind="trumpet", vol=0.5):
    t = np.linspace(0, dur, int(sr * dur), endpoint=False)
    if kind == "trumpet":
        # медный духовой: богатый обертоновый ряд + резкая атака
        env = np.exp(-2.5 * t / max(dur, 0.01)) * (1 - np.exp(-80 * t))
        wave = (np.sin(2*np.pi*freq*t)
                + 0.7 * np.sin(2*np.pi*2*freq*t)
                + 0.5 * np.sin(2*np.pi*3*freq*t)
                + 0.3 * np.sin(2*np.pi*4*freq*t)
                + 0.15 * np.sin(2*np.pi*5*freq*t))
    elif kind == "tuba":
        # туба (бас)
        env = np.exp(-1.8 * t / max(dur, 0.01)) * (1 - np.exp(-60 * t))
        wave = (np.sin(2*np.pi*freq*t)
                + 0.9 * np.sin(2*np.pi*2*freq*t)
                + 0.4 * np.sin(2*np.pi*3*freq*t))
    elif kind == "clarinet":
        # кларнет: нечётные гармоники
        env = np.minimum(1.0, t / (dur*0.05)) * np.exp(-1.2 * t / max(dur, 0.01))
        wave = (np.sin(2*np.pi*freq*t)
                + 0.6 * np.sin(2*np.pi*3*freq*t)
                + 0.3 * np.sin(2*np.pi*5*freq*t)
                + 0.15 * np.sin(2*np.pi*7*freq*t))
    elif kind == "snare":
        # малый барабан: шум + резкая атака
        env = np.exp(-25 * t / max(dur, 0.001))
        wave = np.random.default_rng(42).standard_normal(len(t)).astype(np.float32) * 0.8
        wave += np.sin(2*np.pi*200*t) * 0.3
    elif kind == "kick":
        env = np.exp(-18 * t / max(dur, 0.001))
        wave = np.sin(2*np.pi*freq * np.exp(-15*t) * t)
    else:  # pad
        env = np.minimum(1.0, t / (dur*0.2)) * np.minimum(1.0, (dur - t) / (dur*0.3))
        wave = np.sin(2*np.pi*freq*t) + 0.4*np.sin(2*np.pi*freq*2*t)
    return (wave * env * vol).astype(np.float32)


def make_music(total_sec):
    """
    Весёлый духовой оркестр — полька-марш в стиле советских комедий.
    Гармония C-dur: C F G C, темп ~130 bpm.
    """
    N = {
        "C2": 65.41, "G2": 98.00, "F2": 87.31, "D2": 73.42,
        "C3":130.81, "D3":146.83, "E3":164.81, "F3":174.61,
        "G3":196.00, "A3":220.00, "B3":246.94,
        "C4":261.63, "D4":293.66, "E4":329.63, "F4":349.23,
        "G4":392.00, "A4":440.00, "B4":493.88,
        "C5":523.25, "D5":587.33, "E5":659.25, "F5":698.46,
        "G5":783.99, "A5":880.00,
    }
    # мелодия польки (2 такта × 2 варианта = 16 нот)
    melody_A = ["C5","E5","G5","E5", "C5","G4","E4","G4"]
    melody_B = ["F5","A5","F5","D5", "C5","E5","C5","G4"]
    melody_C = ["G4","B4","D5","B4", "G4","D4","B3","D4"]

    beat = 60/130  # длительность одной четверти при 130 bpm
    b8 = beat / 2  # восьмая

    # аккорды (бас + квинта)
    chord_seq = [
        (["C2","G2"], ["C3","E3","G3"]),  # C
        (["F2","C3"], ["F3","A3","C4"]),  # F — исправлено
        (["G2","D3"], ["G3","B3","D4"]),  # G7
        (["C2","G2"], ["C3","E3","G3"]),  # C
    ]

    buf = np.zeros(int(SR * (total_sec + 2)), dtype=np.float32)
    pos = 0.0
    ci = 0  # счётчик тактов

    while pos < total_sec:
        chord_idx = ci % len(chord_seq)
        bass_notes, harm_notes = chord_seq[chord_idx]

        # ── бас (туба: октавный прыжок вверх-вниз) ──
        for ki, bn in enumerate(bass_notes * 2):
            s = int((pos + ki * beat) * SR)
            nw = note(N[bn], beat * 0.85, kind="tuba", vol=0.30)
            e = min(len(buf), s + len(nw))
            buf[s:e] += nw[:e-s]

        # ── гармония (кларнет, на 2-й и 4-й удар) ──
        for hi, hn in enumerate(harm_notes):
            s = int((pos + beat + hi * b8) * SR)
            nw = note(N[hn], b8 * 0.9, kind="clarinet", vol=0.18)
            e = min(len(buf), s + len(nw))
            buf[s:e] += nw[:e-s]

        # ── мелодия (труба) ──
        phrase = melody_B if (ci // 4) % 2 else melody_A
        for mi, mn in enumerate(phrase):
            s = int((pos + mi * b8) * SR)
            nw = note(N[mn], b8 * 0.88, kind="trumpet", vol=0.28)
            e = min(len(buf), s + len(nw))
            buf[s:e] += nw[:e-s]

        # ── ударные: kick на 1/3, snare на 2/4 ──
        for ki, off in enumerate([0, beat, 2*beat, 3*beat]):
            kind_d = "kick" if ki % 2 == 0 else "snare"
            freq_d = 80 if kind_d == "kick" else 200
            s = int((pos + off) * SR)
            nw = note(freq_d, b8 * 0.5, kind=kind_d, vol=0.20 if kind_d=="kick" else 0.14)
            e = min(len(buf), s + len(nw))
            buf[s:e] += nw[:e-s]

        pos += beat * 4  # один такт = 4 четверти
        ci += 1

    buf = buf[:int(SR * total_sec)]
    # мягкая компрессия / нормализация
    peak = np.max(np.abs(buf)) or 1.0
    buf = np.tanh(buf / peak * 1.4) * 0.62
    # fade-in / fade-out
    fi = int(SR * 1.5)
    buf[:fi] *= np.linspace(0, 1, fi)
    fo = int(SR * 2.0)
    buf[-fo:] *= np.linspace(1, 0, fo)
    stereo = np.column_stack([buf, buf])
    return stereo


# ── сборка ──────────────────────────────────────────────────────────────────
def build():
    from moviepy import ImageSequenceClip, AudioArrayClip

    # подбираем фото в нужном порядке с подписями
    plan = [
        ("photo_2026-06-23_21-47-31.jpg", "Виновница торжества — Светлана!"),
        ("photo_2026-06-23_21-47-56.jpg", "Красота не требует возраста"),
        ("photo_2026-06-23_21-47-07.jpg", "Рядом с ней — её верный рыцарь"),
        ("photo_2026-06-23_21-47-11.jpg", "Семья — главный её аргумент"),
        ("photo_2026-06-23_21-47-00.jpg", "Мамина гордость, папина копия"),
        ("photo_2026-06-23_21-47-16.jpg", "Дети растут, мама молодеет!"),
        ("photo_2026-06-23_21-47-52.jpg", "Хозяйка, мама, красавица..."),
        ("photo_2026-06-23_21-47-37.jpg", "А это — её верные соратницы!"),
        ("photo_2026-06-23_21-47-48.jpg", "Вместе — и в горе, и в шашлыке"),
        ("photo_2026-06-23_21-48-02.jpg", "Где Света — там праздник!"),
        ("photo_2026-06-23_21-47-20.jpg", "За дружбу, за радость, за нас!"),
        ("photo_2026-06-23_21-48-05.jpg", "Умеем и отдыхать!"),
        ("photo_2026-06-23_21-56-35.jpg", "Море, юг и лучшие подруги"),
        ("photo_2026-06-23_21-56-29.jpg", "Море нас не сломить!"),
        ("photo_2026-06-23_21-56-18.jpg", "В любой дороге — вместе!"),
    ]

    scenes = []

    # ── ЗАСТАВКА ──────────────────────────────────────────────
    scenes.append(title_card(
        ["МОСФИЛЬМ", "представляет"],
        sub="при поддержке настоящих друзей", dur=3.5))

    scenes.append(title_card(
        ["«СВЕТЛАНА", "И ЕЁ ВОЛШЕБНЫЙ ЮБИЛЕЙ»"],
        sub="душевная комедия в одном действии   18+  (шуток)",
        dur=4.2, big=56, med=56))

    # ── АКТ I: ЗНАКОМСТВО С ГЕРОИНЕЙ ──────────────────────────
    scenes.append(intertitle(
        "АКТ I\n«Откуда берутся такие женщины»", dur=3.2))

    scenes.append(intertitle(
        "Говорят, такие женщины рождаются раз в сто лет.\n"
        "Нам повезло — мы знаем одну лично.", dur=4.0))

    scenes.append(photo_slide(os.path.join(PHOTO_DIR, plan[0][0]), plan[0][1], dur=3.8))

    scenes.append(intertitle(
        "— Светлана, сколько вам лет?\n"
        "— Столько, сколько надо!\n"
        "Не больше и не меньше.", dur=3.8))

    scenes.append(photo_slide(os.path.join(PHOTO_DIR, plan[1][0]), plan[1][1], dur=3.8))

    # ── АКТ II: СЕМЕЙНАЯ САГА ──────────────────────────────────
    scenes.append(intertitle(
        "АКТ II\n«Ячейка общества (и самая лучшая)»", dur=3.0))

    scenes.append(intertitle(
        "За каждой великой женщиной\n"
        "стоит великий мужчина.\n"
        "И очень терпеливый.", dur=3.8))

    scenes.append(photo_slide(os.path.join(PHOTO_DIR, plan[2][0]), plan[2][1], dur=3.8))

    scenes.append(intertitle(
        "Дети — цветы жизни.\n"
        "А наша Света — садовник\n"
        "высшей категории!", dur=3.5))

    scenes.append(photo_slide(os.path.join(PHOTO_DIR, plan[3][0]), plan[3][1], dur=3.8))
    scenes.append(photo_slide(os.path.join(PHOTO_DIR, plan[4][0]), plan[4][1], dur=3.5))

    scenes.append(intertitle(
        "— Мама, ты самая лучшая!\n"
        "— Знаю. Но спасибо, что напомнил.", dur=3.5))

    scenes.append(photo_slide(os.path.join(PHOTO_DIR, plan[5][0]), plan[5][1], dur=3.5))
    scenes.append(photo_slide(os.path.join(PHOTO_DIR, plan[6][0]), plan[6][1], dur=3.8))

    # ── АКТ III: ДРУЖЕСКАЯ ХРОНИКА ────────────────────────────
    scenes.append(intertitle(
        "АКТ III\n«Подруги. Документальные свидетельства»", dur=3.0))

    scenes.append(intertitle(
        "Настоящая подруга — это та,\n"
        "которая знает всё...\n"
        "и всё равно дружит.", dur=3.8))

    scenes.append(photo_slide(os.path.join(PHOTO_DIR, plan[7][0]), plan[7][1], dur=3.8))
    scenes.append(photo_slide(os.path.join(PHOTO_DIR, plan[8][0]), plan[8][1], dur=3.5))

    scenes.append(intertitle(
        "Застолье — это не просто стол.\n"
        "Это место, где рождаются\n"
        "великие планы и великая дружба.", dur=3.8))

    scenes.append(photo_slide(os.path.join(PHOTO_DIR, plan[9][0]),  plan[9][1],  dur=3.5))
    scenes.append(photo_slide(os.path.join(PHOTO_DIR, plan[10][0]), plan[10][1], dur=3.5))

    # ── АКТ IV: ОТДЫХ ─────────────────────────────────────────
    scenes.append(intertitle(
        "АКТ IV\n«Культурный отдых и оздоровление»", dur=3.0))

    scenes.append(intertitle(
        "Учёные доказали: женщины,\n"
        "которые умеют отдыхать,\n"
        "живут дольше и веселее!", dur=3.8))

    scenes.append(photo_slide(os.path.join(PHOTO_DIR, plan[11][0]), plan[11][1], dur=3.5))
    scenes.append(photo_slide(os.path.join(PHOTO_DIR, plan[12][0]), plan[12][1], dur=3.5))

    scenes.append(intertitle(
        "На море всё лечится:\n"
        "хандра, усталость, понедельник...\n"
        "и даже возраст!", dur=3.8))

    scenes.append(photo_slide(os.path.join(PHOTO_DIR, plan[13][0]), plan[13][1], dur=3.5))
    scenes.append(photo_slide(os.path.join(PHOTO_DIR, plan[14][0]), plan[14][1], dur=3.8))

    # ── ФИНАЛ ──────────────────────────────────────────────────
    scenes.append(intertitle(
        "ФИНАЛ\n«Торжественная часть»", dur=2.8))

    scenes.append(intertitle(
        "Хочу пожелать тебе, Светлана,\n"
        "чтобы все твои желания\n"
        "совпадали с твоими возможностями!\n"
        "А возможности — росли!", dur=4.5))

    scenes.append(color_slide(
        "С ЮБИЛЕЕМ,\nСВЕТЛАНА!",
        sub="Будь здорова, любима и счастлива!\n"
            "Пусть жизнь будет как добрая советская комедия —\n"
            "с юмором, теплом и хорошим концом!",
        bg=(20, 55, 110), text_color=(255, 222, 90), dur=5.0))

    scenes.append(intertitle(
        "— Как вы себя чувствуете в юбилей?\n"
        "— Как огурчик!\n"
        "— В смысле — свежая?\n"
        "— В смысле — в рассоле, но бодрая!", dur=4.2))

    scenes.append(color_slide(
        "Мы тебя очень любим!",
        sub="С теплом, обнимашками и тортиком —\nтвои друзья ❤",
        bg=(110, 30, 80), text_color=(255, 200, 220), dur=4.5))

    scenes.append(title_card(
        ["К О Н Е Ц"],
        sub="...а в жизни — только всё начинается!", dur=3.5))

    # склейка с переходами
    video = scenes[0]
    for sc in scenes[1:]:
        video = crossfade(video, sc, dur=0.5)

    total_sec = len(video) / FPS
    print(f"Кадров: {len(video)}  |  Длительность: {total_sec:.1f} сек")

    print("Генерация музыки...")
    audio = make_music(total_sec)
    aclip = AudioArrayClip(audio, fps=SR)

    print("Рендеринг видео...")
    clip = ImageSequenceClip(video, fps=FPS)
    clip = clip.with_audio(aclip)
    clip.write_videofile(OUTPUT_FILE, codec="libx264", audio_codec="aac",
                         fps=FPS, logger="bar")
    print(f"\nГотово: {OUTPUT_FILE}")


if __name__ == "__main__":
    build()
