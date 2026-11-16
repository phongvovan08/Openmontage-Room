#!/usr/bin/env python3
"""Sinh trang HTML bao cao quet nganh YouTube. Dung Chart.js tu CDN de ve bieu do."""
import json, io, os, sys, html, collections, statistics
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SUM = json.load(io.open(os.path.join(BASE, "_tools", "niche_summary.json"), encoding="utf-8"))
DET = json.load(io.open(os.path.join(BASE, "_tools", "niche_detail_summary.json"), encoding="utf-8"))

LBL = {
    "vn_ha_tang_dia_ly": ("Ha tang, dia ly Viet Nam", "VN"),
    "vn_vi_sao_hang_khong": ("Vi sao trong mot linh vuc", "VN"),
    "vn_lich_su_tu_lieu": ("Lich su tu lieu goc", "VN"),
    "vn_thieu_nhi_hoa_anh": ("Hoc tieng Anh", "VN"),
    "vn_truyen_audio": ("Truyen audio, truyen ma", "VN"),
    "vn_vi_sao_chi_tiet": ("Vi sao chi tiet", "VN"),
    "vn_science_thu_gian": ("Khoa hoc thoi thuong", "VN"),
    "vn_tai_chinh_chung_khoan": ("Tai chinh, chung khoan", "VN"),
    "vn_suc_khoe_dinh_duong": ("Suc khoe, dinh duong", "VN"),
    "vn_cau_chuyen_bep_ky_thuat": ("Ky thuat bep, am thuc", "VN"),
    "intl_how_i_made": ("How I made this (EN)", "EN"),
    "intl_space_science": ("Khoa hoc vu tru (EN)", "EN"),
    "intl_military_tech": ("Cong nghe quan su (EN)", "EN"),
    "intl_megaproject": ("Cong trinh lon, mega project (EN)", "EN"),
    "intl_geopolitics_map": ("Dia ly, bien gioi (EN)", "EN"),
    "intl_code_simulation": ("Mo phong bang code (EN)", "EN"),
    "intl_psychology_philosophy": ("Tam ly, triet hoc (EN)", "EN"),
    "intl_finance_history": ("Tai chinh, lich su tien (EN)", "EN"),
    "intl_documentary_4k": ("Phim tu lieu 4K (EN)", "EN"),
    "intl_health_science": ("Y khoa, sinh ly (EN)", "EN"),
    "intl_ai_tools": ("Ky thuat AI (EN)", "EN"),
    "intl_football_reaction": ("The thao, chien thuat (EN)", "EN"),
}
VN_BG = "#2ea043"
EN_BG = "#1f6feb"
VN_B = "#3fb950"
EN_B = "#58a6ff"


def esc(s):
    return html.escape(str(s))


def fmt(n):
    return format(int(n), ",").replace(",", ".")


def chart_data(rows, key):
    labels = [LBL.get(r["label"], (r["label"],))[0] for r in rows]
    vals = [r[key] for r in rows]
    colors = [VN_B if r["label"].startswith("vn_") else EN_B for r in rows]
    return labels, vals, colors


def flow(steps, title, note=""):
    out = ['<div class="flow"><h3>%s</h3>' % esc(title)]
    if note:
        out.append('<p class="note">%s</p>' % esc(note))
    out.append('<div class="flowchain">')
    for i, (tool, act) in enumerate(steps):
        out.append('<div class="fnode"><span class="ftool">%s</span><span class="fact">%s</span></div>'
                   % (esc(tool), esc(act)))
        if i < len(steps) - 1:
            out.append('<div class="farrow">&rarr;</div>')
    out.append("</div></div>")
    return "".join(out)


def tbl(headers, rows, cls=""):
    h = "".join("<th>%s</th>" % x for x in headers)
    b = "".join("<tr>%s</tr>" % "".join(cells) for cells in rows)
    return '<table class="%s"><thead><tr>%s</tr></thead><tbody>%s</tbody></table>' % (cls, h, b)


P = []
P.append("""<!doctype html>
<html lang="vi"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bao cao quet nganh YouTube 2026-11-14</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.2.0/dist/chartjs-plugin-datalabels.min.js"></script>
<style>
:root{
  --bg:#0b0f16; --panel:#131a24; --panel2:#1a222e; --panel3:#212b39; --line:#26303d;
  --text:#e8eef7; --dim:#94a3b8; --faint:#64748b;
  --vn:#3fb950; --en:#58a6ff; --warn:#e3b341; --bad:#f85149; --good:#2ea043; --accent:#a371f7;
  --glow:0 0 0 1px rgba(88,166,255,.08), 0 8px 32px rgba(0,0,0,.35);
}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:
  radial-gradient(1200px 600px at 12% -8%,rgba(31,111,235,.16),transparent 60%),
  radial-gradient(1000px 520px at 92% 0%,rgba(163,113,247,.13),transparent 60%),
  var(--bg);
  color:var(--text);font-family:"Inter",system-ui,-apple-system,"Segoe UI",sans-serif;
  font-size:15px;line-height:1.68;-webkit-font-smoothing:antialiased}
.wrap{max-width:1240px;margin:0 auto;padding:36px 22px 100px}
header{padding:8px 0 30px;border-bottom:1px solid var(--line);margin-bottom:30px}
.eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:11.5px;font-weight:700;letter-spacing:1.4px;
  text-transform:uppercase;color:var(--accent);background:rgba(163,113,247,.11);padding:5px 13px;border-radius:20px;margin-bottom:16px}
h1{font-size:38px;line-height:1.16;margin:0 0 12px;font-weight:800;letter-spacing:-1px}
h1 .g{background:linear-gradient(92deg,var(--vn),var(--en) 55%,var(--accent));-webkit-background-clip:text;
  background-clip:text;color:transparent}
.sub{color:var(--dim);font-size:16px;margin:0 0 14px;max-width:760px}
.meta{color:var(--faint);font-size:12.5px;margin:0}
.meta code{background:rgba(163,113,247,.1);color:#c9b6f5}
h2{font-size:25px;margin:52px 0 4px;font-weight:750;letter-spacing:-.5px;scroll-margin-top:20px}
h2 .num{color:var(--faint);font-weight:600;margin-right:10px}
h3{font-size:17px;margin:0 0 8px;font-weight:650}
p{margin:9px 0}
.lead{color:var(--dim);margin-bottom:22px;max-width:880px}
section{margin-bottom:14px}
.card{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:20px 22px;margin:16px 0;box-shadow:var(--glow)}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.kpi{background:linear-gradient(160deg,var(--panel2),var(--panel));border:1px solid var(--line);
  border-radius:14px;padding:18px 20px;position:relative;overflow:hidden;box-shadow:var(--glow)}
.kpi::after{content:"";position:absolute;inset:0 0 auto 0;height:2px;
  background:linear-gradient(90deg,var(--vn),var(--en))}
.kpi .v{font-size:30px;font-weight:800;letter-spacing:-1px;font-variant-numeric:tabular-nums}
.kpi .l{color:var(--faint);font-size:11.5px;text-transform:uppercase;letter-spacing:.9px;font-weight:700;margin-top:5px}
.kpi .s{color:var(--dim);font-size:12.5px;margin-top:7px}
.chartbox{background:var(--panel2);border:1px solid var(--line);border-radius:12px;padding:16px 18px;margin:14px 0}
.chartbox h3{font-size:14px;margin-bottom:2px}
.chartbox .unit{color:var(--faint);font-size:12px;margin:0 0 12px}
table{width:100%;border-collapse:collapse;margin:10px 0;font-size:13.5px}
th{text-align:left;color:var(--faint);font-weight:700;padding:10px 11px;border-bottom:1px solid var(--line);
  font-size:11px;text-transform:uppercase;letter-spacing:.7px;white-space:nowrap}
td{padding:9px 11px;border-bottom:1px solid rgba(38,48,61,.6)}
tbody tr:hover{background:rgba(88,166,255,.045)}
td.num{text-align:right;font-variant-numeric:tabular-nums}
.tag{display:inline-block;padding:2px 9px;border-radius:20px;font-size:10.5px;font-weight:700;letter-spacing:.4px}
.tag.vn{background:rgba(63,185,80,.16);color:var(--vn)}
.tag.en{background:rgba(88,166,255,.16);color:var(--en)}
.flow{background:var(--panel2);border:1px solid var(--line);border-radius:14px;padding:18px 20px;margin:14px 0}
.flow .note{color:var(--faint);font-size:12.5px;margin:2px 0 15px}
.flowchain{display:flex;align-items:stretch;gap:9px;flex-wrap:wrap}
.fnode{background:var(--panel3);border:1px solid var(--line);border-radius:10px;padding:10px 13px;min-width:140px;flex:1;
  display:flex;flex-direction:column;gap:4px;transition:.18s}
.fnode:hover{border-color:var(--accent);transform:translateY(-2px)}
.ftool{font-size:12.5px;font-weight:750;color:var(--accent);font-family:"JetBrains Mono",monospace}
.fact{font-size:11.5px;color:var(--dim);line-height:1.45}
.farrow{align-self:center;color:var(--faint);font-size:20px}
ul{margin:8px 0;padding-left:21px}li{margin:6px 0}
code{background:rgba(88,166,255,.1);padding:1.5px 7px;border-radius:5px;font-size:12.5px;
  font-family:"JetBrains Mono",monospace;color:#a5d6ff}
pre{background:#070b12;border:1px solid var(--line);border-radius:11px;padding:16px 18px;overflow-x:auto;
  font-size:12.5px;line-height:1.65;color:#c9d1d9;font-family:"JetBrains Mono",monospace}
pre .c{color:#64748b}pre .k{color:#ff7b72}pre .s{color:#a5d6ff}pre .t{color:#7ee787}
blockquote{border-left:3px solid var(--accent);margin:14px 0;padding:6px 0 6px 18px;color:var(--dim);font-style:italic}
.toc{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:18px 24px;margin-bottom:30px;box-shadow:var(--glow)}
.toc ol{margin:8px 0;padding-left:22px;columns:2;column-gap:40px;font-size:14px}
.toc a{color:var(--en);text-decoration:none;display:inline-block;padding:2px 0}
.toc a:hover{color:#8cc4ff}
.legend{display:flex;gap:20px;flex-wrap:wrap;margin:12px 0 0;font-size:13px;color:var(--dim)}
.legend span{display:flex;align-items:center;gap:8px}
.dot{width:11px;height:11px;border-radius:3px;display:inline-block}
.rank{display:inline-flex;align-items:center;justify-content:center;width:23px;height:23px;border-radius:6px;
  background:var(--panel3);color:var(--dim);font-size:11.5px;font-weight:800;margin-right:9px}
.r1{background:rgba(46,160,67,.28);color:#3fb950}
.r2{background:rgba(227,179,65,.25);color:#e3b341}
.r3{background:rgba(248,81,73,.22);color:#f85149}
.r4{background:rgba(88,166,255,.22);color:#58a6ff}
.footnote{color:var(--faint);font-size:12.5px;margin-top:10px}
.tool{color:var(--accent);font-weight:600}
.bad{color:var(--bad)}.good{color:var(--good)}.warn{color:var(--warn)}
@media(max-width:900px){.grid2,.grid3,.grid4{grid-template-columns:1fr}.toc ol{columns:1}h1{font-size:29px}}
</style></head><body><div class="wrap">""")

P.append("""<header>
<span class="eyebrow">Bao cao nghien cuu thi truong YouTube</span>
<h1>Quet nganh YouTube <span class="g">Viet Nam va nuoc ngoai</span></h1>
<p class="sub">22 nhom nganh, 4.585 video thu thap tu YouTube cong khai. Moi nhom duoc cham diem bang boi so tren trung vi kenh cua chinh no, khong phai bang luot xem tho.</p>
<p class="meta">Nguon: <code>yt_dlp</code> &middot; Cham diem: <code>yt-viral/swipe.py</code> + <code>yt-script/hooks.json</code> cua youtube-agent-skill &middot; Ngay 14/11/2026</p>
</header>""")

P.append("""<nav class="toc"><h3>Noi dung</h3><ol>
<li><a href="#tongquan">Tong quan 22 nhom nganh</a></li>
<li><a href="#chiendich">Bieu do so lieu</a></li>
<li><a href="#bang">Bang xep hang chi tiet</a></li>
<li><a href="#video2026">Video nam 2026 noi bat</a></li>
<li><a href="#hook">Cong thuc hook chay tot</a></li>
<li><a href="#nenlam">4 nganh nen lam</a></li>
<li><a href="#khongnen">Nganh khong nen lam</a></li>
<li><a href="#matran">Ma tran nganh x tool</a></li>
<li><a href="#quytrinh">Quy trinh tung nganh</a></li>
<li><a href="#chuoi">3 chuoi tool thu hut nhat</a></li>
<li><a href="#canhbao">Khong nen dung gi</a></li>
<li><a href="#buoc">Ke hoach 5 giai doan</a></li>
</ol></nav>""")

tot_v = sum(r["n"] for r in SUM)
tot_vw = sum(r["tot"] for r in SUM)
P.append('<section id="tongquan"><h2><span class="num">01</span>Tong quan</h2>')
P.append('<p class="lead">Quet 22 nhom nganh: 11 nhom Viet Nam, 11 nhom nuoc ngoai. Moi nhom lay tu 4 den 832 video cong khai, roi cham diem boi so tren trung vi tung kenh.</p>')
P.append('<div class="grid4">')
P.append('<div class="kpi"><div class="v">%s</div><div class="l">Video quet</div><div class="s">tren %d kenh</div></div>'
         % (fmt(tot_v), sum(r["ch"] for r in SUM)))
P.append('<div class="kpi"><div class="v">%s</div><div class="l">Tong luot xem</div><div class="s">trong mot lan quet</div></div>' % fmt(tot_vw))
P.append('<div class="kpi"><div class="v">22</div><div class="l">Nhom nganh</div><div class="s">11 VN &middot; 11 EN</div></div>')
P.append('<div class="kpi"><div class="v">276</div><div class="l">Video co chi tiet</div><div class="s">ngay dang, like, comment</div></div>')
P.append('</div></section>')

P.append('<section id="chiendich"><h2><span class="num">02</span>Bieu do so lieu</h2>')
P.append('<div class="grid2">')
for cid, key, ttl, unit in [("cTot", "tot", "Tong luot xem theo nhom", "Tong luot xem cua tat ca video trong nhom quet"),
                            ("cMed", "med", "Trung vi luot xem mot video", "Median luot xem cua tung video trong nhom"),
                            ("cN", "n", "So video quet", "So video thu thap duoc"),
                            ("cCh", "ch", "So kenh quet", "So kenh xuat hien trong nhom")]:
    rows = sorted(SUM, key=lambda r: -r[key])
    labels, vals, colors = chart_data(rows, key)
    P.append('<div class="chartbox"><h3>%s</h3><p class="unit">%s</p><canvas id="%s"></canvas></div>'
             % (esc(ttl), esc(unit), cid))
P.append('</div>')
P.append('<div class="legend" style="margin-top:6px"><span><span class="dot" style="background:%s"></span>Nhom Viet Nam</span>'
         '<span><span class="dot" style="background:%s"></span>Nhom nuoc ngoai</span></div>' % (VN_B, EN_B))
P.append('<p class="footnote">Neu mot nhom chi co truy van tu khoa, trung vi luot xem bi keo len rat cao vi ket qua tim kiem tra ve ca kenh lon. Voi nhom do dung video nam 2026 o muc 04 va kenh dan dau trong bang xep hang.</p>')
P.append('</section>')

P.append('<section id="bang"><h2><span class="num">03</span>Bang xep hang chi tiet</h2>')
P.append('<p class="lead">Xep theo tong luot xem trong nhom quet. Cot "kenh dan dau" lay theo trung vi luot xem cua kenh, khong phai theo video don le.</p>')
rows = []
for r in sorted(SUM, key=lambda x: -x["tot"]):
    nm, m = LBL.get(r["label"], (r["label"], "VN"))
    top = " &middot; ".join('<span style="color:#64748b">%s</span> <b>%s</b>' % (esc(t["c"]), fmt(t["m"])) for t in r["top"][:3]) or "&mdash;"
    rows.append(['<span class="tag %s">%s</span> <b>%s</b>' % (m, m, esc(nm)),
                 '<span class="num">%d</span>' % r["n"], '<span class="num">%d</span>' % r["ch"],
                 '<span class="num">%s</span>' % fmt(r["tot"]), '<span class="num">%s</span>' % fmt(r["med"]),
                 '<span class="num">%d</span>' % r["l8"], '<span class="num">%d</span>' % r["l15"], top])
P.append(tbl(["Nhom nganh", "Video", "Kenh", "Tong luot xem", "Trung vi", "Video &ge;8p", "Video &ge;15p", "Kenh dan dau"], rows))
P.append('</section>')

P.append('<section id="video2026"><h2><span class="num">04</span>Video nam 2026 noi bat</h2>')
P.append('<p class="lead">276 video co ngay dang duoc lay chi tiet. Duoi day la nhom co so lieu manh nhat trong tung nganh.</p>')
for key, title, note in [
    ("vn_ha_tang_dia_ly", "Ha tang va dia ly Viet Nam", "35 video nam 2026. Nganh co nhieu video moi, nhung kenh nho van tranh duoc."),
    ("intl_megaproject", "Cong trinh lon, mega project (EN)", "62 video nam 2026. Kenh trung vi chi 4.100 den 50.000 luot, nhung mot video len 3,7 trieu."),
    ("intl_code_simulation", "Mo phong bang code (EN)", "Chi 11 video nam 2026 trong tap lay, nhung tong luot xem cao nhat trong 22 nhom."),
    ("intl_geopolitics_map", "Dia ly, bien gioi (EN)", "24 video nam 2026. Video ve Viet Nam dat 1.300.000 luot tren kenh trung vi 137.000."),
]:
    d = DET.get(key)
    if not d:
        continue
    P.append('<div class="card"><h3>%s</h3><p class="lead" style="font-size:13.5px">%s</p>' % (esc(title), esc(note)))
    rws = []
    for t in d["top"]:
        rws.append(['<span class="num"><b>%s</b></span>' % fmt(t["v"]),
                    '<span class="num">%d:%02d</span>' % (t["d"] // 60, t["d"] % 60),
                    '<span class="num">%s</span>' % fmt(t["l"]), '<span class="num">%s</span>' % fmt(t["c"]),
                    esc(t["t"]), '<span style="color:#64748b">%s</span>' % esc(t["ch"])])
    P.append(tbl(["Luot xem", "Dai", "Like", "Comment", "Tieu de", "Kenh"], rws))
    P.append('<p class="footnote">Ty le like trung vi <b class="good">%.2f%%</b> &middot; comment trung vi <b>%.3f%%</b></p>'
             % (d["eng"]["like"], d["eng"]["cmt"]))
    yrs = d["years"]
    if yrs:
        ys = list(yrs.keys())
        P.append('<div class="chartbox"><h3>Lượt xem trung vị theo năm đăng</h3>'
                 '<p class="unit">Trung vị lượt xem của video theo năm đăng, cùng số video trong từng năm</p>'
                 '<canvas id="yr_%s"></canvas></div>' % key)
    P.append('</div>')
P.append('<p class="footnote">Ba quy luat doc ra tu nhom Viet Nam: (1) cau hoi ve mot dia diem cu the thang cau hoi ve mot danh sach; (2) co doi thu noi tieng de so thi thang; (3) video tieng Anh ve Viet Nam van chay duoc o thi truong Viet.</p>')
P.append('</section>')

P.append('<section id="hook"><h2><span class="num">05</span>Cong thuc hook chay tot</h2>')
P.append('<p class="lead">Khop tieu de video nam 2026 voi 21 cong thuc trong <code>yt-script/hooks.json</code> cua youtube-agent-skill.</p>')
P.append('<div class="card">')
P.append(tbl(["Nhom nganh", "Cong thuc hook"], [
    ['<span class="tag en">EN</span> Cong trinh lon, mega project', "The Question 24 &middot; The Impossible Claim 3 &middot; The List 3"],
    ['<span class="tag en">EN</span> Dia ly, bien gioi', "The Question 7 &middot; The List 3 &middot; The Clock 1"],
    ['<span class="tag en">EN</span> Mo phong bang code', "The Question 6 &middot; The Statistic 1"],
    ['<span class="tag vn">VN</span> Ha tang, dia ly Viet Nam', "The Question 12 &middot; The List 4"],
]))
P.append('<blockquote>"The Question" la cong thuc manh nhat trong ca bon nhom giai thich. Trong tieng Viet tuong ung: "Vi sao", "Tai sao", "Vi sao...?" mo dau tieu de.</blockquote>')
P.append('<p class="footnote">Luu y: cong thuc duoc khop theo TU DE video, khong phai cau chung ve ly do video do thanh cong.</p>')
P.append('</div></section>')

P.append('<section id="nenlam"><h2><span class="num">06</span>Bon nganh nen lam</h2>')
P.append('<p class="lead">Chon theo ba tieu chi: co video moi noi duoc nguoi xem tim kiem, dung duoc bang code, va khong bi chinh sach loai.</p>')
P.append('<div class="card">')
P.append(tbl(["#", "Nganh", "Bang chung", "Rui ro"], [
    ['<span class="rank r1">1</span><b>Ha tang va dia ly kinh te Viet Nam</b>', "Land Connect dat boi so 83,2 lan trung vi kenh; GHIEN DIA LY 528.033 luot; Toa Do Xua 734.931 luot trong 17 ngay", "Canh tranh cao, can ban do dung that"],
    ['<span class="rank r2">2</span><b>Giai thich cong trinh lon bang mo phong code (EN)</b>', "10 video nam 2026 tren 2,6 trieu luot; Unthinkable Build trung vi 4.100 nhung mot video 3.705.334", "Lan song sao chep, doi hoi ky thuat cao"],
    ['<span class="rank r3">3</span><b>Dia ly va dia chinh tri bang ban do (EN)</b>', "Video ve Viet Nam dat 1.300.000 luot tren kenh trung vi 137.000, boi so 9,5", "Chinh tri la vung nhay cam"],
    ['<span class="rank r4">4</span><b>Tom tat lich su dai, co cau truc</b>', "Video tom tat 4000 nam dat 17.297.545 luot, boi so 7,4; video 150 phut dat 9.798.535", "Can nguon chinh xac tuyet doi, de bi han che quang cao"],
]))
P.append('</div></section>')

P.append('<section id="khongnen"><h2><span class="num">07</span>Nganh khong nen lam</h2>')
P.append('<div class="card">')
P.append(tbl(["Nganh", "Bang chung", "Ly do"], [
    ["<b>Truyen audio, truyen ma</b> <span class='tag vn'>VN</span>", "Kenh nho chi 8.211-12.854 luot trung vi; kenh thu vien da dat 1,7 trieu", "Video dong dao khong bung no. Ruy ro chinh sach doc lai truyen nguoi khac"],
    ["<b>Tai chinh, chung khoan</b> <span class='tag vn'>VN</span>", "Video bung no la huong dan dau tu co ban A-Z, 1.490.473 luot tren kenh da co 160.623 luot", "Can uy tin va thuong hieu. De bi han che quang cao"],
    ["<b>Suc khoe, dinh duong</b> <span class='tag vn'>VN</span>", "Video bung no cua bac si co ten tuoi, 109 phut", "Can chung chi va danh tinh that. Khong dung duoc bang AI ma van dang tin"],
    ["<b>Ky thuat bep, am thuc</b> <span class='tag vn'>VN</span>", "Video bung no cua mot dau bep noi tieng, 2,6 trieu luot trung vi", "Can ban tay that, khong dung bang code"],
    ["<b>Khoa hoc thoi thuong</b> <span class='tag vn'>VN</span>", "Trung vi 0 luot trong tap lay, toan video la Shorts", "La Shorts chu khong phai video dai"],
    ["<b>The thao, chien thuat</b> <span class='tag en'>EN</span>", "Chi 2 video vuot trung vi, ca hai deu dai tren 80 phut", "Can kien thuc chien thuat sau va tien thue nguoi ve so do"],
    ["<b>Ky thuat AI</b> <span class='tag en'>EN</span>", "Video dung 999.839 va 1.021.094 luot", "Tuoi tho ngan, de loi thoi, canh tranh voi nha san xuat"],
]))
P.append('</div></section>')

P.append('<section id="matran"><h2><span class="num">08</span>Ma tran nganh x tool</h2>')
P.append('<p class="lead">Voi moi nganh thi dung tool nao. Viet tat: OM = OpenMontage, SK = shorts-kit, YAS = youtube-agent-skill, RV = rea-video, CV = CIT Voice Studio, VB = Vibi TTS, INK = openmontage-ink-theater, SM = stickman-video-director + StykAnimate, C3D = cartoon-3d-short, CIM = cinecode, OC = OpenCreator, TB = turboflow, MAN = manim.</p>')
P.append('<div class="card">')
P.append(tbl(["Nganh", "Tool chinh", "Tool ho tro", "Khong dung"], [
    ["Ha tang, dia ly Viet Nam", '<span class="tool">SK, OM</span>', "YAS, VB, MAN, RV", '<span class="bad">TB, 3 repo Muse, MoneyPrinterTurbo</span>'],
    ["Cong trinh lon, mo phong code (EN)", '<span class="tool">OM, CIM</span>', "YAS, OC, TB, INK", '<span class="bad">RV (chi de hoc), Muse</span>'],
    ["Dia ly, bien gioi (EN)", '<span class="tool">SK, OM</span>', "YAS, INK, C3D", '<span class="bad">TB (ban do phai dung)</span>'],
    ["Tom tat lich su dai", '<span class="tool">OM, SK</span>', "YAS, VB, RV", '<span class="bad">SM, C3D</span>'],
    ["Khoa hoc, vu tru (EN)", '<span class="tool">OM, MAN</span>', "TB, INK, C3D", '<span class="bad">SK (khong can ban do)</span>'],
    ["Tam ly, triet hoc (EN)", '<span class="tool">OM, INK</span>', "YAS, TB", '<span class="bad">SM</span>'],
    ["Tai chinh, kinh te hoc", '<span class="tool">OM, MAN</span>', "YAS, SK (bieu do)", '<span class="bad">TB</span>'],
    ["Truyen audio, truyen ma", '<span class="tool">VB hoac CV</span>', "OM (montage), YAS", '<span class="bad">SK, SM, TB, MoneyPrinterTurbo</span>'],
    ["Vi sao trong mot linh vuc", '<span class="tool">OM, INK</span>', "YAS, VB, RV", '<span class="bad">SK (tru khi linh vuc co ban do)</span>'],
    ["Ky thuat AI, huong dan", '<span class="tool">OM, OC</span>', "YAS, TB", '<span class="bad">RV, Muse</span>'],
    ["Am thuc, ky thuat nep", '<span class="tool">OM, TB</span>', "YAS, VB", '<span class="bad">SM, SK</span>'],
    ["The thao, chien thuat", '<span class="tool">OM, MAN</span>', "YAS, RV", '<span class="bad">SK, TB</span>'],
]))
P.append('</div></section>')

P.append('<section id="quytrinh"><h2><span class="num">09</span>Quy trinh tung nganh</h2>')
P.append(flow([("SK", "docs/facts/facts.json &mdash; so nguon"),
               ("SK", "map.json + bun run satellite / geo"),
               ("OM", "animated-explainer"),
               ("VB", "long tieng Viet"),
               ("YAS", "yt-retention")],
              "9.1 Ha tang va dia ly kinh te Viet Nam",
              "Moi canh phai co toa do that, moi con so phai truy duoc ve mot dong trong so nguon. Day la ly do nganh nay kho sao chep hon nganh mega project tieng Anh."))
P.append(flow([("RV", "phan ra 3 video de thay nhip cat"),
               ("OM / CIM", "dung bang code hoac footage co license"),
               ("TB", "Omni Flash 10 giay, Veo 3.1"),
               ("INK", "canh giai thich khai niem bang hinh ve"),
               ("OC", "long tieng ban tieng Duc / Tay Ban Nha"),
               ("YAS", "yt-retention")],
              "9.2 Cong trinh lon va mo phong bang code (EN)",
              "Khong can tu lieu ngoai nen nhip lam nhanh hon nhieu. Video 10 phut can ~60 doan AI neu dung AI toan bo; thuc te nen dung AI cho 20-30% va code phan con lai."))
P.append(flow([("SK", "so nguon bat buoc"),
               ("OM", "dung timeline bang code, chu la tham so"),
               ("VB", "long tieng, 30 den 150 phut"),
               ("YAS", "yt-chapters")],
              "9.3 Tom tat lich su dai",
              "Video 150 phut dat 9.798.535 luot, video 516 phut dat 3.357.911. Do dai khong phai rao can; do chinh cua nguon moi la rao can."))
P.append(flow([("MAN", "bieu do ky thuat: quy dao, ti le"),
               ("TB", "canh khong gian"),
               ("OM", "Remotion ghep bieu do + canh"),
               ("INK", "canh giai thich khai niem")],
              "9.4 Khoa hoc va vu tru (EN)",
              "Solar System 101 cua National Geographic dat 39.813.028 luot trong video 4 phut. Dinh dang '101' va thoi luong ngan de dan nhap mot chu de lon."))
P.append(flow([("INK", "khai niem &rarr; mot hanh dong vat ly &rarr; mot vat the don gian"),
               ("OC / VB", "long tieng"),
               ("OM", "Remotion")],
              "9.5 Tam ly va triet hoc (EN)",
              "Rui ro cao nhat trong nhom quoc te. Chinh sach YouTube loai 'nhan vat AI dong vai chuyen gia o chu de nhay cam'."))
P.append(flow([("VB / CV", "25 giong Viet hoac VieNeu offline"),
               ("OM", "documentary-montage cho hinh")],
              "9.6 Truyen audio va truyen ma",
              "Truyen phai do ban viet. Doc lai truyen nguoi khac khong kiem tien duoc."))
P.append('</section>')

P.append('<section id="chuoi"><h2><span class="num">10</span>Ba chuoi tool thu hut nhat</h2>')
P.append('<div class="card"><h3>10.1 Tao hinh nhanh nhat cho video giai thich dai</h3>')
P.append('<p class="lead">Chuoi nay dung het nhung gi da cau hinh tren may.</p>')
P.append("""<pre><span class="c"># 1. Chong goi</span>
<span class="k">python</span> .agents/skills/youtube-agent-skill__yt-package/title.py <span class="t">--title</span> <span class="s">"..."</span> <span class="t">--thumb</span> <span class="s">"..."</span>

<span class="c"># 2. Cham hook, lap toi khi diem &gt; 70</span>
<span class="k">python</span> .agents/skills/youtube-agent-skill__yt-script/hookscore.py <span class="t">--hook</span> <span class="s">"..."</span>

<span class="c"># 3. Dung video</span>
OM animated-explainer: research -&gt; proposal -&gt; script -&gt; scene_plan -&gt; assets
TB cho 20-30% canh (Omni Flash 10s) hoac SM cho nhan vat
<span class="k">python</span> tools/audio/vibi_tts.py <span class="t">--text-file</span> narration.txt <span class="t">--lang</span> vi <span class="t">--out-mp3</span> audio/vo.mp3 <span class="t">--out-srt</span> audio/vo.srt
OM Remotion ghep (chu la tham so)
OM subtitle_gen (SRT tai len YouTube, khong in vao hinh)

<span class="c"># 4. Tu kiem tra truoc khi dang</span>
OM visual_qa + composition_validator + audio_probe
YAS yt-seo + yt-chapters

<span class="c"># 5. Dang tay qua YouTube Studio, doc lai sau 48 gio</span>
<span class="k">python</span> .agents/skills/youtube-agent-skill__yt-retention/retention.py retention.csv <span class="t">--transcript</span> audio/vo.srt</pre>""")
P.append('<p class="footnote">Diem mau chot: chu tren hinh phai la tham so cua canh Remotion, khong in cung. Nhu vay cung mot video dung duoc ra ban tieng Anh chi bang cach doi tham so, va khong phai lam lai hinh.</p></div>')

P.append('<div class="card"><h3>10.2 Chuoi cho nganh ban do</h3>')
P.append("""<pre><span class="c"># Cai dat truoc</span>
<span class="k">cd</span> C:/Users/ACER/Desktop &amp;&amp; <span class="k">git clone</span> https://github.com/howznguyen/shorts-kit.git
<span class="k">cd</span> shorts-kit &amp;&amp; <span class="k">bun install</span> &amp;&amp; <span class="k">bun run</span> facts

<span class="c"># Tao file toa do cho tung canh</span>
<span class="c"># src/videos/&lt;id&gt;/map.json</span>
{ <span class="s">"shots"</span>: [ {<span class="s">"id"</span>:<span class="s">"country"</span>, <span class="s">"lon"</span>:106.8, <span class="s">"lat"</span>:14.5, <span class="s">"spanLon"</span>:21},
                    {<span class="s">"id"</span>:<span class="s">"saigon"</span>, <span class="s">"lon"</span>:106.71, <span class="s">"lat"</span>:10.78, <span class="s">"spanLon"</span>:0.45, <span class="s">"zoom"</span>:12} ] }

<span class="c"># Tai du lieu</span>
<span class="k">bun run</span> satellite &lt;id&gt;   <span class="c"># anh ve tinh EOX Sentinel-2, CC BY 4.0</span>
<span class="k">bun run</span> geo &lt;id&gt;         <span class="c"># bo bien, bien gioi, song tu Natural Earth</span>

<span class="c"># Dung</span>
SK SatelliteMap + VectorLayer + Route + Measure + VietnamMap
OM Remotion</pre>""")
P.append('<p class="footnote">Quy tac bat buoc: mot canh cho mot muc ti le, khong cat giua hai dia diem tren cung mot ban do, ve len anh chu khong ve len the, khoang cach do tu <code>distanceKm()</code> chu khong trich so da nghe, dong ghi nguon EOX phai hien tren hinh.</p></div>')

P.append('<div class="card"><h3>10.3 Chuoi cho nganh ngan (Shorts cat tu video dai)</h3>')
P.append("""<pre>YAS yt-shorts              <span class="c"># tim doan co the cat</span>
OM captions-and-clipping    <span class="c"># hoac C3D neu can phong cach hoat hinh</span>
OM Remotion doc 1080x1920
OM subtitle_gen             <span class="c"># phu de dot luu bat buoc</span></pre>""")
P.append('<p class="footnote">Neu lam kenh tieng Viet, Shorts cat tu video dai la cach tot nhat de co video moi tuan ma khong ton them mot tap dai nua.</p></div>')
P.append('</section>')

P.append('<section id="canhbao"><h2><span class="num">11</span>Khong nen dung gi</h2>')
P.append('<div class="card">')
P.append(tbl(["Cong cu", "Ly do"], [
    ["<b>MoneyPrinterTurbo</b>", "Chinh sach goi dung la 'san xuat hang loat' va 'noi dung khun chung chung'. README cua chinh repo ghi mac dinh lay nhac tu video YouTube khac."],
    ["<b>3 repo Muse</b>", "Muse chi mo o My, Canada, Nhat, Singapore; d4ncboz/museai dung cookie phien va khong con cap nhat; useapi/muse-api phai giao email va mat khau Muse cho ben thu ba."],
    ["<b>morluto/rea</b>", "La cong cu dich nguoc phan mem, khong lien quan video. Ten giong rea-video nhung la du an khac."],
    ["<b>CopilotKit/openbot, openmuse</b>", "Khong phai cong cu lam video."],
    ["<b>bang-motion cho ident chinh</b>", "Trung vai voi HyperFrames da co san trong OpenMontage."],
]))
P.append('</div></section>')

P.append('<section id="buoc"><h2><span class="num">12</span>Ke hoach 5 giai doan</h2>')
P.append('<div class="card">')
P.append(tbl(["Giai doan", "Thoi gian", "Noi dung", "Cong cu"], [
    ["<b>0. Nen mong</b>", "15/11 &ndash; 22/11/2026", "Chot ten kenh, loi hua mot cau, ngon ngu hinh. Dung 5 canh ky thuat dung lai. Lap so nguon. Chon giong doc. Viet 3 kich ban dau.", '<span class="tool">YAS, OM, SK</span>'],
    ["<b>1. Thu nghiem</b>", "23/11 &ndash; 20/12/2026", "6 den 8 video. Moi video thu mot bien: kieu cau hoi, co doi thu so hay khong, 10 hay 15 phut. Sau moi video tai retention va chay yt-retention.", '<span class="tool">OM, VB, YAS</span>'],
    ["<b>2. Tang toc</b>", "21/12/2026 &ndash; 31/01/2027", "Lam them video cung nhom voi video chay tot nhat. Bo nhom de tai yeu. Them playlist theo loat.", '<span class="tool">OM, YAS</span>'],
    ["<b>3. Kiem tien + tieng Anh</b>", "02/2027 &ndash; 04/2027", "Nop don khi du nguong, khai thue trong AdSense. Thi diem 4 video tieng Anh tu 4 video Viet tot nhat.", '<span class="tool">OC, openai_tts</span>'],
    ["<b>4. Mo rong</b>", "05/2027 &ndash; 10/2027", "Thu long tieng tu dong cho tieng Duc va Tay Ban Nha. Nguon thu ngoai quang cao. Loat thu hai sang lanh giang Dong Nam A.", '<span class="tool">OC, OM</span>'],
]))
P.append('<p class="footnote">Voi hinh thuc video nay, <b>1.000 nguoi dang ky moi la nut that, khong phai gio xem</b>. Bon kenh mau co 0,15 den 0,44 nguoi dang ky tren moi 100 luot xem, nen 1.000 nguoi can 225.000 den 650.000 luot xem. Video 14 phut o do xem trung binh 35-45% cho ~24.000 den 32.000 gio xem, vuot xa ca nguong 8.000.</p>')
P.append('</div></section>')

P.append('<section><h2><span class="num">13</span>Tai lap lai</h2>')
P.append("""<div class="card"><pre><span class="c">cd</span> C:/Users/ACER/Desktop/Openmontage-Room

<span class="c"># 1. Thu thap (giu file cu, chi them nhom moi)</span>
<span class="k">python</span> -I _tools/scan_niches.py _tools/niche_plan.json
<span class="k">python</span> -I _tools/scan_niches.py _tools/niche_plan2.json

<span class="c"># 2. Cham diem</span>
<span class="k">python</span> -I _tools/analyze_niches.py                    <span class="c"># tat ca 22 nhom</span>
<span class="k">python</span> -I _tools/analyze_niches.py vn_ha_tang_dia_ly   <span class="c"># mot nhom</span>

<span class="c"># 3. Cong cu san co cua youtube-agent-skill</span>
<span class="k">python</span> .agents/skills/youtube-agent-skill__yt-viral/swipe.py collected.json <span class="t">--min</span> 2.0</pre>
<p class="footnote">collected.json can it nhat 4 video moi kenh de trung vi co nghia:<br>
<code>[{"channel":"...","title":"...","views":412000,"url":"...","duration":613}]</code></p>
<p class="footnote">Luu y ve yt-dlp: day la du lieu cong khai. Chi dung de hoc cau truc va doc nguon. Khong lay lai footage cua nguoi khac.</p>
</div></section>""")

P.append('<p class="footnote" style="margin-top:30px;border-top:1px solid var(--line);padding-top:18px">'
         'Du lieu: YouTube cong khai, thu thap ngay 14/11/2026 qua yt_dlp. '
         'Chi tiet chinh sach va thi truong: xem <code>16_PHAN_TICH_DOC_LAP_GITHUB_THI_TRUONG_NGACH_2026-11-14.md</code>, muc 4 va muc 10.<br>'
         'So lieu RPM va thu nhap trong file do lay tu vidIQ va NexLev, khong lay tu lan quet nay.</p>')

# ---- JS chart ----
js = []
js.append("""<script>
Chart.register(ChartDataLabels);
Chart.defaults.font.family="Inter,system-ui,sans-serif";
Chart.defaults.color="#94a3b8";
Chart.defaults.borderColor="rgba(38,48,61,.7)";
const GRID={color:"rgba(38,48,61,.65)",drawBorder:false};
const TT={backgroundColor:"#131a24",borderColor:"#26303d",borderWidth:1,padding:11,
  titleColor:"#e8eef7",bodyColor:"#94a3b8",titleFont:{size:12.5,weight:"700"},bodyFont:{size:12.5},cornerRadius:8,
  displayColors:true,boxWidth:9,boxHeight:9,boxPadding:4};
const NUM=new Intl.NumberFormat("vi-VN");
""")
for cid, key, ttl in [("cTot", "tot", "Tong luot xem theo nhom"), ("cMed", "med", "Trung vi luot xem mot video"),
                       ("cN", "n", "So video quet"), ("cCh", "ch", "So kenh quet")]:
    rows = sorted(SUM, key=lambda r: -r[key])
    labels, vals, colors = chart_data(rows, key)
    horiz = key in ("tot", "med")
    data = dict(labels=labels, datasets=[dict(label=ttl, data=vals, backgroundColor=colors,
                                             borderRadius=4, borderSkipped=False,
                                             barPercentage=.82, categoryPercentage=.86)])
    js.append("""new Chart(document.getElementById("%s"),{type:"bar",data:%s,options:{indexAxis:"%s",
  responsive:true,maintainAspectRatio:false,
  plugins:{legend:{display:false},tooltip:{...TT,callbacks:{label:c=>c.dataset.label+": "+NUM.format(c.raw)}},
    datalabels:{display:ctx=>ctx.dataset.data[ctx.dataIndex]>0,anchor:"end",align:%s,
      color:"#94a3b8",font:{size:10.5,weight:"600"},formatter:v=>v>=1000000?(v/1000000).toFixed(1)+"M":v>=1000?(v/1000).toFixed(0)+"k":v}},
  scales:{x:{grid:{display:false},ticks:{maxRotation:60,minRotation:45,font:{size:10.5}},border:{display:false}},
          y:{grid:GRID,border:{display:false},ticks:{font:{size:10.5},callback:v=>v>=1000000?(v/1000000).toFixed(1)+"M":v>=1000?(v/1000).toFixed(0)+"k":v}}}}});"""
             % (cid, json.dumps(data, ensure_ascii=False), "y" if horiz else "x", '"right"' if horiz else '"end"'))

for key in DET:
    yrs = DET[key]["years"]
    if not yrs:
        continue
    ys = list(yrs.keys())
    labels = ys
    med = [yrs[y]["med"] for y in ys]
    mx = [yrs[y]["max"] for y in ys]
    nn = [yrs[y]["n"] for y in ys]
    data = dict(labels=labels, datasets=[
        dict(type="bar", label="Trung vi luot xem", data=med, backgroundColor="rgba(88,166,255,.55)",
             borderRadius=4, borderSkipped=False, order=2, yAxisID="y"),
        dict(type="line", label="Cao nhat trong nam", data=mx, borderColor="#a371f7",
             backgroundColor="rgba(163,113,247,.12)",
             borderWidth=2, pointRadius=3, pointBackgroundColor="#a371f7", tension=.3, fill=True, order=1, yAxisID="y"),
        dict(type="line", label="So video", data=nn, borderColor="#3fb950", borderWidth=1.5, borderDash=[5,4],
             pointRadius=2, pointBackgroundColor="#3fb950", tension=.25, fill=False, order=0, yAxisID="y1")])
    js.append("""new Chart(document.getElementById("yr_%s"),{data:%s,options:{responsive:true,maintainAspectRatio:false,
  interaction:{mode:"index",intersect:false},
  plugins:{legend:{position:"top",labels:{boxWidth:11,boxHeight:11,font:{size:11.5},padding:14,color:"#94a3b8"}},
    tooltip:{...TT,callbacks:{label:c=>c.dataset.label+": "+NUM.format(c.raw)}},
    datalabels:{display:false}},
  scales:{x:{grid:{display:false},ticks:{font:{size:11.5}},border:{display:false}},
    y:{position:"left",grid:GRID,border:{display:false},ticks:{font:{size:10.5},callback:v=>v>=1000000?(v/1000000).toFixed(1)+"M":v>=1000?(v/1000).toFixed(0)+"k":v}},
    y1:{position:"right",grid:{display:false},border:{display:false},ticks:{font:{size:10.5},color:"#3fb950"}}}}});"""
             % (key, json.dumps(data, ensure_ascii=False)))
js.append("</script>")

P.append("".join(js))
P.append("</div></body></html>")

dest = os.path.join(BASE, "Chu-De", "BAO_CAO_QUET_NGACH_YOUTUBE_2026-11-14.html")
io.open(dest, "w", encoding="utf-8", newline="\n").write("".join(P))
print("WROTE", dest, os.path.getsize(dest), "bytes")
