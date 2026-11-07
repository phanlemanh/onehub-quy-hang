---
schema_version: 1
feature: "Thước của hai hồ sơ đã ký đo bước triển khai cũ được đưa về bước triển khai mới: bài kiểm CI của moi-truong-that đo deploy chờ bộ cách ly trên CSDL tạm, migrate rồi kiểm nhanh rồi Vercel; hai eval đo bước cũ khai không chạy, trỏ tiêu chí đã ký đo lại chúng"
slug: va-thuoc-ci-ho-so-moi-truong-that
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ci, config]
status: implemented
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

- **AC-1** — Bài kiểm CI của moi-truong-that đo bước triển khai mới.
  Given `.github/workflows/ci.yml` hiện tại,
  When chạy `node _acceptance/moi-truong-that/thu/kiem-ci.mjs`,
  Then thoát 0 với đúng tám vế ĐẠT: chỉ chạy khi push main; chờ check, isolation, secrets, gate; bí mật ở environment
  production; thứ tự migrate → kiem-nhanh → deploy hook; không chạy test:isolation, db:test, test:db; không trong ci-ok;
  vercel.json tắt tự deploy main; ghim sin1 — dòng đối chứng in khác chữ «ĐẠT» nên E7 đã ký («tám dòng ĐẠT») vẫn đúng.

- **AC-2** — Bài kiểm CI đỏ đúng vế khi job deploy trôi về bước cũ.
  Given bản sao ci.yml sửa trong bộ nhớ,
  When chèn lại `npm run test:isolation -w @quy-hang/db`, đảo kiem-nhanh xuống sau deploy hook, hay bỏ `isolation` khỏi
  needs,
  Then mỗi bản sao làm hàm xét đỏ đúng tên vế tương ứng; các đối chứng chạy trước mỗi lần chạy bài.

- **AC-3** — Hai eval đo bước cũ khai không chạy, trỏ tiêu chí đã ký đo lại chúng.
  Given evals.yaml của hai hồ sơ cũ,
  When đọc `moi-truong-that/E3` và `bat-rang-buoc-ban-ma/E4`,
  Then cả hai mang `status: not-run` và `superseded_by` lần lượt `va-deploy-csdl-tam#AC-2`,
  `kiem-nhanh-rang-buoc-ban-ma#AC-1`; hai hồ sơ thay đã ký và thiết kế của chúng ghi thẻ eval cũ.

- **AC-4** — Lưới trước gộp của hai hồ sơ cũ sạch.
  Given nhánh của hàng,
  When chạy lưới trước gộp của kit cho bốn slug: moi-truong-that, bat-rang-buoc-ban-ma và hai hồ sơ thay
  va-deploy-csdl-tam, kiem-nhanh-rang-buoc-ban-ma (thiết kế của chúng có thêm bảng thay),
  Then không VIOLATION nào cho bốn slug ấy.

## Coverage

Trục: thước {kiem-ci E7, E3 cach_ly_that, bat-rang-buoc E4} × việc {sửa thước, khai thay bởi}. Thước CE: bảng ba thước của
thiết kế; luật eval thay bởi (GUIDE kit 2.24, chín điều kiện).

## Đường đo

- Ngưỡng `bat_khi`: «lưới trước gộp của hai hồ sơ cũ xanh trên main sau hàng» → AC-4 đo trên nhánh; trên main đọc job
  `gate` của lần chạy CI đầu tiên sau gộp (giám sát xem theo luật đợt 77). Hàng chỉ đổi tệp trong `_acceptance/` và thiết
  kế, nên hai hồ sơ cũ không hoá cũ và không cần ghim lại (vị từ hoá cũ chỉ tính tệp ngoài `_acceptance/`) · «bài kiểm CI đỏ khi deploy chạy lại bộ kiểm ghi» → AC-2. Timebox chưa khai.

## Out of scope

- Sửa hợp đồng đã ký của moi-truong-that (vế AC-7 «chạy bộ kiểm cách ly trên cơ sở dữ liệu thật») — ghi Notes.
- Sửa executor `cach_ly_that` trong `_acceptance/config.yaml` — ngoài vùng; ô E3 không chạy nữa.
- ADR-0009, Tham chiếu — hàng adr-0009-csdl-tam.

## Notes

- Vế «áp migration rồi chạy bộ kiểm cách ly trên cơ sở dữ liệu thật» của moi-truong-that AC-7 thay bởi
  `va-deploy-csdl-tam#AC-1` và `#AC-3`; E7 của moi-truong-that vẫn chạy để giữ đo các vế còn đúng của AC-7.
