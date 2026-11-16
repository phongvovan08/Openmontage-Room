"""Write local viewing page, source credits and episode production status."""
from pathlib import Path
import json,html,shutil
ROOT=Path(__file__).resolve().parents[1]
EP=ROOT/'Chu-De/Tam-Ly-Noi-Tam/episodes/01-mot-cau-noi-thoang-qua'
OUT=EP/'render'
AS=ROOT/'Chu-De/Tam-Ly-Noi-Tam/assets/tap-01'
p=json.loads((ROOT/'remotion-composer/public/demo-props/inner-01-haitrieu.json').read_text(encoding='utf-8'))
video='01-mot-cau-noi-thoang-qua-haitrieu-1080p.mp4'
title='Một câu nói thoáng qua, vì sao bạn nghĩ mãi cả đêm?'
def stamp(t):
    n=int(t);return f'{n//60:02d}:{n%60:02d}'
chapters='\n'.join(f'{stamp(c["start"])} {c["name"]}' for c in p['chapters'])
stock=json.loads((AS/'stock-manifest.json').read_text(encoding='utf-8'))['assets']
used={Path(b.get('media','')).name for b in p['beats']}
credits='\n'.join(f'- {a.get("creator","Unknown")}: {a.get("source_url",a.get("original_url",""))} — {a["license"]}' for a in stock if Path(a['path']).name in used)
sources=(EP/'NGUON_VA_KIEM_CHUNG.md').read_text(encoding='utf-8').split('## Phân biệt loại nội dung')[0]
description=f'''# {title}

Hai giờ lẻ bảy. Một cuộc trò chuyện đã kết thúc từ chiều, nhưng bạn vẫn mở lại đoạn chat, viết rồi xóa một câu trả lời.

Câu chuyện đi từ căn phòng họp đến bữa tối, ba dòng ghi chú và cuộc trao đổi sáng hôm sau: điều gì đã được nói, điều gì mình đang suy đoán, và câu hỏi cụ thể nào có thể giúp mình hiểu rõ hơn?

## Các chương

{chapters}

## Sản xuất

- Lời dẫn v2; giọng tổng hợp Haitrieu, Vibi MiniMax, tốc độ 1.0x.
- Nhân vật và tình huống là hư cấu minh họa. Cảnh phòng ngủ được tạo bằng AI; các clip quay thật được dùng làm hình minh họa.
- Nhạc nền được tổng hợp riêng cho tập này. Nội dung mang tính chia sẻ và giáo dục, không dùng để chẩn đoán cá nhân.

## Tác giả tư liệu được dùng trong bản dựng

{credits}

## Nguồn nội dung

{sources}

Đây là mô tả lưu trong dự án; chưa đăng lên nền tảng nào.
'''
(OUT/'MO_TA_VIDEO.md').write_text(description,encoding='utf-8')
shutil.copy2(AS/'audio/haitrieu/narration-haitrieu.srt',OUT/'phu-de-haitrieu.srt')
buttons=''.join(f'<button data-time="{c["start"]}"><span>{stamp(c["start"])}</span> {html.escape(c["name"])}</button>' for c in p['chapters'])
page=f'''<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(title)}</title><style>
*{{box-sizing:border-box}}body{{margin:0;background:#0b132b;color:#f5efe4;font:16px/1.6 system-ui,sans-serif}}main{{max-width:1140px;padding:40px 24px;margin:auto}}.eyebrow{{color:#34d399;letter-spacing:3px;font-size:12px}}h1{{font-size:clamp(25px,4vw,42px);line-height:1.25;max-width:900px;margin:16px 0}}p{{color:#b9c2d0}}video{{display:block;width:100%;background:#050b13;border-radius:12px;margin:25px 0}}nav{{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:8px}}button{{text-align:left;background:#18253b;color:inherit;border:1px solid #344153;padding:12px;border-radius:8px;font:inherit;cursor:pointer}}button:hover{{border-color:#34d399}}button span{{color:#34d399;margin-right:8px}}a{{color:#8ce3ba}}.links{{display:flex;gap:24px;flex-wrap:wrap;margin:24px 0}}
</style><main><div class="eyebrow">TÂM LÝ NỘI TÂM · TẬP 01</div><h1>{html.escape(title)}</h1><p>Haitrieu · 1.0x · 16 phút 55 giây · Full HD</p>
<video id="film" controls preload="metadata" poster="frames/phone.png"><source src="{video}" type="video/mp4"></video>
<nav aria-label="Các chương">{buttons}</nav><div class="links"><a href="{video}" download>Tải video MP4</a><a href="phu-de-haitrieu.srt" download>Tải phụ đề SRT</a><a href="MO_TA_VIDEO.md">Mô tả và nguồn tư liệu</a></div></main>
<script>const film=document.querySelector('#film');document.querySelectorAll('button[data-time]').forEach(b=>b.onclick=()=>{{film.currentTime=Number(b.dataset.time);film.play();}});</script></html>'''
(OUT/'XEM_VIDEO.html').write_text(page,encoding='utf-8')
meta=json.loads((EP/'script-metadata.json').read_text(encoding='utf-8'))
review_path=ROOT/'projects/tam-ly-noi-tam-tap01-v2/artifacts/final-review.json'
review_ok=review_path.exists() and json.loads(review_path.read_text(encoding='utf-8')).get('status')=='pass'
meta['production']['status']=('complete' if review_ok else 'rendered') if (OUT/video).exists() else 'rendering'
meta['production']['output']=str((OUT/video).relative_to(ROOT))
(EP/'script-metadata.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2),encoding='utf-8')
readme=(EP/'README.md').read_text(encoding='utf-8')
readme=readme.replace('Chưa tạo âm thanh, SRT, props hoặc video cho tập.','Đã tạo lời dẫn Haitrieu 1.0x, SRT và props. Xem trạng thái bản dựng tại [render/README.md](./render/README.md).')
readme=readme.replace('chưa đo bằng TTS.','đã đo bằng TTS Haitrieu: **16:55.053** gồm khoảng nghỉ giữa chương.')
if '[Trang xem video]' not in readme:readme+='\nBản dựng: [Trang xem video](./render/XEM_VIDEO.html) · [Phụ đề SRT](./render/phu-de-haitrieu.srt) · [Mô tả và nguồn](./render/MO_TA_VIDEO.md).\n'
(EP/'README.md').write_text(readme,encoding='utf-8')
print('Local viewing page, SRT, source description and metadata prepared.')
