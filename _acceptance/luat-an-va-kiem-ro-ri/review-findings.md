# Review findings: luat-an-va-kiem-ro-ri (round 1)

## Trong hợp đồng

- **Rào cửa ra không bắt được route API công khai viết theo khuôn Hono của kho**
  file: `packages/core/src/redaction/rao-cua-ra.ts:10`
  severity: medium
  AC: AC-9
  source: conventions
  detail: Nhánh API của `timCuaRaThieuKiem` chỉ nhận ra một trang khi tên tệp khớp `^(page|route)\.(tsx?|jsx?)$` dưới `packages/api/src/public`, rồi suy URL `/api/v1/public/<thư mục>` từ cây thư mục. Nhưng kho không dựng API kiểu đó. Mọi route Hono nằm ở `packages/api/src/<miền>/routes.ts` (catalog, contacts, leads, listings, owners, photos, push, today, jobs…). Mỗi tệp có hàm `register*Routes` được `app.ts` gọi, và URL do code khai báo chứ không suy từ đường dẫn. Phía Next, cả API đi qua một catch-all duy nhất là `apps/web/src/app/api/v1/[[...route]]/route.ts`. Rào tính URL của tệp này là `/api/v1/[[...route]]`, không khớp tiền tố `/api/v1/public/` nào. Hệ quả: khi có cửa ra công khai cho trang khách viết theo đúng khuôn của kho, tức `packages/api/src/public/routes.ts` gắn vào `app.ts`, tên `routes.ts` không khớp `route.ts`, nên rào không thấy và không đòi bài kiểm rò rỉ nào. Bài E9 chỉ chứng minh được trên cây mẫu dựng tay `packages/api/src/public/share/route.ts`, một khuôn không có ở đâu trong kho. Như vậy rào của bất biến 4 cho tiền tố `/api/v1/public/` chỉ có trên giấy. Cần đối chiếu theo cách kho thật sự gắn route: tìm đường khai báo trong `register*Routes`/`app.ts`, hoặc bắt buộc một tệp hay một quy ước cụ thể cho route công khai và kiểm luôn quy ước đó.

- **Bộ kiểm rò rỉ bỏ sót số điện thoại đứng sau một dãy số khác (regex giới hạn độ dài)**
  file: `packages/core/src/redaction/kiem-ro-ri.ts:423`
  severity: high
  AC: AC-8
  source: bugs
  detail: Regex số điện thoại là `/\+?\d[\d\s.\-()]{7,20}\d/g`, dài tối đa 22 ký tự. Lớp ký tự cho phép cả dấu cách và dấu chấm, nên một dãy số đứng ngay trước (ví dụ giá ghi kiểu nhóm ba) gộp vào cùng một lần khớp. Lần khớp bị cắt ở giữa số điện thoại, phần còn lại quá ngắn để khớp lần nữa. Đã chạy thử: `timRoRi("Giá 4.250.000.000 0900 000 073", [{truong:'ownerPhone', giaTri:'0900 000 073', kieu:'so_dien_thoai'}])` trả `[]`, tức báo không rò dù số chủ nhà nằm nguyên trong văn bản. Đây đúng là dạng của tin soạn sẵn hay dòng xuất file mà bộ kiểm định quét, nên bài kiểm báo xanh oan cho một lỗ rò thông tin chủ nhà (bất biến 2 và 4). Nên bỏ giới hạn trên của dãy số (giống DAY_SO_TIEN), vì bước sau chỉ so `includes` trên dãy chữ số.

- **Rào cửa ra không bao giờ bắt được route API công khai**
  file: `packages/core/src/redaction/rao-cua-ra.ts:783`
  severity: medium
  AC: AC-9
  source: bugs
  detail: Rào chỉ tính tệp tên `page|route.(ts|tsx|js|jsx)` dưới `packages/api/src/public`. Nhưng API của kho là Hono: route khai `path: "/api/v1/..."` trong mã, tệp tên `routes.ts` (ví dụ packages/api/src/listings/routes.ts, push/routes.ts). Từ phía Next, mọi API đi qua một route bắt hết là `apps/web/src/app/api/v1/[[...route]]/route.ts`, URL tính ra là `/api/v1/[[...route]]`, không khớp tiền tố `/api/v1/public/`. Vì vậy một route `/api/v1/public/...` thêm đúng theo quy ước của kho (`packages/api/src/public/x/routes.ts`, hay `path` khai trong một routes.ts bất kỳ) bị rào bỏ qua mà không báo gì: tiền tố `/api/v1/public/` trong TIEN_TO_CUA_RA thực tế không được thi hành.

- **Nhận nhầm trang thật là trang chỗ giữ khi trang có import viết nhiều dòng**
  file: `packages/core/src/redaction/rao-cua-ra.ts:812`
  severity: low
  AC: AC-9
  source: bugs
  detail: `laChoGiu` chỉ đọc import viết trên một dòng (`/^import .* from "([^"]+)";?$/gm`). Lấy một trang cửa ra vừa dựng `<Placeholder` vừa nhập dữ liệu bằng import nhiều dòng (`import {\n banRaNgoai,\n ...\n} from "@quy-hang/core/redaction";`): `nhap` chỉ còn import của placeholder, nên `every` ra true. Trang bị coi là chỗ giữ và bỏ qua mà không báo, dù đang cầm dữ liệu. Import chỉ để chạy (`import "x";`) cũng lọt theo cách này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 5 — tuyên quét LỚP dạng mã hoá nhưng ma trận đếm tay 16, thiếu phần tử «ket_hop» của chính bảng dạng**
  Người dùng thấy gì: Bài kiểm chưa thử trường hợp văn bản bị mã hoá chồng nhiều lớp, nên nếu phần xử lý đó hỏng thì bài kiểm vẫn báo xanh. Các dạng mã hoá đơn lẻ vẫn được kiểm đủ.
  Căn cứ: Chưa có dữ liệu nào bị lộ, chỉ là một đường kiểm chưa được đo; thêm ca kiểm sau này rẻ và không ảnh hưởng người dùng hiện tại.
  file: `packages/core/src/redaction/khong-ro.test.ts`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
