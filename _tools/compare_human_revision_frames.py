"""Analysis-only side-by-side frames: never use these in production videos."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
ROOT=Path(__file__).resolve().parents[1]
TOPIC=ROOT/'Chu-De/Be-Mochi-Mam-Xanh'
QA=TOPIC/'demo-nhan-vat-nguoi-v2/kiem-tra'
font=ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf',21)
small=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',18)
sheet=Image.new('RGB',(1800,620),'#142033');d=ImageDraw.Draw(sheet)
items=[('video1/frame-002.jpg','flat-1s.png','1 · GIẢI THÍCH'),('video2/frame-007.jpg','office-1s.png','2 · VĂN PHÒNG'),('video3/frame-006.jpg','world-1s.png','3 · THẾ GIỚI 2D')]
for i,(ref,new,label) in enumerate(items):
    x=i*600
    d.text((x+300,21),label,font=font,fill='#FFFFE8',anchor='mm')
    for j,source in enumerate([TOPIC/'phan-tich-3-video-tham-khao'/ref,QA/new]):
        with Image.open(source) as im:sheet.paste(im.resize((300,533)),(x+j*300,45))
        d.text((x+j*300+150,594),'GỐC · CHỈ ĐỐI CHIẾU' if j==0 else 'BẢN SỬA · NHÂN VẬT NGƯỜI',font=small,fill='#D6E3E0',anchor='mm')
sheet.save(QA/'doi-chieu-voi-mau.jpg',quality=95)
print('Saved analysis-only reference/revision contact sheet.')
