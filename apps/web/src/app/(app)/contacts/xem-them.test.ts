// «Xem thêm» của danh sách Liên hệ (va-ho-so-lien-he AC-2): kịch bản lỗi của lượt chấm 4 hàng 103 — bộ lọc đổi, trong
// 250 ms chờ gõ người dùng bấm «Xem thêm» — phát lại từng bước trên luật thuần. Mỗi ca âm tính có đối chứng dương trên
// cùng dữ liệu, và luật cũ (chỉ xét «còn con trỏ, đang hiện») được chạy trên cùng kịch bản để chứng nó là kịch bản lỗi.
import assert from "node:assert/strict";
import { test } from "node:test";
import { conTroXemThem, duocNoi, khoaLoc, type TrangCuoi } from "./xem-them";

const A = khoaLoc({ q: "", type: "Seller", status: "", lan: 0 });
const B = khoaLoc({ q: "", type: "Landlord", status: "", lan: 0 });
/** Luật trước bản vá: gửi khi còn con trỏ và danh sách đang hiện, không xét bộ lọc của con trỏ. */
const luatCu = (cursor: string | null, dangHien: boolean) => (cursor && dangHien ? cursor : null);

test("xem thêm: khoá bộ lọc phân biệt từng thành phần", () => {
  const goc = { q: "nguyen", type: "Seller", status: "lead", lan: 0 };
  const BANG: [string, Partial<typeof goc>, boolean][] = [
    ["cùng bộ lọc", {}, true],
    ["cắt khoảng trắng của chuỗi tìm", { q: "  nguyen " }, true],
    ["đổi chuỗi tìm", { q: "tran" }, false],
    ["đổi loại", { type: "Buyer" }, false],
    ["đổi dấu", { status: "contact" }, false],
    ["thử lại", { lan: 1 }, false],
  ];
  let dem = 0;
  for (const [ten, doi, giong] of BANG) {
    assert.equal(khoaLoc({ ...goc, ...doi }) === khoaLoc(goc), giong, `khoá: ${ten}`);
    dem++;
  }
  assert.equal(dem, BANG.length);
});

test("xem thêm: bấm trong 250 ms sau khi đổi bộ lọc không gửi con trỏ cũ", () => {
  // Danh sách của bộ lọc A đã hiện, còn trang (con trỏ c1).
  const trang: TrangCuoi = { khoa: A, tiep: "c1" };
  // Đối chứng dương: chưa đổi bộ lọc thì «Xem thêm» gửi đúng c1.
  assert.equal(conTroXemThem(trang, A, true), "c1", "đối chứng: cùng bộ lọc phải gửi con trỏ");
  // Người dùng đổi sang B; danh sách A vẫn đang hiện (chưa hết 250 ms) — luật cũ gửi c1 kèm bộ lọc B (lỗi của 103).
  assert.equal(luatCu(trang.tiep, true), "c1", "kịch bản phải là kịch bản lỗi của luật cũ");
  assert.equal(conTroXemThem(trang, B, true), null, "gửi con trỏ của bộ lọc cũ kèm bộ lọc mới");
});

test("xem thêm: không gửi khi đang tải hay hết trang", () => {
  const BANG: [string, TrangCuoi | null, boolean, string | null][] = [
    ["còn trang, đang hiện", { khoa: A, tiep: "c1" }, true, "c1"],
    ["đang tải", { khoa: A, tiep: "c1" }, false, null],
    ["hết trang", { khoa: A, tiep: null }, true, null],
    ["chưa có trang nào", null, true, null],
  ];
  let dem = 0;
  for (const [ten, trang, dangHien, mong] of BANG) {
    assert.equal(conTroXemThem(trang, A, dangHien), mong, ten);
    dem++;
  }
  assert.equal(dem, BANG.length);
});

test("xem thêm: trang về sau khi bộ lọc đã đổi thì không nối", () => {
  // Gửi «Xem thêm» ở lượt 3 của bộ lọc A.
  const gui = { luot: 3, khoa: A };
  assert.equal(duocNoi(gui, { luot: 3, khoa: A }), true, "đối chứng: không đổi gì thì nối");
  assert.equal(duocNoi(gui, { luot: 4, khoa: B }), false, "bộ lọc đổi trước khi trang về mà vẫn nối");
  assert.equal(duocNoi(gui, { luot: 4, khoa: A }), false, "lượt đọc mới (thử lại cùng bộ lọc) mà vẫn nối");
  assert.equal(duocNoi(gui, { luot: 3, khoa: B }), false, "khoá đổi cùng lượt mà vẫn nối");
});
