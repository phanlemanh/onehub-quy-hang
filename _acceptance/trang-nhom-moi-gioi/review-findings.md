## Trong hợp đồng

- **Phép kiểm «tối đa hai chữ số lẻ» dùng nhân số thực nên từ chối cả số hợp lệ (0.29, 1.15, 0.57…)**
  file: `packages/core/src/sharing/index.ts:687`
  severity: medium
  AC: AC-8
  source: conventions
  detail: validateShareInput kiểm bằng `Math.round(muc * 100) !== muc * 100`. Với số thực, 0.29*100 = 28.999999999999996 và 1.15*100 = 114.99999999999999, nên mức chia hợp lệ bị máy chủ trả 400 «tối đa hai chữ số lẻ». Đã chạy thử: 0.29, 1.15 và 0.57 đều bị từ chối. Cùng phép kiểm đó được chép lại ở `mucChiaGui` (apps/web/src/app/(app)/shares/new/gui.ts:200) và `docO` (settings/broker-page/thuan.ts:71). Kết quả là cả ô cài đặt lẫn ô ở màn Gửi đều báo lỗi sai với người dùng. Nên so bằng sai số (`Math.abs(Math.round(n*100) - n*100) < 1e-9`) hoặc kiểm trên chuỗi đã nhập. Nên gom về một hàm trong lõi thay vì ba bản chép. Lý do thuộc hợp đồng: AC-8 nói đặt mức chia trong 0–100 thì đọc lại thấy đúng giá trị, nhưng các số hợp lệ như 0,29 bị từ chối với lỗi 400.

- **Hinh dang 4 — assert khong the do: 'kem ly do' cua 400 duoc kiem bang `reason ?? "x"` (luon truthy)**
  file: `packages/api/test-db/trang-nhom-moi-gioi/trang-moi-gioi.test.ts:205`
  severity: high
  AC: AC-8
  source: measurement
  detail: Trong ca «môi giới: cài đặt sàn», dong `assert.ok(((await r.json()) as {reason?: string; error?: string}).reason ?? "x", "thiếu lý do")` khong bao gio do duoc: khi than tra ve khong co `reason` thi bieu thuc thanh "x" va assert van qua. evals.yaml E8 hua «120 và -1 → 400 kèm lý do», nhung ly do khong bi ghim, ca chuoi lan su co mat cua khoa. Ve do-luong, 400 chi duoc do bang ma trang thai, con loi hua ve ly do khong co phep do nao. Lý do thuộc hợp đồng: AC-8 yêu cầu giá trị ngoài 0–100 bị trả 400 kèm lý do, mà phép kiểm lý do không đo được gì.

- **Hinh dang 1 — do hang so chu thay vi dau ra da dung: dong «tải lỗi» cua E10c**
  file: `apps/web/src/app/s/broker/bang.test.ts:208`
  severity: medium
  AC: AC-10
  source: measurement
  detail: Bang sau trang thai co dong `["tải lỗi", "Chưa tải được tệp — thử lại", CHU_MG.taiLoi]`: cot "html dung" chinh la hang so `CHU_MG.taiLoi` lay tu chu.ts, khong phai markup dung tu NutTai. Phep `ra.includes(chu)` vi the chi so hang so voi mot ban chep cua no. Neu nut-tai.tsx thoi hien `CHU_MG.taiLoi` (dong 41) thi ca van xanh. evals.yaml E10c hua «mỗi dòng dựng thành phần ở trạng thái ấy và tìm đúng chuỗi». Ca van dem 6/6 nhu the da do du sau trang thai. Lý do thuộc hợp đồng: AC-10 đòi mỗi trạng thái, trong đó có tải tệp lỗi, có đúng chữ trên màn; phép kiểm chỉ so hằng số với chính nó.

- **Hinh dang 3 — anh chi dem so o, khong kiem thu tu va gia tri dong can; thieu ca an muc chia tren anh**
  file: `apps/web/src/app/s/broker/bang.test.ts:196`
  severity: medium
  AC: AC-6
  source: measurement
  detail: Ca «môi giới: ảnh vẽ đúng cột và dòng» chi ghim dau va tieu de cot. Cac dong can chi duoc kiem bang `assert.equal(sau.length, m.cot.length * (1 + than.dong!.length), "ảnh thiếu ô")`, tuc la mot phep dem. evals.yaml E6 hua quan he «ba dòng căn theo thứ tự … phần đầu như Excel; thân ẩn mức chia → không dòng mức chia». Bo ve doi cho o, ve sai gia tri hay dao thu tu dong van qua. Nhanh than an muc chia cung khong duoc chay qua veMoiGioi trong bai nay (an chi duoc kiem tren moHinhTep o ca Excel). Lý do thuộc hợp đồng: AC-6 đòi ảnh vẽ đúng các cột, các dòng và phần đầu như Excel, nhưng bài chỉ đếm số ô.

- **Hinh dang 5 — bang muc chia o API lech ma tran viet truoc cua E3**
  file: `packages/api/test-db/trang-nhom-moi-gioi/trang-moi-gioi.test.ts:146`
  severity: medium
  AC: AC-3
  source: measurement
  detail: evals.yaml E3 khai ma tran: (mac dinh 50, gui khong sua) → trang 50 · gui 40 → 40 · trong → khong khoa · doi mac dinh 30 → van 40 · khach rieng kem 40 → 400. Moi dong mot assert, dem bang so dong. BANG trong test lai la [gửi 40, gửi 12,5, để trống, không gửi khoá → null]. Dong «mặc định 50 → trang 50» khong co, va dong «không gửi khoá» con assert dieu nguoc lai (null). Hai dong «đổi mặc định» va «khách riêng → 400» nam ngoai bang nen `dem === BANG.length` khong phu ma tran da tuyen. Lý do thuộc hợp đồng: AC-3 nêu rõ mặc định giữ, sửa, sàn đổi mặc định về sau và khách riêng không mang mức chia; bảng kiểm lệch ma trận này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Gửi bộ khi ô mức chia sai làm màn Gửi kẹt ở trạng thái «đang tạo» mãi**
  Người dùng thấy gì: Nếu người gửi gõ mức chia không hợp lệ rồi bấm Gửi, nút Gửi bị treo ở «Đang tạo link…» và không bấm lại được dù đã sửa ô.
  Căn cứ: Không mất dữ liệu và người dùng tự gỡ được bằng cách tải lại trang, chỉ gặp khi gõ sai ô mức chia.
  file: `apps/web/src/app/(app)/shares/new/man-gui.tsx`
  severity: medium
  Đề xuất: known-limits

- **Khuôn cấu hình điểm #15 nhận số lẻ quá hai chữ số, khác ràng buộc numeric(5,2) và khác bộ kiểm Lần gửi: một mặc định xấu chặn mọi lần gửi nhóm môi giới**
  Người dùng thấy gì: Quản trị sàn có thể lưu mức chia mặc định có nhiều chữ số lẻ, và sau đó mọi lần gửi cho nhóm môi giới mà không sửa ô sẽ báo lỗi tạo link.
  Căn cứ: Hiếm gặp vì giao diện đã chặn và chỉ xảy ra khi gọi thẳng đường lưu; quản trị sàn sửa lại giá trị là hết, không mất dữ liệu.
  file: `packages/core/src/config/khuon.ts`
  severity: medium
  Đề xuất: known-limits

- **Gửi khi ô Mức chia sai làm nút Gửi kẹt ở «Đang tạo link…» vĩnh viễn**
  Người dùng thấy gì: Gõ mức chia sai rồi bấm Gửi làm nút kẹt ở «Đang tạo link…» và không gửi được nữa nếu không tải lại trang.
  Căn cứ: Không mất dữ liệu, tải lại trang là gỡ được, và chỉ xảy ra khi người gửi nhập sai ô mức chia.
  file: `apps/web/src/app/(app)/shares/new/man-gui.tsx`
  severity: high
  Đề xuất: known-limits

- **Mức chia mặc định của sàn mất lặng lẽ khi gửi trước lúc tải xong cài đặt, hoặc khi tải lỗi**
  Người dùng thấy gì: Nếu người gửi bấm Gửi quá sớm hoặc mạng lỗi lúc tải cài đặt, bộ gửi đi sẽ không có mức chia dù sàn đã đặt mặc định, và không có câu báo nào.
  Căn cứ: Chỉ xảy ra khi bấm cực nhanh hoặc mạng lỗi, nhưng bộ đã gửi thì không sửa lại được mức chia; số ca ít nên chấp nhận.
  file: `apps/web/src/app/(app)/shares/new/man-gui.tsx`
  severity: low
  Đề xuất: known-limits

- **Hinh dang 3 — gia ra cua tung can duoc ghim bang chi so cung, khong so voi banRaNgoai cua chinh can**
  Người dùng thấy gì: Bài kiểm tra giá hiển thị của từng căn so với vị trí cố định thay vì luật ẩn giá, nên có thể báo sai nếu luật giá đổi về sau.
  Căn cứ: Không ảnh hưởng người dùng hiện tại, chỉ làm bài kiểm dễ báo nhầm khi luật đổi; sửa sau cũng rẻ.
  file: `packages/api/test-db/trang-nhom-moi-gioi/trang-moi-gioi.test.ts`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
