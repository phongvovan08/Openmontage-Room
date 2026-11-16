# Quy chuẩn làm việc OpenMontage

Tài liệu này chỉ giữ các quy tắc vận hành ngắn gọn của workspace. Quy trình sản xuất, pipeline, checkpoint, capability discovery và chính sách approval nằm trong [AGENT_GUIDE.md](AGENT_GUIDE.md); phải đọc file đó trước mọi tác vụ.

## 1. Thứ tự ưu tiên

1. Đọc `AGENT_GUIDE.md` và tài liệu pipeline được chọn trong `pipeline_defs/`.
2. Chạy preflight bằng `provider_menu_summary()` trước khi làm creative work.
3. Đọc stage director skill trước từng stage; đọc Layer 3 skill từ `agent_skills` trước khi gọi tool tạo media.
4. Không tạo asset trước proposal approval và không tự thay provider, model, runtime hoặc fallback khi chưa được duyệt.
5. Mọi artifact và output của production phải nằm trong `projects/<project-id>/`; không ghi khóa API, token hay dữ liệu riêng tư vào repo.

## 2. Quy tắc nội dung và quyền sử dụng

- Mỗi video phải có kịch bản, visual plan, nguồn fact và hồ sơ license riêng; không sao chép footage, transcript, nhạc hoặc thumbnail của video tham khảo.
- AI có thể hỗ trợ research, draft, voice, visual và subtitle, nhưng người duyệt chịu trách nhiệm về tính chính xác, tính nguyên bản, disclosure altered/synthetic content và quyền sử dụng.
- Không dùng workflow tự động sản xuất hàng loạt rồi tự đăng. Xuất gói bằng `export_bundle`, người dùng duyệt và đăng qua YouTube Studio.
- Với tiếng Việt, dùng Vibi qua [_tools/vibi_tts.py](_tools/vibi_tts.py) hoặc provider đã được registry xác nhận; không ghi cứng credential.

## 3. Tài liệu điều hành kênh hiện tại

- [Chủ đề đang triển khai](Chu-De/README.md)
- [Quyết định ngách và checklist Giai đoạn 0](Chu-De/21_QUYET_DINH_NGACH_VA_GIAI_DOAN_0.md)
- [Tài liệu nghiên cứu GitHub, thị trường, chính sách và ngách](Chu-De/16_PHAN_TICH_DOC_LAP_GITHUB_THI_TRUONG_NGACH_2026-11-14.md)

Kế hoạch hiện hành là pilot tiếng Việt về giải mã địa lý kinh tế và hạ tầng dân dụng Việt Nam bằng bản đồ. Giai đoạn 0 từ 15/11 đến 22/11/2026. File 16 là tài liệu nghiên cứu tham khảo; file 21 là quyết định và checklist hiện hành.

## 4. Xuất video

- Output production canonical: `projects/<project-id>/renders/` theo `AGENT_GUIDE.md`.
- Chỉ đặt bản bàn giao ngoài `.gitignore` khi có yêu cầu lưu trữ hoặc chia sẻ cụ thể; không biến thư mục `Chu-De/` thành nơi mặc định cho mọi render.
- Khi bàn giao, nêu rõ output path, trạng thái kiểm tra và mọi giới hạn về nguồn hoặc license.
