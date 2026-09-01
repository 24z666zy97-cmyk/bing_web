"""Generate the Chinese font subset used by the homepage.

The Source Han Sans source files stay in ``prepare/fonts``. The generated
WOFF2 files are written to ``public/fonts`` and are safe to serve on the web.
Run this script again whenever homepage copy changes.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = ROOT / "prepare" / "fonts" / "source-han-sans-sc"
OUT_DIR = ROOT / "public" / "fonts"

# Only files rendered by the homepage are included. Comments may contribute a
# few harmless glyphs, but automatic extraction prevents visible copy from
# silently falling back to a system font.
HOME_SOURCES = [
    ROOT / "app" / "layout.tsx",
    ROOT / "app" / "page.tsx",
    ROOT / "components" / "HomeShell.tsx",
    *sorted((ROOT / "components" / "Loading").glob("*.tsx")),
    *sorted((ROOT / "components" / "Hero").glob("*.tsx")),
    *sorted((ROOT / "components" / "About").glob("*.tsx")),
    *sorted((ROOT / "components" / "Content").glob("*.tsx")),
    *sorted((ROOT / "components" / "Nav").glob("*.tsx")),
]

# Chinese punctuation does not always occur next to a Han character in source
# code, so keep the punctuation used by the interface explicitly.
EXTRA_TEXT = "，。！：；？、·《》「」『』（）【】—–…“”‘’｜一"
HAN_OR_CJK_PUNCTUATION = re.compile(r"[\u3000-\u303f\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]")


def collect_characters() -> set[str]:
    characters = set(EXTRA_TEXT)
    for path in HOME_SOURCES:
        if not path.exists():
            continue
        source = path.read_text(encoding="utf-8")
        characters.update(HAN_OR_CJK_PUNCTUATION.findall(source))

    # Source Han Sans remains the fallback for mixed labels, dates and contact
    # details, so retain printable ASCII as well.
    characters.update(chr(codepoint) for codepoint in range(0x20, 0x7F))
    return characters


def main() -> int:
    try:
        from fontTools import subset
    except ImportError:
        print("Missing dependency: install fonttools and brotli first.")
        return 1

    targets = [
        ("SourceHanSansCN-Regular.otf", "source-han-home-regular.woff2"),
        ("SourceHanSansCN-Bold.otf", "source-han-home-bold.woff2"),
    ]
    characters = collect_characters()
    unicodes = ",".join(f"U+{ord(char):04X}" for char in sorted(characters))

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    total_size = 0
    print(f"Homepage character set: {len(characters)} glyphs")

    for source_name, output_name in targets:
        source_path = SRC_DIR / source_name
        if not source_path.exists():
            print(f"Missing source font: {source_path}")
            return 1

        output_path = OUT_DIR / output_name
        subset.main(
            [
                str(source_path),
                f"--unicodes={unicodes}",
                "--flavor=woff2",
                f"--output-file={output_path}",
                "--layout-features=kern,liga,calt,vert,vrt2",
                "--no-hinting",
                "--desubroutinize",
            ]
        )
        size = output_path.stat().st_size
        total_size += size
        print(f"  {output_name}: {size / 1024:.1f} KB")

    print(f"Total: {total_size / 1024:.1f} KB")
    return 0


if __name__ == "__main__":
    sys.exit(main())
