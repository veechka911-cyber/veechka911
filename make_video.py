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


# ── музыка (синтез) ─────────────────────────────────────────────────────────
def note(freq, dur, sr=SR, kind="bell", vol=0.5):
    t = np.linspace(0, dur, int(sr * dur), endpoint=False)
    if kind == "bell":
        env = np.exp(-3.5 * t / dur)
        wave = (np.sin(2*np.pi*freq*t)
                + 0.5 * np.sin(2*np.pi*2*freq*t) * np.exp(-6*t/dur)
                + 0.25 * np.sin(2*np.pi*3*freq*t) * np.exp(-9*t/dur))
    else:  # pad
        env = np.minimum(1.0, t / (dur*0.3)) * np.minimum(1.0, (dur - t) / (dur*0.4))
        wave = np.sin(2*np.pi*freq*t) + 0.4*np.sin(2*np.pi*freq*2*t)
    return (wave * env * vol).astype(np.float32)


def make_music(total_sec):
    """тёплая мелодия-шкатулка по кругу C–G–Am–F"""
    N = {"C3":130.81,"E3":164.81,"G3":196.00,"A3":220.00,"F3":174.61,
         "C4":261.63,"D4":293.66,"E4":329.63,"F4":349.23,"G4":392.00,
         "A4":440.00,"B4":493.88,"C5":523.25,"D5":587.33,"E5":659.25}
    chords = [
        ("C", ["C4","E4","G4","C5"], "C3"),
        ("G", ["B4","D5","G4","D4"], "G3"),
        ("Am",["A4","C5","E5","E4"], "A3"),
        ("F", ["A4","C5","F4","C4"], "F3"),
    ]
    beat = 0.5  # сек на ноту
    buf = np.zeros(int(SR * (total_sec + 2)), dtype=np.float32)
    pos = 0.0
    ci = 0
    while pos < total_sec:
        name, arp, bass = chords[ci % len(chords)]
        # бас-пад на весь такт
        bass_w = note(N[bass], beat*4, kind="pad", vol=0.10)
        s = int(pos * SR)
        e = min(len(buf), s + len(bass_w))
        buf[s:e] += bass_w[:e-s]
        # арпеджио-шкатулка
        pattern = [0, 1, 2, 3, 2, 1, 2, 3]
        for k, idx in enumerate(pattern):
            f = N[arp[idx % len(arp)]] * 2  # на октаву выше — «шкатулка»
            nw = note(f, beat, kind="bell", vol=0.22)
            ns = int((pos + k*beat*0.5) * SR)
            ne = min(len(buf), ns + len(nw))
            buf[ns:ne] += nw[:ne-ns]
        pos += beat * 4 * 0.5 * 2  # длительность такта
        ci += 1
    buf = buf[:int(SR * total_sec)]
    # мягкая нормализация
    peak = np.max(np.abs(buf)) or 1.0
    buf = buf / peak * 0.6
    # стерео
    stereo = np.column_stack([buf, buf])
    return stereo


# ── сборка ──────────────────────────────────────────────────────────────────
def build():
    from moviepy import ImageSequenceClip, AudioArrayClip

    # подбираем фото в нужном порядке с подписями
    plan = [
        ("photo_2026-06-23_21-47-31.jpg", "Вот она — виновница торжества!"),
        ("photo_2026-06-23_21-47-56.jpg", "Светлана Третьякова — наша королева!"),
        ("photo_2026-06-23_21-47-07.jpg", "С любимым мужем — душа в душу"),
        ("photo_2026-06-23_21-47-11.jpg", "Семья — её главное богатство"),
        ("photo_2026-06-23_21-47-00.jpg", "Сын — мамина гордость и радость"),
        ("photo_2026-06-23_21-47-16.jpg", "Дети растут, а мама всё хорошеет!"),
        ("photo_2026-06-23_21-47-52.jpg", "Хозяйка, каких ещё поискать!"),
        ("photo_2026-06-23_21-47-37.jpg", "А это — наши верные подруги"),
        ("photo_2026-06-23_21-47-48.jpg", "Вместе и в радости, и в печали"),
        ("photo_2026-06-23_21-48-02.jpg", "Где Светлана — там веселье!"),
        ("photo_2026-06-23_21-47-20.jpg", "За дружбу! За нашу Свету!"),
        ("photo_2026-06-23_21-48-05.jpg", "Отдыхать мы тоже умеем"),
        ("photo_2026-06-23_21-56-35.jpg", "Юг, море и лучшие подруги"),
        ("photo_2026-06-23_21-56-29.jpg", "Загорелые и счастливые!"),
        ("photo_2026-06-23_21-56-18.jpg", "В любую дорогу — только вместе!"),
    ]

    scenes = []

    # 1. Мосфильм
    scenes.append(title_card(["МОСФИЛЬМ", "представляет"],
                             sub="киностудия настоящих друзей", dur=3.8))
    # 2. Название фильма
    scenes.append(title_card(["«СВЕТЛАНА И ЕЁ", "ВОЛШЕБНЫЙ ЮБИЛЕЙ»"],
                             sub="лирическая комедия в одном действии",
                             dur=4.5, big=58, med=58))
    # 3. Интертитр-завязка
    scenes.append(intertitle(
        "Эта история — про женщину,\n"
        "у которой золотое сердце,\n"
        "светлая голова и самые лучшие друзья.", dur=4.5))

    # 4-10. Фото семьи (первые 7)
    family_caps = plan[:7]
    for fn, cap in family_caps:
        scenes.append(photo_slide(os.path.join(PHOTO_DIR, fn), cap, dur=4.0))

    # 11. Цитата из «Бриллиантовой руки»
    scenes.append(intertitle(
        "— Светлана, вы прекрасны!\n"
        "— Это не я, это юбилей меня украшает!", dur=4.2))

    # 12-18. Фото с друзьями (остальные)
    for fn, cap in plan[7:]:
        scenes.append(photo_slide(os.path.join(PHOTO_DIR, fn), cap, dur=3.8))

    # 19. Цитата в духе «Кавказской пленницы»
    scenes.append(intertitle(
        "Хочу пожелать: чтобы все наши желания\n"
        "совпадали с нашими возможностями!\n"
        "За Светлану!", dur=4.5))

    # 20. Поздравление
    scenes.append(color_slide(
        "С ЮБИЛЕЕМ,\nСВЕТЛАНА!",
        sub="Будь здорова, любима и счастлива.\nПусть жизнь будет как добрая советская комедия —\nс юмором, теплом и хорошим концом!",
        bg=(20, 55, 110), text_color=(255, 222, 90), dur=5.2))

    # 21. От друзей
    scenes.append(color_slide(
        "Мы тебя очень любим!",
        sub="С теплом и обнимашками — твои друзья",
        bg=(95, 35, 90), text_color=(255, 200, 220), dur=4.5))

    # 22. КОНЕЦ
    scenes.append(title_card(["КОНЕЦ"],
                             sub="...а точнее — только всё начинается!", dur=3.6))

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
