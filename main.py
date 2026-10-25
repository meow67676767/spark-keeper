import pgzrun
import math

TITLE = "Хранитель Искры — Кибер-Кот Спарк"
WIDTH = 800
HEIGHT = 600

# --- МУЗЫКА И ГРОМКОСТЬ ---
current_music = 1
music_playing = True
MUSIC_VOLUME = 0.22  # Комфортная громкость
music.play("track1")
music.set_volume(MUSIC_VOLUME)

# --- ИГРОВЫЕ ПЕРЕМЕННЫЕ ---
MAX_LIVES = 3
lives = MAX_LIVES
score = 0
crystals_found = 0
TOTAL_CRYSTALS = 30  # 6 уровней * 5 кристаллов
current_level_idx = 0
game_state = "play"  # "play", "win", "game_over"
invulnerable_timer = 0
game_tick = 0
level_banner_timer = 90
shoot_cooldown = 0
popups = []
bullets = []  # Выстрелы искрами

# --- ОПРЕДЕЛЕНИЕ 6 РАЗНООБРАЗНЫХ И СБАЛАНСИРОВАННЫХ УРОВНЕЙ ---
# Больше НИКАКИХ мышей в слепых коридорах прыжков!
# Мыши летают на честной высоте, а у игрока есть Двойной Прыжок и Стрельба (F)!
LEVELS_DATA = [
    {
        "name": "Уровень 1: Зачарованный лес",
        "cat_start": (80, 480),
        "platforms": [(160, 440), (330, 360), (480, 280), (710, 220)],
        "spikes": [(290, 512), (326, 512)],
        "slimes": [{"x": 450, "y": 508, "vx": 1.2, "min_x": 380, "max_x": 560}],
        "bats": [{"x": 480, "y": 170, "vy": 1.0, "min_y": 130, "max_y": 210}],  # Высоко над платформой!
        "crystals": [(160, 380), (330, 300), (480, 110), (420, 485), (640, 160)],
        "portal": (710, 168),
        "track": "track1"
    },
    {
        "name": "Уровень 2: Кристальный каньон",
        "cat_start": (80, 480),
        "platforms": [(180, 430), (340, 370), (200, 280), (360, 210), (550, 220), (710, 280)],
        "spikes": [(240, 512), (276, 512), (480, 512), (516, 512)],
        "slimes": [{"x": 380, "y": 508, "vx": 1.2, "min_x": 320, "max_x": 440}],
        "bats": [{"x": 360, "y": 120, "vy": 1.1, "min_y": 80, "max_y": 150}],  # Над верхней башней
        "crystals": [(180, 370), (340, 310), (200, 220), (550, 160), (710, 220)],
        "portal": (710, 228),
        "track": "track2"
    },
    {
        "name": "Уровень 3: Ночные шпили",
        "cat_start": (70, 480),
        # Плавная лесенка без ловушек в пустоте!
        "platforms": [(150, 440), (290, 390), (440, 350), (590, 300), (720, 240)],
        "spikes": [(360, 512), (396, 512), (500, 512)],
        "slimes": [
            {"x": 220, "y": 508, "vx": 1.2, "min_x": 160, "max_x": 280},
        ],
        "bats": [
            # Мыши летают высоко над платформами, охраняя кристаллы
            {"x": 440, "y": 180, "vy": 1.1, "min_y": 130, "max_y": 230},
            {"x": 660, "y": 130, "vy": 1.0, "min_y": 90, "max_y": 170}
        ],
        "crystals": [(150, 380), (290, 330), (440, 120), (590, 240), (720, 180)],
        "portal": (720, 188),
        "track": "track3"
    },
    {
        "name": "Уровень 4: Шипастая долина",
        "cat_start": (80, 480),
        # Широкие удобные островки над морем шипов
        "platforms": [(160, 430), (300, 370), (440, 310), (580, 260), (710, 210)],
        "spikes": [
            (210, 512), (246, 512), (282, 512), (318, 512),
            (410, 512), (446, 512), (482, 512), (518, 512)
        ],
        "slimes": [{"x": 650, "y": 508, "vx": 1.2, "min_x": 600, "max_x": 730}],
        "bats": [
            # Летают над платформами, их можно расстрелять на F или перепрыгнуть
            {"x": 300, "y": 190, "vy": 1.0, "min_y": 140, "max_y": 240},
            {"x": 580, "y": 130, "vy": 1.1, "min_y": 80, "max_y": 170}
        ],
        "crystals": [(160, 370), (300, 130), (440, 250), (580, 80), (710, 150)],
        "portal": (710, 158),
        "track": "track1"
    },
    {
        "name": "Уровень 5: Небесная башня",
        "cat_start": (70, 480),
        "platforms": [(160, 450), (310, 400), (170, 320), (330, 250), (500, 200), (680, 160)],
        "spikes": [(220, 512), (256, 512), (380, 512), (416, 512)],
        "slimes": [
            {"x": 480, "y": 508, "vx": 1.3, "min_x": 430, "max_x": 540},
        ],
        "bats": [
            {"x": 170, "y": 160, "vy": 1.0, "min_y": 110, "max_y": 200},
            {"x": 500, "y": 100, "vy": 1.1, "min_y": 60, "max_y": 140}
        ],
        "crystals": [(160, 390), (310, 340), (170, 100), (330, 190), (680, 100)],
        "portal": (680, 108),
        "track": "track2"
    },
    {
        "name": "Уровень 6: Сердце Тьмы (ФИНАЛ)",
        "cat_start": (70, 480),
        "platforms": [(150, 440), (290, 380), (430, 330), (570, 270), (710, 210)],
        "spikes": [(210, 512), (246, 512), (350, 512), (386, 512), (490, 512)],
        "slimes": [
            {"x": 300, "y": 508, "vx": 1.4, "min_x": 260, "max_x": 340},
            {"x": 620, "y": 508, "vx": 1.4, "min_x": 560, "max_x": 700}
        ],
        "bats": [
            {"x": 290, "y": 180, "vy": 1.1, "min_y": 130, "max_y": 230},
            {"x": 570, "y": 120, "vy": 1.2, "min_y": 70, "max_y": 160}
        ],
        "crystals": [(150, 380), (290, 120), (430, 270), (570, 70), (710, 150)],
        "portal": (710, 158),
        "track": "track3"
    }
]

total_crystals_count = len(LEVELS_DATA) * 5 * 10

# --- АКТЁР КАТА ---
cat = Actor("cat_idle", (80, 480))
cat.vx = 0
cat.vy = 0
cat.on_ground = False
cat.can_double_jump = True  # ФИЧА: ДВОЙНОЙ ПРЫЖОК!
cat.facing_right = True

# Переменные текущего уровня
platforms = []
ground_blocks = []
spikes = []
slimes = []
bats = []
crystal_data = []
portal = Actor("portal", (710, 168))

for x in range(18, 800 + 36, 36):
    ground_blocks.append(Actor("ground", (x, 542)))


def load_level(idx):
    global current_level_idx, platforms, spikes, slimes, bats, crystal_data, portal, level_banner_timer, invulnerable_timer, bullets

    current_level_idx = idx
    lvl = LEVELS_DATA[idx]

    cat.pos = lvl["cat_start"]
    cat.vx = 0
    cat.vy = 0
    cat.on_ground = False
    cat.can_double_jump = True
    invulnerable_timer = 0
    level_banner_timer = 90
    bullets = []

    platforms = list(ground_blocks)
    for pos in lvl["platforms"]:
        platforms.append(Actor("platform_wide", pos))

    spikes = [Actor("spike", pos) for pos in lvl["spikes"]]

    slimes = []
    for s_info in lvl["slimes"]:
        s_act = Actor("slime", (s_info["x"], s_info["y"]))
        s_act.vx = s_info["vx"]
        s_act.min_x = s_info["min_x"]
        s_act.max_x = s_info["max_x"]
        slimes.append(s_act)

    bats = []
    for b_info in lvl["bats"]:
        b_act = Actor("bat", (b_info["x"], b_info["y"]))
        b_act.vy = b_info["vy"]
        b_act.min_y = b_info["min_y"]
        b_act.max_y = b_info["max_y"]
        bats.append(b_act)

    crystal_data = []
    for x, y in lvl["crystals"]:
        crystal_data.append({
            "base_x": x,
            "base_y": y,
            "actor": Actor("crystal", (x, y))
        })

    portal.pos = lvl["portal"]


load_level(0)


def update(dt):
    global score, lives, game_state, invulnerable_timer, game_tick, level_banner_timer, shoot_cooldown, crystals_found

    game_tick += 1

    if level_banner_timer > 0:
        level_banner_timer -= 1

    if shoot_cooldown > 0:
        shoot_cooldown -= 1

    # Всплывающие надписи
    for p in popups[:]:
        p["y"] -= 1
        p["timer"] -= 1
        if p["timer"] <= 0:
            popups.remove(p)

    if game_state != "play":
        return

    if invulnerable_timer > 0:
        invulnerable_timer -= 1

    # --- ДВИЖЕНИЕ ВЫСТРЕЛОВ ИСКР (АТАКА) ---
    for b in bullets[:]:
        b["actor"].x += b["vx"]
        # Вылет за экран
        if b["actor"].x < 0 or b["actor"].x > WIDTH:
            bullets.remove(b)
            continue

        # Попадание по слизням
        hit = False
        for sl in slimes[:]:
            if b["actor"].colliderect(sl):
                slimes.remove(sl)
                popups.append({"text": "+20 РАЗРЯД!", "x": sl.x, "y": sl.y - 15, "timer": 25})
                score += 20
                sounds.coin.play()
                hit = True
                break

        # Попадание по мышам
        if not hit:
            for bt in bats[:]:
                if b["actor"].colliderect(bt):
                    bats.remove(bt)
                    popups.append({"text": "+25 СБИТА!", "x": bt.x, "y": bt.y - 15, "timer": 25})
                    score += 25
                    sounds.coin.play()
                    hit = True
                    break

        if hit and b in bullets:
            bullets.remove(b)

    # --- УПРАВЛЕНИЕ КОТОМ ---
    moving = False
    move_speed = 3.6
    if keyboard.left or keyboard.a:
        cat.x -= move_speed
        cat.facing_right = False
        moving = True
    if keyboard.right or keyboard.d:
        cat.x += move_speed
        cat.facing_right = True
        moving = True

    # Стрельба на F / Shift / J
    if (keyboard.f or keyboard.j or keyboard.lshift) and shoot_cooldown == 0:
        fire_bullet()

    # Смена спрайта
    suffix = "_left" if not cat.facing_right else ""
    if not cat.on_ground:
        cat.image = f"cat_jump{suffix}"
    elif moving:
        cat.image = f"cat_walk{suffix}"
    else:
        cat.image = f"cat_idle{suffix}"

    # --- ФИЗИКА И ГРАВИТАЦИЯ ---
    cat.vy += 0.48
    cat.y += cat.vy
    cat.on_ground = False

    # Коллизия с платформами (приземление сверху)
    for plat in platforms:
        if cat.colliderect(plat) and cat.vy >= 0:
            if cat.bottom - cat.vy <= plat.top + 14:
                cat.bottom = plat.top
                cat.vy = 0
                cat.on_ground = True
                cat.can_double_jump = True  # Восстановление двойного прыжка!
                break

    # Границы экрана
    if cat.left < 0:
        cat.left = 0
    if cat.right > WIDTH:
        cat.right = WIDTH
    if cat.top > HEIGHT:
        take_damage()

    # --- ДВИЖЕНИЕ ВРАГОВ ---
    for sl in slimes:
        sl.x += sl.vx
        if sl.x > sl.max_x or sl.x < sl.min_x:
            sl.vx = -sl.vx

    for bt in bats:
        bt.y += bt.vy
        if bt.y > bt.max_y or bt.y < bt.min_y:
            bt.vy = -bt.vy

    # --- ПАРЯЩИЕ КРИСТАЛЛЫ ---
    for c in crystal_data:
        if c["actor"] is not None:
            c["actor"].y = c["base_y"] + math.sin(game_tick * 0.08 + c["base_x"]) * 5
            if cat.colliderect(c["actor"]):
                popups.append({"text": "+10", "x": c["actor"].x, "y": c["actor"].y - 10, "timer": 25})
                c["actor"] = None
                score += 10
                crystals_found += 1
                sounds.coin.play()

    # --- РАСТАПТЫВАНИЕ СВЕРХУ И УРОН ---
    for sl in slimes[:]:
        if cat.colliderect(sl):
            if cat.vy > 0 and cat.bottom <= sl.y + 14:
                slimes.remove(sl)
                cat.vy = -10.5
                cat.can_double_jump = True
                score += 20
                sounds.coin.play()
                popups.append({"text": "+20 РАСТОПТАН!", "x": sl.x, "y": sl.y - 15, "timer": 30})
            elif invulnerable_timer == 0:
                take_damage()
                break

    for bt in bats[:]:
        if cat.colliderect(bt):
            if cat.vy > 0 and cat.bottom <= bt.y + 12:
                bats.remove(bt)
                cat.vy = -11.0
                cat.can_double_jump = True
                score += 25
                sounds.coin.play()
                popups.append({"text": "+25 СБИТА!", "x": bt.x, "y": bt.y - 15, "timer": 30})
            elif invulnerable_timer == 0:
                take_damage()
                break

    if invulnerable_timer == 0:
        for sp in spikes:
            if cat.colliderect(sp) and cat.bottom >= sp.top + 8:
                take_damage()
                break

    # --- ПОРТАЛ ---
    if cat.colliderect(portal):
        sounds.win.play()
        if current_level_idx < len(LEVELS_DATA) - 1:
            load_level(current_level_idx + 1)
        else:
            game_state = "win"


def fire_bullet():
    global shoot_cooldown
    shoot_cooldown = 16  # 4 выстрела в секунду
    bx = cat.x + (20 if cat.facing_right else -20)
    bvx = 9.0 if cat.facing_right else -9.0
    bullet_actor = Actor("spark_bullet", (bx, cat.y))
    bullets.append({"actor": bullet_actor, "vx": bvx})
    sounds.jump.play()  # звук выстрела


def take_damage():
    global lives, game_state, invulnerable_timer
    lives -= 1
    sounds.hit.play()
    if lives <= 0:
        game_state = "game_over"
    else:
        invulnerable_timer = 50
        cat.vy = -6
        cat.x -= 30 if cat.facing_right else -30
        if cat.x < 40:
            cat.x = 40


def on_key_down(key):
    global current_music, music_playing, game_state, score, lives, current_level_idx, crystals_found

    # ПРЫЖОК И ДВОЙНОЙ ПРЫЖОК (плавный, контролируемый)
    if key == keys.SPACE or key == keys.UP or key == keys.W:
        if cat.on_ground:
            cat.vy = -11.8
            sounds.jump.play()
        elif cat.can_double_jump:
            cat.vy = -10.5
            cat.can_double_jump = False
            sounds.jump.play()
            popups.append({"text": "ДВОЙНОЙ ПРЫЖОК!", "x": cat.x, "y": cat.y - 20, "timer": 20})

    # Выстрел на F или J
    if key == keys.F or key == keys.J:
        if shoot_cooldown == 0:
            fire_bullet()

    # Музыка 1-3
    if key == keys.K_1:
        current_music = 1
        music.play("track1")
        music.set_volume(MUSIC_VOLUME)
        music_playing = True
    elif key == keys.K_2:
        current_music = 2
        music.play("track2")
        music.set_volume(MUSIC_VOLUME)
        music_playing = True
    elif key == keys.K_3:
        current_music = 3
        music.play("track3")
        music.set_volume(MUSIC_VOLUME)
        music_playing = True
    elif key == keys.M:
        if music_playing:
            music.pause()
            music_playing = False
        else:
            music.unpause()
            music.set_volume(MUSIC_VOLUME)
            music_playing = True

    # Рестарт
    elif key == keys.R:
        if game_state == "game_over":
            lives = MAX_LIVES
            game_state = "play"
            load_level(current_level_idx)
        elif game_state == "win":
            lives = MAX_LIVES
            score = 0
            crystals_found = 0
            game_state = "play"
            load_level(0)


def draw():
    screen.clear()

    # 1. Фон
    screen.blit("bg", (0, 0))

    # 2. Платформы
    for plat in platforms:
        plat.draw()

    # 3. Шипы
    for sp in spikes:
        sp.draw()

    # 4. Портал
    portal.draw()

    # 5. Кристаллы
    for c in crystal_data:
        if c["actor"] is not None:
            c["actor"].draw()

    # 6. Выстрелы искрами
    for b in bullets:
        b["actor"].draw()

    # 7. Враги
    for sl in slimes:
        sl.draw()
    for bt in bats:
        bt.draw()

    # 8. Кот Спарк
    if invulnerable_timer % 4 < 2:
        cat.draw()

    # 9. Всплывающие очки
    for p in popups:
        screen.draw.text(p["text"], center=(p["x"], p["y"]), fontsize=22, color="#FFE600", owidth=1.5, ocolor="black")

    # --- 10. ВЕРХНИЙ ИНТЕРФЕЙС (HUD) ---
    screen.draw.filled_rect(Rect((0, 0), (WIDTH, 48)), (14, 12, 28))
    screen.draw.line((0, 48), (WIDTH, 48), (65, 55, 110))

    screen.draw.text(f"УРОВЕНЬ {current_level_idx + 1}/6", (16, 14), fontsize=22, color="#00FFF0", owidth=1, ocolor="#003344")

    for i in range(MAX_LIVES):
        h_img = "heart_full" if i < lives else "heart_empty"
        screen.blit(h_img, (170 + i * 28, 10))

    screen.blit("crystal", (265, 8))
    screen.draw.text(f"{score}", (305, 14), fontsize=22, color="#FFDF00", owidth=1, ocolor="#403000")

    # Подсказка по новым способностям прямо на экране
    screen.draw.text("[ПРОБЕЛ x2] Двойной прыжок   [F] Выстрел искрой", (380, 15), fontsize=18, color="#80FFB0", owidth=1, ocolor="black")

    # --- БАННЕР ПРИ СТАРТЕ УРОВНЯ ---
    if level_banner_timer > 0 and game_state == "play":
        lvl_name = LEVELS_DATA[current_level_idx]["name"]
        screen.draw.filled_rect(Rect((160, 80), (480, 50)), (15, 12, 35))
        screen.draw.rect(Rect((160, 80), (480, 50)), (100, 80, 180))
        screen.draw.text(lvl_name, center=(400, 105), fontsize=28, color="#FFFFFF", owidth=1.5, ocolor="black")

    # --- ЭКРАНЫ РЕЗУЛЬТАТА ---
    if game_state == "win":
        screen.draw.filled_rect(Rect((110, 140), (580, 300)), (18, 35, 25))
        screen.draw.rect(Rect((110, 140), (580, 300)), (0, 255, 150), width=2)
        screen.draw.text("ПОЛНАЯ ПОБЕДА!", center=(400, 185), fontsize=44, color="#FFE600", owidth=1.5, ocolor="black")
        screen.draw.text("Вы прошли ВСЕ 6 уровней и спасли Великое Древо!", center=(400, 235), fontsize=21, color="white")

        # Оценка ранга игрока
        rank = "S+ (ЛЕГЕНДАРНЫЙ КОТ!)" if score >= 450 else "A (ХРАНИТЕЛЬ СВЕТА)" if score >= 350 else "B (ИСКАТЕЛЬ)"
        rank_color = "#FFE600" if score >= 450 else "#00FFF0"

        screen.draw.text(f"Итоговый счет: {score} очков", center=(400, 280), fontsize=28, color="#00FFF0")
        screen.draw.text(f"Собрано кристаллов: {crystals_found} из {TOTAL_CRYSTALS}", center=(400, 320), fontsize=22, color="#FFDF00")
        screen.draw.text(f"Ранг: {rank}", center=(400, 355), fontsize=22, color=rank_color, owidth=1, ocolor="black")
        screen.draw.text("Нажмите [ R ] чтобы начать сначала", center=(400, 405), fontsize=20, color="#80FFB0")

    elif game_state == "game_over":
        screen.draw.filled_rect(Rect((140, 170), (520, 250)), (35, 15, 20))
        screen.draw.rect(Rect((140, 170), (520, 250)), (255, 60, 80))
        screen.draw.text("ТЬМА ПОГЛОТИЛА ИСКРУ", center=(400, 225), fontsize=36, color="#FF4055", owidth=1.5, ocolor="black")
        screen.draw.text(f"Уровень {current_level_idx + 1} провален. Очки: {score}", center=(400, 280), fontsize=24, color="white")
        screen.draw.text("Нажмите [ R ] чтобы повторить этот уровень", center=(400, 350), fontsize=22, color="#FFAAA0")


pgzrun.go()
