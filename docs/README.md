# Tài liệu Quỹ hàng

Mỗi loại thông tin ở đúng một chỗ. Khi hai nơi nói khác nhau, nơi ghi ở cột «Nguồn chính» thắng.

| Loại thông tin | Nguồn chính | Ghi chú |
|---|---|---|
| Điều đang đúng của sản phẩm: vai, đối tượng, trạng thái, quyền, luật, màn và ưu tiên, sổ quyết định, chỗ cần chốt, thuật ngữ | [`product/tham-chieu.md`](product/tham-chieu.md) | Đọc trước khi đề xuất việc mới; không hỏi lại điều đã chốt ở §12 |
| Kiến trúc kho, API, kết nối, stack, thứ tự dựng | [`architecture/kien-truc-repo-va-stack.md`](architecture/kien-truc-repo-va-stack.md) | Điều đã chốt có ADR đi kèm |
| Quyết định kiến trúc | [`adr/`](adr/) | Gốc: ADR-0017 của onehub-invest |
| Việc phát triển: hàng, chờ điều kiện, thứ tự | [`plan/lo-trinh.json`](plan/lo-trinh.json) · trang [`LO-TRINH.html`](../LO-TRINH.html) | Thêm việc bằng `/acceptance-gate:cat-luot`, mở vòng bằng `/feature-loop:feature-loop <mã>`; bản phạm vi của từng đợt nằm cạnh |
| Vỏ ứng dụng, IA theo giao diện, khối ReUI đích của từng màn, chỗ hở | [`design/vo-va-ia.md`](design/vo-va-ia.md) | Chọn trên kho trước — luật ở [`../.claude/rules/giao-dien.md`](../.claude/rules/giao-dien.md); ADR-0002 |
| Từ vựng: nhãn trên màn ↔ tên code | [`../CONTEXT.md`](../CONTEXT.md) | Nhãn mới thêm cùng commit |
| Luật cho agent, lệnh | [`../AGENTS.md`](../AGENTS.md) | |
| Lý do, phỏng vấn, lịch sử chỉnh (28–29/10) | [`product/ghi-chep/`](product/ghi-chep/) | Lưu vết, không sửa |
| Nghiên cứu, thảo luận của phiên: tài liệu thô bất biến và trang tóm | [`tri-thuc/`](tri-thuc/) | Ghi bằng `/tri-thuc:ghi`, kiểm bằng `/tri-thuc:kiem`; luật ở [`tri-thuc/TRI-THUC.md`](tri-thuc/TRI-THUC.md) |
| Phác thảo màn (41 màn, mã 1–3, M1–M5, G1–G4, N1–N2, K1–K4, KD1–KD2, L1–L5, S1–S5, T1–T4) | [Canvas «Phác thảo UX quỹ hàng»](https://claude.ai/artifact/VESE23ChnX6oSC3X73Bzwf) | Nằm trên claude.ai; danh mục màn ở Tham chiếu §10 |

Tài liệu thiết kế gốc trên claude.ai ([liên kết](https://claude.ai/artifact/B12d9FDirVB9vEA8gSChLe)) giữ để đọc lại và bình luận. Từ 29/10/2026 bản trong kho là bản hiện hành.
