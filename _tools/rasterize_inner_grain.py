"""Rasterize the composition's procedural SVG speckles into a tiny cached PNG."""
from pathlib import Path
from PIL import Image,ImageDraw
import base64,io
root=Path(__file__).resolve().parents[1]
im=Image.new('RGBA',(720,720));draw=ImageDraw.Draw(im)
for i in range(110):
    x=((i*47+13)%180)*4;y=((i*73+29)%180)*4;r=(.8 if i%3==0 else .45)*4
    draw.ellipse((x-r,y-r,x+r,y+r),fill=(255,255,255,round((.7 if i%2==0 else .35)*255)))
im=im.resize((180,180),Image.Resampling.LANCZOS)
blob=io.BytesIO();im.save(blob,format='PNG')
p=root/'remotion-composer/src/InnerThoughtsEpisode.tsx';s=p.read_text(encoding='utf-8')
start=s.index('// Static speckle tile:');end=s.index('/** Last item',start)
(root/'Chu-De/Tam-Ly-Noi-Tam/episodes/01-mot-cau-noi-thoang-qua/render/grain-original.txt').write_text(s[start:end],encoding='utf-8')
replacement='// Rasterized procedural grain avoids repeated SVG pattern rasterization.\nconst GRAIN = "url(data:image/png;base64,'+base64.b64encode(blob.getvalue()).decode()+')";\n\n'
p.write_text(s[:start]+replacement+s[end:],encoding='utf-8')
print('Raster grain PNG bytes:',len(blob.getvalue()))
