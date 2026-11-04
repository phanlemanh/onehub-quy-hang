# Thiết kế — cau-hinh-theo-san (hàng 82)

Hàng 82 của lộ trình (dãy D, đợt `dau-khach-nhap`), mã phạm vi CH3, CH4, CH5 (`docs/plan/pham-vi-cau-hinh-theo-san.md`).
Gốc: ADR-0018 quyết định 2, 3, 4, 6; Tham chiếu §4 «Cấu hình sàn: mọi thay đổi vào nhật ký, không sửa số đã lưu»; luật
đợt 23 và 46. Đứng trên hàng 81 (sổ điểm biến thiên ở lõi, `packages/core/src/config/`), hàng 25 (bảng
`company_settings`, migration 011, lối `/company/settings/lead-routing`), hàng 22 (lối `/company/settings/queue`).
Hạng T3: thêm bảng, trigger và cột ở cơ sở dữ liệu (migration `026`, số giữ chỗ luật đợt 25). Không có màn — màn Cài đặt
sàn là hàng 45–49.

## Hiện trạng đã kiểm (04/11, `origin/main` d326096)

- `company_settings` (011): khoá chính (`company_id`, `key`), `value jsonb`, `updated_by`, `updated_at`; bật và ép luật
  theo dòng; cả sàn đọc, chỉ `company_admin` ghi (`updated_by = app.current_user_id()`). Khuôn khoá
  `^[a-z][a-z_]*\.[a-z][a-z_]*$` — hai đoạn.
- Hai lối ghi đang có: `PUT /api/v1/company/settings/lead-routing` (bốn khoá `lead_routing.*`, kiểm cặp hạn) và
  `PUT /api/v1/company/settings/queue` (`queue.groups`). Cả hai upsert thẳng, **không có nhật ký**.
- Đọc: chia lead đọc `app.lead_routing_settings_rows()` qua `readLeadRoutingSettings`; hàng đợi đọc `queue.%`; sẵn sàng
  bán đọc `listing.ready_min_real_photos`. Bộ giải chung `giaiCauHinh` (hàng 81) có sẵn nhưng chưa lối API nào dùng.
- Hiệu lực «mới» của hai hạn đã có ở cơ sở dữ liệu: `app.stamp_leads` đóng dấu `accept_minutes`, `first_call_minutes`
  lên lead lúc chia; xét hạn đọc số trên lead, không đọc cấu hình.
- Lỗ Ngoài-5 của hàng 81 (luật đợt 46): `kiemGiaTri` chỉ kiểm `khongNhoHon` ở khoá phụ thuộc (hạn gọi), không kiểm
  chiều ngược ở khoá được trỏ (hạn nhận). Sàn chỉ đặt `lead_routing.accept_minutes = 60` (hạn gọi vẫn mặc định 30):
  `giaiCauHinh` trả cấu hình hạn nhận 60 > hạn gọi 30 không lỗi; `readLeadRoutingSettings` cũng nhận im.

## Phương án

### 1. Nhật ký sự kiện ghi bằng trigger ở cơ sở dữ liệu

Bảng mới `company_settings_events` (migration `026_cau_hinh_su_kien.sql`): `id bigint identity`, `company_id`, `key`,
`value jsonb`, `data_class text`, `actor_user_id text`, `actor_roles text[]`, `at timestamptz default now()`. Bật và ép
luật theo dòng; luật đọc `company_id = app.current_company_id()`; vai `quy_hang_app` chỉ có `select` — không `insert`,
`update`, `delete`. Trigger `before update or delete` chặn sửa, xoá (như `listing_events`).

Sự kiện sinh bởi trigger `after insert or update on company_settings for each row`: hàm `security definer` chép khoá,
giá trị, lớp, `new.updated_by` và `app.current_user_roles()` vào nhật ký. Vì vậy **mọi lối ghi** — lối chung mới, lối
lead-routing và lối queue có sẵn, hay lối nào thêm sau — đều có đúng một dòng nhật ký mỗi dòng ghi, không cần sửa hai lối
cũ và không thể quên.

- So: (B) lối API ghi nhật ký cạnh upsert — phải sửa cả hai lối cũ (ngoài vùng của hàng) và lối thứ tư quên ghi là lọt;
  (C) chỉ nhật ký, bản hiện hành là view «dòng cuối mỗi khoá» — đổi cách đọc của ba người đọc đang chạy và luật ghi của
  011. Chọn (A) trigger.
- Dòng đã có trong `company_settings` trước 026 được **chép bù** một sự kiện mỗi dòng ngay trong 026 (người = `updated_by`,
  lúc = `updated_at`, vai rỗng — không biết vai lúc ấy), để «mọi thay đổi vào nhật ký» (Tham chiếu §4) đúng cả với cấu hình
  đặt từ hàng 22, 25. Ca kiểm: cơ sở dữ liệu tạm chạy migration tới 025, chèn dòng, rồi chạy `migrate.mjs` (theo khuôn
  `bat-rang-buoc-migrate.test.ts`).

### 2. Lớp dữ liệu — cơ sở dữ liệu chặn `source`

Thêm cột `data_class text not null default 'company_internal'` vào `company_settings` với ràng buộc
`check (data_class in ('catalog','shareable_listing','company_internal','custom_field','transaction','behavior'))` —
mọi lớp trừ `source` (ADR-0018 quyết định 3, «như trần ở ADR-0010»). Nhật ký có cùng ràng buộc. Lối chung ghi lớp theo
sổ (`DiemSo.lop`); hai lối cũ để mặc định — đúng lớp của bốn khoá `lead_routing.*` và `queue.groups` trong sổ
(`company_internal`).

### 3. Lối API chung

`packages/api/src/settings/{routes.ts,store.ts}`:

- `GET /api/v1/company/settings` — mọi thành viên sàn: mọi **điểm giá trị đơn đã mở** của sổ (không `map`, không họ
  khoá `<…>`, `tinhTrang: mo`) mỗi điểm một dòng `{ key, value, source: "default" | "company", updatedBy, updatedAt }`,
  giải bằng `giaiCauHinh` từ dòng của sàn; kèm `errors: string[]` — lỗi của bộ giải (dòng hỏng, cặp trái luật) **hiện ra**
  ở đây, không nuốt.
- `PATCH /api/v1/company/settings` — thân `{ "<khoá>": <giá trị>, … }`, một hay nhiều khoá, **nguyên khối**: khoá lạ, khoá
  `map`/họ khoá, khoá `de_xuat`, sai khuôn, ngoài khoảng → 400 `invalidSettings` với `reason` nêu đúng khoá, không khoá
  nào được ghi. Vai không nằm trong `aiDoi` của **mọi** khoá gửi → 403 `adminRequired` (hôm nay mọi điểm đơn là
  `company_admin`). Khoá cấu hình của sàn bằng `pg_advisory_xact_lock` cùng khoá với lối lead-routing để hai lối không
  giẫm nhau. Kiểm trên cấu hình đang áp ⊕ phần đổi, rồi upsert từng khoá (mỗi khoá một sự kiện qua trigger), trả bản như
  GET.
- So: (B) `PUT /company/settings/{key}` một khoá mỗi lệnh — đổi cặp hạn cùng chiều (15/30 → 45/60) phải gọi theo đúng
  thứ tự, và màn 48 lưu nhiều ô thành nhiều lệnh không nguyên khối: một ô hỏng giữa chừng để cấu hình nửa đổi. Chọn
  (A) PATCH nhiều khoá, nguyên khối.

### 4. Cặp hạn không áp im lặng (luật đợt 46 — Ngoài-5 hàng 81)

- **Lối ghi**: `kiemGiaTri` kiểm cả hai chiều của mỗi ràng buộc `khongNhoHon` — khoá phụ thuộc không nhỏ hơn khoá được
  trỏ (đã có), **và** khoá được trỏ không lớn hơn khoá phụ thuộc đang áp. Lối chung kiểm trên cấu hình ghép phần đổi
  nên gửi cả hai khoá cùng lệnh thì hợp lệ.
- **Lối đọc**: `giaiCauHinh` sau khi giải xét lại mọi cặp `khongNhoHon` trên cấu hình cuối; cặp trái luật → cả hai khoá
  của cặp về mặc định của sổ và một lỗi nêu **hai** khoá (`lead_routing.first_call_minutes < lead_routing.accept_minutes
  (30 < 60): cặp về mặc định`); lỗi hiện ở `errors` của GET. Chia lead lúc gặp cặp trái luật — **Hỏi-1** (chỉ người
  quyết): (a, khuyến nghị) `readLeadRoutingSettings` áp cùng luật — cặp về 15/30, lead vẫn chia, lỗi hiện ở GET; (b) ném
  lỗi nêu hai khoá như ô hỏng hôm nay — nhịp chia của sàn dừng tới khi quản trị sửa cặp. Giá: (a) lead chạy theo hạn mặc
  định mà quản trị có thể không để ý lỗi tới khi mở cấu hình; (b) telesales của sàn không nhận lead nào trong lúc ấy.
  Bản nháp viết theo (a).
- So: (B) chỉ chặn ở lối ghi — dòng trái luật vẫn có thể tới từ dữ liệu cũ hay ghi tay; luật 46 đòi «bị từ chối hoặc
  báo». (C) bộ đọc tự sửa (kéo hạn gọi lên bằng hạn nhận) — áp một số không ai đặt. Chọn (A).

### 5. Mới và cũ (CH5)

Không mã mới: lối chung ghi `company_settings`, nhịp chia đọc qua `readLeadRoutingSettings` và đóng dấu lên lead lúc chia.
Hàng này chứng hành vi ấy qua **lối chung** (đổi 15 → 20: lead đã chia giữ 15, lead chia sau mang 20) — ADR-0018 quyết
định 6 «Mới và cũ».

## Đối chiếu ngành (ADR-0022)

| Năng lực | RESO | Sản phẩm khác ([Đối chiếu ngành §9](../../product/doi-chieu-nganh.md#9-cấu-hình-theo-sàn)) | Ta làm | Ta cứng — họ cấu hình |
| --- | --- | --- | --- | --- |
| Ai đổi cấu hình sàn | Không có tài nguyên cấu hình (RESO chỉ chuẩn dữ liệu listing, liên hệ) | Follow Up Boss: chỉ chủ tài khoản đổi stage, trường riêng; KW Command: quyền theo từng ứng dụng | Vai đổi đọc từ `aiDoi` của sổ (hôm nay `company_admin`) | Không — vai là dữ liệu của sổ, không viết trong lối |
| Cấp cấu hình | — | Lofty, BoldTrail: ba cấp công ty ⊃ văn phòng ⊃ đội | Một cấp sàn; ghi đè dưới sàn là của đối tượng (ADR-0018 §4 «ghi đè dưới sàn») | Đã quyết ở ADR-0018 (Quỹ hàng chưa có «Nhóm», Tham chiếu §6) — không mở lại ở hàng này |
| Nhật ký thay đổi cấu hình | — | chưa kiểm (Follow Up Boss, Lofty) | Mọi lần ghi một dòng sự kiện chỉ thêm, ghi người và vai | Không |

Hàng này không thêm chỗ giữ cứng mới so với ADR-0018, nên không có Hỏi «giữ cứng hay làm dữ liệu».

## Chạm bốn bất biến

1. Cách ly: bảng mới bật và ép luật theo dòng theo `app.current_company_id()`; ca cách ly cho cả hai bảng cấu hình.
2. Chủ nhà không rời công ty: không khoá nào lớp `source`; cơ sở dữ liệu chặn bằng `check` ở cả hai bảng.
3. Người bấm gửi, 4. phần nội bộ không ra trang khách: không chạm.

## Ranh giới

Vùng của hàng: `packages/api/src/settings/**`, `packages/db/migrations/026_*.sql`. Khai thêm ở Cổng Phạm vi:
`packages/core/src/config/**` (cặp hai chiều ở khuôn và bộ giải), `packages/core/src/routing/index.ts` (cặp ở
`readLeadRoutingSettings`), `packages/api/src/app.ts` + `app.test.ts` (đăng ký lối), `packages/api/src/errors.ts` (nếu
cần mã lỗi), `packages/api/test-db/cau-hinh-theo-san.test.ts`, `packages/db/tests/isolation.test.mjs`,
`docs/product/tham-chieu.md`, `docs/architecture/so-diem-bien-thien.md`, `CONTEXT.md`.

## Đặc tả UX

Bỏ — hàng không có màn (sổ: «bỏ đặc-tả-UX»). Màn Cài đặt sàn là hàng 45–49.
