# -*- coding: utf-8 -*-
"""
สร้างแกลเลอรี AW สำหรับแบบประเมินปี 2569 จากโฟลเดอร์ต้นฉบับ AW2569
- ย่อรูปเป็น WebP (รูปเต็ม + รูปย่อ) ไว้ที่ artwork-survey/aw/
- แปลง PDF ทุกหน้าเป็นรูป
- เขียน artwork-survey/aw-data.js (รายการรูปที่ฟอร์มและแดชบอร์ดใช้)

รันใหม่ทุกครั้งที่เพิ่ม/เปลี่ยนไฟล์ใน AW2569:
    python tools/build-aw-gallery.py "D:/Claud Backup/TIkTok/AW2569"
"""
import json, os, re, shutil, sys
from PIL import Image
import pymupdf

SRC = sys.argv[1] if len(sys.argv) > 1 else r"D:\Claud Backup\TIkTok\AW2569"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "artwork-survey", "aw")
OUT_JS = os.path.join(ROOT, "artwork-survey", "aw-data.js")

MONTHS = ["01-มกราคม", "02-กุมภาพันธ์", "03-มีนาคม", "04-เมษายน", "05-พฤษภาคม", "06-มิถุนายน",
          "07-กรกฎาคม", "08-สิงหาคม", "09-กันยายน", "10-ตุลาคม", "11-พฤศจิกายน"]
IMG_EXT = (".jpg", ".jpeg", ".png", ".webp")
FULL_BOX = (1500, 1500)
THUMB_BOX = (480, 480)


def natkey(name):
    stem = os.path.splitext(name)[0].lower()
    return [(0, int(p), "") if p.isdigit() else (1, 0, p) for p in re.split(r"(\d+)", stem) if p != ""]


def sources(folder):
    """คืนรายการ (path, page) ของรูป/หน้า PDF ในโฟลเดอร์ (ไม่ลงโฟลเดอร์ย่อย)"""
    if not os.path.isdir(folder):
        return []
    out = []
    for f in sorted(os.listdir(folder), key=natkey):
        p = os.path.join(folder, f)
        if not os.path.isfile(p):
            continue
        low = f.lower()
        if low.endswith(IMG_EXT):
            out.append((p, None))
        elif low.endswith(".pdf"):
            with pymupdf.open(p) as d:
                out.extend((p, i) for i in range(d.page_count))
    return out


def load(path, page):
    if page is None:
        im = Image.open(path)
        im.load()
    else:
        with pymupdf.open(path) as d:
            pg = d[page]
            zoom = min(3.0, 1500 / max(pg.rect.width, pg.rect.height))
            pix = pg.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), alpha=False)
            im = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        bg = Image.new("RGB", im.size, (255, 255, 255))
        bg.paste(im, mask=im.split()[-1])
        im = bg
    elif im.mode != "RGB":
        im = im.convert("RGB")
    return im


def emit(items, rel_dir):
    """ย่อรูปทั้งหมดใน items ไปไว้ที่ aw/<rel_dir>/NN.webp และ NN_t.webp"""
    res = []
    if not items:
        return res
    os.makedirs(os.path.join(OUT_DIR, rel_dir), exist_ok=True)
    for i, (path, page) in enumerate(items, 1):
        im = load(path, page)
        full = im.copy()
        full.thumbnail(FULL_BOX, Image.LANCZOS)
        thumb = im.copy()
        thumb.thumbnail(THUMB_BOX, Image.LANCZOS)
        base = "%02d" % i
        full.save(os.path.join(OUT_DIR, rel_dir, base + ".webp"), "WEBP", quality=80, method=5)
        thumb.save(os.path.join(OUT_DIR, rel_dir, base + "_t.webp"), "WEBP", quality=72, method=5)
        src_name = os.path.basename(path) + ("" if page is None else " (หน้า %d)" % (page + 1))
        res.append({"f": "aw/%s/%s.webp" % (rel_dir, base), "t": "aw/%s/%s_t.webp" % (rel_dir, base),
                    "w": full.width, "h": full.height, "n": src_name})
    return res


def main():
    if os.path.isdir(OUT_DIR):
        shutil.rmtree(OUT_DIR)
    data = {"wholesale": {}, "retail": {}, "marketplace": {}, "website": {}}
    for mi, mname in enumerate(MONTHS, 1):
        mm = "%02d" % mi
        # ค้าส่ง — A4
        a = emit(sources(os.path.join(SRC, "ค้าส่ง", mname)), "wholesale/" + mm)
        if a:
            data["wholesale"][mm] = {"a4": a}
        # Retail — A4 + LINE card แยกรอบ
        r = {}
        a = emit(sources(os.path.join(SRC, "Retail", mname, "A4")), "retail/%s/a4" % mm)
        if a:
            r["a4"] = a
        line_dir = os.path.join(SRC, "Retail", mname, "LINE card")
        rounds = []
        if os.path.isdir(line_dir):
            for rd in sorted(os.listdir(line_dir), key=natkey):
                if os.path.isdir(os.path.join(line_dir, rd)):
                    cards = emit(sources(os.path.join(line_dir, rd)), "retail/%s/line/%s" % (mm, re.sub(r"[^0-9A-Za-z_-]", "", rd) or "r"))
                    if cards:
                        rounds.append({"name": rd, "cards": cards})
        if rounds:
            r["line"] = rounds
        if r:
            data["retail"][mm] = r
        # MarketPlace — แยกแพลตฟอร์ม
        m = {}
        for pid, pdir in (("shopee", "Shopee"), ("lazada", "Lazada"), ("tiktok", "TikTok Shop")):
            a = emit(sources(os.path.join(SRC, "MarketPlace", mname, pdir)), "marketplace/%s/%s" % (mm, pid))
            if a:
                m[pid] = a
        if m:
            data["marketplace"][mm] = m
        # Website
        a = emit(sources(os.path.join(SRC, "Website", mname)), "website/" + mm)
        if a:
            data["website"][mm] = {"banner": a}
        print(mname, "done")

    with open(OUT_JS, "w", encoding="utf-8") as fh:
        fh.write("// สร้างอัตโนมัติจาก tools/build-aw-gallery.py — อย่าแก้ด้วยมือ\n")
        fh.write("window.AW = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n")
    total = sum(len(v) for g in data.values() for mo in g.values() for v in
                ([x for k, x in mo.items() if k != "line"] + [rd["cards"] for rd in mo.get("line", [])]))
    print("images:", total)


if __name__ == "__main__":
    main()
