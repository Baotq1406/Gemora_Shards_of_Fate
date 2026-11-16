"""Pack generated sprite cells with a shared scale and contact-point alignment."""
from pathlib import Path
from collections import deque
import json
import shutil
import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SOURCES = ROOT / 'assets/source/companions'
OUTPUT = ROOT / 'apps/game-client/public/art/companions/animated'
QA = ROOT / 'docs/previews/companion-animation'
GENERATED = Path('C:/Users/ADMIN/.codex/generated_images/01a1bf16-a47c-78b0-bebe-6460bcc5e42b')
FILES = {
    'crystal': 'exec-1ef89793-97f2-4b5d-952e-679d28bf941e.png',
    'leaf': 'exec-ec42704e-181f-463c-8202-4070fbb19838.png',
    'water': 'exec-7086e426-5c09-4680-8414-45aac52ce7c0.png',
    'fire': 'exec-103692bc-e50a-4eae-841b-ea9d4118e4c0.png',
}

def clean_cell(cell):
    alpha = np.asarray(cell.getchannel('A')).copy()
    solid = alpha >= 170
    seen = np.zeros(solid.shape, dtype=bool)
    largest = []
    h, w = solid.shape
    for y, x in zip(*np.where(solid)):
        if seen[y, x]:
            continue
        queue = deque([(y, x)])
        seen[y, x] = True
        component = []
        while queue:
            cy, cx = queue.popleft()
            component.append((cy, cx))
            for ny, nx in ((cy-1,cx),(cy+1,cx),(cy,cx-1),(cy,cx+1)):
                if 0 <= ny < h and 0 <= nx < w and solid[ny,nx] and not seen[ny,nx]:
                    seen[ny,nx] = True
                    queue.append((ny,nx))
        if len(component) > len(largest):
            largest = component
    mask = np.zeros_like(alpha)
    ys, xs = np.array(largest).T
    mask[ys,xs] = 255
    expanded = np.asarray(Image.fromarray(mask).filter(ImageFilter.MaxFilter(5)))
    alpha[expanded == 0] = 0
    cell.putalpha(Image.fromarray(alpha))
    # The lower body supplies a stable contact anchor, independent of moving head/tail.
    bottom = int(ys.max()) + 1
    foot_x = float(np.median(xs[ys >= bottom - 16]))
    return cell, (foot_x, bottom), cell.getbbox()

for folder in (SOURCES, OUTPUT, QA):
    folder.mkdir(parents=True, exist_ok=True)
report = {}
for pet, filename in FILES.items():
    source = SOURCES / f'{pet}-sheet-v1.png'
    if not source.exists():
        shutil.copyfile(GENERATED / filename, source)
    sheet = Image.open(source).convert('RGBA')
    cw, ch = sheet.width // 4, sheet.height // 4
    cells = [clean_cell(sheet.crop((i%4*cw, i//4*ch, (i%4+1)*cw, (i//4+1)*ch))) for i in range(16)]
    # One scale for the entire sequence; no per-frame auto-fit or re-centering.
    scale = min(222 / max(b[3]-b[1] for _,_,b in cells), 222 / max(b[2]-b[0] for _,_,b in cells))
    frames=[]
    atlas=Image.new('RGBA',(1024,1024))
    frame_dir = SOURCES / f'{pet}-frames'
    frame_dir.mkdir(exist_ok=True)
    for i,(cell,anchor,bounds) in enumerate(cells):
        resized=cell.resize((round(cw*scale),round(ch*scale)),Image.Resampling.LANCZOS)
        frame=Image.new('RGBA',(256,256))
        frame.alpha_composite(resized,(round(128-anchor[0]*scale),round(238-anchor[1]*scale)))
        frame.save(frame_dir / f'{i:02}.png')
        frames.append(frame)
        atlas.alpha_composite(frame,(i%4*256,i//4*256))
    atlas.save(OUTPUT / f'{pet}-v1.webp',quality=88,method=6)
    frames[0].save(OUTPUT / f'{pet}-still-v1.webp',quality=92,method=6)
    # White-backed animated preview only. Runtime uses the full-alpha atlas.
    preview=[]
    for frame in frames:
        bg=Image.new('RGB',frame.size,'#edf4d9')
        bg.paste(frame,mask=frame.getchannel('A'))
        preview.append(bg)
    preview[0].save(QA / f'{pet}.gif',save_all=True,append_images=preview[1:],duration=[900,180,180,100,100,100,180,700]+[170]*7+[1100],loop=0)
    report[pet]={'frames':16,'cell':[256,256],'columns':4,'rows':4,'contact':[128,238],'scale':round(scale,4),'bytes':(OUTPUT/f'{pet}-v1.webp').stat().st_size,'alpha':atlas.getchannel('A').getextrema(),'bounds':[f.getbbox() for f in frames]}
(QA/'sprite-set-report.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
background = ROOT/'assets/source/home-compact-v1.png'
if not background.exists():
    shutil.copyfile(GENERATED/'exec-a6342ff4-9620-418d-a0b5-ec72f4f0a698.png',background)
Image.open(background).resize((900,1200),Image.Resampling.LANCZOS).save(ROOT/'apps/game-client/public/art/home/compact-v1.webp',quality=88,method=6)
print(json.dumps({pet:{'frames':v['frames'],'bytes':v['bytes'],'alpha':v['alpha']} for pet,v in report.items()}))
