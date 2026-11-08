# Vá nút «Ghim lại hồ sơ cần bản thật»: cài gitleaks cho bài tự kiểm của rào trong làn

Ngày 08/11/2026 · hàng `va-nut-ci-gitleaks` (T3) · dãy Q, đợt `dau-khach-nhap` · Cổng Đáng: giám sát «build» (Q-13),
chủ kho giữ quyền kéo lại.

## Vì sao

Lượt bấm lại nút sau bản vá va-nut-ci-ag-root (run 42440631323, 08/11, hồ sơ moi-truong-that, nhánh của PR #192) đã qua
bước tìm kit. Bước «Ghim lại» chạy đủ bảy suite và mọi eval, nhưng bài tự kiểm của rào đỏ ở hai chỗ (suite 4/7 và eval
E9 của moi-truong-that, cùng lệnh `npm run test:hooks`):

```
      ĐỎ   gitleaks phải có trên CI
    TỔNG: ĐỎ
```

Bài tự kiểm (`.claude/hooks/tests/run.sh`) chỉ bỏ qua ca pre-commit khi máy không có gitleaks và `CI` trống. Máy chủ
GitHub luôn đặt `CI=true`, nên trên máy chủ không cài gitleaks bài ấy đỏ — đúng ý: rào chặn bí mật phải chứng được nó
chạy trên CI. Job `check` của `ci.yml` cài gitleaks (bản `GITLEAKS_VERSION`) trước `npm run test:hooks`; luồng của nút
thì không.

Khối bài tự kiểm trong nhật ký lượt ấy có đúng một dòng ĐỎ (ghim ở `thu/run-42440631323-suite-4-7.txt`). Các eval E1,
E2, E4, E5 của moi-truong-that cũng đỏ ở lượt ấy (`kiem-moi-truong.mjs`), nhưng vì bản thật có sàn không
mang nhãn mẫu — câu đang chờ chủ kho ở #192, không phải việc của hàng này.

## Thiết kế

1. Env của job `ghim-lai` thêm `GITLEAKS_VERSION` (cùng giá trị với `ci.yml`, hôm nay `8.30.1`) và `GITLEAKS_SHA256`
   (digest GitHub công bố cho `gitleaks_8.30.1_linux_x64.tar.gz` của bản phát hành:
   `551f6fc83ea457d62a0d98237cbad105af8d557003051f41f3e7ca7b3f2470eb`).
2. Bước mới «Cài gitleaks (bài tự kiểm của rào trong làn cần nó)» đứng ngay sau bước lấy kit, trước bộ chặn và trước
   «Ghim lại»: tải tệp nén vào `$RUNNER_TEMP`, kiểm băm bằng `sha256sum -c -` TRƯỚC khi giải nén, giải nén riêng tệp
   `gitleaks` vào `$RUNNER_TEMP/gitleaks`, rồi ghi thư mục ấy vào `GITHUB_PATH` — GitHub đặt nó trước PATH của mọi bước
   sau, nên `npm run test:hooks` trong «Ghim lại» thấy gitleaks. Bước không mang bí mật nào.
3. Kiểm băm là chỗ khác với `ci.yml` (job `check` tải không kiểm). Lý do: tệp nhị phân này chạy trong bước «Ghim lại»,
   cạnh chuỗi kết nối bản thật; `ci.yml` không có bí mật nào ở job ấy. Đây là câu Hỏi-1 ở Cổng Phạm vi (khuyến nghị: kiểm).
4. Không đổi bước nào khác, không đổi `KIT_TAG`, bộ chặn, bộ quét, `config.yaml`, `ci.yml`, bài tự kiểm của rào.

Lối khác đã loại: sửa bài tự kiểm cho bỏ qua trên CI, hay cho làn ghim lại chạy suite với `CI` trống — đều hạ thước
(rào chặn bí mật không còn chứng được nó chạy) và đều chạm tệp ngoài vùng (`.claude/hooks/**`, `config.yaml`).

## Bộ đo của hàng (`_acceptance/va-nut-ci-gitleaks/thu/kiem-gitleaks.mjs`)

Chỉ đọc cây kho. Tệp tải, HOME rỗng và kho tạm nằm ở thư mục tạm của hệ điều hành.

- `--tinh` (AC-1): luồng thật đủ năm vế — có bước cài đứng trước «Ghim lại» · bản là `GITLEAKS_VERSION` của `ci.yml` ·
  tệp tải được kiểm băm 64 ký tự ghim ở env của job, dòng kiểm đứng trước dòng `tar` · thư mục cài vào `GITHUB_PATH` ·
  env HIỆU LỰC của bước không có bí mật (env của job, env của bước, và khoá mà bước trước ghi vào `GITHUB_ENV` từ một bí
  mật). Bộ chấm chấm ĐỦ năm vế, không dừng ở vế hỏng đầu; luồng không có bước cài thì vế đầu hỏng và bốn vế còn lại
  «không áp». Ma trận phá viết trước, chín ca, mỗi ca ghi TẬP vế phải hỏng và bộ đo so bằng nhau: bỏ bước (vế đầu, bốn
  vế không áp) · bước đứng sau «Ghim lại» · bản lệch `ci.yml` · bỏ dòng kiểm băm · kiểm băm sau khi giải nén · bỏ dòng
  `GITHUB_PATH` · bước mang bí mật · bí mật ở env của job · phá kép (kiểm băm sau giải nén và bỏ `GITHUB_PATH`, phải hỏng
  đúng hai vế). Ca không áp được vào luồng in «ca phá thử … lệch luồng» và đỏ.
- `--chay` (AC-2): chạy NGUYÊN khối `run` của bước cài rút từ tệp luồng, như máy chủ GitHub: `bash --noprofile --norc -eo
  pipefail`, `HOME` rỗng, `RUNNER_TEMP` và `GITHUB_PATH` tạm, `CI=true`, env của job. Đòi thoát 0, `GITHUB_PATH` đúng một
  dòng trỏ thư mục chứa `gitleaks`, và tệp ấy là bản linux x64 (đầu ELF, máy x86-64). Máy chấm là darwin/arm64 nên không
  chạy được tệp; trên máy linux x64 phép đo chạy thêm `gitleaks version`. Đối chứng: băm ghim lệch một ký tự → bước đỏ
  («FAILED»), không dòng `GITHUB_PATH`, không tệp `gitleaks`. Cần mạng (tải ~8 MB từ GitHub).
- `--hooks` (AC-3): vật ghim là khối bài tự kiểm trong nhật ký bước «Ghim lại» của run 42440631323 (`gh run view
  --log`, 12 dòng kết luận), lưu nguyên văn ở `thu/run-42440631323-suite-4-7.txt`. Bộ đo đòi tập dòng ĐỎ của khối ấy
  đúng bằng {«gitleaks phải có trên CI»} — tức trên máy chủ GitHub không còn chỗ đỏ thứ hai trong bài tự kiểm. Rồi chạy
  lệnh `test:hooks` của `package.json` trên cây kho ở chế độ của bước «Ghim lại» (`CI=true`, bốn biến bản thật để trống
  như `feature_loop.repin_ci_blank_env`): PATH bỏ mọi thư mục có gitleaks → tập dòng kết luận trùng TỪNG DÒNG với khối
  ghim (máy chấm tái hiện đúng cảnh máy chủ); rồi đặt một thư mục chỉ chứa gitleaks của máy chấm trước PATH (đúng cách
  GitHub áp `GITHUB_PATH`) → không dòng ĐỎ nào, giữ mọi dòng ĐẠT của khối ghim, thêm «ĐẠT chặn bí mật đã stage»,
  `TỔNG: ĐẠT`. So bằng nhau, không so chứa.

Trước gộp không có máy chủ GitHub nào chạy được luồng của nút (nút chỉ chạy từ main, bước đầu từ chối ref khác). Khối
cài thì tự đứng được (không bí mật), nên một luồng thử kích bởi push trên nhánh nháp chạy được nó trên ubuntu thật trước
gộp — nhưng phải thêm một tệp `.github/workflows/` ngoài vùng hàng. Đây là câu Hỏi-2 ở Cổng Phạm vi; khuyến nghị: dựng
lại tại máy và để lượt bấm sau gộp là Đường đo (tiền lệ va-nut-ci-ag-root, sổ d-20261107T225855Z-7). Giá của khuyến
nghị: máy chấm dùng bash, tar, sha256sum của macOS và không chạy được tệp x64, nên sai khác GNU/BSD hay một tệp không
chạy được chỉ lộ ở lượt bấm sau gộp (một lượt bấm, một hàng vá nhỏ nếu đỏ). Ba lệnh của khối (`curl -sSfL -o`,
`sha256sum -c -`, `tar -xzf … -C`) là dạng GNU gốc; job `check` của `ci.yml` đã chạy `curl … | tar -xz` trên cùng máy chủ.

## Hồ sơ khác bị chạm

Hai hồ sơ đã ký có eval đo tệp luồng (`paths`): ghim-lai-ban-that-qua-ci (E1, E2) và va-nut-ci-ag-root (E1, E2). Trên
bản vá, cả hai bộ đo tĩnh vẫn xanh (đã chạy trên bản nháp: mười hai vế gác 12/12, ma trận 14/14; bốn ca phá của
va-nut-ci-ag-root). Câu Hỏi-3 ở Cổng Phạm vi; khuyến nghị: không sửa tệp nào của hai hồ sơ ấy, ghim lại cả hai bằng
một lượt làn của kit trước gộp (cùng cách chủ kho chọn ở va-nut-ci-ag-root cho ghim-lai-ban-that-qua-ci). Lối khác: để
hai hồ sơ cũ — lưới gộp chỉ xét hồ sơ có tệp trong PR nên PR vẫn xanh, nhưng bằng chứng đã ký trỏ luồng cũ cho tới khi ai
đó chạm hồ sơ. Giám sát đã cấp chạm `run-log.jsonl` và `evidence-report.md` của va-nut-ci-ag-root (Q-14, 08/11); hồ sơ
ghim-lai-ban-that-qua-ci nằm trong vùng của hàng. Gói Cổng Bằng chứng nêu `sha` mà mỗi hồ sơ được ghim lại trỏ tới.

## Đường đo sau gộp

Bấm nút cho moi-truong-that trên nhánh của PR #192. Nhật ký bước «Cài gitleaks» có dòng `…gitleaks.tar.gz: OK`; nhật ký
bước «Ghim lại» có `suite 4/7: npm run test:hooks → exit 0` và `moi-truong-that E9: npm run test:hooks → exit 0`. Các
eval của `kiem-moi-truong.mjs` có thể vẫn đỏ vì sàn không mang nhãn mẫu trên bản thật — đó là việc của #192.
Timebox: 1 ngày sau gộp.
