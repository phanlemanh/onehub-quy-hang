---
schema_version: 1
feature: "Eval thứ tự deploy cũ của hồ sơ đã ký bat-rang-buoc-ban-ma khai không chạy, trỏ tiêu chí đã ký đo lại nó; hồ sơ ấy ghim lại sau gộp main (phần moi-truong-that tách sang hàng sau)"
slug: va-thuoc-ci-ho-so-moi-truong-that
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ci, config]
status: signed-off
approved_by: Manh Phan
approved_at: 2026-11-07
design_doc: docs/superpowers/specs/2026-11-07-va-thuoc-ci-ho-so-moi-truong-that-design.md
---

# Acceptance Contract: va-thuoc-ci-ho-so-moi-truong-that

## Context

Ngoài-3 của hàng `va-deploy-csdl-tam` (PR #176), chủ kho mở hợp đồng mới ở Cổng Bằng chứng 06/11. Chỉ chạm vật hồ sơ
(`_acceptance/moi-truong-that/`, `_acceptance/bat-rang-buoc-ban-ma/`) và hai bản thiết kế của hồ sơ thay. Không chạm bất
biến nào; không chạy gì lên bản thật.

## Criteria

- **AC-1** — Eval thứ tự deploy cũ của bat-rang-buoc-ban-ma khai không chạy, trỏ tiêu chí đã ký đo lại nó.
  Given `_acceptance/bat-rang-buoc-ban-ma/evals.yaml`,
  When bộ đọc của kit (`notRunConflicts`, `chungThayBoi` trong `lib/evidence-core.cjs`) đọc ô E4,
  Then E4 mang `status: not-run` và `superseded_by: va-deploy-csdl-tam#AC-3`, bộ đọc nhận con trỏ (không xung
  đột); thiết kế của hồ sơ thay ghi thẻ `bat-rang-buoc-ban-ma/E4`.

- **AC-2** — Con trỏ hỏng bị bắt đúng điều kiện.
  Given bản sao tạm của hồ sơ thay,
  When con trỏ tới AC không có, thẻ trong thiết kế dính chữ (`bat-rang-buoc-ban-ma/E4a`), hay hồ sơ thay chưa ký,
  Then bộ đọc của kit trả đúng `ac-thay-vang`, `thay-khong-nhan`, `ho-so-thay-chua-ky`; bản sao không sửa thì nhận con trỏ.

- **AC-3** — Lưới trước gộp của hai hồ sơ liên quan sạch.
  Given nhánh của hàng (bat-rang-buoc-ban-ma đã ghim lại sau gộp main),
  When chạy lưới trước gộp của kit cho bat-rang-buoc-ban-ma và va-deploy-csdl-tam,
  Then không VIOLATION nào cho hai slug ấy.

## Coverage

Trục: thước {bat-rang-buoc E4} × việc {khai thay bởi, ghim lại}. Thước CE: luật eval thay bởi (GUIDE kit 2.24). Phần
moi-truong-that (kiem-ci E7, E3 cach_ly_that) tách sang hàng `va-thuoc-ci-moi-truong-that-ban-that` (giám sát 07/11:
ghim lại hồ sơ ấy cần chuỗi kết nối bản thật — chủ kho tự chạy).

## Đường đo

- Ngưỡng `bat_khi`: «lưới trước gộp của hồ sơ cũ xanh trên main sau hàng» → AC-3 trên nhánh; trên main đọc job `gate` của
  lần CI đầu sau gộp. Timebox chưa khai.

## Out of scope

- Sửa thước của moi-truong-that (kiem-ci E7, E3 cach_ly_that) — hàng `va-thuoc-ci-moi-truong-that-ban-that`.
- Sửa executor `cach_ly_that` trong `_acceptance/config.yaml`; ADR-0009, Tham chiếu — hàng adr-0009-csdl-tam.

## Notes

- Ngoài-3 của va-deploy-csdl-tam chưa xong trọn ở hàng này: phần moi-truong-that (bài kiểm CI E7 còn đòi needs cũ và
  test:isolation; E3 chạy bộ cách ly trên bản thật) chuyển sang hàng `va-thuoc-ci-moi-truong-that-ban-that` theo quyết
  định của giám sát 07/11 (ghim lại hồ sơ ấy cần DATABASE_URL bản thật, chủ kho tự chạy). Hỏi-1, Hỏi-2 của Cổng Phạm vi
  thuộc phần ấy và đi theo sang hàng sau.
- Known limits — chọn ở Cổng Bằng chứng 2026-11-07:
  - Ngoài-1: Báo cáo đã ký của bat-rang-buoc-ban-ma (ghim lại lần 2) còn ghi tiêu chí thay cũ kiem-nhanh#AC-1, trong khi
    cấu hình đã trỏ va-deploy-csdl-tam#AC-3; đúng lại ở lần ghim sau.
  - Ngoài-2: Mục ghim lại lần 2 của cùng hồ sơ tả lần thay khác lần thay thật; người duyệt sau đọc theo cấu hình, không
    theo mục ấy.
  - Ngoài-3: Thẻ Cổng Phạm vi của hàng này vẽ trước khi tách hàng, nên tả phạm vi rộng hơn và số AC cũ; hợp đồng hiện
    hành là bản đúng.
  - Ngoài-4: Phép kiểm E1 chỉ xác nhận có con trỏ thay, không đối chiếu với con trỏ trong lần ghim đã chứng, nên lệch kiểu
    Ngoài-1 vẫn lọt.
