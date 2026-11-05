# Review findings: nhap-hoan-tac (round 2)

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 1 — đo chỉ dẫn thay vì đầu ra: phép kiểm «xem trước lỗi không ghi» chỉ đo cờ `lam` của hàm phụ, không đo việc nút có gọi lệnh ghi hay không**
  Người dùng thấy gì: Nếu sau này có người sửa màn hoàn tác sai, nút «xem trước» lỗi có thể vẫn ghi hoàn tác mà bộ kiểm không báo đỏ. Hiện chưa thấy người dùng bị ghi nhầm.
  Căn cứ: Chưa có hậu quả thật nào với người dùng, chỉ là lưới kiểm thiếu một lớp; không mất hay lộ dữ liệu, và bổ sung phép kiểm sau này rẻ, không gấp.
  file: `apps/web/src/lib/nhap/hoan-tac.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Database functions for creating a share and recording interest still accept removed (voided) units (r1)**
  Người dùng thấy gì: Căn đã được hoàn tác khỏi Quỹ hàng vẫn có thể bị đưa vào một link chia sẻ mới, và khách mở link cũ vẫn bấm được «Quan tâm» dù trang đã báo căn không còn.
  Căn cứ: Hậu quả vừa phải: không mất hay lộ dữ liệu nhưng có thể sinh liên hệ khách cho căn đã gỡ; người dùng không tự gỡ được và sửa ở tầng dữ liệu cần migration riêng.
  file: `packages/db/migrations/021_lien_he_khach.sql`
  severity: medium
  Đề xuất: new-contract

- **The voided-to-Withdrawn rule for the customer page lives in the API store, not in the core redaction rule (r1)**
  Người dùng thấy gì: Hiện trang khách vẫn báo căn đã gỡ là không còn; rủi ro là một cửa ra khác trong tương lai có thể quên luật này và để lộ giá của căn đã gỡ.
  Căn cứ: Hiện không ai thấy sai ở trang khách, rủi ro chỉ phát sinh khi thêm cửa ra mới và sửa lúc đó rẻ hơn.
  file: `packages/api/src/public/store.ts`
  severity: medium
  Đề xuất: known-limits

- **The undo route turns every exception into `import-undo-incomplete` (503) (r1)**
  Người dùng thấy gì: Nếu hoàn tác gặp lỗi thật chứ không phải đứt mạng, người dùng vẫn chỉ thấy «bấm lại để làm tiếp» và bấm mãi không xong, đội kỹ thuật không có dấu vết để tìm nguyên nhân.
  Căn cứ: Không mất dữ liệu và các căn đã làm xong được giữ, nhưng người dùng bị kẹt không tự gỡ được khi lỗi lặp lại.
  file: `packages/api/src/imports/undo/routes.ts`
  severity: low
  Đề xuất: known-limits

- **Migration number 025 is placed after 026–033 already on main (r1)**
  Người dùng thấy gì: Thứ tự áp dụng thay đổi dữ liệu có thể khác nhau giữa môi trường cũ và môi trường mới, nhưng hiện chưa gây sai lệch nào cho người dùng.
  Căn cứ: Số đã được giữ có chủ đích, các thay đổi không đụng nhau nên người dùng không thấy gì; đổi số sau khi đã áp dụng lại gây rối hơn.
  file: `packages/db/migrations/025_hoan_tac_nhap.sql`
  severity: low
  Đề xuất: wont-fix

- **Hoàn tác nuốt mọi lỗi, không ghi log: lỗi lặp lại thành vòng «chưa xong, bấm lại» mãi mãi mà không ai biết nguyên nhân (r1)**
  Người dùng thấy gì: Khi một dòng luôn hỏng, người dùng thấy «Hoàn tác chưa xong» mãi và bấm lại không giúp được, còn đội kỹ thuật không biết vì sao.
  Căn cứ: Dữ liệu không bị mất hay lộ nhưng lần nhập có thể không bao giờ hoàn tác xong; sửa bằng ghi nhật ký khá rẻ.
  file: `packages/api/src/imports/undo/store.ts`
  severity: medium
  Đề xuất: known-limits

- **Mọi lần từ chối của lệnh bù đều bị ghi là «Đã có người sửa sau lần nhập» (r1)**
  Người dùng thấy gì: Một số căn không hoàn tác được vì lý do khác sẽ bị báo nhầm là «Đã có người sửa sau lần nhập» và không được thử lại.
  Căn cứ: Chỉ sai lý do hiển thị ở các tình huống hiếm, căn không bị gỡ nhầm và không mất dữ liệu; người dùng tự xử lý tay được.
  file: `packages/api/src/imports/undo/store.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 — chỉ kiểm «chuỗi có mặt» trong khi lời hứa là quan hệ căn đã gỡ ↔ trạng thái «unavailable» và không giá (r1)**
  Người dùng thấy gì: Bài kiểm có thể vẫn xanh dù căn đã gỡ lại hiện giá trên trang khách; sản phẩm hiện chưa thấy sai.
  Căn cứ: Không ảnh hưởng người dùng trực tiếp, chỉ làm giảm độ tin của bài kiểm; siết lại sau rẻ và không rủi ro dữ liệu.
  file: `packages/api/test-db/imports/hoan-tac.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — kiểm âm tính một mình: «huỷ thì không ghi» không có đối chứng dương, và đường huỷ không hề được chạy (r1)**
  Người dùng thấy gì: Bài kiểm «huỷ thì không ghi gì» chưa thực sự thử đường huỷ nên nếu có lỗi ghi khi huỷ thì không bị bắt.
  Căn cứ: Hiện chưa thấy lỗi ở sản phẩm; rủi ro là lỗi tương lai lọt qua, và bổ sung bài kiểm sau rẻ.
  file: `apps/web/src/lib/nhap/hoan-tac.test.ts`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/9 lỗi rơi vào file không bộ đo nào phủ (packages/db/migrations/021_lien_he_khach.sql, packages/api/test-db/imports/hoan-tac.test.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

