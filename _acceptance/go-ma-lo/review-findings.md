# Review findings: go-ma-lo (round 1)

## Trong hợp đồng

- **Hình dạng 4 (kiểm âm tính đứng một mình, không ghim thông điệp): phép phá thử AC-4 chỉ kiểm `length > 0` và không bao giờ chạm tới nhánh «hai lô ra một»**
  file: `packages/core/src/catalog/lot-lookup.test.ts:125`
  severity: medium
  AC: AC-4
  source: measurement
  detail: Dòng 125 chỉ có `assert.ok(kiemMaTran(buildLotIndex(KHU, [loiDay])).length > 0)`, không ghim nội dung thông điệp lỗi nào. Cách đọc lỗi dùng `blockPattern: "[A-Z]{2}"`. Đối chiếu với readLotCode trong lot-code.ts: các mẫu dayLo, lien và loDay đều neo hai đầu, nên với mẫu này cả 12 kiểu viết của mọi lô đều không đọc được. Ví dụ «LK1-02» không khớp `^[A-Z]{2}[sep]+\d{1,2}$` vì chữ «1» đứng sau «LK», «LK102» cũng không khớp `^[A-Z]{2}\d{2}$`. Kết quả là bộ tra trả unreadable, nên hàm kiemMaTran chỉ sinh lỗi «kiểu viết không đọc ra lô: …» và không bao giờ sinh «hai lô ra một: …». Lời hứa của AC-4 là hai lô không bao giờ ra một, do nhánh `kq.unit.upi !== lo.upi` ở dòng 50 kiểm. Nhánh này chưa từng được cho thấy là bắt được lỗi: phép kiểm dương ở dòng 122 (lọc theo tiền tố «hai lô ra một» ra rỗng) có thể rỗng vô nghĩa, còn phép phá thử vẫn xanh nhờ một loại lỗi khác. Ở evals.yaml, E4 có ghi thông điệp mong đợi («hai lô ra một: LK1-02 → LK2-02» hoặc «kiểu viết không đọc ra lô»), nhưng code không ghim chuỗi nào. Vì vậy phép đo cho AC-4 không chứng minh được rằng nó phát hiện được việc hai lô bị gộp thành một.
  rationale: AC-4 hứa hai lô không bao giờ ra một và phép đo của nó phải chứng minh bắt được lỗi gộp lô; phép phá thử hiện không chạm nhánh đó nên bằng chứng cho AC-4 không đủ.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Khi cách đọc mã của một khu lệch với danh mục, lô bị báo nhầm là «chưa có trong danh mục» mà không có lỗi nào**
  Người dùng thấy gì: Khi sau này thêm một khu mới mà cách đọc mã khai lệch với danh mục, đầu chủ gõ đúng mã vẫn bị báo lô chưa có, và không ai nhận ra lỗi cấu hình. Hiện chưa ai gặp vì chỉ có khu mẫu đã kiểm.
  Căn cứ: Hiện chưa ảnh hưởng người dùng nào vì chưa có khu thật, và chỉ hiện ra khi thêm khu mới, lúc đó sẽ sửa cùng việc nhận danh mục thật.
  file: `packages/core/src/catalog/lot-lookup.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên bố «số assert = số dòng» nhưng con đếm luôn đúng theo cách dựng): con đếm của AC-5 là phép so tự thoả**
  Người dùng thấy gì: Một con số đếm trong bộ kiểm luôn khớp dù có bỏ sót dòng, nên nó không báo được nếu bộ kiểm bị rút gọn. Việc kiểm từng mã gần trúng vẫn chạy bình thường, người dùng không bị ảnh hưởng.
  Căn cứ: Không ảnh hưởng người dùng, kiểm từng dòng vẫn bắt lỗi thật, và sửa chỉ làm đẹp con số đếm nên không đáng mở việc.
  file: `packages/core/src/catalog/lot-lookup.test.ts`
  severity: low
  Đề xuất: wont-fix

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
