"""读取 7-items 渲图中每个物件的实际包围盒，输出为 CSS 定位百分比。

渲图共用 1068x1213 画布并已排好最终位置。本脚本不修改任何图片，
只测量不透明像素范围，供 Hero 中间层把每个物件拆成独立定位元素。
"""

import json
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit("需要 Pillow: pip install Pillow")

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "prepare" / "public" / "profile" / "7-items"

# 中间层从下到上的叠放顺序，来自 content.md
STACK_ORDER = [
    "cloud",
    "brain",
    "analyticsClipboard",
    "glasses",
    "voicemic",
    "molecularFormula",
    "heart",
]

# hover 弹胶囊的四个物件，来自 content.md
CAPSULE = {
    "molecularFormula": "SYSTEM",
    "analyticsClipboard": "SENSE",
    "glasses": "SIGNALS",
    "voicemic": "STAGES",
}

# alpha 阈值：低于此值视为透明，滤掉渲染边缘的羽化像素
ALPHA_THRESHOLD = 8


def measure(path):
    with Image.open(path) as im:
        im = im.convert("RGBA")
        w, h = im.size
        alpha = im.getchannel("A")
        # 阈值化后再取包围盒，避免极淡的抗锯齿像素撑大范围
        mask = alpha.point(lambda a: 255 if a >= ALPHA_THRESHOLD else 0)
        box = mask.getbbox()
    if box is None:
        return None
    left, top, right, bottom = box
    return {
        "canvas": {"width": w, "height": h},
        "px": {
            "left": left,
            "top": top,
            "right": right,
            "bottom": bottom,
            "width": right - left,
            "height": bottom - top,
        },
        # 相对画布的百分比，供 CSS 直接使用
        "pct": {
            "left": round(left / w * 100, 3),
            "top": round(top / h * 100, 3),
            "width": round((right - left) / w * 100, 3),
            "height": round((bottom - top) / h * 100, 3),
        },
    }


def main():
    if not SRC.is_dir():
        sys.exit(f"找不到素材目录: {SRC}")

    results = {}
    for index, name in enumerate(STACK_ORDER):
        path = SRC / f"{name}.png"
        if not path.is_file():
            print(f"缺失: {name}.png")
            continue
        data = measure(path)
        if data is None:
            print(f"整张透明: {name}.png")
            continue
        data["zIndex"] = index + 1
        if name in CAPSULE:
            data["capsule"] = CAPSULE[name]
        results[name] = data

    out = ROOT / "scripts" / "items-layout.json"
    out.write_text(json.dumps(results, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"画布 {results[STACK_ORDER[0]]['canvas']['width']}x"
          f"{results[STACK_ORDER[0]]['canvas']['height']}\n")
    header = f"{'物件':<20}{'z':>3}  {'left%':>8}{'top%':>8}{'width%':>8}{'height%':>8}  胶囊"
    print(header)
    print("-" * len(header))
    for name in STACK_ORDER:
        if name not in results:
            continue
        d = results[name]
        p = d["pct"]
        print(f"{name:<20}{d['zIndex']:>3}  "
              f"{p['left']:>8.2f}{p['top']:>8.2f}{p['width']:>8.2f}{p['height']:>8.2f}  "
              f"{d.get('capsule', '')}")
    print(f"\n已写入 {out.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
