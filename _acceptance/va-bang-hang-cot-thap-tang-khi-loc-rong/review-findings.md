# Review findings: va-bang-hang-cot-thap-tang-khi-loc-rong (round 1)

## Trong hợp đồng

- **Trạng thái giuBoCot không được đặt lại khi áp góc nhìn, nên nhánh «mở góc nhìn đã rỗng» của AC-6 bị bỏ qua**
  AC: AC-6
  file: `apps/web/src/app/(app)/inventory/bang-hang.tsx:287`
  severity: medium
  source: conventions
  detail: apCachXem là chỗ duy nhất đặt lại trạng thái theo góc nhìn (loc, cot, sap, nhom, expanded, locMo), nhưng giuBoCot mới thêm ở dòng 345 không nằm trong đó. Khi chuyển trang phía máy khách tới /inventory/views/<id>, danh sách đã có trong bộ đồng bộ và phamVi đã đặt sẵn. Lượt dựng đầu vì vậy chạy với loc = {}: daLoc là toàn bộ dòng, tinhBoCot ghi giu theo toàn bộ dòng, rồi useEffect mới gọi apCachXem. Nếu góc nhìn ra rỗng, tinhBoCot trả về giu vừa ghi (bộ cột của toàn sàn), không rơi vào nhánh «chỉ lọc Loại hình». Hệ quả: góc nhìn Đất ra rỗng trên sàn có hàng trộn sẽ hiện cả Tầng, Hướng, Loại căn, trái AC-6. Kết luận này đến từ đọc luồng code, chưa chạy trên màn. Bài E4b không bắt được vì hàm chạy bắt đầu với giu = null và vào thẳng bộ lọc của góc nhìn, không qua lượt loc = {} như màn thật. Hướng sửa: đặt lại giuBoCot về null trong apCachXem và thêm ca kiểm cho trình tự này.

- **Bài E4b bật closePrice, không phải cột của loại hình như evals.yaml mô tả**
  AC: AC-6
  file: `apps/web/src/app/(app)/inventory/cot-khi-loc-rong.test.ts:121`
  severity: low
  source: conventions
  detail: Phần expected của E4b trong evals.yaml ghi «bật cột của loại hình đang hiện thì có», nhưng bài kiểm thêm closePrice. closePrice là cột chung, không có trong COT_THEO_TRUONG, nên không đi qua luật ẩn theo loại hình. Vế bật lại một cột loại hình lúc bảng rỗng (ví dụ tắt rồi bật lotSizeArea) chưa được đo như bằng chứng E4b khai. Cần sửa bài kiểm cho đúng mô tả, hoặc sửa mô tả cho đúng điều đang đo.

- **Mở góc nhìn đã rỗng từ trong app: bộ cột theo toàn bộ dòng, không theo dòng chỉ lọc Loại hình (trái AC-6)**
  AC: AC-6
  file: `apps/web/src/app/(app)/inventory/bang-hang.tsx:346`
  severity: medium
  source: bugs
  detail: Nhánh AC-6 của tinhBoCot (loc.ts:81) chỉ chạy khi giu = null, nhưng khi bấm một góc nhìn đã lưu từ trong app thì giu đã có giá trị trước lúc bộ lọc được áp. Trình tự: `loc` khởi tạo {} (dòng 277) và góc nhìn chỉ được áp trong useEffect sau lần commit đầu (dòng 299-304, apCachXem). Bộ đồng bộ nằm ở vỏ (components/shell/app-shell-dong-bo.tsx) nên còn dòng trong bộ nhớ khi chuyển trang bằng router.push hoặc link ở second-column.tsx:155. Lần render đầu vì vậy có daLoc = toàn bộ dòng, và dòng 347 ghi giu = bộ cột của toàn sàn. Effect áp bộ lọc xong, daLoc rỗng, tinhBoCot trả lại giu đó thay vì boCotCua(các dòng chỉ lọc Loại hình). Đã chạy mô phỏng đúng hai bước này với dòng trộn căn hộ + đất và góc nhìn {propertySubType: 'Unimproved Land', lotSizeArea: '>99999999'}: kết quả an = ['storiesTotal'], trong khi AC-6 cho an = ['unitType','livingArea','floor','directionFaces','storiesTotal']. Bảng rỗng của góc nhìn Đất vì thế hiện cả cột căn hộ (Loại căn, Diện tích, Tầng, Hướng). Với góc nhìn Loại hình = Căn hộ đã rỗng trên sàn trộn, cột đất cũng hiện và tiêu đề là «Vị trí» thay vì «Toà». Tải lại cứng thường không dính vì dòng đến sau khi góc nhìn đã áp. Bộ kiểm E4b không bắt được: ca «mở bảng đã rỗng» gọi chay() với giu = null ngay bước đầu, không dựng bước loc = {} có dòng mà màn thật đi qua. Hướng sửa: đặt lại giu về null trong apCachXem (setGiuBoCot(null)), và thêm ca kiểm đi qua bước {} rồi mới áp góc nhìn.

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ có điểm-case): mọi dãy bước chỉ có đúng một bước còn dòng trước khi rỗng, nên «bước liền trước» không phân biệt được với «bước đầu tiên»**
  AC: AC-1
  file: `apps/web/src/app/(app)/inventory/cot-khi-loc-rong.test.ts:56`
  severity: medium
  source: measurement
  detail: E1 ghi «mỗi ca chạy qua hàm bước thật từng phím», AC-1 hứa bộ cột bằng đúng bước liền trước, chú thích của tinhBoCot hứa «lần gần nhất còn dòng». Sáu hàng CA_RONG (dòng 56-61) đều là dãy hai bước [có dòng, rỗng]. Ca «trộn đã co theo Số tầng» (dòng 61), ca mà gap-probe P1 yêu cầu thêm, bắt đầu luôn ở {storiesTotal: ">=1"} và bỏ bước {} mà màn luôn đi qua trước. Các ca E2, E3, E4, E4b cũng không có hai bước còn dòng liên tiếp rồi mới rỗng. Trục «giữ phải được cập nhật giữa hai bước còn dòng» vì thế không có phần tử nào trong bảng. Đã kiểm bằng đột biến trên bản sao: đổi nhánh có dòng của tinhBoCot (loc.ts) thành `return { boCot, giu: giu ?? boCot }`, tức chỉ nhớ lần đầu, thì bộ kiểm vẫn pass 5/5, fail 0. Trên màn thật, đột biến này làm bảng lọc Đất rồi rỗng quay về bộ cột trộn của lần mở trang. Chỉ E5 ca2 bắt được, mà E5 là lần nhìn màn một lần, không nằm trong bộ test chạy lại. Cần thêm hàng có bước rộng đứng trước bước đã co, ví dụ [{}, LOAI_DAT, rỗng] và [{}, {storiesTotal:">=1"}, rỗng].

- **Hình dạng 3 (assert «có mặt» trong khi lời hứa là quan hệ): E4b đo bật cột bằng closePrice, cột không bao giờ bị loại hình ẩn, và đo «tiêu đề không đổi» bằng hằng trên đối tượng trước khi bật tắt**
  AC: AC-6
  file: `apps/web/src/app/(app)/inventory/cot-khi-loc-rong.test.ts:122`
  severity: low
  source: measurement
  detail: AC-6 hứa một quan hệ: «cột vừa bật hiện nếu không bị loại hình ẩn». E4b ghi rõ «bật cột của loại hình đang hiện thì có». Dòng 121-122 chỉ thêm closePrice rồi `assert.ok(bat.includes("closePrice"))`. closePrice không có trong COT_THEO_TRUONG (loai-hinh.ts), nên nó nằm ngoài quan hệ với tập cột bị ẩn và assert này không chạm vế điều kiện. Không có assert nào cho cột loại hình đang hiện được bật lại, ví dụ tắt lotSizeArea rồi bật lại. Cũng không có assert cho vế ngược, ví dụ `floor` đang bị ẩn với Đất thì bật vẫn không hiện. Dòng 123 `assert.equal(rong.viTri, "Vị trí")` so hằng trên `rong` lấy trước khi bật tắt, và các lệnh bật tắt không đi qua tinhBoCot, nên «tiêu đề vị trí không đổi» của E4b không có đường nào để fail.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 6 (đo chỗ cố định thay vì cây đang kiểm): E5 nhận bất kỳ máy dev nào đang nghe cổng 3496, không xác minh máy đó chạy từ worktree đang chấm**
  Người dùng thấy gì: Bài nhìn màn có thể vô tình chụp một bản chạy cũ từ nơi khác, làm kết quả nghiệm thu trông đúng dù bản đang chấm chưa được nhìn. Người dùng cuối không bị ảnh hưởng.
  Căn cứ: Chỉ ảnh hưởng độ tin cậy của bước kiểm nội bộ, chưa thấy lệch thật, và người kiểm có thể tự tắt máy cũ rồi chạy lại nên nhẹ.
  file: `_acceptance/va-bang-hang-cot-thap-tang-khi-loc-rong/thu/dung.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
