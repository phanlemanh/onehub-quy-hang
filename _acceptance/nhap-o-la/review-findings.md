## Trong hợp đồng

- **Khuôn gói ô lạ ở máy chủ không kiểm `phep` theo thực đơn: phép lạ làm sập sau khi đã gọi Claude, không ghi ai_usage**
  file: `packages/core/src/import/ai/o-la/goi.ts:1471`
  severity: high
  AC: AC-2
  source: conventions
  detail: `kiemKhuonGoiOLa` chỉ kiểm `phep` là đối tượng có `name` là chuỗi. Nó không đối chiếu `TRANSFORM_NAMES`/`TRANSFORM_PARAMS` và không chặn khoá lạ trong `phep`/`params`, trái luật khuôn chặt («khoá lạ bị từ chối»). Kho đã có bộ kiểm đúng việc này là `kiemPhep` ở packages/core/src/import/plan.ts:57, nhưng bản mới tự viết một bản yếu hơn. Hậu quả có hai. (1) `phep.params` nhận chuỗi tuỳ ý dài bao nhiêu cũng được, và nó đi nguyên văn sang nhà cung cấp AI (`noiDung: goi` trong claude.ts) mà `quetGoiOLa` không quét trường `phep`. Một lời gọi tự dựng có thể gửi số điện thoại hay họ tên ra ngoài qua `phep.params.x`, lọt cả hai lần chặn. (2) Với `phep.name` ngoài thực đơn, `runTransform` (transforms.ts:354) rơi khỏi `switch` và trả `undefined`. Khi đó `lyDoLoai` đọc `r.mark` và ném TypeError ở `kiemDeXuatOLa` (cells/routes.ts:753). Chỗ này nằm SAU lời gọi Claude và TRƯỚC `ghi(...)`, nên lời gọi đã tốn tiền nhưng không vào `ai_usage` và route trả 500. Lặp lại thì vượt được trần tháng. Sửa: dùng lại `kiemPhep` (xuất từ plan.ts) trong `kiemKhuonGoiOLa`.

- **Gói có phep sai khuôn làm đề xuất ô lạ sập 500 sau khi đã trả tiền gọi Claude, và lần gọi đó không được ghi vào ai_usage**
  file: `packages/core/src/import/ai/o-la/goi.ts:101`
  severity: high
  AC: AC-9
  source: bugs
  detail: kiemKhuonGoiOLa chỉ kiểm phep là một đối tượng có name kiểu chuỗi. Nó không kiểm name có thuộc danh sách phép đóng hay không, cũng không kiểm params. Lỗi chỉ lộ ra sau khi đã gọi Claude, ở cells/routes.ts:101, khi kiemDeXuatOLa gọi normalizeValue với phép đó: (a) name lạ: runTransform rơi qua switch và trả undefined, nên `r.mark` trong lyDoLoai ném TypeError; (b) {name:"price"} không có params: price(raw, undefined) truy cập `params.unit` và ném TypeError. Cả hai lỗi đều không được bắt. Chúng ném sau `tl = await goiAi(...)` và trước `ghi(...)`, nên route trả 500 và không có dòng ai_usage nào. Tiền Claude đã tiêu mà không cộng vào daDungUsd, nên trần tháng không chặn được: một client gửi phep hỏng có thể gọi Claude không giới hạn. Ghi chú trong code nói «Phép biến đổi kiểm ở kiemDeXuatOLa bằng bộ chạy thật», nhưng thực tế ở đó không kiểm mà ném lỗi. Cách sửa: kiểm phep theo khuôn Transform (name thuộc danh sách đóng, params đúng khuôn) ngay ở kiemKhuonGoiOLa, trước khi gọi AI.

- **Máy chủ không quét các khoá khác trong phep: chữ bất kỳ (kể cả số điện thoại) vượt lần chặn thứ hai và tới Claude**
  file: `packages/core/src/import/ai/o-la/quet.ts:16`
  severity: medium
  AC: AC-2
  source: bugs
  detail: kiemKhuonGoiOLa chỉ đòi phep.name là chuỗi và nhận mọi khoá hay giá trị lồng khác trong phep, ví dụ {name:"price",params:{unit:"ty",ghiChu:"0900 000 011"}}. quetGoiOLa chỉ quét tieuDe, giaTri và lyDoMa, không quét phep. Sau đó khachOLaClaude gửi nguyên gói bằng JSON.stringify(goi). Vì vậy lần chặn ở máy chủ (ADR-0011 qđ 2) có một đường vòng: dữ liệu cá nhân nằm trong phep ra tới nhà cung cấp AI. Gói hàng 68 không mở chỗ chứa tự do kiểu này. Cách sửa: kiểm phep theo khuôn đóng của Transform, hoặc quét cả phep.

- **Hình 1 (đo chỉ dẫn thay vì đầu ra): MO_HINH_O_LA so với bản chép cục bộ, không với hằng máy chủ dùng**
  file: `packages/core/src/import/ai/o-la/do-o-la.test.ts:39`
  severity: high
  AC: AC-8
  source: measurement
  detail: Dòng 12 khai `const MO_HINH_O_LA = "claude-opus-5-5"` ngay trong tệp test, dòng 39 `assert.equal(MO_HINH_O_LA, "claude-opus-5-5")` so hằng với chính nó, nên không bao giờ đỏ. Lời hứa E8 (Hỏi-1) là đường ô lạ của máy chủ chạy Opus, tức hằng `MO_HINH_O_LA` ở packages/api/src/imports/ai/claude.ts:14, chỗ `khachOLaMacDinh` và routes.ts đọc. Đổi hằng máy chủ sang Haiku thì assert này vẫn xanh. Thêm nữa, `tinh.mo_hinh[MO_HINH_O_LA]` (chỗ chấm ngưỡng phủ/đúng/bịa) cũng lấy theo bản chép ấy, nên ngưỡng có thể được chấm trên mô hình khác với mô hình máy chủ gọi thật.

- **Hình 4 (âm tính một mình): số đo 'tự ghi' được dựng để không thể khác 0**
  file: `_acceptance/nhap-o-la/thu/do-o-la.ts:37`
  severity: medium
  AC: AC-8
  source: measurement
  detail: `tinhSoDoOLa` chụp `ap = applyPlan(table, plan, ctx)`, gọi `kiemDeXuatOLa` (hàm thuần, không nhận bảng hay kế hoạch), rồi chạy lại `applyPlan(table, plan, ctx)` trên cùng đầu vào và so JSON. Phép so ấy luôn bằng nhau, nên `tuGhi` luôn bằng 0 bất kể đề xuất là gì. Nó không đi qua đường nhận đề xuất của màn (hoiOLa / man-nhap) là nơi có thể tự áp. Assert `so.tuGhi === 0` ở do-o-la.test.ts:45 vì thế không có đối chứng dương nào chứng minh số đo có thể ra 1.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Lần chặn thứ hai ở máy chủ yếu hơn lần chặn ở trình duyệt: họ tên giữa câu và họ tên trong `lyDoMa` lọt**
  Người dùng thấy gì: Nếu có người gửi yêu cầu không qua màn hình thường, một họ tên chủ nhà nằm giữa câu có thể bị gửi sang bên AI. Người dùng bình thường qua màn hình thì đã được lọc.
  Căn cứ: Có thể làm lộ tên chủ nhà ra ngoài công ty nhưng chỉ khi đi đường vòng, và gửi đi rồi thì không rút lại được; sửa khá rẻ nên nên đăng việc riêng.
  file: `packages/core/src/import/ai/o-la/quet.ts`
  severity: medium
  Đề xuất: new-contract

- **Quét ở máy chủ yếu hơn bộ lọc trình duyệt: họ tên nằm giữa câu và nhãn [Tên] không bị chặn**
  Người dùng thấy gì: Một ô có tên chủ nhà kèm chữ khác, như «chủ [Tên] giữ», có thể qua cổng máy chủ nếu yêu cầu không đi từ màn hình thường, rồi tới bên AI.
  Căn cứ: Lộ tên chủ nhà ra ngoài công ty là nặng và không rút lại được, nhưng chỉ xảy ra khi đi đường vòng; sửa rẻ nên đăng việc riêng.
  file: `packages/core/src/import/ai/o-la/quet.ts`
  severity: medium
  Đề xuất: new-contract

- **Ô «chủ nhận về X» bỏ qua kiểm luật 12: đề xuất giá nào đọc được cũng qua**
  Người dùng thấy gì: Với ô kiểu «chủ nhận về 3,95 tỷ», máy có thể đề xuất một giá sai mà vẫn hiện ra cho người bấm «Dùng».
  Căn cứ: Người vẫn phải tự bấm «Dùng» và sửa tay được, nên không mất dữ liệu; chỉ thiếu một lớp kiểm cho một cách viết.
  file: `packages/core/src/import/ai/o-la/kiem.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 4 (âm tính một mình): 'sàn chưa bật thì không gọi khách' kiểm một bộ đếm không nối vào đâu**
  Người dùng thấy gì: Bài kiểm không chứng minh chắc là màn không gọi AI khi sàn tắt; chức năng thật có thể vẫn đúng.
  Căn cứ: Không ảnh hưởng người dùng trực tiếp, chỉ làm bài kiểm yếu; có thể củng cố sau.
  file: `apps/web/src/lib/nhap/o-la.test.ts`
  severity: high
  Đề xuất: known-limits

- **Hình 3 (kiểm 'có mặt' trong khi lời hứa là quan hệ): ma trận 6 mẫu × 3 chỗ không ghim loại trúng theo mẫu**
  Người dùng thấy gì: Sổ chi phí có thể ghi sai loại dữ liệu cá nhân bị chặn, dù việc chặn vẫn xảy ra.
  Căn cứ: Dữ liệu vẫn được chặn nên không lộ; chỉ sai nhãn thống kê, sửa sau được.
  file: `packages/api/src/imports/ai/cells/quet.ro-ri.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 3 (kiểm 'có mặt' trong khi lời hứa là quan hệ): 'thứ tự cột rồi dòng' chỉ xem hai phần tử đầu của một cột**
  Người dùng thấy gì: Với tệp có hơn 300 ô lạ, chưa chắc máy chọn đúng 300 ô theo thứ tự mong muốn.
  Căn cứ: Chỉ xảy ra với tệp rất lớn, ô bị bỏ vẫn sửa tay được và không mất dữ liệu.
  file: `packages/core/src/import/ai/o-la/goi.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 4 (âm tính một mình): đối chứng E4c không ghim lý do dòng bị bỏ**
  Người dùng thấy gì: Bài kiểm có thể xanh dù dòng bị bỏ vì lý do khác, nên chưa chứng minh chặt rằng ô giá cần người mới là nguyên nhân.
  Căn cứ: Không đổi hành vi với người dùng, chỉ làm bài kiểm lỏng; sửa sau rẻ.
  file: `apps/web/src/lib/nhap/test-db/o-la.db-test.mts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
