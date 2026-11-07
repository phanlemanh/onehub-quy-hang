---
schema_version: 1
feature: "Bài kiểm «đường lõi mật khẩu đóng» thôi đếm tổng người dùng của cả cơ sở dữ liệu: nó chỉ xét người dùng mang đúng email mà đường đăng ký được thử, để chạy song song với các tệp kiểm khác không vỡ, và vẫn bắt được đường đăng ký lỡ mở lại."
slug: va-dong-duong-gui-ma-song-song
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api]
status: machine-cleared
design_doc: docs/superpowers/specs/2026-11-07-va-dong-duong-gui-ma-song-song-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-11-07T10:40:00Z
---

# Acceptance Contract: va-dong-duong-gui-ma-song-song

## Context

Hàng vá dãy Q (đợt `dau-khach-nhap`), Cổng Đáng chủ kho «build» 07/11. Ca «đường lõi mật khẩu đóng» của
`packages/api/test-db/dong-duong-gui-ma/dong-duong-gui-ma.test.ts` đếm người dùng của cả bảng `identity."user"`, nên đỏ
oan khi tiến trình khác tạo người trên cùng cơ sở dữ liệu (mau-nhap-va-bai lượt 2, va-deploy-csdl-tam lượt 1). Vòng chỉ sửa
ca ấy. Không chạm bất biến nào; không chạy gì lên bản thật.

Source input: hàng `va-dong-duong-gui-ma-song-song` (`docs/plan/lo-trinh.json`) · ô `opportunity.md`

## Criteria

- **AC-1** — Người do tiến trình khác tạo không làm ca đỏ.
  Given tệp kiểm của cây, chép riêng và chèn một người mang email khác ngay trước lần đếm «sau»,
  When chạy bản chép trên Postgres dãy,
  Then ca «đường lõi mật khẩu đóng» xanh; và cùng phép chèn vào bản tệp trước hàng (`987c78c6`) thì ca đỏ «đường đăng ký
  tạo người» (phép đo phân biệt được bản sửa).

- **AC-2** — Đường đăng ký lỡ mở lại vẫn bị bắt.
  Given ca gọi đường đăng ký của bảng lõi mười lần với một email chưa ai đăng ký, mỗi lần phải 404,
  When một người mang đúng email ấy xuất hiện giữa hai lần đếm (chèn vào bản chép),
  Then ca đỏ đúng thông điệp «đường đăng ký tạo người».

- **AC-3** — Tệp kiểm thật của cây xanh trọn.
  Given tệp `dong-duong-gui-ma.test.ts` của cây, không chèn gì,
  When chạy riêng trên Postgres dãy,
  Then thoát 0, bốn ca đều đạt, có «✔ đường lõi mật khẩu đóng»; các khẳng định khác của ca (404, không gửi thư, không đốt
  lượt xin mã, không đếm thử sai, đối chứng dương xin mã) vẫn có trong nguồn.

## Coverage

Trục: người xuất hiện giữa hai lần đếm {không ai · người email khác · người đúng email đăng ký thử} × bản tệp {trước hàng ·
cây}. Ô có nghĩa: (không ai, cây) → AC-3 · (email khác, cây) → AC-1 xanh · (email khác, trước hàng) → AC-1 đối chứng đỏ ·
(đúng email, cây) → AC-2 đỏ. Thước CE: hai lần đỏ oan đã ghi ở sổ mau-nhap-va-bai và va-deploy-csdl-tam.

## Đường đo

- Ngưỡng ô cơ hội «xanh khi tệp kiểm khác tạo người cùng lúc, vẫn đỏ khi đường đăng ký tạo người» → AC-1, AC-2 trên nhánh;
  sau gộp: các lượt chấm có bộ kiểm API không còn đỏ ở ca này vì đếm người. Timebox chưa khai.

## Out of scope

- Ca hay tệp kiểm khác cũng đếm toàn bảng — chưa soát ở hàng này; thấy thì ghi việc theo sau.
- Đổi bảng xếp loại đường lõi, đổi `--test-concurrency` hay cấu hình bộ kiểm API.

## Notes

- Ngoài-1 (máy định tuyến 2026-11-07, đề xuất S4 known-limits): Phép kiểm nghiệm thu chỉ chứng minh dòng kiểm tra còn nằm trong tệp, chưa chứng minh nó còn chạy. Nếu sau này ai đó vô tình tắt dòng ấy bằng chú thích, phép kiểm vẫn báo xanh. — `_acceptance/va-dong-duong-gui-ma-song-song/thu/kiem-song-song.mjs`
