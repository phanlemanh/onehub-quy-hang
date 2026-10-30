# Review findings: tang-5-giao-dien (round 1)

## Trong hợp đồng

- **Rà directive trần và đếm ngoại lệ bỏ qua components/blocks và components/examples, trong khi ESLint vẫn áp luật quy-hang-ui cho hai thư mục đó**
  file: `packages/ui-lint/check-bare-disables.mjs:53`
  severity: medium
  AC: AC-7
  source: conventions
  detail: Trong eslint.config.mjs, chỉ components/ui/** và components/reui/** nằm ngoài luật quy-hang-ui (`VENDOR = [".../components/ui/**", ".../components/reui/**"]`). Vậy các khối ReUI và ví dụ c-* đã chuyển thể vào components/blocks/** và components/examples/** vẫn bị luật quét, đúng tinh thần của .claude/rules/giao-dien.md (chuyển thể là sửa dữ liệu, chữ, prop nên phải chịu lint). Nhưng check-bare-disables.mjs (dòng 53) và muc-no.mjs (dòng 23) đều khai `VENDOR = ["ui", "reui", "blocks", "examples"]` rồi bỏ qua hai thư mục này. Hệ quả: một dòng `/* eslint-disable */` trần ở đầu tệp trong components/blocks tắt hết luật quy-hang-ui của tệp đó mà không bị chặn ở đâu. Luật require-disable-reason không tự bắt được dạng này (chính phần chú thích đầu tệp check-bare-disables.mjs đã nói vậy), còn script bù thì bỏ qua thư mục. Mức nợ vẫn 0/0 và `npm run lint` vẫn xanh. Các ngoại lệ có lý do trong blocks/examples cũng không được muc-no đếm và in ra, trái với điều mức nợ hứa là người duyệt PR thấy từng dòng. Hiện chưa có thư mục blocks, nhưng màn đầu tiên theo vo-va-ia.md sẽ cài khối vào đó. Cách sửa: cho hai script dùng cùng danh sách vendor với eslint.config.mjs (chỉ ui, reui), hoặc thêm blocks/examples vào phần bỏ qua của ESLint nếu thật sự muốn coi chúng là vendor.

- **Bare eslint-disable inside components/blocks and components/examples silently turns off all quy-hang-ui rules**
  file: `packages/ui-lint/check-bare-disables.mjs:52`
  severity: medium
  AC: AC-7
  source: bugs
  detail: eslint.config.mjs only excludes components/ui and components/reui from the UI rules (VENDOR = ui, reui). So the ten quy-hang-ui/* rules run at error level on apps/web/src/components/blocks/** and components/examples/**. I confirmed this with calculateConfigForFile: no-raw-table and require-disable-reason are both 2 there. ESLint swallows the require-disable-reason report when the directive is a bare one, and check-bare-disables.mjs exists to catch exactly that case. But its VENDOR list is ["ui","reui","blocks","examples"], so scanSrc skips those two folders. Repro: lintText('/* eslint-disable */\n<table className="text-[10px]"/>', {filePath:'apps/web/src/components/blocks/x.tsx'}) returns [] (no messages), and the scanner never looks at that file, so `npm run lint` stays green. Blocks are where ReUI blocks get placed and adapted by hand, so this hole is in the folder that gets edited most. muc-no.mjs:24 copies the same VENDOR list, so reasoned exceptions in blocks/examples are also left out of the «ngoại lệ có lý do» count. Fix: make VENDOR in both scripts match the ESLint config (ui, reui only), or ignore blocks/examples in the ESLint config as well.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The text-based comment scanner misses directives that come after a URL or glob string on the same line**
  Người dùng thấy gì: Hiếm khi, một dòng tắt kiểm tra giao diện mà không ghi lý do có thể lọt qua nếu cùng dòng đó có đường dẫn hay địa chỉ web. Người duyệt PR vẫn thấy được dòng đó khi đọc thay đổi.
  Căn cứ: Chỉ xảy ra với cách viết hiếm, không làm mất hay lộ dữ liệu của ai, và người duyệt PR vẫn nhìn thấy dòng đó; sửa sau được rẻ vì chỉ đổi cách đọc chú thích.
  file: `packages/ui-lint/check-bare-disables.mjs`
  severity: low
  Đề xuất: known-limits

- **Debt-ceiling gate passes silently when `tran` is missing or not a number, or when main's ceiling file can't be read**
  Người dùng thấy gì: Nếu tệp ghi mức trần bị sửa hỏng hoặc mất con số, cổng chặn tăng nợ giao diện có thể cho qua mà không báo. Chỉ ảnh hưởng người sửa tệp này, không ảnh hưởng người dùng cuối.
  Căn cứ: Cần ai đó sửa tệp trần sai đúng kiểu này mới gặp, hậu quả chỉ là nợ giao diện tăng mà không bị chặn, không động đến dữ liệu khách; người duyệt PR nhìn thấy thay đổi tệp trần và sửa sau rẻ.
  file: `packages/ui-lint/muc-no.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét LỚP nhưng chỉ có điểm-case): ma trận phá của kiem-chuan không phủ hết các nhánh lỗi của script**
  Người dùng thấy gì: Một số lỗi khai thiếu trong cấu hình giao diện của kho chưa có bài thử riêng bắt được. Nếu bước kiểm này hỏng đúng chỗ đó, bài thử vẫn xanh và không ai hay.
  Căn cứ: Không ảnh hưởng trực tiếp người dùng, bước kiểm vẫn chạy và chặn các lỗi chính; thiếu bài thử chỉ làm lỗi trong chính bước kiểm khó bị phát hiện sớm, bổ sung sau rẻ.
  file: `packages/ui-lint/tests/kiem-chuan.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): test tim-kit tự soạn sẵn danh sách bản cài và danh sách gốc kho, không đọc sổ plugin thật**
  Người dùng thấy gì: Bài thử việc tự tìm bộ công cụ nghiệm thu dùng dữ liệu viết tay, chưa chạy trên sổ cài thật. Nếu cách đọc sổ thật sai, bước sàn thiết kế có thể không chạy mà bài thử vẫn xanh.
  Căn cứ: Chỉ làm bước chạy sàn thiết kế trên máy người làm có thể báo lỗi, không mất dữ liệu và thử lại được ngay; lần sửa gần nhất đã xử lý đường này nên rủi ro còn lại nhỏ.
  file: `packages/ui-lint/tests/tim-kit.test.mjs`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
