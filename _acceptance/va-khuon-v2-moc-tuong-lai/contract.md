---
schema_version: 1
feature: Gói danh mục có mốc đo ở tương lai bị từ chối thay vì đóng băng ảnh chụp của khu với mọi sàn; bộ chặn tên miền nhận đuôi bất kỳ (zalo.me, t.me, .land); mốc đo có phút múi giờ từ 60 trở lên báo sai khuôn thay vì lỗi máy chủ.
slug: va-khuon-v2-moc-tuong-lai
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api]
status: signed-off
approved_by: Manh Phan
approved_at: 2026-11-10
design_doc: docs/superpowers/specs/2026-11-09-va-khuon-v2-moc-tuong-lai-design.md
---

# Acceptance Contract: va-khuon-v2-moc-tuong-lai

## Context

Hàng vá phát sinh từ Cổng Bằng chứng của `khuon-nguon-danh-muc-v2`, chủ kho chọn mở hợp đồng mới 09/11. Hạng **T3** (`packages/connect/**`). Không đổi hình khuôn, không migration.

Source input: `docs/plan/lo-trinh.json` hàng `va-khuon-v2-moc-tuong-lai` · `_acceptance/va-khuon-v2-moc-tuong-lai/opportunity.md` · `_acceptance/khuon-nguon-danh-muc-v2/review-findings.md`.

## Criteria

- AC-1: Given mốc đo vượt giờ hiện tại quá dung sai, When đọc khuôn, Then ma trận viết trước (đầu gói v1, đầu gói v2, số thị trường, tin rao) mỗi ô đúng một lỗi đúng đường khoá; mốc đúng bằng biên dung sai và mốc quá khứ được nhận.
- AC-2: Given khu đã có ảnh chụp, When gói có mốc đo tương lai, có tên miền đuôi lạ, hay có phút múi giờ từ 60 trở lên được đẩy bằng phiên và bằng token, Then 422 `invalid-feed`, toàn nội dung ba bảng của khu không đổi, đường token ghi một dòng `invalid_payload`; gói đúng có mốc mới hơn sau đó vẫn thay được ảnh chụp, tức khu không bị đóng băng (cross-layer).
- AC-3: Given chuỗi có tên miền, When đọc khuôn v2, Then ma trận viết trước (`zalo.me/mau`, `t.me/kenh`, `fb.me/mau`, `nhadat.land`, `muaban.xyz`, `nha.shop`, `ten.lavender`, `ZALO.ME`) ở sáu trường chữ do người gõ (`provider`, tên khu, tên phân khu, tên toà, mã căn, hướng) bị từ chối đúng đường khoá, thông điệp nêu tên miền; địa danh viết toàn chữ thường `tp.hcm` cũng bị từ chối, là giá đã duyệt ở Hỏi-2.
- AC-4: Given chuỗi sạch có dấu chấm, When đọc khuôn v2, Then ma trận viết trước (`A.2305`, `S1.02`, `S1.Shop`, `Toà 3.1`, `Khu B.2`, `Tp.HCM`, `Q.1`, `P.Bến Nghé`, `H.Me Linh`, `P.Co Giang`) ở cả sáu trường chữ được nhận; khoá máy cấp có dấu chấm chữ thường (`khu-a.toa-b` ở khoá khu, khoá toà, UPI) được nhận.
- AC-5: Given mốc đo cơ sở dữ liệu không nhận, When đọc khuôn và đẩy qua cửa nhận, Then ma trận viết trước (`+07:60`, `+07:99`, `+0760`, `-00:75`, phần lẻ giây 10 chữ số, 300 chữ số) ở bốn vị trí mốc (đầu gói v1, đầu gói v2, số thị trường, tin rao) đúng một lỗi đúng đường khoá và 422 không phải 500 qua cả hai đường vào; biên `+15:59` phút 59 và phần lẻ 9 chữ số được nhận và ghi được (cross-layer).
- AC-6: Given bộ kiểm khuôn v1, v2 đã có, When chạy, Then vẫn xanh và gói mẫu đúng byte với tệp ví dụ: hàng này không đổi hình khuôn.

## Coverage

Quét bằng morphological-scan, preset test-matrix:

- Trục A — lỗ: mốc tương lai | tên miền | mốc cơ sở dữ liệu không nhận [thước CE: SUY-TỪ-REPO `_acceptance/khuon-nguon-danh-muc-v2/review-findings.md`]
- Trục B — vị trí: đầu gói v1 | đầu gói v2 | số thị trường | tin rao | trường chữ tự do [thước CE: SUY-TỪ-REPO `packages/connect/src/catalog-feed.ts`]
- Trục C — giá trị: vượt | đúng biên | trong khoảng [thước CE: SUY-TỪ-REPO `docs/plan/lo-trinh.json` `bat_khi`]
- Trục D — đường vào: phiên | token [thước CE: SUY-TỪ-REPO `packages/api/src/catalog/feeds.ts`]

Core: A(tương lai)×B×C → AC-1 · A(tương lai)×D → AC-2 · A(tên miền)×B → AC-3, AC-4 · A(mốc)×B×D → AC-5 · không đổi hình → AC-6.
Later: số nguyên vượt trần và ký tự rỗng (Known limits của hàng trước). Never: bắt mọi `chữ.chữ`, vì `Tp.HCM` là tên địa danh.

## Đường đo

- Mốc tương lai, tên miền đuôi lạ, phút múi giờ từ 60: gói bị từ chối đúng lỗi khuôn và ảnh chụp của khu không đổi: AC-2.
- Đúng từng lỗ ở tầng khuôn: AC-1, AC-3, AC-5.

Số đo là kết quả eval máy, chưa có đường chảy thật cho tới khi Invest đẩy.

## Out of scope

- Số nguyên vượt trần, ký tự rỗng: đã ghi Known limits ở hàng trước.
- Gỡ ảnh chụp đã đóng băng trên dữ liệu thật: chưa có gói v2 thật nào.
- Áp lưới tên miền cho khuôn v1.

## Notes

- Câu hỏi Cổng Phạm vi: Hỏi-1 dung sai mốc tương lai · Hỏi-2 bắt tên miền tới đâu · Hỏi-3 kiểm mốc tương lai ở đâu (thiết kế §4).
- Known limits — chọn ở Cổng Bằng chứng 2026-11-10:
  - Ngoài-1: Một vài địa danh viết tắt có dấu chấm như «T.Me Linh» bị nhận nhầm là tên miền, cả gói bị từ chối, bên đẩy phải đổi cách viết rồi đẩy lại.
  - Ngoài-2: Tên miền đuôi .io, .co viết hoa chữ đầu như «Nhadat.io» lọt qua lưới và có thể vào các trường tên, trong khi bản trước chặn được.
  - Ngoài-3: Bài kiểm chưa phân biệt được gói sai múi giờ bị từ chối vì lý do nào; sản phẩm hiện báo đúng, chỉ thiếu lưới giữ cho lần sửa sau.
  - Ngoài-4: Trường dãy của căn chưa có bài kiểm tên miền riêng; lưới hiện vẫn áp cho trường này.
