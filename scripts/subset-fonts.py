"""把网站用到的字符从开源字体里裁出来，生成本地托管的 woff2。

内容改了、出现新字后重新运行：
  python scripts/subset-fonts.py <字体源文件目录>
源文件目录里需要有（都可以从 github.com/google/fonts 下载，SIL OFL 许可）：
  NotoSerifSC[wght].ttf、InstrumentSerif-Italic.ttf、JetBrainsMono[wght].ttf
"""
import html
import re
import sys
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

root = Path(__file__).resolve().parent.parent
src = Path(sys.argv[1])
out = root / 'assets' / 'fonts'
out.mkdir(parents=True, exist_ok=True)

pages = ['index.html', 'room.html', 'resume.html', '404.html', 'blog/index.html']
text = ''.join((root / p).read_text(encoding='utf-8') for p in pages)
text += (root / 'assets' / 'js' / 'room.js').read_text(encoding='utf-8')
text = html.unescape(re.sub(r'<[^>]+>', ' ', text))
chars = set(text) | set(' 0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.,:;!?…—–-·/()[]{}「」『』，。：；！？、（）《》“”‘’')


def build(name, file, unicodes, axes=None):
    font = TTFont(src / file, lazy=False)
    options = subset.Options()
    options.flavor = 'woff2'
    options.layout_features = ['*']
    options.name_IDs = ['*']
    options.notdef_outline = True
    subsetter = subset.Subsetter(options)
    subsetter.populate(unicodes=unicodes)
    subsetter.subset(font)
    if axes:
        font = instancer.instantiateVariableFont(font, axes)
    path = out / name
    font.flavor = 'woff2'
    font.save(path)
    print(f'{name}: {len(unicodes)} 个字符, {path.stat().st_size // 1024} KB')


codes = sorted(ord(c) for c in chars if c.isprintable())
build('kandao-serif.woff2', 'NotoSerifSC[wght].ttf', codes, {'wght': (500, 900)})
latin = [c for c in codes if c < 0x2500] + [0x2588, 0x258C, 0x2713, 0x25CF, 0x251C, 0x2514, 0x2733]
build('instrument-serif-italic.woff2', 'InstrumentSerif-Italic.ttf', [c for c in codes if c < 0x0250])
build('jetbrains-mono.woff2', 'JetBrainsMono[wght].ttf', latin, {'wght': (400, 700)})
