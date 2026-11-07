// Đọc tên xã gõ thiếu một phần dấu (hàng doc-xa-thieu-mot-phan-dau) — E1…E7. Mỗi phép đo là một hàm kiểm thuần trả danh
// sách lỗi: bộ đọc mới (soDau mặc định «tuong-thich») ra rỗng; phá thử chạy CÙNG hàm kiểm, CÙNG ma trận với công tắc khác
// hoặc bộ đọc cấy lệch, ghim thông điệp. Ma trận rút từ danh mục theo luật viết trước trong hợp đồng; số dòng in ra.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { boDau, dangSo } from "./chuan-hoa";
import { DANH_MUC_DON_VI_HANH_CHINH as DM, type DonViCapTinh, type DonViCapXa, type DonViCapXaCu } from "./danh-muc";
import { docDiaChi, type KetQuaDiaChi } from "./doc-dia-chi";
import { docDiaChiVoi, type SoDau } from "./doc-dia-chi-loi";

type Doc = (chu: string) => KetQuaDiaChi;
const docVoi =
  (soDau: SoDau): Doc =>
  (chu) =>
    docDiaChiVoi(chu, DM, { trongTinh: true, nhanHuyenTP: true, soDau });
const docMoi: Doc = (chu) => docDiaChi(chu);

const TINH = new Map<string, DonViCapTinh>(DM.tinh.map((t) => [t.ma, t]));
const tenTinh = (ma: string) => TINH.get(ma)!.ten;

/** Dạng giữ chữ: bỏ dấu thanh, giữ â ă ê ô ơ ư đ, chữ thường (cùng nghĩa với bộ đọc). */
const giu = (s: string) => s.normalize("NFD").replace(/[̣̀́̃̉]/g, "").normalize("NFC").toLowerCase();
const coMu = (ch: string) => boDau(ch) !== ch;
const soMu = (ten: string) => [...giu(ten)].filter(coMu).length;
const MU = /[̛̂̆]/g;

/** Chữ gốc của một chữ (bỏ mũ/móc/đ), giữ dấu thanh và hoa thường. */
function veGoc(ch: string): string {
  if (ch === "đ") return "d";
  if (ch === "Đ") return "D";
  return ch.normalize("NFD").replace(MU, "").normalize("NFC");
}

/** Dạng thiếu: giữ chữ mũ/móc/đ đầu tiên, đổi các chữ mũ/móc/đ còn lại về gốc, giữ dấu thanh. */
function dangThieu(ten: string): string {
  let daGiu = false;
  return [...ten]
    .map((ch) => {
      if (!coMu(giu(ch))) return ch;
      if (!daGiu) {
        daGiu = true;
        return ch;
      }
      return veGoc(ch);
    })
    .join("");
}

const THEM_MU: Record<string, string> = { a: "̂", o: "̂", e: "̂", u: "̛" };

/** Dạng sai: chữ gốc đầu tiên thuộc a, o, u, e, d mà danh mục để gốc → gõ thành chữ mang mũ/móc/đ. null khi không có. */
function dangSai(ten: string): string | null {
  const chu = [...ten];
  for (let i = 0; i < chu.length; i++) {
    const ch = chu[i]!;
    const g = giu(ch);
    if (g === "d") {
      chu[i] = ch === "D" ? "Đ" : "đ";
      return chu.join("");
    }
    const mu = THEM_MU[g];
    if (mu) {
      const nfd = ch.normalize("NFD");
      chu[i] = (nfd[0]! + mu + nfd.slice(1)).normalize("NFC");
      return chu.join("");
    }
  }
  return null;
}

/** Cùng luật với bộ đọc, viết lại độc lập để rút ma trận. */
function tuongThich(go: string, dm: string): boolean {
  const a = [...giu(go)];
  const b = [...giu(dm)];
  return a.length === b.length && a.every((ch, i) => ch === b[i] || (!coMu(ch) && boDau(b[i]!) === ch));
}

const theoMa = <T extends { ma?: string }>(a: T, b: T) => (a.ma ?? "").localeCompare(b.ma ?? "");
const laQuanHuyen = (h: string) => /^(Quận|Huyện) /.test(h);
const diaChi = (loai: string | null, ten: string, ...sau: string[]) =>
  ["12 Đường Mẫu 1", loai === null ? ten : `${loai} ${ten}`, ...sau].join(", ");
const laXa = (kq: KetQuaDiaChi, ma: string) => kq.wardName !== null && "ma" in kq.wardName && kq.wardName.ma === ma;
/** Ra xã `ma` bằng tên xã mới (không qua tên xã cũ — tên cũ trỏ xã mới là đọc đúng, không phải khớp nhầm). */
const laXaTheoTenMoi = (kq: KetQuaDiaChi, ma: string) => laXa(kq, ma) && !("tuTenCu" in kq.wardName!);

// ---------- Ma trận AC-1 (dùng lại ở AC-5, AC-6, AC-7) ----------

type DongXa = { x: DonViCapXa; thieu: string };

function maTranXa(): { dong: DongXa[]; biLoai: string[]; thieuTinh: string[] } {
  const dong: DongXa[] = [];
  const biLoai: string[] = [];
  const thieuTinh: string[] = [];
  for (const t of DM.tinh) {
    const cuaTinh = DM.xa.filter((x) => x.maTinh === t.ma);
    const anhEm = (x: DonViCapXa) => cuaTinh.some((y) => y !== x && dangSo(y.ten) === dangSo(x.ten));
    const ung = cuaTinh.filter((x) => soMu(x.ten) >= 2).sort(theoMa);
    for (const x of ung) if (anhEm(x)) biLoai.push(`${x.ten} (${t.ma})`);
    const x = ung.find((x) => !anhEm(x));
    if (x) dong.push({ x, thieu: dangThieu(x.ten) });
    else thieuTinh.push(t.ten);
  }
  return { dong, biLoai, thieuTinh };
}
const MT = maTranXa();

// ---------- AC-1 ----------

function kiemThieuXa(dong: readonly DongXa[], doc: Doc): string[] {
  const loi: string[] = [];
  for (const { x, thieu } of dong) {
    const du = docMoi(diaChi(x.loai, x.ten, tenTinh(x.maTinh)));
    const kq = doc(diaChi(x.loai, thieu, tenTinh(x.maTinh)));
    if (du.trangThai !== "chuan" || kq.trangThai !== "chuan" || kq.khoa !== du.khoa) loi.push(`thiếu dấu không ra xã: ${x.ten}`);
  }
  return loi;
}

test("AC-1 xã mới gõ thiếu một phần dấu", () => {
  console.log(`AC-1: ma trận ${MT.dong.length} dòng; bị loại vì có xã cùng tỉnh cùng dạng bỏ dấu: ${MT.biLoai.join(", ") || "không"}`);
  if (MT.thieuTinh.length > 0) console.log(`AC-1: tỉnh không có dòng: ${MT.thieuTinh.join(", ")}`);
  assert.equal(MT.dong.length, 34);
  for (const d of MT.dong) assert.notEqual(d.thieu, d.x.ten, `dạng thiếu suy biến: ${d.x.ten}`);
  assert.deepEqual(kiemThieuXa(MT.dong, docMoi), []);

  const tanDinh = docMoi("12 Lê Lợi, Phường Tan Định, Thành phố Hồ Chí Minh");
  assert.equal(tanDinh.trangThai, "chuan");
  assert.ok(laXa(tanDinh, "26737"), JSON.stringify(tanDinh.wardName));
  // Đông Ba là phường cũ, nay vào phường Phú Xuân (19753).
  const dongBa = docMoi("12 Lê Lợi, Phường Đong Ba, Thành phố Huế");
  assert.equal(dongBa.trangThai, "chuan");
  assert.deepEqual(dongBa.wardName, { ma: "19753", ten: "Phú Xuân", tuTenCu: "Đông Ba" });
});

test("AC-1 phá thử: bộ đọc trước vòng (soDau giu) không ra xã nào của ma trận", () => {
  const loi = kiemThieuXa(MT.dong, docVoi("giu"));
  assert.equal(loi[0], `thiếu dấu không ra xã: ${MT.dong[0]!.x.ten}`);
  assert.equal(loi.length, MT.dong.length);
});

// ---------- AC-2 ----------

function maTranXaCu(): { dong: { c: DonViCapXaCu; thieu: string }[]; thieuTinh: string[] } {
  const dong: { c: DonViCapXaCu; thieu: string }[] = [];
  const thieuTinh: string[] = [];
  for (const t of DM.tinh) {
    const cuaTinh = DM.xaCu.filter((c) => c.maTinh === t.ma);
    const c = cuaTinh
      .filter(
        (c) =>
          c.loai !== null &&
          c.vao.length === 1 &&
          laQuanHuyen(c.huyenCu) &&
          soMu(c.ten) >= 2 &&
          !cuaTinh.some((d) => d !== c && d.huyenCu === c.huyenCu && dangSo(d.ten) === dangSo(c.ten)),
      )
      .sort(theoMa)[0];
    if (c) dong.push({ c, thieu: dangThieu(c.ten) });
    else thieuTinh.push(t.ten);
  }
  return { dong, thieuTinh };
}

function kiemThieuXaCu(dong: ReturnType<typeof maTranXaCu>["dong"], doc: Doc): string[] {
  const loi: string[] = [];
  for (const { c, thieu } of dong) {
    const kq = doc(diaChi(c.loai, thieu, c.huyenCu, tenTinh(c.maTinh)));
    const w = kq.wardName as { ma?: string; tuTenCu?: string } | null;
    if (kq.trangThai !== "chuan" || w?.ma !== c.vao[0] || w?.tuTenCu !== c.ten) loi.push(`thiếu dấu không ra xã cũ: ${c.ten}`);
  }
  return loi;
}

test("AC-2 xã cũ gõ thiếu một phần dấu", () => {
  const { dong, thieuTinh } = maTranXaCu();
  console.log(`AC-2: ma trận ${dong.length} dòng; tỉnh không có xã cũ đủ điều kiện: ${thieuTinh.join(", ") || "không"}`);
  assert.ok(dong.length >= 30);
  for (const d of dong) assert.notEqual(d.thieu, d.c.ten);
  assert.deepEqual(kiemThieuXaCu(dong, docMoi), []);
});

test("AC-2 phá thử: soDau giu không ra xã cũ", () => {
  const { dong } = maTranXaCu();
  const loi = kiemThieuXaCu(dong, docVoi("giu"));
  assert.equal(loi[0], `thiếu dấu không ra xã cũ: ${dong[0]!.c.ten}`);
});

// ---------- AC-3 ----------

type Cap = { a: DonViCapXa; b: DonViCapXa };

/** «trái»: ở một chỗ chữ của A có mũ/móc/đ và khác chữ của B. Ngược lại «thiếu». */
function laTrai(a: string, b: string): boolean {
  const x = [...giu(a)];
  const y = [...giu(b)];
  return x.some((ch, i) => ch !== y[i] && coMu(ch));
}

function capKhacTinh(): { trai: Cap[]; thieu: Cap[]; tong: number } {
  const trai: Cap[] = [];
  const thieu: Cap[] = [];
  let tong = 0;
  for (const a of DM.xa)
    for (const b of DM.xa) {
      if (a === b || a.maTinh === b.maTinh || dangSo(a.ten) !== dangSo(b.ten) || giu(a.ten) === giu(b.ten)) continue;
      tong++;
      (laTrai(a.ten, b.ten) ? trai : thieu).push({ a, b });
    }
  return { trai, thieu, tong };
}
const CAP = capKhacTinh();
const haiDang = ({ a, b }: Cap) => [diaChi(b.loai, a.ten, tenTinh(b.maTinh)), diaChi(null, a.ten, tenTinh(b.maTinh))];

function kiemTrai(caps: readonly Cap[], doc: Doc): string[] {
  return caps.flatMap((p) => haiDang(p).filter((c) => laXaTheoTenMoi(doc(c), p.b.ma)).map(() => `khớp nhầm khác tỉnh: ${p.a.ten} → ${p.b.ma}`));
}

/**
 * Kỳ vọng nhóm «thiếu», tính từ danh mục theo luật viết trước: tỉnh B có xã trùng nguyên văn dạng giữ chữ của tên A →
 * xã ấy; không thì B là xã duy nhất của tỉnh B tương thích → B. Cặp không thuộc hai nhánh này (nhiều ứng viên) bị loại
 * khỏi nhóm và in ra.
 */
function kyVongThieu(p: Cap): { ma: string; nhanh: "nguyen-van" | "tuong-thich" } | null {
  const cuaTinh = DM.xa.filter((x) => x.maTinh === p.b.maTinh);
  const trung = cuaTinh.filter((x) => giu(x.ten) === giu(p.a.ten));
  if (trung.length === 1) return { ma: trung[0]!.ma, nhanh: "nguyen-van" };
  const tt = cuaTinh.filter((x) => tuongThich(p.a.ten, x.ten));
  return trung.length === 0 && tt.length === 1 && tt[0] === p.b ? { ma: p.b.ma, nhanh: "tuong-thich" } : null;
}

function kiemThieuKhacTinh(caps: readonly Cap[], doc: Doc): string[] {
  return caps.flatMap((p) => {
    const ky = kyVongThieu(p)!;
    return haiDang(p)
      .filter((c) => {
        const kq = doc(c);
        return !(kq.trangThai === "chuan" && laXaTheoTenMoi(kq, ky.ma));
      })
      .map(() => `thiếu dấu không ra xã tỉnh đã chọn: ${p.a.ten} → ${ky.ma}`);
  });
}

test("AC-3 không khớp nhầm khác tỉnh", () => {
  console.log(`AC-3: ${CAP.tong} cặp có thứ tự = ${CAP.trai.length} trái + ${CAP.thieu.length} thiếu; ${2 * CAP.tong} địa chỉ`);
  assert.equal(CAP.trai.length + CAP.thieu.length, CAP.tong);
  assert.ok(CAP.trai.length > 0 && CAP.thieu.length > 0);
  const nhanh = CAP.thieu.map(kyVongThieu);
  const ngoai = CAP.thieu.filter((_, i) => nhanh[i] === null);
  console.log(
    `AC-3 nhóm thiếu: ${nhanh.filter((k) => k?.nhanh === "tuong-thich").length} ra B, ` +
      `${nhanh.filter((k) => k?.nhanh === "nguyen-van").length} ra xã trùng nguyên văn của tỉnh B, ` +
      `${ngoai.length} nhiều ứng viên: ${ngoai.map((p) => `${p.a.ten}→${p.b.ma}`).join(", ") || "không"}`,
  );
  assert.equal(ngoai.length, 0);
  assert.deepEqual(kiemTrai(CAP.trai, docMoi), []);
  assert.deepEqual(kiemThieuKhacTinh(CAP.thieu, docMoi), []);
  for (const { a } of [...CAP.trai, ...CAP.thieu]) {
    assert.ok(laXa(docMoi(diaChi(a.loai, a.ten, tenTinh(a.maTinh))), a.ma), `đối chứng: ${a.ten}`);
  }
  const bn = docMoi("12 Lê Lợi, Phường Tân Định, Tỉnh Bắc Ninh");
  assert.ok(!(bn.wardName && "ten" in bn.wardName && bn.wardName.ten === "Tân Dĩnh"), JSON.stringify(bn.wardName));
});

test("AC-3 phá thử: lối lui về so bỏ dấu khớp nhầm; bộ đọc trước vòng không ra nhóm thiếu", () => {
  const trai = kiemTrai(CAP.trai, docVoi("lui-bo-dau"));
  assert.match(trai[0] ?? "", /^khớp nhầm khác tỉnh: .+ → \d{5}$/);
  const p = CAP.thieu.find((q) => kyVongThieu(q)?.nhanh === "tuong-thich")!;
  assert.equal(kiemThieuKhacTinh([p], docVoi("giu"))[0], `thiếu dấu không ra xã tỉnh đã chọn: ${p.a.ten} → ${p.b.ma}`);
});

// ---------- AC-4 ----------

function capCungTinh(): Cap[] {
  const ra: Cap[] = [];
  DM.xa.forEach((a, i) =>
    DM.xa.slice(i + 1).forEach((b) => {
      if (a.maTinh === b.maTinh && dangSo(a.ten) === dangSo(b.ten) && giu(a.ten) !== giu(b.ten)) ra.push({ a, b });
    }),
  );
  return ra;
}

const dangChung = (a: string, b: string) => {
  const y = [...giu(b)];
  return [...giu(a)].map((ch, i) => (ch === y[i] ? ch : boDau(ch))).join("");
};

function kiemCungTinh(caps: readonly Cap[], doc: Doc): { loi: string[]; nhanh: string[] } {
  const loi: string[] = [];
  const nhanh: string[] = [];
  for (const { a, b } of caps) {
    for (const x of [a, b]) {
      const kq = doc(diaChi(x.loai, x.ten, tenTinh(x.maTinh)));
      if (kq.trangThai !== "chuan" || !laXa(kq, x.ma)) loi.push(`tên trùng nguyên văn không thắng: ${x.ten}`);
    }
    const chung = dangChung(a.ten, b.ten);
    const kq = doc(diaChi(a.loai, chung, tenTinh(a.maTinh)));
    const trung = [a, b].find((x) => giu(x.ten) === chung);
    if (trung) {
      nhanh.push(`${chung} → ${trung.ten}`);
      if (kq.trangThai !== "chuan" || !laXa(kq, trung.ma)) loi.push(`dạng chung không ra tên trùng: ${chung}`);
    } else {
      nhanh.push(`${chung} → cần người chọn`);
      const uv = kq.wardName && "ungVien" in kq.wardName ? kq.wardName.ungVien.map((u) => u.ma).sort() : [];
      if (kq.trangThai !== "can-nguoi-chon" || uv.join() !== [a.ma, b.ma].sort().join()) {
        loi.push(`mơ hồ không ra cần người chọn: ${chung}`);
      }
    }
  }
  return { loi, nhanh };
}

test("AC-4 cùng tỉnh: nguyên văn thắng, mơ hồ ra cần người chọn", () => {
  const caps = capCungTinh();
  const { loi, nhanh } = kiemCungTinh(caps, docMoi);
  console.log(`AC-4: ${caps.length} cặp cùng tỉnh: ${caps.map((p) => `${p.a.ten}/${p.b.ten}`).join(", ")}; ${nhanh.join("; ")}`);
  assert.ok(caps.length >= 1);
  assert.deepEqual(loi, []);
});

test("AC-4 phá thử: tương thích không ưu tiên nguyên văn thì gõ đúng tên vẫn bị hỏi chọn", () => {
  const { loi } = kiemCungTinh(capCungTinh(), docVoi("tuong-thich-tron"));
  assert.ok(loi.some((l) => l.startsWith("tên trùng nguyên văn không thắng: ")), loi.join("\n"));
});

// ---------- AC-5 ----------

function maTranSai(): { x: DonViCapXa; sai: string }[] {
  return MT.dong.flatMap(({ x }) => {
    const sai = dangSai(x.ten);
    return sai === null ? [] : [{ x, sai }];
  });
}

function kiemSai(dong: ReturnType<typeof maTranSai>, doc: Doc): string[] {
  const loi: string[] = [];
  for (const { x, sai } of dong) {
    const kq = doc(diaChi(x.loai, sai, tenTinh(x.maTinh)));
    if (laXa(kq, x.ma)) loi.push(`chữ trái danh mục vẫn khớp: ${sai}`);
    const khac = DM.xa.some((y) => y.maTinh === x.maTinh && y !== x && tuongThich(sai, y.ten));
    if (!khac && !kq.chuaCoTrongDanhMuc.some((c) => c.phan === "wardName")) loi.push(`chữ trái không vào chưa có: ${sai}`);
  }
  return loi;
}

test("AC-5 chữ trái danh mục không nới", () => {
  const dong = maTranSai();
  const bo = MT.dong.filter(({ x }) => dangSai(x.ten) === null).map(({ x }) => x.ten);
  console.log(`AC-5: ${dong.length} dòng; bỏ (không có chữ gốc a o u e d): ${bo.join(", ") || "không"}`);
  assert.ok(dong.length >= 20);
  assert.deepEqual(kiemSai(dong, docMoi), []);
});

test("AC-5 phá thử: lối lui về so bỏ dấu nhận chữ trái", () => {
  const dong = maTranSai();
  assert.equal(kiemSai(dong, docVoi("lui-bo-dau"))[0], `chữ trái danh mục vẫn khớp: ${dong[0]!.sai}`);
});

// ---------- AC-6 ----------

function kiemKhongTienTo(dong: readonly DongXa[], doc: Doc): string[] {
  return dong
    .filter(({ x, thieu }) => {
      const kq = doc(diaChi(null, thieu, tenTinh(x.maTinh)));
      return !(kq.trangThai === "chuan" && laXa(kq, x.ma));
    })
    .map(({ x }) => `đoạn thiếu dấu không thành xã: ${x.ten}`);
}

test("AC-6 đoạn không tiền tố gõ thiếu dấu", () => {
  console.log(`AC-6: ${MT.dong.length} dòng`);
  assert.deepEqual(kiemKhongTienTo(MT.dong, docMoi), []);
});

test("AC-6 phá thử: soDau giu không đọc đoạn thiếu dấu thành xã", () => {
  assert.equal(kiemKhongTienTo(MT.dong, docVoi("giu"))[0], `đoạn thiếu dấu không thành xã: ${MT.dong[0]!.x.ten}`);
});

// ---------- AC-7 ----------

type DongAnh = { ma: string; streetNumber: string | null; streetName: string | null; khoa: string | null; trangThai: string };
const ANH: { dong: DongAnh[] } = JSON.parse(readFileSync(fileURLToPath(new URL("./anh-truoc-va.json", import.meta.url)), "utf8"));
const DAP_AN: { ma: string; chu: string }[] = JSON.parse(
  readFileSync(fileURLToPath(new URL("../../../db/seed/mau-thap-tang/dap-an-thap-tang.json", import.meta.url)), "utf8"),
).diaChi;

function kiemAnh(anh: readonly DongAnh[]): string[] {
  const chu = new Map(DAP_AN.map((d) => [d.ma, d.chu]));
  return anh.flatMap((d) => {
    const kq = docMoi(chu.get(d.ma)!);
    return (["streetNumber", "streetName", "khoa", "trangThai"] as const).filter((k) => kq[k] !== d[k]).map((k) => `đổi so với ảnh: ${d.ma}: ${k}`);
  });
}

/** So hai bộ đọc trên cùng danh sách địa chỉ. */
function kiemLech(dsChu: readonly string[], moi: Doc, cu: Doc): string[] {
  return dsChu.filter((c) => JSON.stringify(moi(c)) !== JSON.stringify(cu(c))).map((c) => `lệch bộ đọc trước vòng: ${c}`);
}

const DIA_CHI_DU_VA_BO = MT.dong.flatMap(({ x }) => {
  const t = tenTinh(x.maTinh);
  return [diaChi(x.loai, x.ten, t), diaChi(null, x.ten, t), diaChi(x.loai, dangSo(x.ten), t), diaChi(null, dangSo(x.ten), t)];
});

test("AC-7 hồi quy", () => {
  assert.equal(ANH.dong.length, 86);
  assert.deepEqual(kiemAnh(ANH.dong), []);
  console.log(`AC-7: ${ANH.dong.length} cách viết so với ảnh; ${DIA_CHI_DU_VA_BO.length} địa chỉ đủ dấu và bỏ dấu so với soDau giu`);
  assert.equal(DIA_CHI_DU_VA_BO.length, 4 * MT.dong.length);
  assert.deepEqual(kiemLech(DIA_CHI_DU_VA_BO, docMoi, docVoi("giu")), []);
  const trai = CAP.trai.flatMap(haiDang);
  assert.deepEqual(kiemLech(trai, docMoi, docVoi("giu")), []);
});

test("AC-7 phá thử: bộ đọc cấy lệch ở dòng đầu thì phép so đỏ", () => {
  const dau = DIA_CHI_DU_VA_BO[0]!;
  const cayLech: Doc = (c) => (c === dau ? { ...docMoi(c), trangThai: "thieu" } : docMoi(c));
  assert.deepEqual(kiemLech(DIA_CHI_DU_VA_BO, cayLech, docVoi("giu")), [`lệch bộ đọc trước vòng: ${dau}`]);
});
