// Bộ đọc bản đồ khuôn (hồ sơ ban-do-khuon-nhom-da-co, hàng 58): đọc design/patterns/<nhóm>.md, kiểm lược đồ theo
// finding kit §11.3, rồi kiểm cây — màn của nhóm dựng khuôn ở gốc (don_vi: man) hay mọi chỗ trình trạng thái đi qua
// khuôn (don_vi: phan-tu). Không thêm phụ thuộc: frontmatter là tập con YAML một dòng, mã đọc bằng TypeScript của kho.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import ts from "typescript";

export const THU_MUC_BAN_DO = "design/patterns";
const GOC_WEB = "apps/web/src";

/** Chín khoá của §11.3, kiểu của từng khoá; `don_vi` là khoá thêm của kho (thiếu thì đọc là `man`). */
const KHOA = {
  nhom: "chuoi",
  doi_tuong: "mang-chuoi",
  khuon: { ten: "chuoi", nhap: "chuoi" },
  nhan_dien: "mang-chuoi",
  mau_dang_chay: { tep: "chuoi", duong: "chuoi", trang_thai: "mang-chuoi" },
  khe_bat_buoc: "mang-chuoi-rong-duoc",
  cam_ngoai_khuon: "mang-chuoi-rong-duoc",
  ngoai_le: "mang-ngoai-le",
  luat: "mang-chuoi",
};
export const KHOA_BAT_BUOC = Object.keys(KHOA);
const DON_VI = ["man", "phan-tu"];

// ---------- frontmatter: tập con YAML một dòng ----------

/** Đọc một giá trị luồng: chuỗi trong nháy kép, [..], {..}, hay chữ trần chỉ gồm chữ, số, «.», «_», «-». */
function docGiaTri(s, i) {
  const boQua = () => {
    while (i < s.length && s[i] === " ") i++;
  };
  boQua();
  const c = s[i];
  if (c === '"') {
    let j = i + 1;
    while (j < s.length && s[j] !== '"') j += s[j] === "\\" ? 2 : 1;
    if (j >= s.length) throw new Error("nháy kép không đóng");
    return [JSON.parse(s.slice(i, j + 1)), j + 1];
  }
  if (c === "[" || c === "{") {
    const dong = c === "[" ? "]" : "}";
    const ket = c === "[" ? [] : {};
    i++;
    boQua();
    if (s[i] === dong) return [ket, i + 1];
    for (;;) {
      if (c === "[") {
        const [v, j] = docGiaTri(s, i);
        ket.push(v);
        i = j;
      } else {
        boQua();
        const m = /^([A-Za-z_][A-Za-z0-9_]*)\s*:/.exec(s.slice(i));
        if (!m) throw new Error(`cần «khoá:» trong {…} tại «${s.slice(i, i + 12)}»`);
        const [v, j] = docGiaTri(s, i + m[0].length);
        ket[m[1]] = v;
        i = j;
      }
      boQua();
      if (s[i] === ",") {
        i++;
        continue;
      }
      if (s[i] === dong) return [ket, i + 1];
      throw new Error(`cần «,» hay «${dong}» tại «${s.slice(i, i + 12)}»`);
    }
  }
  const m = /^[A-Za-z0-9][A-Za-z0-9_.-]*/.exec(s.slice(i));
  if (!m) throw new Error(`giá trị «${s.slice(i, i + 20).trim()}» phải đặt trong nháy kép`);
  return [m[0], i + m[0].length];
}

/** Tách frontmatter và thân. Trả `{ data, than, loi }`; mỗi dòng ngoài tập con là một lỗi nêu số dòng. */
export function docFrontmatter(text) {
  const dong = text.split("\n");
  if (dong[0] !== "---") return { data: {}, than: text, loi: ["thiếu frontmatter (dòng đầu phải là ---)"] };
  const cuoi = dong.indexOf("---", 1);
  if (cuoi < 0) return { data: {}, than: text, loi: ["frontmatter không đóng (thiếu dòng --- thứ hai)"] };
  const data = {};
  const loi = [];
  for (let n = 1; n < cuoi; n++) {
    const d = dong[n];
    if (/^\s*(#.*)?$/.test(d)) continue;
    const m = /^([a-z_]+):(.*)$/.exec(d);
    if (!m) {
      loi.push(`dòng ${n + 1}: ngoài tập con đọc được (chỉ nhận «khoá: giá trị» trên một dòng) — «${d.trim()}»`);
      continue;
    }
    try {
      if (!m[2].trim()) throw new Error("giá trị rỗng");
      const [v, j] = docGiaTri(m[2], 0);
      const du = m[2].slice(j).trim();
      if (du && !du.startsWith("#")) throw new Error(`thừa «${du}» sau giá trị`);
      if (m[1] in data) throw new Error("khoá lặp");
      data[m[1]] = v;
    } catch (e) {
      loi.push(`dòng ${n + 1}: ${m[1]} — ${e.message}`);
    }
  }
  return { data, than: dong.slice(cuoi + 1).join("\n"), loi };
}

// ---------- tệp và glob ----------

/** Glob của bản đồ: chỉ `*` (trong một đoạn) và `**` (nhiều đoạn) là ký tự đại diện; ngoặc là chữ thường. */
export function globRegex(glob) {
  let r = "";
  for (let i = 0; i < glob.length; i++) {
    if (glob.startsWith("**/", i)) {
      r += "(?:.*/)?";
      i += 2;
    } else if (glob.startsWith("**", i)) {
      r += ".*";
      i += 1;
    } else if (glob[i] === "*") r += "[^/]*";
    else r += glob[i].replace(/[.+?^${}()|[\]\\]/g, "\\$&");
  }
  return new RegExp(`^${r}$`);
}

function moiTep(root, thuMuc) {
  const out = [];
  const di = (rel) => {
    const abs = join(root, rel);
    if (!existsSync(abs)) return;
    for (const e of readdirSync(abs, { withFileTypes: true })) {
      if (e.name === "node_modules" || e.name.startsWith(".")) continue;
      const r = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) di(r);
      else out.push(r);
    }
  };
  di(thuMuc);
  return out;
}

/** Tệp (tương đối gốc kho, sắp) khớp một trong các glob. */
export function khopGlob(root, globs) {
  const out = new Set();
  for (const g of globs) {
    const re = globRegex(g);
    const goc = g.slice(0, g.search(/\*|$/)).replace(/\/[^/]*$/, "");
    for (const t of moiTep(root, goc)) if (re.test(t)) out.add(t);
  }
  return [...out].sort();
}

/** `@/x` → apps/web/src/x; tương đối → theo thư mục tệp nhập. Thử .tsx, .ts, /index.tsx. Trả đường tương đối gốc kho hay null. */
export function giaiNhap(root, spec, tuTep) {
  let base;
  if (spec.startsWith("@/")) base = join(GOC_WEB, spec.slice(2));
  else if (spec.startsWith(".")) base = join(dirname(tuTep), spec);
  else return null;
  for (const duoi of ["", ".tsx", ".ts", "/index.tsx", "/index.ts"]) {
    const t = base + duoi;
    if (existsSync(join(root, t)) && !t.endsWith("/") && /\.tsx?$/.test(t)) return relative(root, resolve(root, t));
  }
  return null;
}

// ---------- đọc mã ----------

const docMa = (root, tep) =>
  ts.createSourceFile(tep, readFileSync(join(root, tep), "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

const coXuat = (n) => ts.getModifiers?.(n)?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
const coMacDinh = (n) => ts.getModifiers?.(n)?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword);

/** Hàm xuất tên `ten` trong tệp, hay null. */
function hamXuat(sf, ten) {
  for (const s of sf.statements) {
    if (ts.isFunctionDeclaration(s) && coXuat(s) && s.name?.text === ten) return s;
    if (ts.isVariableStatement(s) && coXuat(s))
      for (const d of s.declarationList.declarations)
        if (ts.isIdentifier(d.name) && d.name.text === ten && d.initializer && (ts.isArrowFunction(d.initializer) || ts.isFunctionExpression(d.initializer)))
          return d.initializer;
  }
  return null;
}

/** Mọi tên một tệp xuất (export function/const/class, export { … }). */
function tenXuat(sf) {
  const out = new Set();
  for (const s of sf.statements) {
    if ((ts.isFunctionDeclaration(s) || ts.isClassDeclaration(s)) && coXuat(s) && s.name) out.add(s.name.text);
    if (ts.isVariableStatement(s) && coXuat(s))
      for (const d of s.declarationList.declarations) if (ts.isIdentifier(d.name)) out.add(d.name.text);
    if (ts.isExportDeclaration(s) && s.exportClause && ts.isNamedExports(s.exportClause))
      for (const e of s.exportClause.elements) out.add(e.name.text);
  }
  return out;
}

const thamSo = (fn) => {
  const p = fn.parameters[0];
  if (!p || !ts.isObjectBindingPattern(p.name)) return null;
  return p.name.elements.map((e) => (e.propertyName ?? e.name).getText());
};

/** Tên một phần tử JSX lấy nhập từ đâu: tệp (tương đối gốc kho) hay null nếu không nhập. */
function nguonNhap(root, sf, ten) {
  for (const s of sf.statements) {
    if (!ts.isImportDeclaration(s) || !s.importClause?.namedBindings || !ts.isNamedImports(s.importClause.namedBindings)) continue;
    for (const e of s.importClause.namedBindings.elements)
      if (e.name.text === ten) return { spec: s.moduleSpecifier.text, tep: giaiNhap(root, s.moduleSpecifier.text, sf.fileName) };
  }
  return null;
}

const tenThe = (n) => (ts.isJsxElement(n) ? n.openingElement.tagName : ts.isJsxSelfClosingElement(n) ? n.tagName : null)?.getText() ?? null;
const thuocTinh = (n) => (ts.isJsxElement(n) ? n.openingElement.attributes : n.attributes).properties;
const coCon = (n) => ts.isJsxElement(n) && n.children.some((c) => !(ts.isJsxText(c) && !c.text.trim()));

function thieuKhe(n, khe) {
  const co = new Set(thuocTinh(n).filter(ts.isJsxAttribute).map((a) => a.name.getText()));
  return khe.filter((k) => (k === "children" ? !coCon(n) && !co.has(k) : !co.has(k)));
}

/** Mọi biểu thức `return` của chính hàm (không đi vào hàm lồng). */
function cacReturn(fn) {
  const out = [];
  const di = (n) => {
    if (n !== fn && ts.isFunctionLike(n)) return;
    if (ts.isReturnStatement(n) && n.expression) out.push(n.expression);
    ts.forEachChild(n, di);
  };
  if (fn.body && !ts.isBlock(fn.body)) out.push(fn.body);
  else di(fn);
  return out;
}

const boNgoac = (e) => {
  while (ts.isParenthesizedExpression(e)) e = e.expression;
  return e;
};

const NOI_LOGIC = [ts.SyntaxKind.AmpersandAmpersandToken, ts.SyntaxKind.BarBarToken, ts.SyntaxKind.QuestionQuestionToken];

/** Mọi biểu thức có thể là gốc của một `return`: đi vào cả hai nhánh của `a ? b : c` và vế phải của `&&`, `||`, `??`. */
function cacGoc(e) {
  e = boNgoac(e);
  if (ts.isConditionalExpression(e)) return [...cacGoc(e.whenTrue), ...cacGoc(e.whenFalse)];
  if (ts.isBinaryExpression(e) && NOI_LOGIC.includes(e.operatorToken.kind)) return [...cacGoc(e.left), ...cacGoc(e.right)];
  return [e];
}

// ---------- đọc bản đồ ----------

function kiemKieu(ten, kieu, v, loi) {
  if (typeof kieu === "object") {
    if (!v || typeof v !== "object" || Array.isArray(v)) return loi.push(`${ten} phải là {…}`);
    for (const [k, kk] of Object.entries(kieu)) {
      if (!(k in v)) loi.push(`${ten}.${k}: thiếu khoá`);
      else kiemKieu(`${ten}.${k}`, kk, v[k], loi);
    }
    for (const k of Object.keys(v)) if (!(k in kieu)) loi.push(`${ten}.${k}: khoá lạ`);
    return;
  }
  if (kieu === "chuoi") {
    if (typeof v !== "string" || !v) loi.push(`${ten} phải là chuỗi không rỗng`);
    return;
  }
  if (!Array.isArray(v)) return loi.push(`${ten} phải là […]`);
  if (kieu === "mang-ngoai-le") {
    v.forEach((x, i) => {
      if (!x || typeof x !== "object" || Array.isArray(x)) return loi.push(`${ten}[${i}] phải là { tep, ly_do }`);
      if (typeof x.tep !== "string" || !x.tep) loi.push(`${ten}[${i}] thiếu tep`);
      if (typeof x.ly_do !== "string" || !x.ly_do.trim()) loi.push(`${ten}[${i}] thiếu ly_do`);
      for (const k of Object.keys(x)) if (k !== "tep" && k !== "ly_do") loi.push(`${ten}[${i}].${k}: khoá lạ`);
    });
    return;
  }
  if (kieu !== "mang-chuoi-rong-duoc" && v.length === 0) loi.push(`${ten} không được rỗng`);
  v.forEach((x, i) => {
    if (typeof x !== "string" || !x) loi.push(`${ten}[${i}] phải là chuỗi không rỗng`);
  });
}

/**
 * Đọc mọi tệp bản đồ. Trả `{ nhom: [{ tep, data, than, donVi, khuonTep }], loi: [chuỗi] }` — mỗi lỗi mở đầu bằng tên
 * tệp bản đồ («cai-dat-san.md: ngoai_le[0] thiếu ly_do»).
 */
export function docBanDo(root) {
  const dir = join(root, THU_MUC_BAN_DO);
  const loi = [];
  if (!existsSync(dir)) return { nhom: [], loi: [`${THU_MUC_BAN_DO}: không có thư mục bản đồ`] };
  const xuatTheoTep = new Map();
  const tenThanhPhan = new Set();
  for (const t of khopGlob(root, [`${GOC_WEB}/components/**/*.tsx`, `${GOC_WEB}/components/**/*.ts`]))
    for (const n of tenXuat(docMa(root, t))) tenThanhPhan.add(n);
  const nhom = [];
  for (const ten of readdirSync(dir).filter((f) => f.endsWith(".md")).sort()) {
    const L = (s) => loi.push(`${ten}: ${s}`);
    const { data, than, loi: loiFm } = docFrontmatter(readFileSync(join(dir, ten), "utf8"));
    loiFm.forEach(L);
    const loiKieu = [];
    for (const k of KHOA_BAT_BUOC) {
      if (!(k in data)) loiKieu.push(`${k}: thiếu khoá`);
      else kiemKieu(k, KHOA[k], data[k], loiKieu);
    }
    for (const k of Object.keys(data)) if (!(k in KHOA) && k !== "don_vi") loiKieu.push(`${k}: khoá lạ`);
    const donVi = data.don_vi ?? "man";
    if (!DON_VI.includes(donVi)) loiKieu.push(`don_vi: phải là man hay phan-tu (đang là ${JSON.stringify(donVi)})`);
    loiKieu.forEach(L);
    if (loiFm.length || loiKieu.length) {
      nhom.push({ tep: ten, data, than, donVi, khuonTep: null, hong: true });
      continue;
    }
    if (data.nhom !== basename(ten, ".md")) L(`nhom: «${data.nhom}» phải bằng tên tệp «${basename(ten, ".md")}»`);
    const khuonTep = data.khuon.nhap.startsWith("@/") ? giaiNhap(root, data.khuon.nhap, "") : null;
    if (!khuonTep) L(`khuon.nhap: «${data.khuon.nhap}» không có tệp (chỉ nhận dạng @/…)`);
    else {
      if (!xuatTheoTep.has(khuonTep)) xuatTheoTep.set(khuonTep, docMa(root, khuonTep));
      const fn = hamXuat(xuatTheoTep.get(khuonTep), data.khuon.ten);
      if (!fn) L(`khuon.ten: ${khuonTep} không xuất hàm «${data.khuon.ten}»`);
      else {
        const ts_ = thamSo(fn);
        for (const k of data.khe_bat_buoc)
          if (!ts_?.includes(k)) L(`khe_bat_buoc: «${k}» không phải tham số của khuôn ${data.khuon.ten}`);
      }
    }
    const khop = khopGlob(root, data.nhan_dien);
    const ngoaiLe = new Set(data.ngoai_le.map((x) => x.tep));
    data.ngoai_le.forEach((x, i) => {
      if (!existsSync(join(root, x.tep))) L(`ngoai_le[${i}]: tệp «${x.tep}» không có`);
    });
    const mau = data.mau_dang_chay.tep;
    if (!existsSync(join(root, mau))) L(`mau_dang_chay.tep: «${mau}» không có`);
    else if (!khop.includes(mau)) L(`mau_dang_chay.tep: «${mau}» không khớp nhan_dien`);
    else if (ngoaiLe.has(mau)) L(`mau_dang_chay.tep: «${mau}» là ngoại lệ — màn mẫu phải dựng khuôn`);
    for (const c of data.cam_ngoai_khuon) if (!tenThanhPhan.has(c)) L(`cam_ngoai_khuon: ${c} không thành phần nào của ${GOC_WEB}/components xuất`);
    for (const c of data.luat) if (!than.includes(c)) L(`luat: mã «${c}» không có câu luật trong thân tệp`);
    nhom.push({ tep: ten, data, than, donVi, khuonTep, khop, ngoaiLe });
  }
  // Một tệp màn thuộc đúng một nhóm: khớp nhan_dien của hai nhóm đơn vị màn thì phải là ngoại lệ ở mọi nhóm trừ một.
  const theoTep = new Map();
  for (const g of nhom.filter((g) => !g.hong && g.donVi === "man"))
    for (const t of g.khop) if (!g.ngoaiLe.has(t)) theoTep.set(t, [...(theoTep.get(t) ?? []), g.data.nhom]);
  for (const [t, gs] of theoTep) if (gs.length > 1) loi.push(`${gs[0]}.md: tệp «${t}» thuộc hai nhóm ${gs.join(", ")} — khai ngoại lệ ở một nhóm`);
  return { nhom, loi };
}

// ---------- kiểm cây ----------

/**
 * Kiểm mọi tệp của từng nhóm đọc được. Trả `{ [nhóm]: { donVi, theoKhuon: [tệp hay «tệp:dòng»], ngoaiLe: [tệp],
 * nhanDien: [tệp], lech: [{ tep, nhom, dieu }] } }`.
 */
export function kiemCay(root, banDo) {
  const ket = {};
  for (const g of banDo.nhom) {
    if (g.hong || !g.khuonTep) continue;
    const { ten } = g.data.khuon;
    const khe = g.data.khe_bat_buoc;
    const nhom = g.data.nhom;
    const r = (ket[nhom] = { donVi: g.donVi, theoKhuon: [], ngoaiLe: [...g.ngoaiLe].sort(), nhanDien: g.khop, lech: [] });
    const lech = (tep, dieu) => r.lech.push({ tep, nhom, dieu });
    for (const tep of g.khop) {
      if (g.ngoaiLe.has(tep) || tep === g.khuonTep) continue;
      const sf = docMa(root, tep);
      const kiemNguon = () => {
        const n = nguonNhap(root, sf, ten);
        if (!n) return lech(tep, `dùng <${ten}> mà không nhập từ tệp khuôn ${g.khuonTep}`), false;
        if (n.tep !== g.khuonTep) return lech(tep, `nhập ${ten} từ «${n.spec}», không phải tệp khuôn ${g.khuonTep}`), false;
        return true;
      };
      if (g.donVi === "man") {
        const fn = sf.statements.find((s) => ts.isFunctionDeclaration(s) && coXuat(s) && coMacDinh(s));
        if (!fn) {
          lech(tep, "không có thành phần xuất mặc định (export default function)");
          continue;
        }
        const jsx = cacReturn(fn).flatMap(cacGoc).filter((e) => ts.isJsxElement(e) || ts.isJsxSelfClosingElement(e) || ts.isJsxFragment(e));
        if (!jsx.length) {
          lech(tep, `không trả JSX — tệp không dựng màn thì khai ngoại lệ có lý do`);
          continue;
        }
        let dat = true;
        for (const e of jsx) {
          const the = ts.isJsxFragment(e) ? "<>" : tenThe(e);
          if (the !== ten) {
            lech(tep, `gốc là <${the === "<>" ? "" : the}>, phải là <${ten}> (khuôn của nhóm ${nhom})`);
            dat = false;
            continue;
          }
          const thieu = thieuKhe(e, khe);
          if (thieu.length) {
            lech(tep, `<${ten}> thiếu khe ${thieu.map((k) => `«${k}»`).join(", ")}`);
            dat = false;
          }
        }
        if (dat && kiemNguon()) r.theoKhuon.push(tep);
        continue;
      }
      // phan-tu: mọi chỗ trình trạng thái đi qua khuôn.
      let daKiemNguon = null;
      const di = (n) => {
        if (ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n)) {
          const the = tenThe(n);
          const dong = sf.getLineAndCharacterOfPosition(n.getStart()).line + 1;
          if (g.data.cam_ngoai_khuon.includes(the)) lech(tep, `dòng ${dong}: <${the}> dùng ngoài khuôn — dựng qua <${ten}>`);
          else if (the && /^[a-z]/.test(the)) {
            const role = thuocTinh(n).find((a) => ts.isJsxAttribute(a) && a.name.getText() === "role");
            const v = role?.initializer && ts.isStringLiteral(role.initializer) ? role.initializer.text : null;
            if (v === "alert" || v === "status") lech(tep, `dòng ${dong}: thẻ <${the}> trần mang role="${v}" — dựng qua <${ten}>`);
          } else if (the === ten) {
            if (daKiemNguon === null) daKiemNguon = kiemNguon();
            const thieu = thieuKhe(n, khe);
            if (thieu.length) lech(tep, `dòng ${dong}: <${ten}> thiếu khe ${thieu.map((k) => `«${k}»`).join(", ")}`);
            else if (daKiemNguon) r.theoKhuon.push(`${tep}:${dong}`);
          }
        }
        ts.forEachChild(n, di);
      };
      di(sf);
    }
  }
  return ket;
}

/** Dòng tóm tắt của một nhóm. */
export function dongTomTat(nhom, r) {
  const loai = r.donVi === "phan-tu" ? "chỗ" : "tệp";
  return `${nhom}: ${r.theoKhuon.length} ${loai} theo khuôn · ${r.ngoaiLe.length} ngoại lệ · ${r.lech.length} lệch`;
}
