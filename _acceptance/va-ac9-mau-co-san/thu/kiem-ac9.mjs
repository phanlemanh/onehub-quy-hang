// Bài đo của hàng vá va-ac9-mau-co-san: tệp kiểm dữ liệu mẫu thấp tầng có chạy được trên cơ sở dữ liệu đã có sàn mẫu
// khác (như bản thật) mà không đổi dữ liệu có sẵn không. Mỗi ca tạo một cơ sở dữ liệu tạm trên Postgres của DATABASE_URL
// (mặc định Postgres dãy D, cổng 5575), migrate, cấy dữ liệu có sẵn của ca, chạy tệp kiểm bằng node --test, rồi DROP.
//   node kiem-ac9.mjs --ca <ca> [--ca <ca> …]     ca trên tệp kiểm của cây: sach · san-khac · san-thu-trung · pha-dem
//   node kiem-ac9.mjs --doi-chung-do <sha>         tệp kiểm của nhánh chính tại <sha>: san-khac phải ĐỎ, sach phải xanh
// Mỗi ca in một dòng JSON. Thoát 0 = mọi ca đạt kỳ vọng · 1 = có ca lệch · 2 = không chạy được (Postgres, sha, hàm).
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const DAY = path.dirname(fileURLToPath(import.meta.url));
const GOC = path.resolve(DAY, "../../..");
const TUONG_DOI = "packages/db/tests/du-lieu-mau-thap-tang.test.mjs";
const TEP_KIEM = path.join(GOC, TUONG_DOI);
const URL_GOC = new URL(
  process.env.DATABASE_URL ??
    "postgres://postgres:quyhang@localhost:5575/postgres",
);
const THONG_DIEP_DO = "còn dòng mẫu sau xoá";
const RA = path.join(GOC, ".acceptance-runs/va-ac9-mau-co-san");

const urlCua = (ten) => {
  const u = new URL(URL_GOC);
  u.pathname = `/${ten}`;
  return u.toString();
};
async function voiDb(ten, fn) {
  const c = new pg.Client({
    connectionString: urlCua(URL_GOC.pathname.slice(1) || "postgres"),
  });
  await c.connect();
  try {
    return await fn(c);
  } finally {
    await c.end();
  }
}
async function taoDb(ten) {
  await voiDb(null, async (c) => {
    await c.query(`drop database if exists "${ten}"`);
    await c.query(`create database "${ten}"`);
  });
  const m = spawnSync("npm", ["run", "db:migrate"], {
    cwd: GOC,
    env: { ...process.env, DATABASE_URL: urlCua(ten) },
    encoding: "utf8",
  });
  if (m.status !== 0)
    throw new Error(
      `migrate cơ sở dữ liệu tạm ${ten} lỗi: ${(m.stderr || m.stdout).slice(-400)}`,
    );
}
const xoaDb = (ten) =>
  voiDb(null, (c) =>
    c.query(`drop database if exists "${ten}" with (force)`),
  ).catch((e) =>
    console.error(
      `cảnh báo: không xoá được cơ sở dữ liệu tạm ${ten}: ${e.message}`,
    ),
  );

// Dữ liệu có sẵn của từng ca — dữ liệu bài không nạp — dựng bằng CHÍNH bộ ghi đã dựng sàn trên bản thật: bộ nạp mẫu
// hàng 5 (packages/db/seed/nap.mjs --nap, sàn «[Mẫu] Sàn thử» cùng người miền mẫu) và lệnh mở sàn vận hành
// (packages/db/scripts/mo-san.mjs). Không dữ liệu thật: tên mang nhãn, email miền thử.
const NAP = ["packages/db/seed/nap.mjs", "--nap"];
const MO = (ten, email) => [
  "packages/db/scripts/mo-san.mjs",
  "--ten",
  ten,
  "--email",
  email,
];
const CAY = {
  sach: [],
  "san-khac": [
    NAP,
    MO("[Mẫu] Sàn trình diễn", "quan-tri-trinh-dien@mau.quy-hang.test"),
    MO("[Tên sàn] có sẵn", "quan-tri-co-san@vi-du.test"),
  ],
  "san-thu-trung": [MO("[Mẫu] Sàn thử (bản cũ)", "quan-tri-ban-cu@vi-du.test")],
};
CAY["pha-dem"] = CAY["san-khac"];
CAY["pha-hai-san"] = CAY["san-thu-trung"];
CAY["deploy-san-khac"] = CAY["san-khac"];
// Đối chứng dương: các sàn này phải có mặt trước lượt chạy.
const SAN_CAY = {
  sach: [],
  "san-khac": ["[Mẫu] Sàn thử", "[Mẫu] Sàn trình diễn", "[Tên sàn] có sẵn"],
  "san-thu-trung": ["[Mẫu] Sàn thử (bản cũ)"],
};
SAN_CAY["pha-dem"] = SAN_CAY["deploy-san-khac"] = SAN_CAY["san-khac"];
SAN_CAY["pha-hai-san"] = SAN_CAY["san-thu-trung"];
function cay(ten, ca) {
  for (const lenh of CAY[ca]) {
    const r = spawnSync(process.execPath, lenh, {
      cwd: GOC,
      env: { ...process.env, DATABASE_URL: urlCua(ten) },
      encoding: "utf8",
    });
    if (r.status !== 0)
      throw new Error(
        `cấy dữ liệu có sẵn (${lenh.join(" ")}) lỗi: ${(r.stderr || r.stdout).slice(-300)}`,
      );
  }
}

/** Băm và đếm mọi dòng của ba bảng — dữ liệu có sẵn phải giống hệt trước và sau lượt chạy. */
const anhChup = (ten) =>
  voiDbTen(ten, async (c) => {
    const bang = [
      `select id, name from companies order by id`,
      `select id, name, email from identity."user" order by id`,
      `select company_id, user_id, roles from company_members order by company_id, user_id`,
    ];
    const ra = [];
    for (const q of bang) {
      const r = (await c.query(q)).rows;
      ra.push({
        n: r.length,
        bam: createHash("sha256").update(JSON.stringify(r)).digest("hex"),
      });
    }
    return ra;
  });
async function voiDbTen(ten, fn) {
  const c = new pg.Client({ connectionString: urlCua(ten) });
  await c.connect();
  try {
    return await fn(c);
  } finally {
    await c.end();
  }
}

/** Chạy một bản tệp kiểm (đường tuyệt đối, cùng thư mục với tệp thật) trên cơ sở dữ liệu tạm. */
function chayTep(tep, ten) {
  const r = spawnSync(
    process.execPath,
    ["--test", "--test-reporter=spec", tep],
    {
      cwd: GOC,
      env: { ...process.env, DATABASE_URL: urlCua(ten) },
      encoding: "utf8",
      timeout: 300_000,
    },
  );
  const ra = `${r.stdout}\n${r.stderr}`;
  return {
    ma: r.status,
    ra,
    ac9Dat: /✔ AC-9 /.test(ra),
    ac9BoQua: /AC-9 [^\n]*# SKIP|﹣ AC-9 /.test(ra),
    dongDo: ra
      .split("\n")
      .filter((l) => /AssertionError|✖ AC-/.test(l))
      .slice(0, 4),
  };
}

// Lời khẳng định phá thử mà mỗi phép đếm bị vô hiệu làm hỏng. Node in «false == true» cho assert.ok, không in lại biểu
// thức, nên ghim là khung stack đầu tiên sau AssertionError: phải trỏ đúng dòng chứa lời khẳng định này trong tệp phá.
const KHANG_DINH = {
  "pha-dem": `coLoi(loi, "${THONG_DIEP_DO}")`,
  "pha-hai-san": 'coLoi(loi, "hai sàn mẫu")',
};
// Chỗ ghim chiều đỏ theo ca; ca phá điền lúc dựng tệp phá (tên tệp:số dòng).
const GHIM_DO = {};

/** Khung stack đầu tiên sau MỖI dòng AssertionError — một tệp đỏ có thể có nhiều ca đỏ. */
function khungDau(ra) {
  const d = ra.split("\n");
  const ds = [];
  d.forEach((l, i) => {
    if (l.includes("AssertionError"))
      ds.push(d.slice(i + 1).find((x) => /^\s+at /.test(x)) ?? "");
  });
  return ds;
}
/** Tên các ca kiểm đỏ khác AC-9 — báo ra để thấy, không đổi kết luận của ca phá. */
const caDoKhac = (ra) => [
  ...new Set(
    ra
      .split("\n")
      .filter((l) => /^✖ AC-\d/.test(l) && !/^✖ AC-9 /.test(l))
      .map((l) => l.replace(/ \([\d.]+ms\)$/, "")),
  ),
];

/** Đúng lệnh của job deploy (ci.yml): mọi tệp packages/db/tests/*.test.mjs của gói db. */
function chayDeploy(ten) {
  const r = spawnSync("npm", ["run", "test:isolation", "-w", "@quy-hang/db"], {
    cwd: GOC,
    env: { ...process.env, DATABASE_URL: urlCua(ten) },
    encoding: "utf8",
    timeout: 600_000,
  });
  const ra = `${r.stdout}\n${r.stderr}`;
  return {
    ma: r.status,
    ra,
    ac9Dat: /✔ AC-9 /.test(ra),
    ac9BoQua: /AC-9 [^\n]*# SKIP|﹣ AC-9 /.test(ra),
    dongDo: ra
      .split("\n")
      .filter((l) => /AssertionError|✖ /.test(l))
      .slice(0, 4),
  };
}

/** Bản sao tạm cạnh tệp thật (đường nhập ../seed/... vẫn đúng); xoá trong finally của người gọi. */
function banSao(noiDung, nhan) {
  const tep = path.join(
    path.dirname(TEP_KIEM),
    `.ac9-${nhan}-${process.pid}.test.mjs`,
  );
  writeFileSync(tep, noiDung);
  return tep;
}

async function mot(ca, tep, kyVongXanh) {
  const ten = `ac9_${ca.replace(/-/g, "_")}_${process.pid}`;
  const loi = [];
  try {
    await taoDb(ten);
    cay(ten, ca);
    const truoc = await anhChup(ten);
    // Đối chứng dương: dữ liệu có sẵn thật sự có mặt trước lượt chạy.
    const coSan = await voiDbTen(ten, async (c) =>
      (await c.query("select name from companies")).rows.map((r) => r.name),
    );
    for (const t of SAN_CAY[ca])
      if (!coSan.includes(t))
        loi.push(`đối chứng dương hỏng: thiếu sàn có sẵn «${t}»`);
    if (SAN_CAY[ca].length && truoc[2].n === 0)
      loi.push("đối chứng dương hỏng: không có thành viên có sẵn");
    const k = ca === "deploy-san-khac" ? chayDeploy(ten) : chayTep(tep, ten);
    // Đầu ra trọn của lần chạy, để soi khi ca lệch (thư mục bị git bỏ qua).
    mkdirSync(RA, { recursive: true });
    writeFileSync(path.join(RA, `ra-${ca}-${process.pid}.txt`), k.ra);
    const khac = caDoKhac(k.ra);
    const sau = await anhChup(ten);
    if (kyVongXanh) {
      if (k.ma !== 0)
        loi.push(
          `tệp kiểm đỏ trên cơ sở dữ liệu ${ca}: ${k.dongDo.join(" | ")}`,
        );
      if (ca !== "deploy-san-khac" && !k.ac9Dat)
        loi.push(`AC-9 không chạy hay không đạt (${ca})`);
      if (k.ac9BoQua) loi.push(`AC-9 bị bỏ qua (${ca})`);
    } else {
      if (k.ma === 0)
        loi.push(
          `tệp kiểm xanh trên cơ sở dữ liệu ${ca} — phép đo không phân biệt được`,
        );
      else if (
        GHIM_DO[ca]
          ? !khungDau(k.ra).some((f) => f.includes(GHIM_DO[ca]))
          : !k.ra.includes(THONG_DIEP_DO)
      )
        loi.push(`đỏ sai thông điệp (${ca}): ${k.dongDo.join(" | ")}`);
    }
    if (JSON.stringify(sau) !== JSON.stringify(truoc))
      loi.push(
        `dữ liệu có sẵn đổi sau lượt chạy (${ca}): ${JSON.stringify(truoc)} → ${JSON.stringify(sau)}`,
      );
    return {
      ca,
      ok: loi.length === 0,
      loi,
      ma_tep: k.ma,
      ...(khac.length ? { ca_khac_do: khac } : {}),
    };
  } finally {
    await xoaDb(ten);
  }
}

/** Bộ kiểm cách ly của kho trên cơ sở dữ liệu sạch tạm (AC-4). */
async function boCachLy() {
  const ten = `ac9_cach_ly_${process.pid}`;
  try {
    await taoDb(ten);
    const r = spawnSync("npm", ["run", "db:test"], {
      cwd: GOC,
      env: { ...process.env, DATABASE_URL: urlCua(ten) },
      encoding: "utf8",
      timeout: 600_000,
    });
    const loi =
      r.status === 0
        ? []
        : [
            `bộ kiểm cách ly đỏ trên cơ sở dữ liệu sạch: ${`${r.stdout}${r.stderr}`
              .split("\n")
              .filter((l) => /✖|not ok|Error/.test(l))
              .slice(0, 3)
              .join(" | ")}`,
          ];
    return { ca: "cach-ly", ok: loi.length === 0, loi, ma_tep: r.status };
  } finally {
    await xoaDb(ten);
  }
}

try {
  await voiDb(null, (c) => c.query("select 1"));
} catch (e) {
  console.error(`không nối được Postgres ${URL_GOC.host}: ${e.message}`);
  process.exit(2);
}

// Hàm đếm theo tập mốc trong tệp kiểm (tên và chữ ký khai ở design.md) — phép phá chèn «return 0;» đầu thân hàm.
const PHA = {
  "pha-dem": "async function dongMauMoi(c, goc) {",
  "pha-hai-san": "async function sanMauMoi(c, goc) {",
};
const ket = [];
try {
  const dcd = process.argv.indexOf("--doi-chung-do");
  if (dcd > 0) {
    const sha = process.argv[dcd + 1];
    const r = spawnSync("git", ["show", `${sha}:${TUONG_DOI}`], {
      cwd: GOC,
      encoding: "utf8",
      maxBuffer: 1 << 26,
    });
    if (r.status !== 0) {
      console.error(
        `không rút được ${TUONG_DOI} tại ${sha}: ${r.stderr.trim()}`,
      );
      process.exit(2);
    }
    const tep = banSao(r.stdout, "cu");
    try {
      ket.push({ ban: "cu", ...(await mot("san-khac", tep, false)) });
      ket.push({ ban: "cu", ...(await mot("san-thu-trung", tep, false)) });
      ket.push({ ban: "cu", ...(await mot("sach", tep, true)) });
    } finally {
      rmSync(tep, { force: true });
    }
  } else {
    const ds = process.argv.flatMap((a, i) =>
      process.argv[i - 1] === "--ca" ? [a] : [],
    );
    if (!ds.length) {
      console.error("thiếu --ca <ca> hay --doi-chung-do <sha>");
      process.exit(2);
    }
    for (const ca of ds) {
      if (ca === "cach-ly") ket.push(await boCachLy());
      else if (PHA[ca]) {
        // Đối chứng âm của AC-3: một phép đếm theo tập mốc bị vô hiệu (luôn 0) thì phá thử tương ứng phải làm tệp đỏ.
        const goc = readFileSync(TEP_KIEM, "utf8");
        const neo = PHA[ca];
        if (!goc.includes(neo)) {
          console.error(
            `không tìm thấy «${neo}» trong ${TUONG_DOI} — phép đo ${ca} không áp được`,
          );
          process.exit(2);
        }
        const pha = goc.replace(neo, `${neo}\n  return 0;`);
        const tep = banSao(pha, ca);
        const dong =
          pha.split("\n").findIndex((l) => l.includes(KHANG_DINH[ca])) + 1;
        if (!dong) {
          rmSync(tep, { force: true });
          console.error(
            `không tìm thấy lời khẳng định ${KHANG_DINH[ca]} trong ${TUONG_DOI}`,
          );
          process.exit(2);
        }
        GHIM_DO[ca] = `${path.basename(tep)}:${dong}:`;
        try {
          ket.push(await mot(ca, tep, false));
        } finally {
          rmSync(tep, { force: true });
        }
      } else if (CAY[ca]) ket.push(await mot(ca, TEP_KIEM, true));
      else {
        console.error(`ca lạ: ${ca}`);
        process.exit(2);
      }
    }
  }
} catch (e) {
  // Không dựng được môi trường đo (migrate, cấy dữ liệu, kết nối): mã 2, vẫn in các ca đã xong.
  for (const k of ket) console.log(JSON.stringify(k));
  console.error(`không chạy được: ${e.message}`);
  process.exit(2);
}
for (const k of ket) console.log(JSON.stringify(k));
process.exit(ket.every((k) => k.ok) ? 0 : 1);
