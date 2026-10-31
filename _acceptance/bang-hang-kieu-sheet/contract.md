---
schema_version: 1
feature: "Đầu chủ mở Bảng hàng trên máy tính và thấy hàng của sàn dày như Sheet: lọc mọi cột, nhóm theo toà rồi loại căn, lưu góc nhìn"
slug: bang-hang-kieu-sheet
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api, docs]
status: verified
approved_by: Manh Phan
approved_at: 2026-10-31
design_doc: _acceptance/bang-hang-kieu-sheet/design.md
---

# Acceptance Contract: bang-hang-kieu-sheet

## Context

Hàng 14 của lộ trình, màn P0 (2) — chỗ người dùng so với Sheet đầu tiên. Dựng phần ĐỌC của Bảng hàng trên máy tính: khối
đích `data-grid-editing-6` (ADR-0002, `docs/design/vo-va-ia.md` §2) trên lưới đã đo ở ADR-0004, đọc từ kho trên máy của
hàng 13; loại căn và thuộc tính căn lấy từ danh mục qua một tuyến đọc mới; góc nhìn lưu trên máy theo người và sàn. Sửa
trên ô (15), đổi hàng loạt (16), hồ sơ căn (17), bảng thẻ trên điện thoại (32) là hàng khác.

Source input: hàng 14 của `docs/plan/lo-trinh.json` · ô cơ hội `_acceptance/bang-hang-kieu-sheet/opportunity.md` (ký
`build`) · trả lời giám sát B-1, B-2 (chạm ngoài vùng).

## Criteria

- AC-1: Given danh mục mẫu của hàng 5 (`SAMPLE_CATALOG`), When thành viên của sàn đang làm gọi `GET /api/v1/catalog`,
  Then nhận 200 với đúng dự án → toà → căn của danh mục (mỗi căn đủ `unitNumber`, `livingArea`, `bedroomsTotal`, `floor`,
  `directionFaces`) và không trường nào của lớp `source`; chưa đăng nhập 401, chưa gắn sàn 403, chưa chọn sàn 409 — cùng
  luật vào với tra mã căn.
- AC-2: Given một hàng (toà, mã căn) và danh mục, When ghép, Then loại căn, diện tích, tầng, hướng đúng căn của chính toà
  đó (cùng mã ở hai toà không lẫn); `bedroomsTotal` 0 ra «Studio», n ra «nPN»; căn ngoài danh mục hay danh mục chưa có
  ra «Chưa rõ» và để trống ba cột còn lại.
- AC-3: Given Đầu chủ mẫu ở sàn thử có 40 hàng mẫu, khổ 1440×900, When mở `/inventory`, Then lưới hiện đúng các căn
  người ấy được thấy (trục ai thấy hàng của hàng 12), mười sáu cột mặc định theo nhãn `CONTEXT.md` (Toà · Mã căn · Loại
  căn · Diện tích · Tầng · Hướng · Trạng thái · Giá · Phí · Nội thất · Pháp lý · Tài chính · Tình trạng sử dụng · Xác nhận
  · Mức đủ · Ai thấy), giá dạng «4,65 tỷ», trạng thái là nhãn có màu; ba cột Giá chốt · Ngày bán · Lý do ngừng ẩn và bật
  được trong menu cột; dòng tổng ở chân bảng ghi «n / N căn». (cross-layer)
- AC-4: Given bảng ở AC-3, When đặt ô lọc ở từng cột đang hiện, Then mọi cột hiện đều có
  ô lọc đúng kiểu (chữ chứa không phân biệt dấu · chọn một giá trị · luật số như `<=5`, `2-5`, Giá gõ theo tỷ); chỉ còn căn khớp mọi ô cùng lúc; dòng tổng đổi theo; «Xoá lọc» trả đủ N căn; bộ lọc ra 0 căn hiện «Không
  căn nào khớp bộ lọc» kèm «Xoá lọc».
- AC-5: Given bảng ở AC-3, When mở lần đầu và đổi điều khiển «Nhóm», Then mặc định nhóm Toà → Loại căn (nhóm loại căn lồng
  trong nhóm toà, mỗi nhóm ghi số căn, gập/mở được); đổi sang Toà hay Không nhóm thì lưới đổi theo; số căn mỗi nhóm tính
  sau bộ lọc.
- AC-6: Given bảng đã đặt lọc, cột hiện, sắp xếp, nhóm, When «Lưu góc nhìn…» với một tên, Then góc nhìn hiện ở menu «Góc nhìn ▾»
  và «Góc nhìn của tôi» ở cột thứ hai; tải lại trang vẫn còn; bấm nó mở `/inventory/views/<id>` áp lại đúng cả bốn thứ;
  đổi một ô lọc thì hiện «Đã đổi» kèm «Lưu đè» và «Lưu thành góc nhìn mới»; đổi tên và xoá (có hộp xác nhận) chạy; tên
  rỗng hay trùng tên của tôi bị báo dưới ô và không lưu; người khác hay sàn khác trên cùng máy không thấy góc nhìn này;
  id không có trên máy hiện «Góc nhìn này không có trên máy này» kèm lối về Bảng hàng.
- AC-7: Given bảng đã tải, When gõ phím chữ, Delete, dán (Ctrl/Cmd+V) vào ô, rồi lọc, nhóm, sắp, Then không thao tác chờ
  nào sinh ra, không lời gọi ghi nào tới API, và lọc · nhóm · sắp không gọi mạng; Ctrl/Cmd+C chép vùng ô đã chọn ra văn bản
  tách tab; mất mạng sau lần tải đầu thì lọc, nhóm vẫn chạy và loại căn vẫn đúng từ bản danh mục đã giữ. (cross-layer)
- AC-8: Given sàn chưa có hàng nào, kho trên máy chưa từng kéo, lần kéo đầu thất bại, và khổ 375×812, When mở
  `/inventory`, Then thấy lần lượt: «Sàn chưa có hàng nào» kèm «Nhập Excel»; khung chờ đúng bố cục lưới; «Chưa tải được
  bảng hàng» kèm «Thử lại»; khối báo «Bảng hàng dạng thẻ trên điện thoại dựng ở mục 32» — sáng và tối đều đọc được.
- AC-9: Given lưới thật của màn này (nhóm Toà → Loại căn, cột ghim Toà và Mã căn) với 5.000 hàng nhân từ bộ hàng mẫu, When chạy
  máy đo cuộn của ADR-0004 (Chrome không đầu, 1366×768, CPU giảm tốc 4×, ba lượt, hiệu chuẩn mỗi lượt), Then p95 khoảng cách
  khung ≤ 33,4 ms, khung > 50 ms ≤ 1%, và cuộn tới căn cuối; đối chứng đỏ cùng máy đo (trang bận mỗi khung) trượt ngưỡng.
- AC-10: Given cây sau hàng này, When chạy kiểm kiểu, lint (luật `quy-hang-ui`, mức nợ 0, kiểm chuẩn danh mục, bài quét
  khuôn 0 lệch), sàn thiết kế M1 và bộ kiểm của lõi, API, web, Then đều xanh; và khi người duyệt đọc
  `design/patterns/bang-hang.md`, `docs/design/vo-va-ia.md`, `.agents/skills/quy-hang-ui/catalog.md`,
  `docs/product/tham-chieu.md`, thấy nhóm màn mới đủ khoá, khối đã chuyển thể kèm đổi gì, và §12 có dòng của hàng này.
  (judgment)

## Đường đo

Ngưỡng của ô cơ hội (đề xuất, chưa có số): «Đầu chủ … thấy hàng của sàn dày như Sheet: lọc mọi cột, nhóm theo toà rồi
loại căn, lưu góc nhìn». Số «ngày Sheet cũ không được sửa» (Tham chiếu §11) là của phiên nghiệm thu sau hai tuần thử.

- Thước: lọc mọi cột · số từ: E4 (ma trận cột × kiểu lọc), E5 · bảo đảm bởi: AC-4
- Thước: nhóm toà rồi loại căn · số từ: E2, E6 · bảo đảm bởi: AC-2, AC-5
- Thước: lưu góc nhìn · số từ: E7, E8 · bảo đảm bởi: AC-6
- Thước: dày như Sheet (đủ căn, đủ cột, mượt) · số từ: E3, E11 · bảo đảm bởi: AC-3, AC-9

## Coverage

Quét bằng morphological-scan (preset entity-feature, rút gọn), bốn trục:

- Trục A — thao tác trên bảng: xem · lọc · nhóm · sắp · chọn và chép · sửa (cấm ở hàng này) · lưu/mở/đổi/xoá góc nhìn
  [thước CE: Tham chiếu §4 dòng «Góc nhìn», §9, `vo-va-ia.md` §2 dòng Bảng hàng]
- Trục B — nguồn cột: bản tính hàng · độ tươi/mức đủ/ai thấy · danh mục · cột ẩn [thước CE: `ListingView` của bộ đồng bộ,
  `CatalogUnitData`]
- Trục C — trạng thái dữ liệu: đang tải · trống · lỗi · lọc rỗng · đầy · ngoài danh mục · mất mạng [thước CE: khuôn
  `trang-thai`, Tham chiếu §12 dòng 31/10]
- Trục D — người và chỗ: Đầu chủ · người khác cùng máy · sàn khác · khổ 1440 · khổ 375 · sáng/tối [thước CE: Tham chiếu §9
  bảng vai]
- Core: A×B ở AC-3, AC-4, AC-5; góc nhìn AC-6; chỉ đọc và không mạng AC-7; C ở AC-8; mượt AC-9; tuyến danh mục AC-1;
  ghép AC-2; rào và tài liệu AC-10.
- Later: góc nhìn của đội (cần bảng ở máy chủ) · độ tươi ở chân cột thứ hai · chọn cột theo «cách gọi» của sàn · ghim
  góc nhìn trên điện thoại.
- Never: cột chủ nhà trên bảng (lớp `source`, bất biến 2).

## Out of scope

- Sửa giá, phí, trạng thái trên ô và hoàn tác — hàng 15.
- Chọn nhiều căn rồi đổi hàng loạt — hàng 16.
- Mở hồ sơ căn thành cột phải khi bấm dòng — hàng 17.
- Bảng hàng dạng thẻ trên điện thoại — hàng 32.
- Góc nhìn của đội và góc nhìn đi theo người qua nhiều máy — cần bảng ở máy chủ; gửi giám sát thành hàng mới.
- Gỡ trang thử ẩn `/proto/nhanh-tuc-thi` — việc phụ B-3.

## Notes

- Chạm ngoài vùng, giám sát duyệt: B-1 — tệp mới `packages/api/src/catalog/doc-ca-danh-muc.ts` + kiểm, một dòng ở
  `packages/api/src/app.ts`; B-2 — `apps/web/package.json`, `package-lock.json` (chỉ thêm `@tanstack/*`,
  `@dnd-kit/modifiers`), tệp cài mới dưới `components/reui`, `components/ui`, `catalog.md`, `design/patterns/trang-tam.md`,
  `components/shell/placeholder.tsx`, `components/shell/second-column.tsx`. Cờ `noUncheckedIndexedAccess` (giám sát CHƯA duyệt nới cờ):
  bản cài `data-grid` nguyên bản đỏ đúng MỘT dòng (`data-grid-cell-selection.tsx:1387`); nháp theo khuyến nghị Hỏi-1 sửa
  dòng ấy (chú thích tại chỗ, ghi ở `catalog.md`), `cascader` của khối không cài vì Bảng hàng không dùng.
- Chốt ở Cổng Phạm vi 2026-10-31, nguyên văn chủ kho: «bang-hang-kieu-sheet duyệt» — Hỏi-1 và Hỏi-2 theo khuyến nghị:
  giữ cờ kiểu chặt, sửa một dòng bản cài; nhãn «nPN»/«Studio»/«Chưa rõ» và ba lựa chọn nhóm.
- Hai câu chỉ người ở Cổng Phạm vi: Hỏi-1 (cờ kiểu chặt — sửa một dòng bản cài hay tắt cờ cho web), Hỏi-2 (nhãn loại
  căn «nPN»/«Studio»/«Chưa rõ» và ba lựa chọn nhóm). Nháp theo khuyến nghị của cả hai.
- Dữ liệu cho bài nhìn: sàn và người của `packages/db/seed/nap.mjs --nap` (hàng 5) + 40 hàng mẫu nạp qua API bằng
  `_acceptance/bang-hang-kieu-sheet/thu/dung-b.mjs` trên Postgres dãy B (5561); hàng mẫu không có pháp lý và tình trạng
  sử dụng mà Đang bán bắt buộc nên điền «[Mẫu] …». Hai sàn phụ: «[Mẫu] Sàn trống» (trạng thái trống, người hai sàn) và
  «[Mẫu] Sàn đo cuộn» — 5.000 hàng của AC-9 nhân từ 40 hàng ấy, mã mang hậu tố mẫu.
- Ngoài-1 (máy định tuyến 2026-10-31, đề xuất S4 known-limits): Người dùng Bảng hàng không bị ảnh hưởng. Chỉ khi người nghiệm thu chạy nhiều bài nhìn cùng lúc và bước dựng dữ liệu mẫu kéo rất lâu thì hai lần dựng có thể chạy chồng nhau, làm dữ liệu thử lộn xộn và phải chạy lại. — `_acceptance/bang-hang-kieu-sheet/thu/dung-b.mjs`
- Ngoài-3 (máy định tuyến 2026-10-31, đề xuất S4 known-limits): Trên Bảng hàng, khi bấm phím End hoặc Ctrl/Cmd+Mũi tên phải để nhảy tới cột cuối, ô được chọn nằm ở cột đang ngoài màn hình và bảng không tự cuộn theo. Người dùng không thấy mình đang chọn ô nào, phải tự cuộn ngang bằng chuột. Bấm từng mũi tên một cột vẫn chạy bình thường. — `apps/web/src/app/(app)/inventory/bang-hang.tsx`
- Ngoài-4 (máy định tuyến 2026-10-31, đề xuất S4 known-limits): Khi kiểm tay ba ô lọc cùng lúc, người kiểm chỉ ghi lại vài căn đầu rồi kết luận cho cả danh sách, nên một căn lọt sai ở cuối danh sách có thể không bị phát hiện. Bảng hàng của người dùng không đổi; chỉ độ chặt của bài kiểm yếu hơn lời hứa. — `_acceptance/bang-hang-kieu-sheet/evals.yaml`
- Ngoài-5 (máy định tuyến 2026-10-31, đề xuất S4 known-limits): Trên menu của tiêu đề cột vẫn có mục ghim cột sang trái hoặc phải, nhưng bấm vào thì không có gì xảy ra. Hai cột Toà và Mã căn vẫn luôn được giữ cố định như thiết kế. — `apps/web/src/app/(app)/inventory/bang-hang.tsx`
- Ngoài-6 (máy định tuyến 2026-10-31, đề xuất S4 known-limits): Nếu trình duyệt không cho ghi (bộ nhớ đầy hoặc chế độ riêng tư cũ), góc nhìn vừa lưu có vẻ đã lưu nhưng khi mở lại báo không có trên máy này, và người dùng không được báo là lưu hỏng. Lưu đè và đổi tên cũng mất theo cách đó. — `apps/web/src/app/(app)/inventory/goc-nhin-react.ts`
- Ngoài-7 (máy định tuyến 2026-10-31, đề xuất S4 known-limits): Gõ khoảng bằng chữ như «5 đến 10» vào ô lọc số thì ô báo đỏ và không lọc được, dù chữ hướng dẫn cho trình đọc màn hình có gợi ý cách gõ này. Gõ «5-10» vẫn dùng được. — `apps/web/src/app/(app)/inventory/bieu-thuc-so.ts`
- Ngoài-8 (máy định tuyến 2026-10-31, đề xuất S4 known-limits): Bài kiểm nói là đảm bảo căn chưa có giá nằm cuối khi sắp theo giá, nhưng thực tế không kiểm điều đó, nên nếu sau này thứ tự này hỏng thì bài kiểm vẫn xanh. Người dùng hiện chưa gặp lỗi nào. — `apps/web/src/app/(app)/inventory/loc.test.ts`
- Ngoài-9 (máy định tuyến 2026-10-31, đề xuất S4 known-limits): Bài kiểm chứng minh góc nhìn của sàn này không lộ sang sàn khác có một phần đối chứng không thật nên có thể không bắt được lỗi nếu phần tách theo sàn bị bỏ đi. Hiện người dùng chưa gặp lỗi lộ góc nhìn. — `apps/web/src/app/(app)/inventory/goc-nhin.test.ts`
- Known limits — chọn ở Cổng Bằng chứng 2026-11-01:
  - Ngoài-1: Chạy nhiều bài nhìn cùng lúc mà bước dựng dữ liệu mẫu kéo quá 15 phút thì hai lần dựng có thể chồng nhau.
  - Ngoài-3: Phím End và Ctrl/Cmd + mũi tên phải đưa ô chọn sang cột ngoài màn hình mà bảng không cuộn theo.
  - Ngoài-4: Bài kiểm ba ô lọc chỉ chép vài căn đầu rồi kết luận cho cả danh sách.
  - Ngoài-5: Mục ghim / bỏ ghim cột trên menu tiêu đề chưa có tác dụng.
  - Ngoài-6: Góc nhìn lưu hỏng mà không báo khi trình duyệt không ghi được bộ nhớ trên máy.
  - Ngoài-7: Ô lọc số chưa hiểu khoảng gõ bằng chữ «5 đến 10»; gõ «5-10» vẫn dùng được.
  - Ngoài-8: Bài kiểm «căn chưa có giá nằm cuối khi sắp theo giá» không thật sự kiểm thứ tự ấy.
  - Ngoài-9: Đối chứng của bài kiểm tách góc nhìn theo sàn chưa thật, có thể không bắt được lỗi lộ góc nhìn.
