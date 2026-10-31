# ADR-0018: Cấu hình theo sàn — khai báo có rào

Ngày: 2026-11-01 · Trạng thái: **đề xuất** (Hỏi-1..3 chờ chủ kho) · Liên quan: Tham chiếu §4 «Cấu hình sàn», §7, §8 luật
7, 13, 17, 18, 20, 24, 25, §12, §13; Kiến trúc §0, §1; bất biến 1–4; ADR-0008 (một đường ghi, sự kiện chỉ thêm), ADR-0010
(lớp nguồn), ADR-0011 (nhập dữ liệu, từ điển của sàn), ADR-0016 (bộ trường theo loại hình); hàng 22, 23, 25, 31, 44–50,
67–71 của lộ trình · sổ: [Sổ điểm biến thiên](../architecture/so-diem-bien-thien.md) · đề xuất hàng:
[Bản phạm vi cấu hình theo sàn](../plan/pham-vi-cau-hinh-theo-san.md)

## Bối cảnh

Chủ kho, 31/10–1/11: «trước đây sự thiếu linh hoạt thường mang lại thất bại và Quỹ hàng được thiết kế cho nhiều sàn/công
ty sử dụng nên sự đa dạng cách dùng và phương pháp… như cách một công ty SaaS thiết kế hệ thống: Metadata-driven
architecture, Multi-tenant, Custom objects/custom fields… Rules engine, Workflow engine, API-first». Chủ kho chọn mở
phiên thiết kế này. Giám sát đợt `dau-chu-dong-vao` khuyến nghị hướng «khai báo có rào»; phiên này kiểm lại trên vật
thật và phản biện ở mục «Khác khuyến nghị của giám sát».

Đã kiểm ngày 01/11 trên `main` 611df45, nhánh đang chạy của dãy L (hàng 25, `claude/dcdv-l-25-chia-lead` 2c0a7cf) và dãy
D (hàng 72, PR #45):

- **Đã có, không phải làm lại**: nhiều sàn trên một nền với luật theo dòng và bộ kiểm cách ly (bất biến 1, ADR-0005);
  API một cửa `/api/v1`, một đường ghi (ADR-0008); kết nối là thoả thuận có trần lớp dữ liệu
  (`packages/core/src/agreements.ts`, `data-classes.ts`); sáu trạng thái chuẩn ở lõi (`listing/status.ts`).
- **Tham chiếu đã chọn mức linh hoạt**: §7 ba lớp (lõi chuẩn · cách gọi riêng · trường riêng có / không và chọn một),
  «không đối tượng mới, không công thức, không bố cục tự dựng»; chốt 29/10 «con số và lựa chọn trong tab này là mặc
  định dựng sẵn, sàn chỉnh được ở Cài đặt sàn; chỉ bất biến là không mở». Kiến trúc §0: «SaaS dọc theo ngành, không
  ngang như Salesforce».
- **Dữ liệu-là-cấu-hình đã có mầm**, cùng một kiểu — bảng dữ liệu ở lõi, hàm đọc không đổi khi thêm dòng: cách đọc mã
  căn theo khu (`UNIT_CODE_RULES`, hàng 9), bộ trường theo loại hình (`PROPERTY_SUBTYPE_FIELDS`, hàng 72), bảng 12 ô «ai
  thấy nguồn» đo cùng lúc luật ở lõi và luật ở cơ sở dữ liệu (`access/bang-xem-nguon.json`, hàng 11), từ điển giá trị
  của sàn (ADR-0011 quyết định 12).
- **Chỗ hở**: chưa có một chỗ khai các điểm sàn được chỉnh. Mỗi hàng đang tự viết hằng số: `CALL_BACK_AFTER_DAYS = 14`
  (`listing/freshness.ts`, main), `DEFAULT_LEAD_DEADLINES` 15/30 phút (`routing/index.ts`, nhánh hàng 25 — commit
  2c0a7cf đã ghi «chỗ khai duy nhất; SQL và lối API không chép lại con số»), ngưỡng ép giá 10 ngày (hàng 22 sắp dựng),
  điều kiện Sẵn sàng bán (hàng 23 sắp dựng). Sáu hàng Cài đặt sàn 45–50 (P1) sẽ phải gom lại; không hàng nào của 45–50
  đứng trên một chỗ khai chung.
- **Kiểm kê**: 27 điểm mở hay đề xuất, 5 ứng viên chưa mở, 19 điều khoá — từng dòng kèm nguồn ở
  [Sổ điểm biến thiên](../architecture/so-diem-bien-thien.md). 3 điểm đã có trong mã hay nhánh, đều khai một chỗ, chưa
  đọc theo sàn.
- **Hàng 25 đã cho thấy hình**: lõi giữ luật và mặc định, cơ sở dữ liệu chở dữ kiện, SQL không chứa con số (migration
  011 không có số phút nào). Thẻ Cổng Phạm vi của 25 tự sửa một lần máy «tự chốt luật chia đều theo vòng» thành câu hỏi
  cho chủ kho vì «đây là chuyện thu nhập của đầu chủ» — luật chia lead là phán xét của sàn, không phải tham số máy chọn.

## Quyết định đề xuất

1. **Một sổ điểm biến thiên ở lõi — dữ liệu, không mã rẽ nhánh.** `packages/core/src/config/` giữ một bảng: mỗi điểm
   một khoá, kiểu, mặc định, khoảng cho phép, vai được đổi, cấp ghi đè dưới sàn, hiệu lực (`mới` / `tính lại`), lớp dữ
   liệu, nhãn và lời giải thích cho màn. Khuôn của từng giá trị là một lược đồ zod sinh từ dòng ấy. Sổ ở tài liệu
   ([Sổ điểm biến thiên](../architecture/so-diem-bien-thien.md)) và sổ ở mã khớp nhau bằng một bộ kiểm.
   - So: (B) sổ là bảng trong cơ sở dữ liệu (`config_keys`) — đổi sổ không cần phát hành, nhưng một điểm mới luôn đi
     kèm mã đọc nó, nên phát hành là bắt buộc dù sổ nằm đâu; và lõi mất khả năng kiểm không cần cơ sở dữ liệu. (C) tệp
     YAML/JSON ngoài mã — thêm một bộ đọc, mất kiểu chặt của TypeScript.
   - Khuyến nghị (A). Căn cứ: cùng kiểu với ba bảng dữ liệu đã chạy ở lõi (hàng 9, 11, 72); luật «TypeScript chặt» của
     kho; hàng 25 đã đặt số ở lõi và không chép vào SQL.
2. **Lõi không đọc cấu hình — nhận làm tham số.** Như «lõi không đọc đồng hồ» (`freshness.ts`): mỗi hàm luật nhận bộ
   cấu hình đã giải (mặc định ⊕ giá trị của sàn) từ người gọi. API giải cấu hình của sàn đang làm một lần mỗi lời gọi
   (hay lấy từ bộ đệm theo phiên bản cấu hình); hàm SQL nhận số làm tham số, không tự đọc bảng cấu hình, không giữ mặc
   định. Hằng số đang có (`CALL_BACK_AFTER_DAYS`, `DEFAULT_LEAD_DEADLINES`) thành mặc định của sổ.
   - So: (B) hàm luật tự tra cấu hình theo mã sàn — gọn ở chỗ gọi, nhưng lõi phải biết cơ sở dữ liệu và bộ ca kiểm phải
     dựng sàn giả. (C) giữ hằng số, mỗi hàng tự thêm tham số khi cần — đúng là chỗ hở hôm nay.
   - Khuyến nghị (A). Căn cứ: `freshness(lastConfirmedAt, today)` và hàm chọn người của hàng 25 đã nhận dữ kiện từ ngoài;
     bộ ca kiểm thuần chạy không cần Postgres.
3. **Giá trị của sàn: bảng khoá–giá trị có sự kiện, sàn chưa đổi thì nhận mặc định.** Hai bảng, cả hai bật và ép luật
   theo dòng theo `app.current_company_id()`:
   - `company_config_events` — chỉ thêm (trigger chặn sửa, xoá như `listing_events`): sàn, khoá, giá trị `jsonb`, người,
     vai, lúc. Mỗi lần đổi một dòng — đây là «mọi thay đổi vào nhật ký» của Tham chiếu §4.
   - `company_config` — bản hiện hành (sàn, khoá, giá trị, phiên bản), ghi cùng giao dịch với sự kiện qua một lệnh API.
     **Không có dòng = mặc định của sổ**: sàn chưa chạm điểm nào thì đi theo mặc định dựng sẵn, kể cả khi sản phẩm đổi
     mặc định (đổi mặc định là sửa Tham chiếu và sổ, qua PR).
   - Lệnh API kiểm khoá có trong sổ, giá trị đúng khuôn và trong khoảng, vai được đổi; sai → 400 nêu đúng khoá. Cơ sở dữ
     liệu chặn thêm một tầng: cột lớp dữ liệu của dòng không bao giờ là `source` (ràng buộc `check`, như trần ở
     ADR-0010).
   - Đối tượng cấu hình có nhiều dòng (từ điển giá trị, nhãn trạng thái, định nghĩa trường riêng, mẫu file, mẫu bài) có
     bảng riêng của hàng tương ứng (ADR-0011 đã đặt `company_value_aliases`, `import_templates`); sổ khai khoá `map` để
     biết chúng có, khuôn và giới hạn của chúng.
   - So các lối lưu:

     | Lối | Được | Mất |
     | --- | --- | --- |
     | **A. Khoá–giá trị `jsonb` + sự kiện, khuôn ở sổ** — chọn | Thêm điểm không cần migration; lịch sử từng khoá; hai người đổi hai khoá không giẫm nhau; cùng hình với lõi hàng (ADR-0008) | Cơ sở dữ liệu không biết kiểu từng khoá — kiểu kiểm ở API theo sổ |
     | B. Một dòng mỗi sàn, cả cấu hình là một khối `jsonb` | Một lần đọc | Hai lần đổi cùng lúc ghi đè nhau; lịch sử phải so khối; khó chặn theo khoá |
     | C. Bảng có kiểu, một cột mỗi điểm | Cơ sở dữ liệu kiểm kiểu, khoảng | Mỗi điểm mới là một migration T3; cột thưa dần theo số điểm; không có lịch sử nếu không thêm bảng |
     | D. EAV có kiểu (`value_int`, `value_text`…) | Kiểu ở cơ sở dữ liệu mà không cần cột mới | Hai nơi giữ kiểu (cột nào và sổ); đọc phải ghép; lợi ích của C mà không đủ chặt |

   - Khuyến nghị (A). Căn cứ: 21 trong 27 điểm là giá trị đơn nhỏ (sổ, mục «Đếm»); điểm nào cơ sở dữ liệu phải tự giữ
     luật thì đã đi đường riêng — trần lớp ở ràng buộc, quyền nguồn ở `app.can_see_source` — không qua cấu hình.
4. **Hiệu lực khai theo từng điểm.** `tính lại`: đọc lúc tính, áp ngay cho mọi thứ (ngưỡng hàng đợi, cách hiện trang
   khách). `mới`: đối tượng ghi lại số cấu hình lúc tạo — lead mang hạn của lúc chia, giá bao phí mang định nghĩa và tỉ
   lệ lúc tính, bộ gửi mang mức chia lúc gửi. Đổi sau không sửa số đã lưu (luật 13; hàng 48 «đổi chỉ áp cho lead mới»;
   Tham chiếu §4 «không sửa số đã lưu»).
   - So: (B) mọi điểm `tính lại` — gọn, nhưng sàn đổi hạn từ 15 lên 30 phút thì lead đang quá hạn tự hết quá hạn, giá
     bao phí cũ đổi nghĩa lặng lẽ — trái luật 13. (C) mọi điểm `mới` — mỗi đối tượng phải chở bản sao cả cấu hình.
   - Khuyến nghị (A).
5. **Luật nghiệp vụ: tham số có kiểu trước; luật dựng sẵn chọn một khi sàn khác hình; bảng quyết định chỉ khi có số đo.**
   Ba bậc, mở bậc sau chỉ khi bậc trước hụt:
   1. **Tham số** (số, có / không, tập con) cho mọi điểm của phần A sổ — đủ cho 21 giá trị đơn.
   2. **Chọn một luật dựng sẵn** (`enum`) khi các sàn khác nhau ở hình của luật, không chỉ ở con số: `lead.routingRule`
      bản đầu một giá trị — cùng chủ trước, rồi đầu chủ phụ trách toà lâu chưa được chia nhất (hàng 25 AC-1). Luật thứ
      hai (chia đều, theo tải, theo ca) là một hàm mới ở lõi, có bộ ca riêng, thêm vào `enum`.
   3. **Bảng quyết định** ở một điểm đã biết: dữ kiện cố định của điểm ấy (khu, toà, loại hình, khoảng giá, nhu cầu…),
      phép so cố định (`=`, `∈`, `<`, `≤`, `giữa`), khớp dòng đầu, dòng cuối luôn là «mọi trường hợp» = mặc định, kết quả
      phải nằm trong khoảng của sổ. Không ngôn ngữ kịch bản, không biểu thức tự viết. Chưa mở ở bản đầu (mục chờ CH6).
   - So: (B) bộ luật tổng quát (JSONLogic, CEL hay một máy luật) cho mọi điểm — sàn tự viết được mọi thứ, nhưng mỗi
     luật sàn viết là một chương trình máy chấm không chứng được trước (mục 6), trợ lý AI và người dựng phải đọc luật
     của từng sàn mới biết hệ thống làm gì, và trái «không công thức» của §7. (C) chỉ tham số, không bao giờ luật — sàn
     thứ hai chia lead khác hình thì không chiều được.
   - Khuyến nghị (A) theo ba bậc. Căn cứ: hàng 25 Hỏi-5 — luật chia lead là chuyện thu nhập, chủ kho quyết từng luật,
     không phải máy cho sàn tự viết; bảng 12 ô `bang-xem-nguon.json` cho thấy bảng quyết định của mình chạy được và
     chấm được khi cần.
6. **Máy chấm chứng minh hành vi khi cấu hình đổi** — điều kiện cho mọi hàng thêm hay đọc một điểm:
   - **Hai điểm và hai biên**: mỗi điểm mở có ca ở mặc định, ở một giá trị khác trong khoảng, ở hai biên của khoảng;
     giá trị ngoài khoảng → 400 nêu khoá. Hàm luật nhận cấu hình làm tham số (quyết định 2) nên ca là ca thuần của lõi.
   - **Cấu hình mở nhất**: bộ kiểm rò rỉ trang khách (hàng 31) và bộ kiểm rò nguồn ra AI (ADR-0011) chạy trên cấu hình
     đặt mọi khoá về phía hiện nhiều nhất (mọi `bool` của trang khách bật, mọi trường riêng bật chia sẻ): vẫn không
     trường nội bộ hay nguồn nào ra. Bất biến đứng được ở cấu hình xấu nhất thì đứng được ở mọi cấu hình.
   - **Mới và cũ**: điểm `mới` có ca đổi cấu hình giữa hai lần tạo — đối tượng trước giữ số cũ, đối tượng sau mang số
     mới.
   - **Cách ly**: bộ kiểm cách ly có ca cho hai bảng cấu hình — sàn B không đọc, không ghi cấu hình của A; việc nền chạy
     cho A dùng cấu hình của A.
   - **Sổ khớp**: bộ kiểm so khoá ở sổ tài liệu và sổ ở mã; không khoá nào lớp `source`.
7. **Luật mở một điểm, và những gì không làm.**
   - Một điểm vào phần A của sổ khi **(a)** Tham chiếu đã chốt là mặc định của sàn, hoặc **(b)** hai sàn khác nhau thật
     cần hai giá trị khác nhau. Một ý của một sàn, hay «biết đâu sau này cần», vào phần B (ứng viên) kèm điều kiện mở
     lại. Bất biến (Kiến trúc §0, bốn dòng) không bao giờ có khoá.
   - **Không làm** cho tới khi có số đo từ ít nhất hai sàn thật cho thấy ba lớp của §7 cộng ba bậc của quyết định 5 không
     đủ: đối tượng do sàn tự tạo, trường công thức, luồng việc tự vẽ, kịch bản do sàn viết (mục chờ CH12). Lý do: mỗi
     thứ ấy là một ngôn ngữ lập trình đưa cho sàn — máy chấm không chứng được hành vi, luật ẩn và trần lớp không biết
     trường mới thuộc lớp nào, và trợ lý AI nhập dữ liệu không có đích chuẩn để ghép.
   - Kiến trúc §0 «SaaS dọc theo ngành» giữ nguyên; ADR này là cơ chế của dòng «Cấu hình công ty» trong bảng tầng ở
     §0, không thêm tầng.
8. **Trường riêng: `jsonb` trên phần lần rao + bảng định nghĩa theo sàn; không EAV.** Giá trị trường riêng nằm trong
   một cột `jsonb` của bản hàng, khoá theo mã trường (không theo tên — đổi tên không đổi dữ liệu); lựa chọn của «chọn
   một» có mã bền. Đổi giá trị là một sự kiện của hàng như mọi phần lần rao (ADR-0008). Bảng định nghĩa mang lớp
   `custom_field` cố định — ràng buộc chặn mọi lớp khác. Giới hạn đề xuất: 20 trường, 30 lựa chọn mỗi trường (sổ #22).
   - So: (B) EAV — một bảng `listing_custom_values` mỗi ô một dòng: lọc nhiều trường phải ghép nhiều lần; bộ đồng bộ
     xuống máy phải gấp lại; sự kiện của hàng phải ghi hai nơi. (C) thêm cột thật cho từng trường của từng sàn — migration
     theo ý sàn, trái cách ly lược đồ chung.
   - Khuyến nghị (A). Căn cứ: Kiến trúc §1 đã ghi «trường riêng là một cột linh hoạt kèm bảng định nghĩa theo sàn»;
     bảng hàng đọc từ kho trên máy (hàng 13) nên một cột gói sẵn đi xuống máy không cần ghép.
9. **Bảng hàng, bộ lọc, ghép cột đọc «bộ trường của sàn», không đọc sổ điểm biến thiên.** Hai sổ khác nhau: sổ điểm
   biến thiên nói sàn chỉnh được gì; **bộ trường của sàn** là một hàm của lõi ghép ba nguồn — trường chuẩn theo loại hình
   (ADR-0016), nhãn riêng (#18), trường riêng (#22) — trả danh sách trường kèm nhãn, kiểu, lựa chọn, lớp. Bảng hàng
   (14, 79), bộ lọc, ghép cột nhập file (65, 67), mẫu phát hàng (43, 50) cùng đọc hàm ấy; hàng 45 dựng nó, hàng 47 nối
   trường riêng vào. Cấu hình hiện hành của sàn (vài KB) đi xuống kho trên máy cùng lần kéo đồng bộ, để màn đọc nhãn
   không chờ mạng.
10. **Màn Cài đặt sàn đọc sổ để dựng ô, không tự dựng bố cục.** Ô của một giá trị đơn (số kèm đơn vị, có / không, chọn
    một, tập con) dựng từ dòng sổ: nhãn, lời giải thích, khoảng, mặc định, «Trả về mặc định». Bố cục từng màn theo phác
    thảo S1–S6 và khuôn nhóm Cài đặt sàn (hàng 58); sàn không tự xếp màn (§7 «không bố cục tự dựng»).

## Chạm bốn bất biến

| Bất biến | Chạm ở đâu | Rào |
| --- | --- | --- |
| 1. Cách ly giữa công ty | Hai bảng cấu hình mới; bảng định nghĩa trường riêng; việc nền đọc cấu hình theo sàn | Luật theo dòng `enable` + `force`; ca trong bộ kiểm cách ly; việc nền nhận cấu hình của đúng sàn đang chạy (quyết định 6) |
| 2. Thông tin chủ nhà không rời công ty | Nhãn và lựa chọn là chữ sàn gõ — có thể chứa số; trường riêng có thể bị dùng để ghi số chủ | Không khoá nào lớp `source` (ràng buộc + bộ kiểm); nhãn, lựa chọn qua bộ dò số điện thoại, email của ADR-0011 §3, trúng là từ chối; trường riêng không có kiểu chữ tự do ở bản đầu; định nghĩa và giá trị trường riêng không gửi ra AI (mục «Chi phí») |
| 3. Người luôn bấm gửi | Mẫu bài theo kênh | Không có khoá «tự gửi», «gửi theo lịch» hay «đăng vào nhóm»; mẫu chỉ soạn chữ cho bảng chia sẻ của thiết bị |
| 4. Phần nội bộ không ra trang khách | Bốn điểm trang khách (#12–#14, #17), mẫu bài, mẫu phát hàng, chia sẻ trường riêng | Mọi điểm chỉ chọn trong trần của luật ẩn ở lõi; chỗ điền của mẫu chỉ lấy trường luật ẩn cho phép; bộ kiểm rò rỉ chạy trên cấu hình mở nhất (quyết định 6) |

## Chi phí với trợ lý AI nhập dữ liệu

- **Cấu hình làm AI rẻ đi, không đắt lên**: mẫu file, từ điển giá trị và nhãn riêng của sàn áp tất định trước khi gọi tác
  tử (ADR-0011 quyết định 6) — tác tử chỉ thấy cột và giá trị bộ nhớ của sàn chưa biết.
- **Định nghĩa trường riêng và nhãn riêng không gửi ra AI ở bản đầu.** Chúng là dữ liệu của sàn lớp `company_internal`
  (trần «trong công ty»); thoả thuận «Xử lý bằng AI» chỉ mở `catalog` và `shareable_listing` (ADR-0011 quyết định 2), và
  `mayFlow` từ chối `company_internal` đi ra. Cột file ghép vào trường riêng hay nhãn riêng bằng so tên tất định sau
  chuẩn hoá; không khớp thì về người. **Chi phí AI thêm: 0.**
- Nếu bộ thử của hàng 64 cho thấy ghép tất định trường riêng hụt ngưỡng, mở lại bằng quyết định riêng (mục chờ CH13):
  thêm lớp vào thoả thuận AI của sàn. Cỡ khi mở: 20 trường × ~30 token + 60 nhãn × ~10 token ≈ 1,2 nghìn token vào, nằm
  trong phần đệm được; ở giá vào 4 USD mỗi triệu token (ADR-0011 quyết định 3) ≈ 0,005 USD mỗi lần nhập — dưới 0,1%
  trần 10 USD/tháng. Ước bằng cỡ, chưa đo token thật.
- Việc dọn từ điển định kỳ (hàng 71) đọc sổ để biết trường nào là tập đóng; không thêm lời gọi AI.

## Khác khuyến nghị của giám sát

Giữ hướng «khai báo có rào» và sáu ý của giám sát; năm chỗ khác, kèm căn cứ:

1. **«Ai thấy hàng» không vào bảng quyết định — khoá (sổ K5).** Đó là quyền, lớp khó đảo (luật cắt lượt 3), kề bất biến
   2 (nguồn chỉ thấy trên hàng mình đọc được — Tham chiếu §12 dòng 31/10 «Lớp trường nguồn»); «Nhóm» còn chưa có. Mở lại khi có hàng «Nhóm».
2. **«Thuế phí» không cần bảng quyết định**: tỉ lệ thuế, lệ phí do luật đặt, là số; «bao phí» là tập con của ba khoản —
   tham số có kiểu đủ (sổ #8–#11).
3. **Chia lead bản đầu là chọn một luật dựng sẵn, không bảng quyết định** — hàng 25 Hỏi-5: chia lead là chuyện thu nhập,
   chủ kho chốt từng luật; bảng quyết định chờ sàn thứ hai khác hình luật (CH6).
4. **Thêm cột «ghi đè dưới sàn»**: Tham chiếu §13 đã có hai chỗ không phải cấu hình sàn — đầu chủ sửa phí môi giới từng
   căn, người gửi sửa mức chia từng bộ. Không tách ra thì sẽ có người làm «cấu hình theo căn».
5. **Sổ khai cả điều khoá** (19 dòng): trợ lý AI, người dựng và quản trị sàn đọc một chỗ là biết điều gì không mở — đỡ
   hỏi lại điều đã chốt.

Một chỗ thêm: hàng nền không chặn các dãy đang chạy. Hàng 25 đã khai số một chỗ ở lõi; hàng 22, 23 nên làm như vậy. Hàng
81 gom các hằng số về sổ sau khi các hàng ấy gộp, không bắt chúng chờ.

## Hệ quả

- Lộ trình: đợt `cau-hinh-theo-san-0111` — hàng 81 `so-diem-bien-thien` (T2, nền) và 82 `cau-hinh-theo-san` (T3, nền)
  đứng trước 45–50; `dung_tren` của 45, 46, 48, 49 thêm 82, của 47, 50 thêm 81; tám mục chờ điều kiện H8–H15 (CH6–CH13).
- Lõi: `packages/core/src/config/` (sổ, giải cấu hình, khuôn); hàm luật nhận cấu hình làm tham số; `freshness.ts`,
  `routing/index.ts` đọc mặc định từ sổ.
- Cơ sở dữ liệu: `company_config_events`, `company_config` — luật theo dòng, ca cách ly; số migration giữ chỗ lúc mở
  hàng 82 (luật 24 của gói đợt). Hạn lead ghi vào lead lúc chia (cột mới trên bảng của hàng 25, migration sau 011).
- API: `GET /api/v1/company/config`, `PUT /api/v1/company/config/{key}` — đường ghi duy nhất của cấu hình.
- Từ nay **hàng thêm một con số hay lựa chọn của sàn khai điểm ấy vào sổ** (tài liệu và mã) trong cùng PR; Cổng Phạm vi
  hỏi «điểm này đã ở sổ chưa».
- Tham chiếu §12 thêm một dòng «đề xuất»; đổi thành «đã chốt» khi chủ kho duyệt. `CONTEXT.md` thêm hai từ (đề xuất).

## Hỏi chủ kho

- **Hỏi-1 — luật mở một điểm.** Khuyến nghị: một điểm sàn chỉnh được khi Tham chiếu đã chốt là mặc định, hoặc hai sàn
  thật cần hai giá trị khác nhau; không làm đối tượng tự tạo, công thức, luồng tự vẽ, kịch bản cho tới khi có số đo từ
  hai sàn thật (quyết định 7). Lối khác: mở rộng như Salesforce ngay từ bản đầu — trái §7 và Kiến trúc §0 đã chốt.
- **Hỏi-2 — chia lead ở Cài đặt sàn bản đầu.** Khuyến nghị: chọn một trong các luật dựng sẵn, bản đầu một luật (cùng chủ,
  rồi theo toà lâu chưa chia nhất); luật thứ hai và bảng quyết định chờ sàn thật (quyết định 5). Lối khác: dựng bảng
  quyết định ngay ở hàng 48.
- **Hỏi-3 — cách lưu.** Khuyến nghị: sổ ở mã + bảng khoá–giá trị có sự kiện, sàn chưa đổi thì đi theo mặc định của sản
  phẩm (quyết định 1, 3). Lối khác: bảng có kiểu một cột mỗi điểm — mỗi điểm mới một migration T3.

Duyệt theo khuyến nghị cả ba thì hàng 81 mở được ngay, không chờ dãy nào.

## Nguồn đã kiểm (01/11/2026)

- Mã: `main` 611df45 — `packages/core/src/{data-classes,agreements}.ts`, `listing/{status,freshness,completeness}.ts`,
  `visibility/index.ts`, `catalog/code-rule.ts`, `access/{can-see-source.ts,bang-xem-nguon.json}`; nhánh hàng 25
  `claude/dcdv-l-25-chia-lead` 2c0a7cf — `packages/core/src/routing/index.ts`, `packages/db/migrations/011_chia_lead_va_han.sql`,
  `_acceptance/chia-lead-va-han/{contract.md,card-plain.json}`; nhánh hàng 72 PR #45 —
  `packages/core/src/catalog/property-type.ts`.
- Tài liệu: Tham chiếu §1–§14; Kiến trúc repo và stack §0–§10; `docs/architecture/nhap-du-lieu.md` §3, §7, §8, §12;
  ADR-0008, 0010, 0011, 0012, 0016; `docs/plan/lo-trinh.json` hàng 22, 23, 25, 44–50, 64–80.
- Số ADR: 0013 (nhánh hàng 62, PR #40), 0016 (đã gộp), 0017 (giữ chỗ cho hàng 25, hồ sơ `chia-lead-va-han`); 0014, 0015
  chưa có tệp trên nhánh nào của origin — coi là giữ chỗ theo lời giám sát. Dùng 0018. Số hàng: lộ trình trên `main` và mọi nhánh trên origin dừng ở 80.
