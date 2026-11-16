# Nghiên cứu `mromidev/claude-animated-shorts`

## Nguồn chính

- Repository: https://github.com/mromidev/claude-animated-shorts
- README: https://github.com/mromidev/claude-animated-shorts#readme
- Skill pipeline: https://raw.githubusercontent.com/mromidev/claude-animated-shorts/main/SKILL.md
- Style Bible: https://raw.githubusercontent.com/mromidev/claude-animated-shorts/main/references/STYLE_BIBLE.md
- License: https://github.com/mromidev/claude-animated-shorts/blob/main/LICENSE

## Kết luận

Đây là một Claude skill và bộ template Remotion/Three.js để tạo short dọc khoảng 55–70 giây: nhân vật 2D dạng billboard/canvas card đứng trong thế giới 3D toon có texture vẽ tay, viền ink, camera gliding, depth of field, voice-over, SFX và nhạc nền. Repository không phải một app dựng video độc lập và không chứa đầy đủ project shell, voice hay toàn bộ asset 3D của video mẫu.

## Thành phần

- `SKILL.md`: quy trình từ kiểm chứng sự kiện, script, word timing, shot plan, world, characters, post, sound, QA đến render.
- `templates/bridge/`: mã nguồn mẫu của short “The Bridge That Fell for a Song”, gồm `story.ts`, `world.ts`, `build.ts`, `cast.ts`, `toon.ts`, `ink.ts`, `lensblur.ts`, `grade.ts` và `Bridge.tsx`.
- `templates/audio/`: Python pipeline tạo SFX, nhạc, ducking và mix loudness.
- `templates/scripts/`: render still, side-by-side và QA từng frame.
- `references/`: style bible, báo cáo đo lường và frame sheets để nghiên cứu look; không được dùng lại nội dung, nhân vật hoặc shot của nguồn tham khảo.

## Điều kiện khi tích hợp OpenMontage

Mã mẫu import `@remotion/three`, `@react-three/fiber`, `@react-three/postprocessing` và `postprocessing`; workspace cần kiểm tra/bổ sung các package còn thiếu. `world.ts` tải các file `public/bridge/kenney/*.glb`, còn audio template kỳ vọng `voice/voice.wav` và `voice/words.json`, nên cần tạo hoặc thay asset riêng. `BridgeShort` mẫu cố định 2025 frame ở 30 fps và cần đổi timeline khi làm tập mới.

## Hướng áp dụng được đề xuất

Tạo một composition mới, ví dụ `Cartoon3D_BiAnLichSu`, bằng cách copy template vào `remotion-composer/src/videos/<slug>/`, đăng ký trong `Root.tsx`, đặt GLB/texture/voice dưới namespace riêng trong `public/`, và giữ các file media tách biệt theo từng chủ đề. Với Vibi, chuyển `word_timestamps` `{word,start,end}` thành dạng `{word,s,e}` mà timeline mẫu đang đọc hoặc dùng trực tiếp lớp Audio/Caption của OpenMontage.

Chủ đề phù hợp nhất để thử đầu tiên là `Chu-De/Bi-An-Lich-Su`, vì công thức hook nghịch lý → nguyên nhân vật lý → diễn tiến → khoảnh khắc gãy → giải thích đời thường khớp với lịch sử có sự kiện trực quan. Sau đó mới mở rộng sang động vật, mẹo vật lý hoặc chuyện đêm khuya bằng bộ world/character/lighting riêng.

