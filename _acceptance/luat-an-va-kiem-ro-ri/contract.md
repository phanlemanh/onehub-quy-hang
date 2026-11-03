---
schema_version: 1
feature: Mọi cửa ra lấy dữ liệu từ một bộ luật ẩn ở lõi, và bộ kiểm rò rỉ chứng không trường nội bộ nào có trong trang khách, kể cả trong mã nguồn trang; luật ẩn phủ cả liên hệ (mọi liên hệ không ra ngoài) và ngăn ảnh (chỉ ngăn Gửi được ra trang khách)
slug: luat-an-va-kiem-ro-ri
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [core, ci]
status: approved
design_doc: _acceptance/luat-an-va-kiem-ro-ri/design.md
approved_by: Manh Phan
approved_at: 2026-11-03
---

# Acceptance Contract: luat-an-va-kiem-ro-ri

## Context

Hàng 31 của lộ trình (dãy H, đợt `dau-khach-nhap`), mã phạm vi K1. Đứng trên hàng 11 (lớp trường nguồn), 18 (ảnh ba
ngăn), 85 (liên hệ). T3 theo lộ trình: chạm bất biến 2 (thông tin chủ nhà không rời công ty) và 4 (phần nội bộ không ra
trang khách), thêm kiểm bắt buộc vào CI. Không màn, không migration (số 022 giữ chỗ để trống). Tệp ngoài vùng đã được giám
sát duyệt (yêu cầu H-1, H-2): `.github/workflows/ci.yml`, `package.json`, `packages/core/package.json`, `AGENTS.md`,
`docs/adr/0022-dinh-vi-va-chuan-doi-chieu.md`, `docs/product/tham-chieu.md`, `_acceptance/config.yaml` (hai khoá
executor), `eslint.config.mjs` (hai dòng của `b324429`, tin G-0311-6).

## Criteria

- AC-1: Given một căn của sàn ở dạng đầy đủ (lần rao, danh mục, chủ nhà, liên hệ, ảnh hai ngăn, người giữ, trường riêng,
  người gửi), When bất kỳ cửa ra nào — gửi link, gửi ảnh + tin, phát hàng — dựng dữ liệu cho khách riêng hay nhóm môi
  giới bằng hàm lõi `banRaNgoai`, Then bản ra chỉ có các khoá trong danh sách được ra của người nhận đó (`TRUONG_RA`), cùng
  người nhận thì ba cửa ra cùng một bản; khoá nào của bản vào ngoài danh sách — kể cả khoá lạ thêm vào bản vào lúc chạy —
  không có trong bản ra.
- AC-2: Given bảng lớp trường của bản vào, When người viết mã thêm một khoá vào bản vào mà chưa xếp lớp, thêm vào danh
  sách được ra một khoá có lớp không ra (`company_internal`, `custom_field`, `transaction`, `behavior`, `source`), hoặc
  đổi lớp một khoá ở bảng gốc của lõi (trường chủ nhà của hàng 11, ngăn ảnh của hàng 18) mà bảng lớp của luật ẩn không đổi
  theo, Then kiểm của lõi đỏ và thông điệp nêu tên khoá (và lớp); bảng lành thì xanh.
- AC-3: Given bản mồi — mọi trường không được ra mang một giá trị riêng, When chạy `banRaNgoai` ở 3 cửa × 2 người nhận ×
  4 cấu hình (gồm cấu hình mở nhất: hiện tuổi xác nhận, không ẩn mã căn), Then JSON của mọi bản ra không chứa giá trị mồi
  nào của lớp nguồn, nội bộ, giao dịch, trường riêng; và cùng bộ kiểm quét chính bản vào thì trúng đủ mọi mồi (đối chứng
  dương); bản sao hàm ra cố tình chép một trường nội bộ thì bộ kiểm đỏ, nêu tên trường.
- AC-4: Given căn có mã, trục, số tầng, mã định danh (UPI) và số tầng của toà, When gửi khách riêng ở cấu hình mặc định,
  Then bản ra không có mã căn, trục, số tầng, UPI ở bất kỳ khoá hay giá trị nào — chỉ toà và «tầng cao» / «tầng thấp» theo
  luật Hỏi-1 (danh mục thiếu số tầng toà thì không có nấc tầng), cùng đúng tập đặc điểm căn chọn ở Hỏi-3; When gửi nhóm
  môi giới, hoặc sàn tắt «ẩn mã căn», Then bản ra có đủ mã căn, trục, số tầng, UPI.
- AC-5: Given căn có liên hệ chủ nhà (Chủ bán) và một liên hệ chỉ là Người mua, mỗi liên hệ có tên và số, When dựng bản
  ra ở mọi cửa × người nhận × cấu hình, Then không tên, số (mọi cách viết số), loại hay mã của liên hệ nào có trong bản ra.
- AC-6: Given căn có ảnh ở ngăn Gửi được (một ảnh bìa, một ảnh mẫu) và ở ngăn Nội bộ, When dựng bản ra, Then bản ra chỉ có
  ảnh ngăn Gửi được, chọn qua `anhRaNgoai` của hàng 18, ảnh bìa đầu, mỗi ảnh mang mã, nhãn («Ảnh thật · <ngày>» / «Ảnh
  mẫu»), rộng, cao; không mã, nhãn hay số đếm nào của ảnh ngăn Nội bộ.
- AC-7: Given căn ở mỗi trạng thái trong sáu trạng thái chuẩn, When dựng bản ra, Then tình trạng và giá theo bảng Hỏi-4
  (khuyến nghị: Đang bán → «còn hàng» có giá và điều kiện phí; Đang giao dịch → «đã cọc» có giá, trang làm mờ; Tạm ngưng →
  «tạm ngưng», không giá; Đã bán, Ngừng hẳn, Chưa đủ để rao → «không còn», không giá); không trạng thái nào ra giá chốt,
  ngày bán, lý do ngừng hay mốc giờ xác nhận; «giá xác nhận X ngày trước» ra đúng số ngày bàn làm việc hiện cho cùng căn,
  cùng hôm (cùng hàm độ tươi của lõi) khi sàn bật, vắng khi sàn tắt.
- AC-8: Given một văn bản bất kỳ (mã nguồn trang, tin soạn sẵn, dòng xuất file) và danh sách mồi, When một mồi nằm trong
  văn bản ở dạng nguyên, thực thể HTML (thập phân, thập lục phân, có tên), thoát JSON `\uXXXX`, mã hoá URL, Unicode NFD,
  hoa thường khác, hoặc số điện thoại viết cách / chấm / `+84`, số tiền có dấu ngăn nghìn, Then `timRoRi` trúng và nêu
  trường cùng dạng; cùng văn bản không có mồi thì không trúng.
- AC-9: Given kho sau khi gộp, When CI chạy, Then job `ro-ri` chạy bộ kiểm rò rỉ (`npm run test:ro-ri`) và là điều kiện của
  `ci-ok` và `deploy`; bản kho có một trường nội bộ cố tình thêm vào danh sách được ra thì lệnh ấy thoát khác 0 và nêu tên
  trường; một trang web của bàn làm việc hay trang khách (`apps/web/src/app`) có URL của cửa ra (`/s/…`, `/shares/new`,
  `/exports` — kể cả nằm trong nhóm route) mà không có tệp `*.ro-ri.test.ts` gọi `canMoi` và `timRoRi` ở thư mục của nó hay
  thư mục cha tới gốc app thì lệnh ấy đỏ, nêu URL. Route API công khai (`/api/v1/public/…`, `/api/v1/s/…`) không thuộc rào
  của hàng này — xem Out of scope.
- AC-10: Given checkout có thư mục `.acceptance-runs/` chứa tệp `.mjs` lỗi lint, When chạy lint của kho, Then lint bỏ qua
  thư mục ấy và vẫn quét mã kho (một tệp lỗi lint trong `packages/` vẫn bị bắt).

## Coverage

Quét theo khuôn test-matrix của `morphological-scan`. Chân sản phẩm `[SUY-TỪ-REPO: docs/product/tham-chieu.md]`,
`[SUY-TỪ-REPO: docs/architecture/kien-truc-repo-va-stack.md]`, `[SUY-TỪ-REPO: packages/core/src/data-classes.ts]`; chân
ngành `[NGÀNH: RESO Media.Permission, PrivateRemarks/PublicRemarks]` (`docs/product/doi-chieu-nganh.md` §7).

- Trục A — người nhận: khách riêng · nhóm môi giới. `[thước CE: luật 24]`
- Trục B — cửa ra: gửi link · gửi ảnh + tin · phát hàng. (Đăng Platform: Later.) `[thước CE: Tham chiếu §3 «Ba cửa ra»]`
- Trục C — lớp dữ liệu của trường: catalog · shareable_listing · company_internal · custom_field · source · transaction ·
  behavior; cộng hai nhóm đặc biệt: liên hệ, ảnh hai ngăn. `[thước CE: DATA_CLASSES của lõi — 7 lớp]`
- Trục D — cấu hình: #12 bật/tắt × #13 bật/tắt = 4, gồm mở nhất. `[thước CE: Sổ điểm biến thiên A4]`
- Lớp cross-cutting — dạng văn bản chứa rò: JSON · HTML (thực thể) · thoát JSON · URL · NFD · cách viết số.
  `[CE: ngành — các dạng mã hoá của trình duyệt; chưa đo trên trang thật, trang ở hàng 35] [GIẢ ĐỊNH]`
- Trạng thái hàng (6 giá trị) là trục phụ của AC-7.

Core → AC: (A × vị trí) AC-4 · (B × A × C × D, quét giá trị) AC-3 · (C liên hệ) AC-5 · (C ảnh) AC-6 · (C bảng lớp) AC-2 ·
(B một hàm) AC-1 · (trạng thái × giá) AC-7 · (cross-cutting văn bản) AC-8 · (CI, cửa mới) AC-9 · rào lint AC-10.
Later: Đăng Platform; trường riêng bật từng trường khi phát hàng (hàng 43/47); nhà ngoài khu (#14, đang Đề xuất).
Never: lớp `source` ở bất kỳ cửa nào — bất biến 2.

## Đường đo

- Ngưỡng ở `opportunity.md`: «Bộ kiểm rò rỉ chạy trong CI và đỏ khi cố tình thêm một trường nội bộ; gửi khách riêng không
  có mã căn». Số từ: job `ro-ri` của CI trên `main` (xanh/đỏ) — AC-9 bảo đảm job tồn tại và đỏ khi cố tình thêm trường nội
  bộ; «khách riêng không có mã căn» — AC-4 bảo đảm trên bản ra của lõi. Đếm trên trang thật là việc của hàng 35.

## Out of scope

- Dựng trang khách, luồng Gửi, Phát hàng, tin soạn sẵn — hàng 35, 34, 43; các hàng ấy dựng trên `banRaNgoai` và thêm tệp
  `*.ro-ri.test.ts` cạnh trang của mình.
- Đọc cấu hình sàn từ `company_settings` và API công khai cho trang khách — hàng 35 (API truyền cấu hình vào lõi).
- Rào cửa ra cho route API công khai — hàng 35, hàng dựng route công khai đầu tiên: rào ấy đọc danh sách route thật đã
  đăng ký trên app API (trong `packages/api`), không đoán URL từ chữ trong mã. Hai lượt chấm của hàng này cho thấy đoán
  từ chữ (cây thư mục ở lượt 1, chuỗi sau `path:` ở lượt 2) luôn sót một kiểu khai; lõi cũng không được phụ thuộc vào gói
  API. Lúc thu phạm vi, kho chưa có route `/api/v1/public/…` hay `/api/v1/s/…` nào.
- Mức chia nhóm môi giới (#15, #16) — hàng 44; số điện thoại người gửi trên trang khách — Cổng Phạm vi hàng 35.
- Trường riêng bật từng trường khi phát hàng cho đội khác — hàng 43, 47; nhà ngoài khu (#14) — chờ ADR-0016 Hỏi-3.
- Đăng Platform — sau bản đầu.

## Notes

- Hỏi-1 … Hỏi-4: xem sổ quyết định và `design.md` §8. Hợp đồng viết theo khuyến nghị.
- Giới hạn đã biết: rào cửa ra (AC-9) đo việc có tệp kiểm và tệp ấy gọi bộ kiểm; việc trang dựng từ `banRaNgoai` được đo
  gián tiếp — trang đi vòng mà cầm giá trị nội bộ thì lượt quét mồi trên mã nguồn trang đỏ. Hàng 35 là hàng đầu tiên
  chạy rào trên một trang thật.
- Thu phạm vi 03/11 sau lượt chấm 2 (dừng vá): AC-9 bỏ nhánh route API, nhánh ấy sang hàng 35.
