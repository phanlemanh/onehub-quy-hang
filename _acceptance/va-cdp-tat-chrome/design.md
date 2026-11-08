# Thiết kế: va-cdp-tat-chrome — công cụ chụp màn chung luôn tắt Chrome của chính nó

Hàng vá dãy D (đợt `dau-khach-nhap`), giám sát quyết (D-21). Câu giao ở hàng `va-cdp-tat-chrome` của
`docs/plan/lo-trinh.json`.

## Vấn đề

`_acceptance/bang-hang-kieu-sheet/thu/cdp.mjs` là công cụ chụp màn mà 30 tệp chỗ thử của các hồ sơ dùng chung
(`moChrome()` → `trang()` / `dong()`). Nó mở Chrome không đầu bằng `spawn` với một thư mục hồ sơ tạm, và chỉ tắt Chrome ở
một chỗ: `dong()` gọi `p.kill()` (SIGTERM). Bốn lối Chrome sống sót:

1. Lời gọi quên `dong()`, hay ném lỗi trước khi tới `dong()` — Chrome là tiến trình con không `unref`, nhưng khi tiến trình
   gọi thoát thì Chrome không bị ai tắt.
2. Tác tử chấm hết giờ → tiến trình gọi nhận SIGTERM/SIGINT/SIGHUP; `finally` không chạy.
3. Tiến trình gọi bị SIGKILL — không bộ bắt tín hiệu nào chạy được.
4. Ngay cả `dong()` cũng không chắc: Chrome không đầu đôi khi sống qua SIGTERM khi cha đã chết (dãy D đo ở hàng 48,
   `a82b6f0b`), và thư mục hồ sơ tạm `qh-b-chrome-*` không bao giờ bị xoá.

Đo 05/11 (dãy B): bốn Chrome mồ côi giữ ~850 MB đúng lúc máy báo áp lực bộ nhớ mức 2 (luật đợt 43).

## Cách sửa (trong `cdp.mjs`, không đổi API)

- **Nhóm tiến trình riêng.** `spawn(..., { detached: true })`: Chrome và các tiến trình phụ (renderer, GPU) chung một
  nhóm mà PID nhóm là PID Chrome. Tắt = `process.kill(-pid, sig)` — đúng nhóm tiến trình công cụ đã mở, không dò tên
  (luật đợt 8: chỉ kill PID mình đã ghi lúc khởi chạy). `unref()` để Chrome không giữ vòng sự kiện của lời gọi.
- **Sổ PID.** Mỗi lần mở ghi `.acceptance-runs/cdp-chrome/<pid>.json` dưới gốc kho của cây đang chạy (thư mục bị git bỏ
  qua): PID Chrome, thư mục hồ sơ, PID tiến trình gọi, giờ mở. Tắt xong thì xoá dòng sổ.
- **Tắt chắc.** `dong()` gửi SIGTERM cho nhóm, chờ tối đa 2 giây, còn sống thì SIGKILL; xoá thư mục hồ sơ; xoá dòng sổ.
  `dong()` gọi nhiều lần không lỗi. API giữ nguyên dạng đồng bộ cho lời gọi cũ (`dong()` không cần `await`), và trả một
  promise cho lời gọi muốn chờ.
- **Thoát thường và lỗi chưa bắt.** `process.on("exit")` tắt đồng bộ: SIGKILL nhóm, `rmSync` thư mục, xoá dòng sổ.
- **Tín hiệu.** Bắt SIGTERM/SIGINT/SIGHUP: tắt Chrome đồng bộ như trên. Nếu bộ bắt của công cụ là bộ bắt DUY NHẤT của tín
  hiệu ấy thì thoát `128 + số hiệu` (giữ hành vi mặc định của Node — thêm bộ bắt mà không thoát sẽ làm lời gọi treo).
  Lời gọi có bộ bắt riêng (như `luat-chia-lead-cap-han-hong/thu/chay-ui.mjs`) thì bộ bắt riêng vẫn chạy và quyết mã thoát.
- **SIGKILL — người canh.** Không bộ bắt nào chạy khi tiến trình gọi bị SIGKILL, nên công cụ mở kèm một tiến trình canh
  nhỏ (`node`, tách rời, `unref`) cho mỗi Chrome: cứ 500 ms xem tiến trình gọi còn sống không VÀ Chrome còn sống không.
  Tiến trình gọi chết → tắt nhóm Chrome (chỉ khi dòng lệnh của PID Chrome còn mang thư mục hồ sơ), xoá thư mục và dòng
  sổ rồi thoát. Chrome đã tắt (do `dong()` hay bất cứ gì) → người canh thoát luôn, kể cả khi tiến trình gọi còn sống —
  không để lại một `node` mỗi lần mở. PID người canh ghi trong dòng sổ; `dong()` và bộ tắt lúc thoát cũng gửi SIGTERM cho
  nó.
- **Các bước tắt chịu được chồng nhau.** `dong()` (bất đồng bộ) có thể còn dở khi bộ tắt lúc thoát chạy (lời gọi gọi
  `dong()` rồi `process.exit()` ngay — mẫu phổ biến của chỗ thử). Mọi bước xoá và kill bỏ qua «không còn» (`ENOENT`,
  `ESRCH`), không ném lỗi, không in gì ra stderr, không đổi mã thoát.
- **Dọn mồ côi cũ.** Đầu mỗi `moChrome()`: đọc sổ, với mỗi dòng mà tiến trình gọi đã chết:
  1. PID Chrome còn sống VÀ dòng lệnh của nó (đọc bằng `ps -ww`, không cắt) còn mang đúng thư mục hồ sơ đã ghi → tắt
     nhóm, xoá thư mục, xoá dòng.
  2. PID Chrome còn sống nhưng dòng lệnh không mang thư mục (PID đã tái dùng) → không kill; xoá dòng.
  3. PID Chrome đã chết (máy khởi động lại, người canh cũng bị giết) → xoá thư mục nếu còn, xoá dòng.
  Thư mục chỉ được xoá khi đường ghi trong sổ nằm ngay dưới thư mục tạm của hệ thống (`os.tmpdir()`) và tên mang tiền tố
  `qh-b-chrome-`; dòng sổ trỏ đường khác → không đụng đường ấy, chỉ xoá dòng.

## Lối đã loại

- **Dò `ps` theo `--headless=new`** (cách của `chay-ui.mjs` hàng 48, a82b6f0b): bắt nhầm Chrome của lượt khác chạy
  song song trên cùng máy; công cụ đã có PID từ `spawn`, không cần dò.
- **`pkill` / `killall Chrome`**: cấm (luật đợt 8).
- **Chỉ thêm bộ bắt tín hiệu, không người canh**: không phủ SIGKILL — đúng lối tác tử chấm bị ngắt cứng.
- **Sửa từng lời gọi (30 tệp)**: vùng của hàng chỉ là `cdp.mjs`; một chỗ sửa phủ mọi lời gọi.

## Ngoài vòng

Hai chỗ thử đã tự vá (`luat-chia-lead/thu/chay-ui.mjs`, `luat-chia-lead-cap-han-hong/thu/chay-ui.mjs`) giữ nguyên — cách
dò `ps` của chúng vẫn chạy cạnh bản sửa (Chrome đã tắt thì vòng dò không thấy gì). Gỡ cách dò ấy là việc của hàng vá
riêng (`va-e7-loi-that-cap-han` có vùng `luat-chia-lead-cap-han-hong/thu/**`).

## Đối chiếu ngành

Không áp dụng: đây là công cụ chấm nội bộ, không phải đối tượng nghiệp vụ (ADR-0022 áp cho thiết kế sản phẩm).

## Đặc tả UX

Không có — công cụ không có màn (dòng sổ «bỏ đặc-tả-UX»).
