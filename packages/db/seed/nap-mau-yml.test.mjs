// Đọc tệp nút «Nạp dữ liệu mẫu» (hàng 87, E8 của hồ sơ nap-mau-ban-that). Phân tích theo dòng — kho không khai thư viện
// YAML; khuôn tệp do chính kho viết. Mỗi luật một lỗi có tên; ca đỏ chạy cùng hàm trên bản sửa của chính tệp.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const TEP = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../../.github/workflows/nap-mau.yml");
const TEN_SAN = "[Mẫu] Sàn thử";

/** Các bước của job: mỗi phần tử là khối dòng bắt đầu bằng `      - `. */
function cacBuoc(dong) {
  const dau = dong.findIndex((d) => /^ {4}steps:\s*$/.test(d));
  const buoc = [];
  for (const d of dong.slice(dau + 1)) {
    if (/^ {6}- /.test(d)) buoc.push([d]);
    else if (/^ {8}/.test(d) && buoc.length) buoc.at(-1).push(d);
    else if (d.trim() && !/^ {6,}/.test(d)) break;
  }
  return buoc.map((b) => b.join("\n"));
}

/** Danh sách lỗi của tệp workflow; rỗng = đạt. */
export function kiemWorkflow(text) {
  const loi = [];
  const dong = text.split("\n");
  const khoaOn = dong.findIndex((d) => /^on:\s*$/.test(d));
  const conOn = [];
  for (const d of dong.slice(khoaOn + 1)) {
    if (/^\S/.test(d)) break;
    if (/^ {2}\S/.test(d)) conOn.push(d.trim());
  }
  if (khoaOn < 0 || conOn.length !== 1 || conOn[0] !== "workflow_dispatch:") loi.push("chỉ workflow_dispatch");
  for (const t of ["viec", "email", "xac_nhan"]) if (!dong.some((d) => d === `      ${t}:`)) loi.push(`thiếu tham số ${t}`);
  if (!/options: \[nap, go\]/.test(text)) loi.push("viec phải là nap hoặc go");
  if (!dong.some((d) => /^ {4}environment: production\s*$/.test(d))) loi.push("environment production");
  if (!dong.some((d) => /^ {6}NODE_ENV: production\s*$/.test(d))) loi.push("NODE_ENV production");
  // Email không được vào môi trường của job: GitHub in môi trường ở đầu log mỗi bước, trước khi kịp che.
  if (dong.some((d) => /^\s+EMAIL: /.test(d))) loi.push("email vào môi trường trước khi che");

  const buoc = cacBuoc(dong);
  if (!(buoc[0]?.includes("refs/heads/main") && buoc[0].includes("exit 1"))) loi.push("chặn nhánh: bước đầu phải thoát khi ref khác main");
  const xacNhan = buoc.find((b) => /if: .*inputs\.viec == 'go'/.test(b));
  if (!(xacNhan?.includes(`"${TEN_SAN}"`) && xacNhan.includes("exit 1"))) loi.push("xác nhận gỡ: thiếu bước so đúng tên sàn mẫu");
  const iChe = buoc.findIndex((b) => b.includes("::add-mask::$EMAIL"));
  const iNap = buoc.findIndex((b) => b.includes("nap-ban-that.ts"));
  if (iChe < 0 || iNap < 0 || iChe > iNap) loi.push("che email trước bước chạy bộ nạp");
  for (const xacNhanGo of [xacNhan]) if (xacNhanGo && buoc.indexOf(xacNhanGo) > iNap) loi.push("xác nhận gỡ phải trước bước chạy bộ nạp");

  // Bí mật và tham số chỉ đi qua env: không dòng `run` nào được chèn `${{ secrets. }}` hay `${{ inputs. }}`.
  let trongRun = false;
  for (const d of dong) {
    if (/^\s+(- )?run: /.test(d) || /^\s+(- )?run: \|/.test(d)) trongRun = true;
    else if (/^\s+(- )?(name|if|uses|with|env):/.test(d)) trongRun = false;
    if (trongRun && /\$\{\{\s*(secrets|inputs)\./.test(d)) loi.push(`chèn thẳng vào lệnh: ${d.trim()}`);
    if (/secrets\./.test(d) && !/^ {6}[A-Z_]+: \$\{\{ secrets\.[A-Z_]+ \}\}\s*$/.test(d)) loi.push(`bí mật ngoài khoá env: ${d.trim()}`);
    if (/(echo|printf).*(OWNER_PHONE_KEY|DATABASE_URL)/.test(d)) loi.push(`in bí mật: ${d.trim()}`);
  }
  return loi;
}

const THAT = readFileSync(TEP, "utf8");

test("nap-mau.yml đạt mọi luật (E8)", () => {
  assert.deepEqual(kiemWorkflow(THAT), []);
});

test("chiều đỏ: bỏ bước chặn nhánh thì báo «chặn nhánh»", () => {
  const sua = THAT.replace(/ {6}- name: Chỉ nhánh main\n {8}run: \|\n.*\n/, "");
  assert.notEqual(sua, THAT, "bản sửa phải khác tệp thật");
  assert.ok(kiemWorkflow(sua).some((l) => l.startsWith("chặn nhánh")), kiemWorkflow(sua).join("; "));
});

test("chiều đỏ: chèn bí mật thẳng vào lệnh hay echo khoá thì báo", () => {
  const chen = THAT.replace('--email "$EMAIL"', '--email "${{ inputs.email }}"');
  assert.ok(kiemWorkflow(chen).some((l) => l.startsWith("chèn thẳng vào lệnh")));
  const inKhoa = THAT.replace('echo "::add-mask::$EMAIL"', 'echo "$OWNER_PHONE_KEY"');
  assert.ok(kiemWorkflow(THAT.replace("      NODE_ENV: production\n", "      NODE_ENV: production\n      EMAIL: ${{ inputs.email }}\n")).includes("email vào môi trường trước khi che"));
  const loi = kiemWorkflow(inKhoa);
  assert.ok(loi.some((l) => l.startsWith("in bí mật")) && loi.includes("che email trước bước chạy bộ nạp"), loi.join("; "));
});

test("chiều đỏ: thêm sự kiện push, bỏ xác nhận gỡ, bỏ NODE_ENV thì báo", () => {
  assert.ok(kiemWorkflow(THAT.replace("on:\n  workflow_dispatch:", "on:\n  push:\n  workflow_dispatch:")).includes("chỉ workflow_dispatch"));
  assert.ok(kiemWorkflow(THAT.replace(`"${TEN_SAN}"`, '"bất kỳ"')).includes("xác nhận gỡ: thiếu bước so đúng tên sàn mẫu"));
  assert.ok(kiemWorkflow(THAT.replace("      NODE_ENV: production\n", "")).includes("NODE_ENV production"));
});
