"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon, RotateCcwIcon, Undo2Icon } from "lucide-react";
import type { CatalogData } from "@quy-hang/core";
import { FIELD_LABEL, STANDARD_FIELDS, type CotMau, type ImportContext, type PlanTarget } from "@quy-hang/core/import";

import { BangGhepCot, DongTomTat, MucTomTat, type LuaChon } from "@/components/khoi/solution-crm-6/buoc";
import { KhungBuoc } from "@/components/khoi/solution-crm-6/khung-buoc";
import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { choMau, DANG_TAI_MAU, daiBaoMau, ghepKhiCoMau, type MauDaNho } from "@/lib/nhap/cho-mau";
import { bamTep, docTep } from "@/lib/nhap/doc-tep";
import { cotTheoMau, loiTheoCot, mauCot, nhanLop } from "@/lib/nhap/duong-ong";
import { canHoi, cauChoDuyet, CHO_DE_XUAT, coTheTiepGhepAi, dongY, dongYHet, hoiDeXuat, khiDoiDich, lyDoKhongHoi, ttDau, type AiMan, type TrangThaiDeXuat } from "@/lib/nhap/de-xuat";
import { canHoiOLa, CHO_O_LA, dungDeXuat, hoiOLa, lyDoKhongHoiOLa, tatO, ttOLaDau, type TrangThaiOLa } from "@/lib/nhap/o-la";
import { batDauGhi, deXuatGhep, deXuatOLa, docDauChu, docMau, docTrangThaiAi, ghiTiep, laLoi, tienDoCho, tongGhi, xemThuTatCa, xongGhi, type LoiGoi, type TienDoGhi } from "@/lib/nhap/goi-api";
import {
  BUOC,
  boDong,
  canChonDauChu,
  chonDauChu,
  chonBuoc,
  coQuyen,
  coTheGhi,
  coTheTiep,
  batDauDoc,
  nhanTep,
  nhanXemThu,
  doiDichCot,
  sangBuoc,
  suaO,
  taoTrangThai,
  type TongKet,
  type TrangThaiNhap,
  type XemThu,
} from "@/lib/nhap/trang-thai";

import { BangTrung, BangXemTruoc } from "./bang";
import { HopHoanTac, LanNhapGanDay } from "./hoan-tac";
import { NUT_SAU_GHI } from "@/lib/nhap/hoan-tac";

const DICH: LuaChon[] = [
  ...STANDARD_FIELDS.map((f) => ({ value: f, label: FIELD_LABEL[f] })),
  { value: "keep_as_note", label: "Giữ làm ghi chú" },
  { value: "ignore_with_reason", label: "Bỏ cột" },
];

const homNay = () => new Date().toISOString().slice(0, 10);
const cauTong = (t: TongKet) => `${t.create} căn mới, cập nhật ${t.update}, tin bổ sung ${t.supplement}, bỏ ${t.skip}`;

export function ManNhap({ vai }: { vai: string[] }) {
  const [s, setS] = useState<TrangThaiNhap>(() => taoTrangThai(vai));
  const [ctx, setCtx] = useState<ImportContext | null>(null);
  const [dauChu, setDauChu] = useState<LuaChon[]>([]);
  const [loiTep, setLoiTep] = useState<string | null>(null);
  const [dangDoc, setDangDoc] = useState(false);
  const [tepGoc, setTepGoc] = useState<{ ten: string; bytes: Uint8Array; trangCo: string[] } | null>(null);
  const [tienDoXem, setTienDoXem] = useState<string | null>(null);
  const [loiXem, setLoiXem] = useState<string | null>(null);
  // Bản xem thử gần nhất vẫn hiện sau khi người bỏ thêm dòng — nút ghi chỉ mở lại khi xem thử lại.
  const [xemCu, setXemCu] = useState<XemThu | null>(null);
  const [ghiDo, setGhi] = useState<TienDoGhi | null>(null);
  const [dangGhi, setDangGhi] = useState(false);
  // Mẫu file của sàn (hàng 67): đọc một lần khi mở màn; chọn tệp trước khi mẫu về thì chờ mẫu (Ngoài-5 hàng 67); lỗi thì
  // ghép theo từ điển và báo một dòng.
  const mauHua = useRef<Promise<CotMau[] | LoiGoi> | null>(null);
  const [mauTT, setMauTT] = useState<MauDaNho>({ kind: "dang-tai" });
  // Hoàn tác cả lần nhập (hàng 66): lần nhập đang mở hộp, và số lần làm mới danh sách «Lần nhập gần đây».
  const [hoanTacId, setHoanTacId] = useState<string | null>(null);
  const [lamMoi, setLamMoi] = useState(0);
  // «Xử lý bằng AI» (hàng 68): trạng thái của sàn và đề xuất của tệp đang mở.
  // Lời đọc trạng thái giữ dạng hứa: tệp thả trước khi trạng thái về vẫn chờ nó, không lặng lẽ coi là «tắt».
  const aiHua = useRef<Promise<AiMan> | null>(null);
  const [dx, setDx] = useState<TrangThaiDeXuat>(() => ttDau(0));
  // Ô lạ còn lại (hàng 69): đề xuất cho ô «Cần người» ở bước Xem trước — riêng mỗi tệp.
  const [ola, setOla] = useState<TrangThaiOLa>(ttOLaDau);
  const olaMoi = useRef(ola);
  useEffect(() => {
    olaMoi.current = ola;
  }, [ola]);

  useEffect(() => {
    fetch("/api/v1/catalog")
      .then((r) => (r.ok ? r.json() : null))
      .then((catalog: CatalogData | null) => setCtx({ today: homNay(), ...(catalog ? { catalog } : {}) }))
      .catch(() => setCtx({ today: homNay() }));
    aiHua.current = docTrangThaiAi(fetch)
      .then((t): AiMan => (laLoi(t) ? "loi" : t))
      .catch((): AiMan => "loi");
    const p = docMau(fetch);
    mauHua.current = p;
    void choMau(p).then(setMauTT);
    if (canChonDauChu(vai))
      docDauChu(fetch).then((ds) => !laLoi(ds) && setDauChu(ds.map((d) => ({ value: d.userId, label: d.name }))));
  }, [vai]);

  // Rời trang giữa chừng thì trình duyệt hỏi lại.
  const ghi = tienDoCho(ghiDo, s);
  const dangDo = s.tep !== null && !(ghi && xongGhi(ghi));
  useEffect(() => {
    if (!dangDo) return;
    const hoi = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", hoi);
    return () => window.removeEventListener("beforeunload", hoi);
  }, [dangDo]);

  // Trạng thái mới nhất cho việc chờ máy lấy thế hệ lúc gửi (khuôn thế hệ ở lib/nhap/trang-thai).
  const moiNhat = useRef(s);
  useEffect(() => {
    moiNhat.current = s;
  }, [s]);

  async function nap(ten: string, bytes: Uint8Array, trang?: string) {
    if (!ctx) return;
    const batDau = batDauDoc(moiNhat.current);
    moiNhat.current = batDau;
    setS(batDau);
    setDangDoc(true);
    setLoiTep(null);
    try {
      const doc = await docTep(ten, bytes, trang);
      if ("loi" in doc) return setLoiTep(doc.loi);
      const bam = await bamTep(bytes);
      setTepGoc({ ten, bytes, trangCo: doc.trang });
      setOla(ttOLaDau());
      olaMoi.current = ttOLaDau();
      const { ong } = await ghepKhiCoMau(doc.grid, ctx, mauHua.current ?? Promise.resolve([]));
      const sau = nhanTep(moiNhat.current, batDau.the, { ten, bam, loai: doc.loai, trang: doc.trangChon }, ong);
      moiNhat.current = sau;
      setS(sau);
      if (sau.the === batDau.the) return setDx(ttDau(sau.the));
      const ai = await (aiHua.current ?? Promise.resolve<AiMan>("loi"));
      if (moiNhat.current.the !== sau.the) return;
      if (!canHoi(ong, ai)) return setDx({ ...ttDau(sau.the), baoTatDinh: lyDoKhongHoi(ong, ai) });
      setDx({ ...ttDau(sau.the), dangHoi: true });
      const kq = await hoiDeXuat(ong, (g) => deXuatGhep(fetch, g), sau.the);
      // Kết quả về muộn: người đã chọn tệp khác hay đổi gì ở tệp này trong lúc chờ (thế hệ đã tăng) thì bỏ, gỡ dải chờ.
      if (moiNhat.current.the !== sau.the) return setDx((cu) => (cu.phien === sau.the ? ttDau(sau.the) : cu));
      setS((cu) => (cu.the === sau.the ? { ...cu, ong: kq.ong } : cu));
      setDx(kq.tt);
    } catch {
      setLoiTep("Không đọc được tệp này — thử chọn lại.");
    } finally {
      setDangDoc(false);
    }
  }

  // Vào bước Xem trước (hay sửa ô ở đó): gửi các ô lạ CHƯA hỏi của kế hoạch này một lần; không ô nào đổi khi người chưa chạm.
  useEffect(() => {
    if (s.buoc !== 3 || !s.ong) return;
    const ong = s.ong;
    const tep = s.tep?.bam;
    void (async () => {
      const ai = await (aiHua.current ?? Promise.resolve<AiMan>("loi"));
      if (olaMoi.current.dangHoi) return;
      if (!canHoiOLa(ong, ai, olaMoi.current)) {
        const bao = lyDoKhongHoiOLa(ong, ai);
        if (bao) setOla((cu) => ({ ...cu, bao }));
        return;
      }
      olaMoi.current = { ...olaMoi.current, dangHoi: true };
      setOla(olaMoi.current);
      const kq = await hoiOLa(ong, (g) => deXuatOLa(fetch, g), olaMoi.current);
      // Người đã chọn tệp khác trong lúc chờ: bỏ kết quả.
      if (moiNhat.current.tep?.bam !== tep) return;
      setOla((cu) => {
        const moi = { ...kq, daTat: cu.daTat };
        olaMoi.current = moi;
        return moi;
      });
    })();
  }, [s.buoc, s.ong, s.tep?.bam]);

  async function xemThu(t: TrangThaiNhap) {
    setLoiXem(null);
    const kq = await xemThuTatCa(fetch, t, (i, n) => setTienDoXem(`Đang hỏi máy chủ… gói ${i}/${n}`));
    setTienDoXem(null);
    if (laLoi(kq)) return setLoiXem(kq.loi);
    setS((cu) => {
      const moi = nhanXemThu(cu, t.the, kq);
      if (moi !== cu) setXemCu(kq);
      return moi;
    });
  }

  async function ghiCac(t: TienDoGhi) {
    setDangGhi(true);
    const kq = await ghiTiep(fetch, t, setGhi);
    setGhi(kq);
    setDangGhi(false);
  }

  const tiep = () => {
    if (s.buoc === 3) {
      const moi = sangBuoc(s, 4);
      setS(moi);
      void xemThu(moi);
      return;
    }
    if (s.buoc === 4 && coTheGhi(s)) return setS(sangBuoc(s, 5));
    if (s.buoc === 2 && s.ong && !coTheTiepGhepAi(s.ong, dx).ok) return;
    if (coTheTiep(s)) setS(sangBuoc(s, s.buoc + 1));
  };

  const loiCot = useMemo(() => (s.ong ? loiTheoCot(s.ong.loi) : new Map<number, string>()), [s.ong]);
  const theoMau = useMemo(() => (s.ong ? cotTheoMau(s.ong) : []), [s.ong]);
  const daiBao = s.ong ? daiBaoMau(mauTT, s.ong) : null;
  const moTa = s.tep && s.ong ? `${s.tep.ten} · ${s.ong.table.rows.length.toLocaleString("vi-VN")} dòng${s.tep.trang ? ` · trang «${s.tep.trang}»` : ""}` : "Chưa chọn tệp";
  const daXong = ghi !== null && xongGhi(ghi);

  const chan = daXong ? (
    <Button render={<Link href="/inventory" />}>Mở Bảng hàng</Button>
  ) : (
    <>
      {s.buoc > 1 && !dangGhi && tienDoXem === null ? (
        <Button type="button" variant="outline" onClick={() => setS(sangBuoc(s, s.buoc - 1))}>
          <ArrowLeftIcon data-icon="inline-start" aria-hidden="true" />
          Lùi
        </Button>
      ) : null}
      {s.buoc < 5 ? (
        <Button type="button" onClick={tiep} disabled={s.buoc === 4 ? !coTheGhi(s) || tienDoXem !== null : !coTheTiep(s) || (s.buoc === 2 && s.ong !== null && !coTheTiepGhepAi(s.ong, dx).ok)}>
          Tiếp
          <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
        </Button>
      ) : (
        <Button
          type="button"
          disabled={!coTheGhi(s) || dangGhi}
          onClick={() => {
            const t = ghi ?? batDauGhi(s);
            if (!laLoi(t)) void ghiCac(t);
          }}
        >
          {dangGhi ? <Spinner data-icon="inline-start" /> : null}
          {ghi?.loi ? `Thử lại gói ${ghi.loi.goi}` : "Ghi vào Quỹ hàng"}
        </Button>
      )}
    </>
  );

  return (
    <KhungBuoc tieuDe="Nhập Excel" moTa={moTa} nhan="Bảng hàng" buoc={BUOC} hienTai={s.buoc} dangChay={dangDoc || tienDoXem !== null || dangGhi} onChonBuoc={(so) => setS(chonBuoc(s, so, { dangDoc, dangXemThu: tienDoXem !== null, dangGhi }))} chan={chan}>
      {s.buoc === 1 ? (
        <section className="flex flex-col gap-6" aria-label="Tải tệp">
          <Field>
            <FieldLabel htmlFor="nhap-tep">Tệp bảng hàng</FieldLabel>
            <Input
              id="nhap-tep"
              type="file"
              accept=".xlsx,.csv"
              disabled={!ctx || dangDoc}
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) await nap(f.name, new Uint8Array(await f.arrayBuffer()));
              }}
            />
            <FieldDescription>Tệp .xlsx hay .csv, tối đa 10 MB và 5.000 dòng. Tệp đọc ngay trên máy này, không gửi lên máy chủ.</FieldDescription>
          </Field>
          {dangDoc ? <TrangThai kind="loading" title={mauTT.kind === "dang-tai" ? DANG_TAI_MAU : "Đang đọc tệp…"} /> : null}
          {loiTep ? <TrangThai kind="error" title="Không đọc được tệp này" description={loiTep} /> : null}
          {tepGoc && tepGoc.trangCo.length > 1 ? (
            <Field>
              <FieldLabel>Trang tính</FieldLabel>
              <ChonMot
                value={s.tep?.trang ?? ""}
                options={tepGoc.trangCo.map((t) => ({ value: t, label: t }))}
                onDoi={(t) => void nap(tepGoc.ten, tepGoc.bytes, t)}
              />
            </Field>
          ) : null}
          {coQuyen(vai) ? <LanNhapGanDay lamMoi={lamMoi} onHoanTac={setHoanTacId} /> : null}
          {canChonDauChu(vai) ? (
            <Field>
              <FieldLabel>Đầu chủ giữ căn</FieldLabel>
              <ChonMot value={s.dauChu ?? ""} options={dauChu} goiY="Chọn đầu chủ" onDoi={(v) => setS(chonDauChu(s, v))} />
              <FieldDescription>Căn mới trong tệp thuộc đầu chủ này.</FieldDescription>
            </Field>
          ) : null}
        </section>
      ) : null}

      {s.buoc === 2 && s.ong && daiBao ? (
        <TrangThai
          kind="notice"
          title={daiBao.title}
          description={mauTT.kind === "loi" ? "Ghép theo từ điển như lần nhập đầu — kiểm lại từng cột." : "Cột có nhãn «theo mẫu» ghép như lần nhập đã ghi gần nhất; đổi cột nào thì lần sau nhớ cách mới."}
        />
      ) : null}
      {s.buoc === 2 && s.ong && dx.dangHoi ? <TrangThai kind="notice" title={CHO_DE_XUAT} description="Máy chỉ gửi tiêu đề, dạng cột và mã căn, giá, phí, trạng thái — không gửi chủ nhà, số điện thoại, giá đáy, ghi chú." /> : null}
      {/* Câu lý do ở mô tả: tiêu đề của TrangThai cắt một dòng, khổ 375 mất nửa câu. */}
      {s.buoc === 2 && s.ong && dx.baoTatDinh ? <TrangThai kind="notice" title="Ghép tay lần này" description={dx.baoTatDinh} /> : null}
      {s.buoc === 2 && s.ong ? (
        <BangGhepCot
          cot={s.ong.table.headers.map((h, i) => ({
            ma: String(i),
            tieuDe: h,
            mau: mauCot(s.ong!.profile[i]!),
            lop: theoMau.includes(i) ? `${nhanLop(s.ong!.lop[i]!.cls)} · theo mẫu` : nhanLop(s.ong!.lop[i]!.cls),
            dich: s.ong!.plan.columns[i]!.target,
            loi: loiCot.get(i),
            ...(dx.choDuyet.includes(i) || dx.daDongY.includes(i)
              ? { deXuat: { lyDo: s.ong!.plan.columns[i]!.reason.replace(/^Máy đề xuất: /, ""), daDongY: dx.daDongY.includes(i) } }
              : {}),
          }))}
          options={DICH}
          canhBao={
            loiCot.size
              ? { tieuDe: "Có cột chưa ghép được", moTa: "Sửa cột có chữ đỏ rồi bấm Tiếp." }
              : dx.choDuyet.length
                ? {
                    tieuDe: cauChoDuyet(dx.choDuyet.length),
                    moTa: (
                      <Button type="button" size="sm" variant="outline" onClick={() => setDx(dongYHet(dx))}>
                        Đồng ý mọi đề xuất ({dx.choDuyet.length})
                      </Button>
                    ),
                  }
                : null
          }
          onDoi={(ma, dich) => {
            if (!ctx) return;
            setS(doiDichCot(s, Number(ma), dich as PlanTarget, ctx));
            setDx(khiDoiDich(dx, Number(ma)));
          }}
          onDongY={(ma) => setDx(dongY(dx, Number(ma)))}
        />
      ) : null}

      {s.buoc === 3 && s.ong && ctx && s.soOTheo ? (
        <TrangThai kind="notice" title={`Đã đổi theo ${s.soOTheo} ô cùng chữ`} description="Các ô cùng chữ trong cột nhận cùng giá trị — soát lại trước khi ghi; lần nhập sau nhớ cách gọi này." />
      ) : null}
      {s.buoc === 3 && s.ong && ola.dangHoi ? <TrangThai kind="loading" title={CHO_O_LA} description="Máy chỉ gửi chữ của ô mã căn, giá, phí, trạng thái chưa đọc được — không gửi chủ nhà, số điện thoại, giá đáy, ghi chú. Vẫn sửa tay được." /> : null}
      {s.buoc === 3 && s.ong && !ola.dangHoi && ola.bao ? <TrangThai kind="notice" title="Sửa tay lần này" description={ola.bao} /> : null}
      {s.buoc === 3 && s.ong && ctx ? (
        <BangXemTruoc
          ong={s.ong}
          bo={s.bo}
          ola={ola}
          onSua={(src, cot, raw) => {
            setS(suaO(s, src, cot, raw, ctx));
            setOla((cu) => tatO(cu, src, cot));
          }}
          onDung={(src, cot) => {
            const r = dungDeXuat(s, ola, src, cot, ctx);
            setS(r.s);
            setOla(r.tt);
          }}
          onBo={(src, bo) => setS(boDong(s, src, bo))}
        />
      ) : null}

      {s.buoc === 4 ? (
        tienDoXem ? (
          <TrangThai kind="loading" title={tienDoXem} />
        ) : loiXem ? (
          <TrangThai
            kind="error"
            title="Chưa hỏi được máy chủ"
            description={loiXem}
            hanhDong={
              <Button variant="outline" onClick={() => void xemThu(s)}>
                <RotateCcwIcon data-icon="inline-start" aria-hidden="true" />
                Thử lại
              </Button>
            }
          />
        ) : s.xemThu ? (
          <div className="flex flex-col gap-4">
            {!coTheGhi(s) ? (
              <TrangThai kind="notice" title="Không dòng nào sẽ được ghi" description="Mọi dòng đều bị bỏ — xem lý do từng dòng dưới đây, hay lùi lại sửa ô." />
            ) : null}
            <BangTrung xemThu={s.xemThu} bo={s.bo} onBo={(src) => setS(boDong(s, src))} />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <TrangThai
              kind="notice"
              title="Đã đổi sau bản xem thử"
              description="Xem thử lại để có con số mới trước khi ghi."
              hanhDong={
                <Button variant="outline" onClick={() => void xemThu(s)}>
                  Xem thử lại
                </Button>
              }
            />
            {xemCu ? <BangTrung xemThu={xemCu} bo={s.bo} onBo={(src) => setS(boDong(s, src))} /> : null}
          </div>
        )
      ) : null}

      {s.buoc === 5 && s.xemThu ? (
        daXong ? (
          <TrangThai
            kind="notice"
            title="Đã ghi vào Quỹ hàng"
            description={`Ghi ${cauTong(tongGhi(ghi!))}. Căn mới ở trạng thái Chưa đủ để rao, «Chỉ tôi» của người nhập.`}
            hanhDong={
              <Button type="button" variant="outline" onClick={() => setHoanTacId(ghi!.importId)}>
                <Undo2Icon data-icon="inline-start" aria-hidden="true" />
                {NUT_SAU_GHI}
              </Button>
            }
          />
        ) : !coTheGhi(s) ? (
          <TrangThai kind="notice" title="Không dòng nào sẽ được ghi" description="Mọi dòng đều bị bỏ — lùi lại xem lý do ở bước Trùng." />
        ) : (
          <div className="flex flex-col gap-4">
            <MucTomTat tieuDe={`Ghi ${cauTong(s.xemThu.summary)}`}>
              <DongTomTat nhan="Căn mới" giaTri={s.xemThu.summary.create} />
              <DongTomTat nhan="Cập nhật căn bạn giữ" giaTri={s.xemThu.summary.update} />
              <DongTomTat nhan="Tin bổ sung cho đầu chủ giữ căn" giaTri={s.xemThu.summary.supplement} />
              <DongTomTat nhan="Bỏ" giaTri={s.xemThu.summary.skip} />
            </MucTomTat>
            {ghi && !ghi.loi ? <TrangThai kind="loading" title={`Đã ghi ${ghi.xong.length}/${ghi.goi.length} gói`} /> : null}
            {ghi?.loi ? <TrangThai kind="error" title={`Gói ${ghi.loi.goi} chưa ghi được`} description={`${ghi.loi.loi} Các gói trước đã ghi giữ nguyên.`} /> : null}
          </div>
        )
      ) : null}
      <HopHoanTac importId={hoanTacId} onDong={() => setHoanTacId(null)} onXong={() => setLamMoi((n) => n + 1)} />
    </KhungBuoc>
  );
}

function ChonMot({ value, options, goiY = "Chọn", onDoi }: { value: string; options: readonly LuaChon[]; goiY?: string; onDoi: (v: string) => void }) {
  const chon = options.find((o) => o.value === value) ?? null;
  return (
    <Select value={chon} items={options} onValueChange={(v) => v && onDoi(v.value)}>
      <SelectTrigger className="w-full sm:w-80">
        <SelectValue>{(o: LuaChon | null) => o?.label ?? goiY}</SelectValue>
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        <SelectGroup>
          {options.map((o) => (
            <SelectItem key={o.value} value={o}>
              {o.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
