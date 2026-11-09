---
schema_version: 1
feature: "Dòng «Tính theo định nghĩa ngày …» ở hồ sơ căn không hiện dấu cũ khi giá còn chờ gửi và đổi sang dấu mới ngay khi giá lên máy chủ, không cần tải lại trang."
slug: va-dinh-nghia-doc-lai
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: machine-cleared
design_doc: docs/superpowers/specs/2026-11-09-va-dinh-nghia-doc-lai-design.md
approved_by: Manh Phan
approved_at: 2026-11-09
---

# Acceptance Contract: va-dinh-nghia-doc-lai

## Context

Ngoài-3 của hàng 49 `thue-phi`: dòng phụ đọc dấu định nghĩa của giá cũ khi giá mới còn trong hàng đợi đồng bộ, và không đọc lại. Dấu do
cơ sở dữ liệu đóng lúc giá vào máy chủ (migration 050), nên chỉ đọc đúng được sau khi giá đã lên.

Source input: hàng `va-dinh-nghia-doc-lai` (`docs/plan/lo-trinh.json`) · ô `opportunity.md`

## Criteria

- **AC-1** — Giá còn chờ gửi thì không đọc dấu và không có dòng (Hỏi-1).
  Given căn bao phí đã có dòng định nghĩa và hàng đợi trên máy có thao tác đổi giá của căn ấy,
  When dựng mô hình hồ sơ và tính lần đọc, chữ dòng từ ngăn thật của bộ đồng bộ,
  Then không có lần đọc nào được yêu cầu, chữ dòng là rỗng, kể cả khi đang giữ một lần đọc thành công của đúng giá ấy; giá mới vẫn hiện.

- **AC-2** — Giá lên máy chủ thì dòng đổi sang dấu mới, không tải lại trang. (cross-layer)
  Given giá bao phí đổi lúc không gửi được, trong lúc ấy sàn đổi tỉ lệ môi giới, rồi gửi được,
  When hàng đợi hết thao tác đổi giá của căn và hồ sơ đang mở,
  Then đúng một lần đọc chạy ngay, máy chủ trả dấu mang tỉ lệ mới, dòng hiện tỉ lệ mới và số về tay của giá mới; trang không tải lại.
  Đổi giá đi rồi đổi về đúng giá cũ trong lúc chờ gửi cũng đọc lại, không giữ dấu cũ; phản hồi của lần đọc trước lúc chờ gửi về muộn thì bị bỏ.

- **AC-3** — Đọc hỏng thì thử lại ở lần kéo thành công kế, không đọc dồn. (cross-layer)
  Given lần đọc dấu của giá hiện hành hỏng vì mất mạng hay máy chủ 5xx,
  When chưa có lần kéo thành công mới, và khi có lần kéo thành công mới,
  Then chưa có lần kéo mới thì không có lần đọc nào nữa và không có dòng; có lần kéo mới thì đúng một lần đọc được yêu cầu, đọc được thì dòng hiện.
  Máy chủ trả 4xx hay `null` thì là kết quả cuối, không thử lại.

- **AC-4** — Thao tác chờ khác giá không đụng tới dòng.
  Given căn đã có dòng định nghĩa và hàng đợi có thao tác không phải đổi giá của căn, hay thao tác đổi giá của căn khác,
  When tính lại lần đọc và chữ dòng,
  Then không có lần đọc mới và chữ dòng giữ nguyên.

- **AC-5** — Giá bị máy chủ từ chối thì dòng theo giá máy chủ. (cross-layer)
  Given thao tác đổi giá của căn bị máy chủ không nhận và căn về «Cần xem»,
  When hàng đợi hết thao tác của căn,
  Then giá trên máy về giá máy chủ, một lần đọc chạy với khoá của giá ấy, và không có bước nào máy đọc theo giá vừa bị từ chối.

- **AC-6** — Giá không bao phí hay chưa có giá giữ nguyên hành vi.
  Given căn giá không bao phí hoặc chưa có giá,
  When tính lần đọc và chữ dòng,
  Then không có lần đọc nào và không có dòng.

- **AC-7** — Giao diện đúng khuôn của hồ sơ căn.
  Given các tệp giao diện vòng này chạm,
  When chạy lưới khuôn và sàn thiết kế,
  Then không có dòng lệch mới và không có mã màu thô; chữ của dòng định nghĩa không đổi.

## Coverage

Chân sản phẩm: `apps/web/src/lib/sync/dong-bo.ts`, `packages/db/migrations/050_dau_dinh_nghia_bao_phi.sql`. Chân ngành: đọc lại sau lệnh ghi của
TanStack Query (`invalidateQueries`), thử lại khi có mạng của SWR (`revalidateOnReconnect`).

- Trục A — thao tác chờ của căn: không có | đổi giá | thao tác khác. [thước CE: `EVENT_TYPES` của lõi; dấu chỉ đóng theo `price_changed`, migration 050]
- Trục B — lần đọc: chưa có | đang đọc dở | có dấu | `null` hay 4xx | hỏng. [thước CE: các nhánh của `readFeeBasis` và `fetch`]
- Trục C — cách thao tác rời hàng đợi: máy chủ nhận | máy chủ từ chối | còn kẹt. [thước CE: `guiHangDoi` của bộ đồng bộ]

| Ô | AC |
|---|---|
| A đổi giá × B mọi giá trị × C còn kẹt | AC-1 |
| A đổi giá × C máy chủ nhận | AC-2 |
| A đổi giá × C máy chủ từ chối | AC-5 |
| A không có × B hỏng | AC-3 |
| A thao tác khác × B có dấu | AC-4 |
| A đổi giá × B đang đọc dở | AC-2 |

Later: hai thẻ trình duyệt cùng mở, một thẻ gửi giá (thẻ kia đọc lại ở lượt kéo của nó). Never: tính dòng tạm trên máy — dấu thuộc máy chủ.

## Đường đo

- Thước: đổi giá khi mất mạng rồi có mạng lại, dòng đổi sang dấu mới không cần tải lại · số từ: bài nhìn màn trên Postgres của dãy và bộ kiểm trên API thật · bảo đảm bởi: AC-2
- Thước: bài kiểm phủ đường mạng yếu · số từ: ma trận thuần chạy trên bộ đồng bộ thật · bảo đảm bởi: AC-1, AC-3

## Out of scope

- Đưa dòng định nghĩa vào thân điện thoại của hồ sơ căn.
- Thêm chữ hay chỉ báo «đang chờ gửi» riêng cho dòng định nghĩa — theo khuyến nghị của Hỏi-1; chủ kho chọn chữ chờ thì mục này bỏ và AC-1 đổi theo.
- Đổi máy chủ, cơ sở dữ liệu hay cách đóng dấu.
- Hiện dòng định nghĩa trên Bảng hàng hay màn cuộc gọi.

## Notes

- Ngoài-1 (máy định tuyến 2026-11-09, đề xuất S4 known-limits): Khi mạng yếu làm nội dung trả về bị đứt dù máy chủ báo thành công, dòng định nghĩa ngày có thể vắng mặt cho tới khi giá hoặc điều kiện phí đổi. Không có thông báo lỗi nào hiện ra. — `apps/web/src/app/(app)/units/ho-so/doc-dau.ts`
- Ngoài-2 (máy định tuyến 2026-11-09, đề xuất S4 known-limits): Bài kiểm trên máy chủ thật chưa phân biệt được máy chủ trả «không có dấu» với trả «không tìm thấy». Người dùng hiện không thấy khác biệt nào. — `apps/web/src/lib/sync/test-db/dinh-nghia-doc-lai.db-test.mts`
- Ngoài-3 (máy định tuyến 2026-11-09, đề xuất S4 known-limits): Bài kiểm chưa chắc chắn rằng lúc kiểm có thao tác khác đang chờ gửi. Người dùng vẫn thấy dòng định nghĩa giữ nguyên đúng như mong đợi. — `apps/web/src/app/(app)/units/ho-so/dinh-nghia-doc-lai.test.ts`
- Ngoài-4 (máy định tuyến 2026-11-09, đề xuất S4 known-limits): Bài kiểm mới thử một loại thao tác khác để chắc dòng định nghĩa không bị đụng tới, chưa thử hết các loại. Người dùng chưa gặp lỗi nào. — `apps/web/src/app/(app)/units/ho-so/dinh-nghia-doc-lai.test.ts`
- Ngoài-5 (máy định tuyến 2026-11-09, đề xuất S4 known-limits): Ca đổi giá đi rồi đổi về chưa được kiểm trọn qua bộ đồng bộ thật. Hiện tại dòng vẫn đổi đúng khi giá lên máy chủ. — `apps/web/src/app/(app)/units/ho-so/dinh-nghia-doc-lai.test.ts`
- Ngoài-6 (máy định tuyến 2026-11-09, đề xuất S4 known-limits): Chưa có bài kiểm cho tình huống phản hồi cũ về đúng lúc giá còn chờ gửi. Người dùng chưa gặp lỗi, nhưng tình huống này hiếm và chưa được xác nhận. — `apps/web/src/app/(app)/units/ho-so/dinh-nghia-doc-lai.test.ts`
