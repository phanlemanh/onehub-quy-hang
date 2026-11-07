---
schema_version: 1
feature: "Đổi nhãn tại chỗ của căn đang giao dịch hay đã bán đi qua phép so phiên bản như mọi lệnh đổi trạng thái: lệnh dựa trên bản cũ không âm thầm đè lần đổi trước hay kéo căn về trạng thái cũ, mà vào «Cần xem»."
slug: doi-nhan-so-phien-ban
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api, sdk]
status: approved
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-11-07T11:04:42Z
design_doc: docs/superpowers/specs/2026-11-07-doi-nhan-so-phien-ban-design.md
---

# Acceptance Contract: doi-nhan-so-phien-ban

## Context

Ngoài-5 và Ngoài-7 của hàng 46 trang-thai-rieng: máy chủ cho mọi lệnh có đích Đang giao dịch / Đã bán «thắng ngay», kể cả
đổi nhãn tại chỗ — hai người cùng đổi nhãn thì lần sau âm thầm đè; lệnh đổi nhãn cũ tới sau khi căn đã về Đang bán thì kéo
căn về Đang giao dịch. Chủ kho chọn «mở hợp đồng mới» ở Cổng Bằng chứng 06/11. Bất biến chạm: không (lõi thuần, đường
ghi hàng, bộ đồng bộ).

Source input: `docs/plan/lo-trinh.json` hàng doi-nhan-so-phien-ban · `_acceptance/doi-nhan-so-phien-ban/opportunity.md` ·
`_acceptance/trang-thai-rieng/review-findings.md` (Ngoài-5, Ngoài-7) · `_acceptance/trang-thai-rieng/decisions.jsonl`
(d-20261106T050934Z-34, -36) · `packages/api/src/listings/store.ts` · `apps/web/src/lib/sync/gui.ts`.

Từ dùng trong tiêu chí: **bản gốc** của lệnh là trạng thái căn ở phiên bản lệnh khai (`expectedVersion`); **đổi nhãn tại
chỗ** là lệnh `status_changed` có đích bằng trạng thái đang có và nhãn khác.

## Criteria

- AC-1: Given ma trận viết trước mọi bộ (đích, bản gốc, bản hiện tại) — đích 6 trạng thái chuẩn, bản gốc 6 trạng thái và
  «không biết», bản hiện tại 6 trạng thái (252 bộ) — When hỏi luật thắng ngay của lõi, Then đúng 60 bộ thắng ngay: đích là
  Đang giao dịch hay Đã bán, bản gốc khác đích, bản hiện tại khác đích — so từng bộ với bảng kết quả viết tay theo nhóm
  (đích, bản hiện tại), không tính bằng chính luật; và chín ca có tên ra đúng kết quả viết trước (ca Ngoài-5: đích, gốc,
  hiện tại cùng Đang giao dịch → không; ca Ngoài-7: đích và gốc Đang giao dịch, hiện tại Đang bán → không; ca cùng đưa vào:
  đích Đang giao dịch, gốc Đang bán, hiện tại Đang giao dịch → không; Đang bán sang Đang giao dịch gốc Đang bán → có; gốc
  «không biết» hiện tại Đang bán sang Đã bán → có).
- AC-2: Given dãy sự kiện thật của một căn (tạo, lên Đang bán, sang Đang giao dịch, đổi nhãn tại chỗ, về Đang bán, sang Đã
  bán, đổi nhãn tại chỗ), When hỏi lõi bản gốc ở từng phiên bản và sự kiện nào là thắng ngay, Then bản gốc ở phiên bản k
  bằng trạng thái sau sự kiện k, phiên bản 0, vượt cuối, số lẻ, vắng → «không biết»; đúng hai sự kiện thắng ngay (sang Đang
  giao dịch, sang Đã bán) — hai lần đổi nhãn tại chỗ và lần về Đang bán không phải.
- AC-3: Given căn Đang giao dịch và căn Đã bán, mỗi căn hai người cùng đọc một phiên bản, When cả hai gửi lệnh đổi nhãn tại
  chỗ (nhãn khác nhau) với phiên bản ấy qua API, Then lệnh đầu 200, lệnh sau 409 `version-conflict`; nhãn của căn là nhãn
  lệnh đầu; số sự kiện của căn tăng đúng một.
- AC-4: Given căn Đang giao dịch ở phiên bản v, When người khác đưa căn về Đang bán rồi lệnh cũ gửi với phiên bản v — đổi
  nhãn tại chỗ, và (lệnh thứ hai) sang Đang giao dịch không nhãn — Then mỗi lệnh 409 `version-conflict`; căn vẫn Đang bán,
  nhãn và số sự kiện không đổi.
- AC-5: Given căn Đang bán ở phiên bản v mà người khác vừa đổi giá (phiên bản v+1), When lệnh sang Đang giao dịch (căn
  thứ hai: sang Đã bán) gửi với phiên bản v, Then 200 và căn ở đích — thắng ngay giữ nguyên; và lệnh đổi nhãn tại chỗ
  đúng phiên bản hiện tại → 200; lệnh đổi nhãn tại chỗ không khai phiên bản → 409 `version-conflict`, như lệnh đổi giá
  không khai phiên bản (đối chứng cùng ca). Và khi hai người cùng đưa một căn Đang bán vào Đang giao dịch (căn khác: vào Đã
  bán, giá chốt khác nhau) từ cùng phiên bản: lệnh đầu 200; lệnh sau — không nhãn, và có nhãn — bị từ chối; trạng thái,
  nhãn, giá chốt là của lệnh đầu; số sự kiện tăng đúng một.
- AC-6: Given hai bộ đồng bộ của hai người cùng kéo căn Đang giao dịch (căn thứ hai: Đã bán), When cả hai đổi nhãn tại chỗ
  rồi gửi, Then bộ gửi sau có đúng một mục «Cần xem» cho căn, lý do «đụng nhau» (không phải «đã cọc» / «đã bán»); hàng đợi
  rỗng; căn trên máy bằng bản máy chủ mang nhãn của người gửi trước; và lệnh đổi nhãn xếp hàng trên máy từ bản Đang giao
  dịch, gửi sau khi người khác đã đưa căn về Đang bán → máy chủ vẫn Đang bán, căn có mục «Cần xem», hàng đợi rỗng; đối
  chứng: người khác đưa căn từ Đang bán sang Đang giao dịch trong lúc máy đổi giá từ bản cũ → «Cần xem» lý do «đã cọc» như
  cũ.
- AC-7: Given bộ kiểm hiện có của hàng 46 (trạng thái riêng), của bộ đồng bộ và của lõi, When chạy cùng lượt sau vòng này,
  Then tất cả xanh.

## Coverage

Quét không gian (skill morphological-scan, preset entity-feature). Chân sản phẩm: Ngoài-5, Ngoài-7 và đường ghi hiện có
[SUY-TỪ-REPO: _acceptance/trang-thai-rieng/review-findings.md, packages/api/src/listings/store.ts].

- Trục A — đích: Đang giao dịch | Đã bán | trạng thái khác. [thước CE: `WINS_IMMEDIATELY` của lõi]
- Trục B — bản gốc so với đích: khác | trùng | không biết. [thước CE: `trangThaiGoc`]
- Trục C — bản hiện tại so với đích: khác | trùng. [thước CE: nhánh `doiNhanTaiCho` của `kiemNhanSuKien`]
- Trục D — lối gửi: API thẳng | bộ đồng bộ | nhập file. [thước CE: ba nơi gọi `applyCommand`]

Core: A×B×C toàn phần ở AC-1 · B rút từ dãy sự kiện thật ở AC-2 · A(giao dịch, đã bán)×B(trùng)×C(trùng)×D(API) ở AC-3 ·
A(giao dịch)×B(trùng)×C(khác)×D(API) ở AC-4 · A(giao dịch, đã bán)×B(khác, không biết)×C(khác)×D(API) ở AC-5 ·
D(bộ đồng bộ) ở AC-6 · hồi quy ở AC-7. Later: lý do «Cần xem» riêng cho đổi nhãn. Never: mở thêm ngoại lệ thắng ngay.
D(nhập file): gửi đúng phiên bản hiện tại nên luật mới không đổi kết quả — không AC riêng (sổ d-20261107T110110Z-7).

## Đường đo

- Thước: hai lệnh đổi nhãn cùng gốc phiên bản — lệnh sau vào Cần xem, không đè · số từ: bộ kiểm API và bộ đồng bộ ·
  bảo đảm bởi: AC-3, AC-6
- Thước: lệnh đổi nhãn cũ gửi sau khi căn đã về Đang bán không kéo căn về · số từ: bộ kiểm API · bảo đảm bởi: AC-4
- Thước: bài kiểm phủ cả Đang giao dịch và Đã bán · số từ: ma trận lõi và bộ kiểm API · bảo đảm bởi: AC-1, AC-3, AC-5

## Out of scope

- Gỡ nhãn hàng loạt của quản trị (cửa hẹp migration 049) — khoá theo hàng, bỏ qua căn đã rời nhãn theo thiết kế hàng 46.
- Chữ lý do riêng cho «Cần xem» do đổi nhãn đụng nhau — dùng lý do «đụng nhau» đã có.
- Đổi chữ luật 10 của Tham chiếu — nghĩa không đổi, máy chủ được đưa về đúng câu đã chốt.
- Kiểm mã nhãn trên máy lúc ngoại tuyến (Ngoài khác của hàng 46, đã ghi Known limits).

## Notes
