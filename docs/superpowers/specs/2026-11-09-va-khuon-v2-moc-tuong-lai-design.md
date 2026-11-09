# Vá khuôn v2: mốc đo tương lai, tên miền, phút múi giờ — thiết kế

Ngày: 2026-11-09 · Hàng vá `va-khuon-v2-moc-tuong-lai` · Dãy G · Hạng **T3** (`packages/connect/**`). Nguồn: Ngoài-1 và hai điểm trong hợp đồng còn lại ở lượt chấm 2 của
`khuon-nguon-danh-muc-v2`, chủ kho chọn «mở hợp đồng mới» 09/11. Không màn hình, không đổi hình khuôn, không migration.

## 1. Ba lỗ

1. **Mốc đo tương lai.** Ảnh chụp chỉ thay khi mốc đo mới hơn hay bằng, nên một gói đẩy nhầm năm làm khu đứng yên với mọi sàn và chỉ sửa được bằng tay trong cơ sở dữ liệu.
2. **Tên miền.** Lưới chỉ biết chín đuôi, nên `zalo.me`, `t.me`, `nhadat.land`, `muaban.xyz` lọt vào gói.
3. **Mốc đo mà cơ sở dữ liệu không nhận.** Phút múi giờ từ 60 trở lên và phần lẻ giây rất dài qua khuôn rồi thành lỗi máy chủ.

## 2. Luật

- **Tương lai.** `parseCatalogFeed(raw, { now })` (mặc định giờ máy) từ chối mốc đo vượt `now` quá dung sai, ở đầu gói (v1, v2), `marketStats[].measuredAt`, `publicListings[].measuredAt`; đúng một lỗi tại đường khoá. Dung sai `CATALOG_FEED_FUTURE_TOLERANCE_MS` (Hỏi-1). Khuôn vẫn thuần: giờ là tham số, bên đẩy tự kiểm được khi đồng hồ lệch trong dung sai (Hỏi-3).
- **Tên miền.** Ba mẫu: đuôi không thể nhầm, không phân biệt hoa thường (`com net org vn info biz asia xyz`); liên kết rút gọn hay gặp, không phân biệt hoa thường (`zalo.me`, `fb.me`, `m.me`, `t.me`); và đuôi bất kỳ khi cả nhãn lẫn đuôi đều chữ thường ASCII (`\b[a-z0-9-]*[a-z][a-z0-9-]*\.[a-z]{2,24}\b`), chỉ áp cho trường chữ do người gõ. Khoá do máy cấp (`subdivisionKey`, `buildingKey`, `upi`) được phép có dấu chấm chữ thường như `khu-a.toa-b`. Tên địa danh có chữ hoa như `Tp.HCM`, `Q.1`, `H.Me Linh`, `P.Co Giang`, mã như `A.2305`, `S1.02`, `S1.Shop` vẫn qua. Giá: địa danh viết toàn chữ thường như `tp.hcm` bị từ chối (Hỏi-2). Chỉ áp cho v2 như lưới cũ.
- **Mốc đo.** `MocDo` thêm: phút múi giờ dưới 60, phần lẻ giây tối đa 9 chữ số.

Dữ liệu, cửa nhận, phản hồi không đổi; `parseCatalogFeed` từ chối thì hai đường vào đều 422 `invalid-feed` như mọi lỗi khuôn.

## 3. Đối chiếu ngành (ADR-0022)

Không thêm năng lực mới, chỉ siết kiểm đầu vào của khuôn đã đối chiếu ở `khuon-nguon-danh-muc-v2` §5; bỏ bảng đối chiếu.

## 4. Câu hỏi cho Cổng Phạm vi

- **Hỏi-1 — mốc đo vượt giờ máy chủ bao nhiêu thì từ chối.** Khuyến: 1 giờ. Máy local của Invest có thể lệch đồng hồ; nếu lọt, khu chỉ đứng yên tối đa một giờ rồi tự hết. Lối khác: 5 phút, chặt hơn nhưng lệch đồng hồ làm mất cả gói.
- **Hỏi-2 — bắt tên miền tới đâu.** Khuyến: đuôi không thể nhầm, liên kết rút gọn hay gặp, cộng đuôi bất kỳ khi trường chữ viết toàn chữ thường, để `Tp.HCM`, `H.Me Linh` không bị bắt nhầm. Giá: địa danh viết toàn chữ thường như `tp.hcm` làm cả gói bị từ chối, bên đẩy phải viết hoa. Lối khác: chỉ mở rộng danh sách đuôi, đuôi lạ tiếp tục lọt; hay bắt mọi `chữ.chữ`, thì `Tp.HCM` cũng bị từ chối.
- **Hỏi-3 — kiểm mốc tương lai ở đâu.** Khuyến: trong khuôn, giờ là tham số, bên đẩy tự kiểm được trước khi gửi khi đồng hồ lệch trong dung sai. Lối khác: chỉ kiểm ở cửa nhận, khuôn giữ đúng nghĩa «hình dạng», đổi lại bên đẩy chỉ biết sau khi gửi.
