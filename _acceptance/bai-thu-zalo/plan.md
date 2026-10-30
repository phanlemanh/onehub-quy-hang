# Bài thử Zalo — kế hoạch làm

> For agentic workers: thực thi tuần tự trong phiên chính (superpowers:executing-plans). Bước dùng `- [ ]`.

**Goal:** Máy chủ thử + một lệnh chạy + bộ tóm tắt có luật kết luận, rồi phiên với Zalo thật, kết quả và ADR đề xuất.

**Architecture:** Node thuần trong `_acceptance/bai-thu-zalo/thu/` (không gói ngoài): `dem.mjs` (phân lớp, đếm, chọn cách chia
sẻ — thuần), `anh.mjs` (PNG zlib), `may-chu.mjs` (HTTP + nhật ký), `chay.mjs` (lệnh chạy, đường hầm), `tom-tat.mjs` (bản
sạch + bảng + kết luận). Bài kiểm `node:test` cạnh mã.

**Tech Stack:** Node 24, `node:http`, `node:zlib`, `node:test`.

**Spec:** `_acceptance/bai-thu-zalo/design.md` · `contract.md` · `evals.yaml`

## Global Constraints

- Cổng mặc định 3463 (dãy T); bài kiểm dùng cổng 0.
- Nhật ký chỉ dưới `.acceptance-runs/bai-thu-zalo/`; không IP thô — chỉ `ip_bam` (sha256 muối, 12 hex).
- Trang chỉ dữ liệu mẫu nhãn «Mẫu»; không mẫu số điện thoại VN, không «giá đáy», «chủ nhà», «sổ».
- Lệnh chạy bài kiểm: `node --test _acceptance/bai-thu-zalo/thu/` (khoá `executors.script.bai_thu_zalo` xin ở T-3).

## Review Focus

1. Zalo lấy xem trước bằng UA giống trình duyệt → thước UA tính nhầm; thước JS vẫn đúng — bài kiểm AC-3 đo lượt tải UA người không báo thì mở = 0.
2. Mã lạ, mã quá dài, ký tự HTML trong mã → 404, không chèn vào trang — bài kiểm ở Task 1.
3. Thân POST quá lớn hay không phải JSON → 204/400, máy chủ không chết — bài kiểm ở Task 1.
4. Đường hầm không trả URL trong 45 giây → báo rõ, máy chủ vẫn chạy trên máy — Task 2.
5. IP thật đến qua `x-forwarded-for`/`cf-connecting-ip` → không vào nhật ký hay tóm tắt — Task 2.

---

### Task 1: Máy chủ thử và phần đếm — phục vụ E1, E2, E3, E4, E6, E7 · independent: false

**Files:** `thu/dem.mjs`, `thu/anh.mjs`, `thu/may-chu.mjs`, Test: `thu/may-chu.test.mjs`

**Interfaces — Produces:** `phanLop(ua, dau) → {lop:'may'|'nguoi', ly_do}` · `MAU_MAY: string[]` ·
`demTheoMa(dong) → [{ma,tai_trang,tai_trang_nguoi,tai_anh,mo,mo_bi_loai,ua_may,ly_do_loai}]` ·
`chonCachChiaSe(nav, tep) → 'tep'|'link'|'khong-ho-tro'` · `anhXemTruoc(ma) → Buffer` · `docCoPng(buf) → {rong,cao}|null` ·
`taoNhatKy(tep?) → {dong, ghi(d)}` · `taoMayChu({nhatKy, muoi}) → http.Server`.

- [ ] Ca «AC-1 thẻ Open Graph»: GET `/s/A-1` trả đủ sáu thẻ; `og:image` = `http://127.0.0.1:<cổng>/og/A-1.png`; với
  `x-forwarded-proto: https`, `x-forwarded-host: vi-du.trycloudflare.com` → `https://vi-du.trycloudflare.com/og/A-1.png`.
  Phá thử: hàm kiểm thẻ trên bản sao HTML bỏ `og:image` ném «thiếu og:image».
- [ ] Ca «AC-2 ảnh xem trước»: chữ ký PNG, `docCoPng` = 1200×630, `content-type: image/png`, < 300 KB. Phá thử: ghi 1201
  vào IHDR bản sao → hàm kiểm ném «cỡ ảnh khác 1200×630».
- [ ] Ca «AC-3 tải mà không báo thì không mở»: qua máy chủ thật — tải trang + ảnh UA Safari, không báo → mở 0; báo phiên p1 → 1;
  báo lại p1 → 1; báo p2 → 2.
- [ ] Ca «AC-4 lượt báo của máy bị loại»: ma trận mọi phần tử `MAU_MAY` + `sec-purpose: prefetch` → `mo_bi_loai` tăng,
  `ly_do_loai` nêu mẫu; số khẳng định = số phần tử ma trận. Đối chứng: UA Safari iPhone, Chrome Android, Zalo in-app → tính.
  Mỗi dòng `tai-trang` có `ua`, `lop`.
- [ ] Ca «AC-5 nhánh chia sẻ»: `chonCachChiaSe` ba nhánh; POST `/ghi` `{ket_cuc:'huy',cach:'tep'}` → một dòng `chia-se`.
- [ ] Ca «AC-8 chỉ dữ liệu mẫu»: HTML `/s/A-1`, `/chia-se`, `/keo-anh` có «Mẫu», không khớp `/(\+?84|0)\d{2}[\s.]?\d{3}[\s.]?\d{3,4}/`,
  không «giá đáy», «chủ nhà», «sổ». Phá thử: chèn «0912 345 678» → «có số điện thoại».
- [ ] Ca biên: `/s/<script>` → 404; POST `/mo` thân 20 KB rác → không chết, `/dem` vẫn trả.
- [ ] Verify: `node --test _acceptance/bai-thu-zalo/thu/` → tất cả pass. Commit.

### Task 2: Một lệnh chạy — phục vụ E5 · independent: false

**Files:** `thu/chay.mjs`, Test: `thu/chay.test.mjs`

**Interfaces — Consumes:** `taoMayChu`, `taoNhatKy`, `demTheoMa`. **Produces:** `chonHam(coLenh) → 'cloudflared'|'ssh'|null` ·
`chay(argv, {coLenh}) → Promise<{may, cong, thuMuc, ma}>`.

- [ ] Ca «AC-7 chọn đường hầm»: `chonHam` ba nhánh với `coLenh` giả.
- [ ] Ca «AC-7 một lệnh»: spawn `chay.mjs --khong-ham --cong 0 --thu-muc <tạm dưới .acceptance-runs/bai-thu-zalo/kiem-*>`; đọc
  stdout tới dòng «Các bước»; có `/s/A-`, `/s/I-`, `/s/K-`, `/chia-se`, `/keo-anh`; gọi trang với `x-forwarded-for:
  203.0.113.7` và `cf-connecting-ip: 203.0.113.7`; SIGINT → `tom-tat.json` có `dem`; nhật ký và tóm tắt không chứa
  `127.0.0.1`, `::1`, `203.0.113.7`. Phá thử: bản sao nhật ký có `203.0.113.7` → hàm kiểm ném «có IP thô».
- [ ] Verify + commit.

### Task 3: Tóm tắt có luật kết luận — phục vụ E9 · independent: false

**Files:** `thu/tom-tat.mjs`, Test: `thu/tom-tat.test.mjs`, `thu/ket-qua.test.mjs`

**Interfaces — Produces:** `lamSach(dong) → dong` (bỏ `ip_bam`) · `thietBi(ua) → 'iPhone'|'Android'|'May tinh'|'khac'` ·
`ketLuan(dong) → [{ve:1..4, ten, dat:boolean, so:string}]` · `bangKetQua(dong) → string` (markdown giữa hai mốc) · CLI
`node tom-tat.mjs <nhat-ky.jsonl> [--ghi]` ghi `nhat-ky-zalo.jsonl` + in bảng.

Luật kết luận viết trước:
- Vế 1 đạt ⟺ có `quan-sat` `xem-truoc=co-anh` từ máy Android VÀ từ iPhone, và mã của mỗi câu trả lời có `tai_anh ≥ 1`.
- Vế 2 đạt ⟺ mã K-* có `tai_trang + tai_anh ≥ 1` và `mo = 0`, và mọi mã A-*, I-* có `mo ≥ 1`.
- Vế 3 đạt ⟺ có `chia-se` từ iPhone `cach=tep`, `ket_cuc=da-gui`, và `quan-sat` `zalo-nhan-anh=co`; vế ghi thêm `zalo-nhan-tin`.
- Vế 4 đạt ⟺ có `nhan-anh` `co_tep=true` từ máy tính.

- [ ] Ca «AC-9 luật kết luận»: nhật ký dựng bằng gọi HTTP vào máy chủ thật đủ ma trận (K chỉ tải; K có báo mở; A, I báo
  mở; báo của UA máy; quan-sat; chia-se bốn kết cục; nhan-anh có và không tệp) → `demTheoMa` của tom-tat bằng `/dem`; bảng
  kết luận đúng; vế 2 đỏ khi K mở = 1, đỏ khi K không có lượt tải.
- [ ] Ca «AC-9 kết quả khớp nhật ký» (`ket-qua.test.mjs`): phần giữa `<!-- dem -->`…`<!-- /dem -->` của `ket-qua.md` ===
  `bangKetQua(nhat-ky-zalo.jsonl)`; tệp không có `ip_bam`, không khớp IPv4/IPv6. Phá thử: sửa một số → «bảng đếm lệch nhật
  ký»; chèn 203.0.113.7 → «có IP thô». Ca này đỏ tới khi có phiên thật — chạy riêng.
- [ ] Verify Task 1–3 (trừ ket-qua) + commit.

### Task 4: Phiên với Zalo thật — chủ kho

- [ ] Gửi một yêu cầu `can-nguoi` gom đủ bước (cài cloudflared nếu chưa có, chạy lệnh, sáu bước của `chay.mjs`).
- [ ] Nhận nhật ký; chạy `tom-tat.mjs <nhật ký> --ghi`.

### Task 5: Kết quả và ADR — phục vụ E9, E10 · independent: false

**Files:** `_acceptance/bai-thu-zalo/ket-qua.md`, `nhat-ky-zalo.jsonl`, `docs/adr/0003-bai-thu-zalo.md`, `docs/product/tham-chieu.md` (thêm dòng)

- [ ] `ket-qua.md`: bảng máy in giữa hai mốc; mỗi vế một dòng đạt/không đạt kèm số; UA của máy Zalo đọc được.
- [ ] ADR-0003 «đề xuất»: bốn việc, mỗi việc khuyến nghị + lối khác + giá + số trỏ ket-qua.md; vế không đạt → các đường đi vòng.
- [ ] `node --test _acceptance/bai-thu-zalo/thu/` xanh toàn bộ. Commit.
