# Job secrets của CI quét đúng lịch sử của commit đang xét — thiết kế

Hàng lộ trình: `va-ci-secrets-quet-dung-lich-su` · Hồ sơ: `_acceptance/va-ci-secrets-quet-dung-lich-su/` · Hạng T3 (rào).

## Vì sao

Job `secrets` chạy `gitleaks git .` sau checkout `fetch-depth: 0`. Hai sự thật gộp lại thành lỗi:

- `actions/checkout@v4` với `fetch-depth: 0` luôn nạp `+refs/heads/*:refs/remotes/origin/*` và mọi tag (mã nguồn
  `getRefSpecForAllHistory`), nên kho trên máy CI có mọi nhánh đã đẩy lên GitHub.
- gitleaks 8.30.1 không có `--log-opts` thì gọi `git log -p -U0 --full-history --all --diff-filter=tuxdb` — `--all` là
  mọi ref, gồm cả các nhánh vừa nạp.

Còn `.gitleaksignore` chỉ được đọc từ cây đang checkout. Một nhánh mang giá trị mẫu cùng tệp bỏ qua của nó làm đỏ mọi
commit khác không có tệp ấy. Đã xảy ra hai lần ngày 08/11: `66b6521d` (6 dòng, đỏ main sau #204) và `f848f717` (3 dòng,
đỏ main sau #213); cách gỡ tạm là gộp chính PR mang tệp bỏ qua (#206, #214), trong lúc đó bước triển khai bị bỏ qua.

Đã đo tại máy trên lịch sử thật (kho tạm mượn đối tượng, chỉ có đúng một ref trỏ commit vi phạm, đứng tại commit main đỏ):

| Đứng tại | Ref thêm | Lệnh hiện tại | Lệnh mới |
|---|---|---|---|
| `fc0dab7b` (sau #204) | `66b6521d` | thoát 1, 6 phát hiện | thoát 0, 0 phát hiện |
| `001ae667` (sau #213) | `f848f717` | thoát 1, 3 phát hiện | thoát 0, 0 phát hiện |

## Thiết kế

Đổi đúng một dòng lệnh ở job `secrets`, thêm `--log-opts`:

```bash
"$HOME/bin/gitleaks" git --redact --no-banner --log-level warn --log-opts="--full-history --diff-filter=tuxdb HEAD" .
```

`--log-opts` thay toàn bộ đối số phạm vi của gitleaks (`sources/git.go` v8.30.1), nên phải chép lại `--full-history` và
`--diff-filter=tuxdb`; chỉ `--all` đổi thành `HEAD`. `git log -p -U0 --full-history --diff-filter=tuxdb HEAD` là lệnh mặc
định trừ phạm vi ref.

`HEAD` là gì trên CI:

- `pull_request`: `refs/pull/N/merge`, một commit gộp có hai cha là đỉnh main và đỉnh nhánh PR → phủ trọn lịch sử cả hai.
- `push` lên main: đỉnh main → phủ trọn lịch sử main, gồm mọi nhánh đã gộp (cha thứ hai).

`fetch-depth: 0` giữ nguyên vì `HEAD` cần toàn bộ lịch sử. `.gitleaksignore` không đổi, không thêm cấu hình gitleaks.

Sửa dòng chú thích phía trên job cho đúng phạm vi mới.

## Lối đã loại

- **Quét theo khoảng `base..head`** (cách `gitleaks-action` làm: `--no-merges --first-parent base^..head`): không phủ
  lịch sử main, trái yêu cầu.
- **`--log-opts=HEAD` trần**: bỏ `--diff-filter=tuxdb` và `--full-history`, đổi hành vi ngoài phạm vi ref.

## Điều chủ kho quyết ở Cổng Phạm vi

**Hỏi-1 — phần CI thôi quét.** Trước đây job của bất kỳ PR nào cũng quét «ké» mọi nhánh và tag. Sau bản này:

- nhánh đã đẩy, chưa mở PR: chưa được CI quét cho tới khi mở PR hoặc gộp;
- nhánh không bao giờ mở PR, và tag ngoài lịch sử `HEAD`: **không bao giờ** được CI quét. Kho hiện có đúng một tag như vậy,
  `thu/bai-thu-luoi-5000-dong-v1`.

Lưới còn lại: hook `pre-commit` trên máy và job `secrets` khi mở PR. Khuyến nghị chấp nhận: phần mất là độ phủ tình cờ, cũng
chính là cơ chế gây đỏ oan; khoá đã đẩy lên là đã lộ dù quét lúc nào. Lối khác: thêm luồng theo lịch quét mọi ref, không nằm
trong `ci-ok` — giá là một luồng CI mới phải giữ, và báo nhầm trên nhánh dở vẫn phát cảnh báo.

**Hỏi-2 — cách thu phạm vi.** Khuyến nghị `--log-opts`, một dòng. Lối khác còn sống: sau checkout xoá mọi ref trừ `HEAD`, giữ
nguyên `gitleaks git .`. Lối ấy không phải chép đối số mặc định của gitleaks 8.30.1, đổi lại thêm một bước xoá ref vào job
và phạm vi quét phụ thuộc bước đó có chạy đúng không. Giá của lối khuyến nghị: nâng `GITLEAKS_VERSION` thì lệnh không tự theo
mặc định mới — E4 đọc đối số thật nên sẽ đỏ khi đo lại.

**Hỏi-3 — đo chiều đỏ trên GitHub thật.** Khuyến nghị không làm: kho tạm dựng đúng refspec của `actions/checkout`, cùng bản
gitleaks, cộng vế tĩnh cấm `ref:` ở bước checkout. Lối khác còn sống: một kho GitHub riêng tư tạm chép luồng CI và đẩy khoá
mẫu — chiều đỏ được thấy trên máy chủ thật, đổi lại phải tạo một tài nguyên ngoài kho rồi dọn. Không bao giờ đẩy khoá mẫu lên
chính kho này trước khi bản vá vào main, vì đó đúng là lỗi đang sửa.

## Đo

`_acceptance/va-ci-secrets-quet-dung-lich-su/thu/kiem-secrets.mjs`, ba chế độ, chạy **đúng dòng lệnh rút từ `ci.yml`**,
không chép tay:

- `--ma-tran`: dựng kho nguồn tạm rồi kho máy chạy theo đúng các refspec của `actions/checkout` (gồm `refs/pull/7/merge`);
  mười một ca viết trước (vị trí giá trị × sự kiện × có dấu vân tay, cộng đối chứng `HEAD` lệch khỏi commit gộp), mỗi ca
  chạy lệnh mới và lệnh cũ làm đối chứng, so mã thoát VÀ tập commit phát hiện. Khoá mẫu sinh lúc chạy, không nằm trong kho. Đo thêm đối số `git log` thật qua
  `GIT_TRACE`.
- `--tinh`: bảy vế của rào trên `ci.yml`, mười một bản phá trên bản sao văn bản, và phạm vi từng commit của hàng.
- `--that`: hai lần đỏ thật ở bảng trên, mỗi mốc là kho tạm chỉ có đúng ref đã khai.

## Ngoài phạm vi

- Kiểm băm tệp tải gitleaks của job `check` và `secrets`.
- Thêm luồng lịch quét mọi ref (lối khác của Hỏi-1).
- Xoá hay sửa dòng nào trong `.gitleaksignore`; rút giá trị mẫu khỏi lịch sử.
- Hook `pre-commit`, `.githooks/**`, các job khác của `ci.yml`.

## Đặc tả UX

Không chạm giao diện — bỏ theo dòng sổ `descope`.
