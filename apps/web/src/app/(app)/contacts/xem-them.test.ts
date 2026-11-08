// «Xem thêm» của danh sách Liên hệ (va-ho-so-lien-he AC-2): kịch bản lỗi của lượt chấm 4 hàng 103 — bộ lọc đổi, trong
// 250 ms chờ gõ người dùng bấm «Xem thêm» — phát lại từng bước trên luật thuần. Mỗi ca âm tính có đối chứng dương trên
// cùng dữ liệu, và luật cũ (chỉ xét «còn con trỏ, đang hiện») được chạy trên cùng kịch bản để chứng nó là kịch bản lỗi.
import assert from "node:assert/strict";
import { test } from "node:test";
import { canDocLan } from "./lien-he";
import {
  conTroXemThem,
  duocNoi,
  khoaLoc,
  trangKhiKhongDoc,
  trangTuMayChu,
  type TrangCuoi,
  type TrangMayChu,
} from "./xem-them";

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
  // Gửi «Xem thêm» ở lượt 3 của bộ lọc A, con trỏ c1.
  const gui = { luot: 3, khoa: A, cursor: "c1" };
  assert.equal(duocNoi(gui, { luot: 3, khoa: A, cursor: "c1" }), true, "đối chứng: không đổi gì thì nối");
  assert.equal(duocNoi(gui, { luot: 4, khoa: B, cursor: "c1" }), false, "bộ lọc đổi trước khi trang về mà vẫn nối");
  assert.equal(duocNoi(gui, { luot: 4, khoa: A, cursor: "c1" }), false, "lượt đọc mới (thử lại cùng bộ lọc) mà vẫn nối");
  assert.equal(duocNoi(gui, { luot: 3, khoa: B, cursor: "c1" }), false, "khoá đổi cùng lượt mà vẫn nối");
});

test("xem thêm: bấm hai lần trước khi trang về thì trang chỉ nối một lần", () => {
  // Hai lần bấm cùng gửi con trỏ c1 của bộ lọc A; lần về đầu nối trang và đưa con trỏ trang cuối sang c2.
  const gui = { luot: 3, khoa: A, cursor: "c1" };
  let cuoi: string | null = "c1";
  let noi = 0;
  for (const tiep of ["c2", "c2"]) {
    if (duocNoi(gui, { luot: 3, khoa: A, cursor: cuoi })) {
      noi++;
      cuoi = tiep;
    }
  }
  assert.equal(noi, 1, "cùng một trang nối hai lần (lặp dòng)");
  // Luật trước bản sửa (chỉ so lượt và khoá) trên cùng kịch bản nối hai lần — chứng đó là kịch bản lỗi.
  const luatTruoc = (g: typeof gui, h: typeof gui) => g.luot === h.luot && g.khoa === h.khoa;
  assert.equal([0, 1].filter(() => luatTruoc(gui, { luot: 3, khoa: A, cursor: "c2" })).length, 2, "kịch bản phải là kịch bản lỗi của luật trước");
});

// Hàng vá va-xem-them-noi-lap-dong (Ngoài-1 của khung-ho-so-lien-he): đã nối trang 2, gõ rồi xoá ô tìm trong 250 ms — lượt
// không đọc lại ấy từng đưa trang cuối về trang máy chủ lúc mở màn, nên lần «Xem thêm» kế gửi lại con trỏ trang 2 và lặp dòng.
const K0 = khoaLoc({ q: "", type: "", status: "", lan: 0 });
const K1 = khoaLoc({ q: "", type: "Seller", status: "", lan: 0 });

test("xem thêm: trang cuối sau lượt không đọc lại", () => {
  const dau: TrangMayChu = { khoa: K0, nextCursor: "c1" };
  const daNoi: TrangCuoi = { khoa: K0, tiep: "c3" };
  // Đối chứng dương: lúc mở màn có trang máy chủ thì «Xem thêm» bấm được ngay, gửi con trỏ của trang ấy.
  assert.equal(conTroXemThem(trangTuMayChu(dau), K0, true), "c1", "mở màn: Xem thêm phải gửi con trỏ của trang máy chủ");
  const BANG: [string, TrangCuoi | null, TrangCuoi | null][] = [
    ["mở màn có trang máy chủ", trangTuMayChu(dau), { khoa: K0, tiep: "c1" }],
    ["mở màn không trang máy chủ", trangTuMayChu(null), null],
    ["không đọc lại, không trang mới: giữ trang đã nối", trangKhiKhongDoc(daNoi, null, K0), { khoa: K0, tiep: "c3" }],
    ["máy chủ vừa trao trang mới đúng bộ lọc", trangKhiKhongDoc(daNoi, { khoa: K0, nextCursor: "c1b" }, K0), { khoa: K0, tiep: "c1b" }],
    ["trang máy chủ mới của bộ lọc khác", trangKhiKhongDoc(daNoi, { khoa: K1, nextCursor: "x" }, K0), { khoa: K0, tiep: "c3" }],
  ];
  let dem = 0;
  for (const [ten, thuc, mong] of BANG) {
    assert.deepEqual(thuc, mong, ten);
    dem++;
  }
  assert.equal(dem, 5);
  assert.notDeepEqual(trangKhiKhongDoc(daNoi, null, K0), trangTuMayChu(dau), "không đọc lại: trang cuối quay về trang máy chủ lúc mở màn");
});

/** Mã liên hệ mẫu, duy nhất. */
const ma = (tu: number, so: number) => Array.from({ length: so }, (_, i) => `lh-${tu + i}`);
type TrangDuLieu = TrangMayChu & { items: string[] };
type LuatKhongDoc = (hienTai: TrangCuoi | null, dauMoi: TrangMayChu | null, khoaLuot: string) => TrangCuoi | null;

/**
 * Bộ phát lại hiệu ứng đọc danh sách và «Xem thêm» của vung.tsx trên luật thật (khoaLoc, canDocLan, conTroXemThem,
 * duocNoi, trangTuMayChu) với luật nhánh không đọc lại thay được. Trang máy chủ mới nhận như vung.tsx: đối tượng `dau`
 * khác đối tượng đã dùng thì là trang mới (`dauMoi`), cùng đối tượng thì không.
 */
function manLienHe(dauDau: TrangDuLieu, trangSau: Record<string, { items: string[]; nextCursor: string | null }>, khiKhongDoc: LuatKhongDoc) {
  let bang = [...dauDau.items];
  let trang = trangTuMayChu(dauDau);
  let tiep = trang?.tiep ?? null;
  let khoaDaCo: string | null = dauDau.khoa;
  let dauDaDung: TrangDuLieu = dauDau;
  let luot = 0;
  let khoa = dauDau.khoa;
  const gui: string[] = [];
  return {
    get bang() {
      return bang;
    },
    gui,
    /** Một lượt của hiệu ứng đọc danh sách với ô tìm `q` và trang máy chủ `dau` của lần vẽ ấy. */
    hieuUng(q: string, dau: TrangDuLieu = dauDau): "hen-doc" | "khong-doc" {
      luot++;
      khoa = khoaLoc({ q, type: "", status: "", lan: 0 });
      const dauMoi = dau !== dauDaDung ? dau : null;
      if (canDocLan(dauMoi?.khoa ?? null, khoa, khoaDaCo)) return "hen-doc";
      if (dauMoi && dauMoi.khoa === khoa) {
        dauDaDung = dauMoi;
        bang = [...dauMoi.items];
      }
      khoaDaCo = khoa;
      trang = khiKhongDoc(trang, dauMoi, khoa);
      tiep = trang?.tiep ?? null;
      return "khong-doc";
    },
    /** Bấm «Xem thêm»: trả hàm «trang về» để kịch bản chọn lúc trang về. */
    bam(): () => void {
      const cursor = conTroXemThem(trang, khoa, true);
      assert.ok(cursor, "Xem thêm phải bấm được");
      gui.push(cursor);
      const guiLuc = { luot, khoa, cursor };
      const kq = trangSau[cursor];
      assert.ok(kq, `con trỏ lạ ${cursor}`);
      return () => {
        if (!duocNoi(guiLuc, { luot, khoa, cursor: tiep })) return;
        tiep = kq.nextCursor;
        bang = [...bang, ...kq.items];
        trang = { khoa: guiLuc.khoa, tiep: kq.nextCursor };
      };
    },
    xemThem() {
      this.bam()();
    },
  };
}

/** Luật trước bản vá: nhánh không đọc lại gán trang máy chủ lúc mở màn khi khoá trùng. */
const luatCuKhongDoc =
  (dau: TrangMayChu): LuatKhongDoc =>
  (hienTai, dauMoi, k) =>
    dauMoi && dauMoi.khoa === k ? { khoa: k, tiep: dauMoi.nextCursor } : k === dau.khoa ? { khoa: k, tiep: dau.nextCursor } : hienTai;

/** Ba trang mẫu: 50, 50, 10 dòng. */
const DAU: TrangDuLieu = { khoa: K0, items: ma(1, 50), nextCursor: "c1" };
const SAU_3: Record<string, { items: string[]; nextCursor: string | null }> = {
  c1: { items: ma(51, 50), nextCursor: "c2" },
  c2: { items: ma(101, 10), nextCursor: null },
};
/** Bốn trang mẫu: 50, 50, 50, 10 dòng. */
const SAU_4: Record<string, { items: string[]; nextCursor: string | null }> = {
  c1: { items: ma(51, 50), nextCursor: "c2" },
  c2: { items: ma(101, 50), nextCursor: "c3" },
  c3: { items: ma(151, 10), nextCursor: null },
};

/** Mở màn → Xem thêm → gõ «a» → xoá «a» trong 250 ms (lượt hẹn bị huỷ, bảng vẫn là dữ liệu của bộ lọc rỗng). */
function denSauGoXoa(m: ReturnType<typeof manLienHe>) {
  assert.equal(m.hieuUng(""), "khong-doc", "mở màn cùng bộ lọc với trang máy chủ: không đọc lại");
  m.xemThem();
  assert.equal(m.hieuUng("a"), "hen-doc", "gõ «a»: hẹn đọc sau 250 ms");
  assert.equal(m.hieuUng(""), "khong-doc", "xoá «a» trong 250 ms: bảng đã đúng bộ lọc, không đọc lại");
}

test("xem thêm: gõ rồi xoá ô tìm trong 250 ms không lặp dòng", () => {
  const m = manLienHe(DAU, SAU_3, trangKhiKhongDoc);
  denSauGoXoa(m);
  m.xemThem();
  assert.deepEqual(m.gui, ["c1", "c2"], "lần Xem thêm sau gõ-xoá phải gửi con trỏ trang 3");
  assert.equal(m.bang.length, 110);
  assert.equal(new Set(m.bang).size, m.bang.length, "bảng có dòng lặp");
  assert.deepEqual(m.bang, [...DAU.items, ...SAU_3.c1!.items, ...SAU_3.c2!.items], "dòng phải theo thứ tự trang 1, 2, 3");

  // Luật trước bản vá trên cùng kịch bản gửi lại c1 và lặp đủ một trang — chứng đó là kịch bản lỗi.
  const cu = manLienHe(DAU, SAU_3, luatCuKhongDoc(DAU));
  denSauGoXoa(cu);
  cu.xemThem();
  assert.deepEqual(cu.gui, ["c1", "c1"], "kịch bản phải là kịch bản lỗi của luật cũ");
  assert.equal(cu.bang.length - new Set(cu.bang).size, 50, "luật cũ phải lặp đủ một trang");
});

test("xem thêm: hai lần Xem thêm liền sau gõ-xoá đi đúng c2 rồi c3", () => {
  const m = manLienHe(DAU, SAU_4, trangKhiKhongDoc);
  denSauGoXoa(m);
  m.xemThem();
  m.xemThem();
  assert.deepEqual(m.gui, ["c1", "c2", "c3"], "hai lần Xem thêm sau gõ-xoá phải gửi c2 rồi c3");
  assert.equal(m.bang.length, 160);
  assert.equal(new Set(m.bang).size, 160, "bảng có dòng lặp");
  assert.deepEqual(m.bang, ma(1, 160), "dòng phải theo thứ tự trang 1, 2, 3, 4");
});

test("xem thêm: gõ-xoá trong lúc trang Xem thêm đang về thì trang ấy bỏ, lần bấm kế nối nó một lần", () => {
  const m = manLienHe(DAU, SAU_3, trangKhiKhongDoc);
  assert.equal(m.hieuUng(""), "khong-doc");
  const ve = m.bam(); // gửi c1, trang 2 chưa về
  assert.equal(m.hieuUng("a"), "hen-doc");
  assert.equal(m.hieuUng(""), "khong-doc");
  ve(); // trang 2 về sau hai lượt đọc mới: duocNoi bỏ (luật lượt của va-ho-so-lien-he)
  assert.equal(m.bang.length, 50, "trang về sau lượt gõ-xoá không được nối");
  m.xemThem();
  m.xemThem();
  assert.deepEqual(m.gui, ["c1", "c1", "c2"], "lần bấm kế phải gửi lại c1 rồi c2");
  assert.equal(new Set(m.bang).size, m.bang.length, "bảng có dòng lặp");
  assert.deepEqual(m.bang, ma(1, 110), "dòng phải theo thứ tự trang 1, 2, 3");
});

test("xem thêm: vẽ lại với cùng trang máy chủ giữ trang đã nối; trang máy chủ mới thay bảng và con trỏ", () => {
  // Vẽ lại với CÙNG đối tượng trang máy chủ (không phải trang mới): giữ c2.
  const m = manLienHe(DAU, SAU_3, trangKhiKhongDoc);
  denSauGoXoa(m);
  assert.equal(m.hieuUng("", DAU), "khong-doc");
  m.xemThem();
  assert.deepEqual(m.gui, ["c1", "c2"], "vẽ lại cùng trang máy chủ: trang cuối phải giữ c2");
  assert.equal(new Set(m.bang).size, m.bang.length, "bảng có dòng lặp");

  // Máy chủ trao trang mới cùng bộ lọc (đối tượng khác): bảng thay bằng trang ấy và con trỏ là của nó, cùng một lượt.
  const n = manLienHe(DAU, SAU_3, trangKhiKhongDoc);
  denSauGoXoa(n);
  const dauMoi: TrangDuLieu = { khoa: K0, items: ma(1, 50), nextCursor: "c1" };
  assert.equal(n.hieuUng("", dauMoi), "khong-doc");
  assert.deepEqual(n.bang, dauMoi.items, "trang máy chủ mới: bảng phải là trang ấy");
  n.xemThem();
  assert.deepEqual(n.gui, ["c1", "c1"], "trang máy chủ mới: con trỏ phải là của trang ấy");
  assert.deepEqual(n.bang, ma(1, 100), "trang máy chủ mới: nối đúng trang 2 một lần");
});
