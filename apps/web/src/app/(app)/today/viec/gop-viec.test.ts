import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { MyLeadView } from "@quy-hang/core/dedupe";
import { dungTin, type CanTrongBo, type TinDauKhach, type VaoDungTin } from "@quy-hang/core/today";

import type { DongLeadTruongNhom } from "../nguon";
import { NHAN_VIEC, nutCuaViec, type ViecDong } from "../viec-dong";
import { chuDong } from "./chu-dong";
import { nguonCanDocLai } from "./doc-nguon";
import { canBaoChuaDoc, gopViec, nguonBoNhom, tinConViec, trangNguonCanDoc, trangNutGiao, type DongVai, type MaNguon, type Nguon, type RaGop, type TrangNguon, type VaoGop } from "./gop-viec";

const BAY_GIO = "2026-11-09T10:00:00.000Z";
const gioTruoc = (phut: number) => new Date(Date.parse(BAY_GIO) - phut * 60_000).toISOString();
const ok = <T>(ds: T[] = []): Nguon<T> => ({ trang: "ok", ds });
const loi = <T>(): Nguon<T> => ({ trang: "loi", ds: [] });
const doi = (leadId: string, kind: DongLeadTruongNhom["kind"]): DongLeadTruongNhom => ({ leadId, kind, buildingName: "Toà A", unitNumber: null, agentUserId: null, dueAt: gioTruoc(30) });
const lead = (id: string, stage: MyLeadView["stage"]) => ({ id, stage, buildingName: "Toà B", unitNumber: "B-1" }) as MyLeadView;
const tin = (kind: TinDauKhach["kind"], at: string) =>
  (kind === "new_match"
    ? { kind, at, day: "2026-11-09", shares: [], listing: { id: "c1", name: "A-1" } }
    : { kind, at, day: "2026-11-09", share: { id: "s1", recipient: "[Tên]" }, listing: { id: "c1", name: "A-1" }, opens: 1, interested: [] }) as unknown as TinDauKhach;

// Tin dựng bằng chính lõi, không ép kiểu: một căn đã gửi có giá lúc gửi, đổi giá sau đó; một căn cùng toà vừa lên Đang bán.
const GUI_LUC = "2026-11-09T08:00:00.000Z";
const CAN_GUI: CanTrongBo = { id: "c1", name: "Toà A · A-1", buildingName: "Toà A", bedroomsTotal: 2, giaLucGui: 1_000, suSau: [{ type: "price_changed", payload: { listPrice: 900 } }], suSauAt: gioTruoc(30) };
const vaoDung = (can: CanTrongBo): VaoDungTin => ({
  shares: [{ id: "s1", recipient: "[Tên]", createdAt: GUI_LUC, disabledAt: null, listings: [can] }],
  events: [{ shareId: "s1", type: "link_opened", listingId: null, createdAt: gioTruoc(40) }, { shareId: "s1", type: "interest", listingId: "c1", createdAt: gioTruoc(39) }],
  activeSau: [{ id: "c2", name: "Toà A · A-2", buildingName: "Toà A", bedroomsTotal: 2, listPrice: 1_050, activeAt: gioTruoc(20) }],
});
const tinThat = (kind: TinDauKhach["kind"]) => dungTin(vaoDung(CAN_GUI), new Date(BAY_GIO)).find((t) => t.kind === kind)!;

const VAO = (b: Partial<VaoGop<string>>): VaoGop<string> => ({
  vai: [],
  bayGio: BAY_GIO,
  tv: null,
  dauChu: [],
  leadGiao: { trang: "ok" },
  hangDoi: ok(),
  dauChuSan: { trang: "ok" },
  leadCuaToi: ok(),
  tin: ok(),
  ...b,
});
const DU = ["team_lead", "listing_agent", "telesales", "buyer_agent"];

describe("gopViec", () => {
  it("gộp việc: năm nguồn, nhóm quá hạn trước", () => {
    const ra = gopViec(
      VAO({
        vai: DU,
        dauChu: [{ code: "new_lead", label: "Lead mới", viec: ["l1"], soQua: 1 }],
        hangDoi: ok([doi("a", "accept_overdue"), doi("b", "unrouted")]),
        leadCuaToi: ok([lead("t", "returned")]),
        tin: ok([tin("reaction", gioTruoc(60))]),
      }),
    );
    assert.deepEqual(ra.nhom.map((g) => g.ma), ["lead_overdue", "lead_unrouted", "new_lead", "lead_returned", "buyer_reaction"]);
  });

  it("gộp việc: số đầu màn bằng số dòng", () => {
    const ra = gopViec(VAO({ vai: DU, dauChu: [{ code: "x", label: "X", viec: ["a", "b"], soQua: 1 }], hangDoi: ok([doi("a", "first_call_overdue")]) }));
    assert.equal(ra.so, 3);
    assert.equal(ra.so, ra.nhom.flatMap((g) => g.viec).length);
    assert.equal(ra.quaHan, 2);
  });

  it("gộp việc: bộ nhóm sàn có nhóm không hạn đứng trước giữ thứ tự", () => {
    const ra = gopViec(VAO({ vai: ["listing_agent"], dauChu: [{ code: "khong_han", label: "A", viec: ["1"], soQua: 0 }, { code: "new_lead", label: "B", viec: ["2"], soQua: 1 }] }));
    assert.deepEqual(ra.nhom.map((g) => g.ma), ["khong_han", "new_lead"]);
  });

  it("gộp việc: chỉ lead bị trả lại thành việc của telesales", () => {
    const NAC = ["sent", "accepted", "called", "on_board", "returned", "resubmitted", "supplement", "discarded"] as const;
    for (const stage of NAC) {
      const ra = gopViec(VAO({ vai: ["telesales"], leadCuaToi: ok([lead("t", stage)]) }));
      assert.equal(ra.so, stage === "returned" ? 1 : 0, `nấc ${stage}`);
      assert.equal(ra.soLeadDaNhap, 1, "dòng Lead đã nhập vẫn đếm mọi lead");
    }
  });

  it("gộp việc: tin đầu khách tự hết sau 48 giờ", () => {
    assert.equal(tinConViec(gioTruoc(48 * 60 - 1), BAY_GIO), true, "47:59 còn là việc");
    assert.equal(tinConViec(gioTruoc(48 * 60 + 1), BAY_GIO), false, "48:01 thôi là việc");
    const ra = gopViec(VAO({ vai: ["buyer_agent"], tin: ok([tin("new_match", gioTruoc(47 * 60)), tin("changed", gioTruoc(49 * 60))]) }));
    assert.deepEqual(ra.nhom.map((g) => g.ma), ["buyer_new_match"]);
  });

  it("gộp việc: nguồn lỗi không thành rỗng", () => {
    const ra = gopViec(VAO({ vai: ["team_lead", "listing_agent"], hangDoi: loi(), dauChu: [{ code: "x", label: "X", viec: ["a"], soQua: 0 }] }));
    assert.deepEqual(ra.loi, [{ nguon: "hang-doi", chu: "Chưa tải được lead quá hạn" }]);
    assert.deepEqual(ra.nhom.map((g) => g.ma), ["x"], "nhóm khác giữ nguyên");
    assert.equal(ra.so, 1, "chỉ đếm phần đọc được");
  });

  it("gộp việc: nguồn ok và rỗng thì không báo lỗi", () => {
    const ra = gopViec(VAO({ vai: ["team_lead"], hangDoi: ok() }));
    assert.deepEqual(ra.loi, []);
    assert.equal(ra.so, 0);
  });

  describe("gộp việc: ma trận năm vai × tám loại việc", () => {
    const CO = "một dòng";
    const KHONG = "không có dòng";
    const LOAI = ["lead_overdue", "lead_unrouted", "new_lead", "missing_info", "lead_returned", "buyer_reaction", "buyer_changed", "buyer_new_match"] as const;
    type Loai = (typeof LOAI)[number];
    const NGUON: Record<Loai, string> = { lead_overdue: "hàng đợi", lead_unrouted: "hàng đợi", new_lead: "lead giao", missing_info: "căn đầu chủ", lead_returned: "lead của tôi", buyer_reaction: "tin", buyer_changed: "tin", buyer_new_match: "tin" };
    // Viết trước, mỗi ô một câu; đọc theo thứ tự của LOAI.
    const BANG: Record<string, readonly string[]> = {
      team_lead: [CO, CO, KHONG, KHONG, KHONG, KHONG, KHONG, KHONG],
      listing_agent: [KHONG, KHONG, CO, CO, KHONG, KHONG, KHONG, KHONG],
      telesales: [KHONG, KHONG, KHONG, KHONG, CO, KHONG, KHONG, KHONG],
      buyer_agent: [KHONG, KHONG, KHONG, KHONG, KHONG, CO, CO, CO],
      company_admin: [KHONG, KHONG, KHONG, KHONG, KHONG, KHONG, KHONG, KHONG],
    };
    const NHOM_LEAD = { code: "new_lead", actions: ["accept", "return"] as const };
    const NHOM_CAN = { code: "missing_info", actions: ["open_record"] as const };
    type DongDc = ViecDong;
    const vaoCua = (vai: string, loai: Loai): VaoGop<DongDc> => ({
      vai: [vai],
      bayGio: BAY_GIO,
      tv: null,
      leadGiao: { trang: "ok" },
      dauChuSan: { trang: "ok" },
      dauChu:
        loai === "new_lead"
          ? [{ code: loai, label: "Lead mới", viec: [{ kind: "lead", nhom: NHOM_LEAD as never, stage: "sent" }], soQua: 0 }]
          : loai === "missing_info"
            ? [{ code: loai, label: "Thiếu thông tin", viec: [{ kind: "can", nhom: NHOM_CAN as never }], soQua: 0 }]
            : [],
      hangDoi: ok(loai === "lead_overdue" ? [doi("a", "accept_overdue")] : loai === "lead_unrouted" ? [doi("b", "unrouted")] : []),
      leadCuaToi: ok(loai === "lead_returned" ? [{ ...lead("t", "returned"), need: "sale", createdAt: gioTruoc(60) } as MyLeadView] : []),
      tin: ok(loai === "buyer_reaction" ? [tinThat("reaction")] : loai === "buyer_changed" ? [tinThat("changed")] : loai === "buyer_new_match" ? [tinThat("new_match")] : []),
    });
    /** Nút chính của một dòng: dòng vai đọc từ `chuDong`, dòng đầu chủ đọc từ bảng nút. */
    function nutChinh(d: DongDc | DongVai): string | null {
      if (d.kind === "can" || d.kind === "lead") {
        const { chinh } = nutCuaViec(d);
        return chinh ? NHAN_VIEC[chinh] : null;
      }
      return chuDong(d, BAY_GIO, () => "[Tên]").nut || null;
    }
    function chayMaTran(gop: (v: VaoGop<DongDc>) => RaGop<DongDc>): number {
      let dem = 0;
      for (const [vai, hang] of Object.entries(BANG))
        LOAI.forEach((loai, i) => {
          dem += 1;
          const ten = `${vai} × ${loai} (nguồn ${NGUON[loai]})`;
          const ra = gop(vaoCua(vai, loai));
          const dong = ra.nhom.filter((g) => g.ma === loai).flatMap((g) => [...g.viec]);
          if (hang[i] === KHONG) {
            assert.equal(dong.length, 0, `${ten}: phải không có dòng`);
            return;
          }
          assert.equal(dong.length, 1, `${ten}: phải đúng một dòng`);
          assert.ok(nutChinh(dong[0]!), `${ten}: phải có đúng một nút chính`);
          assert.equal(ra.so, 1, `${ten}: số đầu màn bằng số dòng`);
        });
      return dem;
    }

    it("mọi ô đúng bảng viết trước", () => {
      assert.equal(chayMaTran(gopViec), 40, "đủ năm vai × tám loại");
    });

    it("đối chứng: bản cố ý bỏ một nguồn thì đỏ, thông điệp nêu tên nguồn", () => {
      const boTin = (v: VaoGop<DongDc>) => gopViec({ ...v, tin: ok() });
      assert.throws(() => chayMaTran(boTin), /nguồn tin/);
      const boHangDoi = (v: VaoGop<DongDc>) => gopViec({ ...v, hangDoi: ok() });
      assert.throws(() => chayMaTran(boHangDoi), /nguồn hàng đợi/);
    });
  });

  it("dòng đầu khách không có khoá lớp nguồn", () => {
    const LOP_NGUON = ["ownerName", "ownerPhone", "floorPrice", "titleDeedPhoto"];
    const MOI = "0900 000 099";
    // Mồi nằm ở dữ liệu vào; lõi dựng tin phải bỏ lại.
    const canMoi = { ...CAN_GUI, ownerPhone: MOI, ownerName: "[Tên chủ]", floorPrice: 1 };
    assert.ok(JSON.stringify(canMoi).includes(MOI), "đối chứng: mồi có ở dữ liệu nguồn");
    const VIET_TRUOC: Record<TinDauKhach["kind"], string[]> = {
      reaction: ["at", "day", "id", "interested", "kind", "name", "opens", "recipient", "share"],
      changed: ["at", "changed", "day", "from", "id", "kind", "listing", "name", "price", "recipient", "share", "to"],
      new_match: ["at", "day", "id", "kind", "listPrice", "listing", "name", "recipient", "shares"],
    };
    const khoa = (o: unknown, ra = new Set<string>()): Set<string> => {
      if (Array.isArray(o)) for (const x of o) khoa(x, ra);
      else if (o && typeof o === "object")
        for (const [k, v] of Object.entries(o)) {
          ra.add(k);
          khoa(v, ra);
        }
      return ra;
    };
    const ds = dungTin(vaoDung(canMoi), new Date(BAY_GIO));
    assert.deepEqual([...new Set(ds.map((t) => t.kind))].sort(), ["changed", "new_match", "reaction"], "đủ ba loại tin");
    for (const t of ds) {
      const dong: DongVai = { kind: "tin", id: "x", tin: t };
      assert.deepEqual([...khoa(t)].sort(), VIET_TRUOC[t.kind], `khoá của tin ${t.kind}`);
      for (const k of LOP_NGUON) assert.equal(khoa(dong).has(k), false, `dòng ${t.kind} có khoá ${k}`);
      const chu = JSON.stringify(chuDong(dong, BAY_GIO, () => "[Tên]"));
      assert.equal(chu.includes(MOI), false, `chữ dòng ${t.kind} lộ số`);
      assert.equal(JSON.stringify(dong).includes(MOI), false, `dòng ${t.kind} lộ số`);
    }
  });

  it("hai nguồn lỗi ra hai dòng báo", () => {
    const ra = gopViec(VAO({ vai: DU, hangDoi: loi(), tin: loi() }));
    assert.deepEqual(ra.loi.map((l) => l.nguon), ["hang-doi", "tin"]);
  });

  it("trưởng nhóm thuần không cần nguồn của vai khác", () => {
    const ra = gopViec(VAO({ vai: ["team_lead"], hangDoi: ok([doi("a", "unrouted")]), leadGiao: { trang: "loi" }, tin: loi(), leadCuaToi: loi() }));
    assert.deepEqual(ra.loi, []);
    assert.deepEqual(ra.nhom.map((g) => g.ma), ["lead_unrouted"]);
  });

  it("nhãn theo sổ từ vựng của sàn", () => {
    const tv = { truong: {}, giaTri: { nhomViec: { lead_overdue: "Lead trễ" } } } as never;
    const ra = gopViec(VAO({ vai: ["team_lead"], tv, hangDoi: ok([doi("a", "accept_overdue")]) }));
    assert.equal(ra.nhom[0]!.nhan, "Lead trễ");
  });

  it("đang tải khi nguồn của vai chưa về", () => {
    assert.equal(gopViec(VAO({ vai: ["buyer_agent"], tin: { trang: "dang", ds: [] } })).dangTai, true);
    assert.equal(gopViec(VAO({ vai: ["team_lead"], tin: { trang: "dang", ds: [] } })).dangTai, false);
  });
});

describe("chịu lỗi từng phần (hom-nay-chiu-loi-tung-phan)", () => {
  it("nguồn bộ nhóm theo vai", () => {
    const BANG: [string[], TrangNguon, boolean, ReturnType<typeof nguonBoNhom>][] = [
      [["team_lead"], "dang", false, "khong-ap"],
      [["telesales"], "loi", true, "khong-ap"],
      [["listing_agent"], "ok", false, "moi"],
      [["listing_agent"], "loi", true, "luu"],
      [["listing_agent"], "loi", false, "mac-dinh"],
    ];
    let dem = 0;
    for (const [vai, trang, daLuu, mong] of BANG) {
      assert.equal(nguonBoNhom(vai, trang, daLuu), mong, `${vai} · ${trang} · ${daLuu}`);
      dem++;
    }
    assert.equal(dem, 5);
  });

  it("danh sách đầu chủ lỗi", () => {
    const co = gopViec(VAO({ vai: ["team_lead"], hangDoi: ok([doi("a", "accept_overdue")]), dauChuSan: { trang: "loi" } }));
    assert.deepEqual(co.loi, [{ nguon: "dau-chu-san", chu: "Chưa tải được danh sách đầu chủ" }]);
    const haiLoi = gopViec(VAO({ vai: ["team_lead"], hangDoi: loi(), dauChuSan: { trang: "loi" } }));
    assert.deepEqual(haiLoi.loi.map((l) => l.nguon), ["hang-doi"]);
    const rong = gopViec(VAO({ vai: ["team_lead"], hangDoi: ok(), dauChuSan: { trang: "loi" } }));
    assert.deepEqual(rong.loi, []);
    const dang = gopViec(VAO({ vai: ["team_lead"], hangDoi: ok([doi("a", "accept_overdue")]), dauChuSan: { trang: "dang" } }));
    assert.equal(dang.dangTai, false, "danh sách đang đọc không giữ khung chờ của màn");
  });

  it("nút giao", () => {
    assert.deepEqual(trangNutGiao("dang", 0), { tat: true });
    assert.deepEqual(trangNutGiao("loi", 0), { tat: true });
    assert.deepEqual(trangNutGiao("ok", 0), { tat: true, cau: "Sàn chưa có đầu chủ nào" });
    assert.deepEqual(trangNutGiao("ok", 2), { tat: false });
  });

  it("nguồn cần đọc lại", () => {
    const LANH = { boNhom: "ok", leadGiao: "ok", hangDoi: "ok", dauChuSan: "ok", leadCuaToi: "ok", tin: "ok" } as const;
    const DU_VAI = ["listing_agent", "team_lead", "telesales", "buyer_agent"];
    const BANG: [keyof typeof LANH, MaNguon, string][] = [
      ["boNhom", "lead-giao", "listing_agent"],
      ["leadGiao", "lead-giao", "listing_agent"],
      ["hangDoi", "hang-doi", "team_lead"],
      ["dauChuSan", "dau-chu-san", "team_lead"],
      ["leadCuaToi", "lead-cua-toi", "telesales"],
      ["tin", "tin", "buyer_agent"],
    ];
    let dem = 0;
    for (const [nguon, ma, vai] of BANG) {
      assert.deepEqual(nguonCanDocLai(trangNguonCanDoc({ vai: DU_VAI, ...LANH, [nguon]: "loi" })), [ma], nguon);
      assert.deepEqual(nguonCanDocLai(trangNguonCanDoc({ vai: DU_VAI.filter((r) => r !== vai), ...LANH, [nguon]: "loi" })), [], `không vai ${vai}`);
      dem++;
    }
    assert.equal(dem, 6);
  });

  it("báo chưa đọc", () => {
    assert.equal(canBaoChuaDoc({ ngoaiTuyen: true, tong: 0, coLoi: true }), true);
    assert.equal(canBaoChuaDoc({ ngoaiTuyen: false, tong: 0, coLoi: true }), false);
    assert.equal(canBaoChuaDoc({ ngoaiTuyen: true, tong: 3, coLoi: true }), false);
    assert.equal(canBaoChuaDoc({ ngoaiTuyen: true, tong: 0, coLoi: false }), false);
  });
});
