/**
 * So hằng số mặc định đang dùng ở các luật với sổ (hàng 81, AC-9). Hàm nhận sổ làm tham số, nên bộ kiểm chạy được cả trên
 * bản sao sổ đã phá. Tệp này nhập các luật — không xuất qua `config/index.ts` để luật nhập sổ không vòng lại.
 */
import { CALL_BACK_AFTER_DAYS } from "../listing/freshness";
import { KHOANG_ANH_THAT_TOI_THIEU } from "../listing/san-sang";
import { MAC_DINH_ANH_THAT_TOI_THIEU } from "../listing/status";
import { MUC_HOI_LAI_DOI_GIA_PHAN_TRAM } from "../pricing/hoi-lai";
import { TI_LE_BAO_PHI_MAC_DINH } from "../pricing/ve-tay";
import { CAU_HINH_MAC_DINH } from "../redaction/ban-ra";
import { DEADLINE_MINUTES, DEFAULT_LEAD_ROUTING } from "../routing";
import { QUEUE_DAY_RANGES, QUEUE_DEFAULT_DAYS } from "../today/mac-dinh";
import { SO_DIEM, type DiemSo } from "./so";

export type DongHangSo = { hang: string; khoa: string; ma: unknown; so: unknown };

/** Mười hằng → khoá của sổ; `so` là giá trị sổ nói, `ma` là giá trị hằng đang có. */
export function bangHangSo(so: readonly DiemSo[] = SO_DIEM): DongHangSo[] {
  const d = (khoa: string) => {
    const x = so.find((r) => r.khoa === khoa);
    if (!x) throw new Error(`${khoa}: không có trong sổ`);
    return x;
  };
  const md = (khoa: string) => d(khoa).macDinh;
  const kh = (khoa: string) => {
    const k = d(khoa).kieu;
    return k.loai === "int" || k.loai === "decimal" ? { min: k.min, max: k.max } : null;
  };
  const phanVan = (khoa: string) => Math.round((md(khoa) as number) * 100);
  return [
    { hang: "CALL_BACK_AFTER_DAYS", khoa: "queue.call_back_after_days", ma: CALL_BACK_AFTER_DAYS, so: md("queue.call_back_after_days") },
    { hang: "MUC_HOI_LAI_DOI_GIA_PHAN_TRAM", khoa: "price.change_confirm_pct", ma: MUC_HOI_LAI_DOI_GIA_PHAN_TRAM, so: md("price.change_confirm_pct") },
    {
      hang: "DEFAULT_LEAD_ROUTING",
      khoa: "lead_routing.*",
      ma: DEFAULT_LEAD_ROUTING,
      so: {
        strategy: md("lead_routing.strategy"),
        acceptMinutes: md("lead_routing.accept_minutes"),
        firstCallMinutes: md("lead_routing.first_call_minutes"),
        alertTo: md("lead_routing.alert_to"),
      },
    },
    { hang: "DEADLINE_MINUTES", khoa: "lead_routing.accept_minutes", ma: DEADLINE_MINUTES, so: kh("lead_routing.accept_minutes") },
    {
      hang: "QUEUE_DEFAULT_DAYS",
      khoa: "queue.price_negotiation_after_days, queue.call_back_after_days",
      ma: QUEUE_DEFAULT_DAYS,
      so: { priceAdjustment: md("queue.price_negotiation_after_days"), callBack: md("queue.call_back_after_days") },
    },
    {
      hang: "QUEUE_DAY_RANGES",
      khoa: "queue.price_negotiation_after_days, queue.call_back_after_days",
      ma: { price_adjustment: QUEUE_DAY_RANGES.price_adjustment, call_back: QUEUE_DAY_RANGES.call_back },
      so: { price_adjustment: kh("queue.price_negotiation_after_days"), call_back: kh("queue.call_back_after_days") },
    },
    { hang: "MAC_DINH_ANH_THAT_TOI_THIEU", khoa: "listing.ready_min_real_photos", ma: MAC_DINH_ANH_THAT_TOI_THIEU, so: md("listing.ready_min_real_photos") },
    { hang: "KHOANG_ANH_THAT_TOI_THIEU", khoa: "listing.ready_min_real_photos", ma: KHOANG_ANH_THAT_TOI_THIEU, so: kh("listing.ready_min_real_photos") },
    {
      hang: "CAU_HINH_MAC_DINH",
      khoa: "customer_page.show_confirmed_age, customer_page.private_hides_unit_number",
      ma: CAU_HINH_MAC_DINH,
      so: { showConfirmedAge: md("customer_page.show_confirmed_age"), privateHidesUnitNumber: md("customer_page.private_hides_unit_number") },
    },
    {
      hang: "TI_LE_BAO_PHI_MAC_DINH",
      khoa: "fee.personal_income_tax_pct, fee.registration_fee_pct, fee.brokerage_pct",
      ma: TI_LE_BAO_PHI_MAC_DINH,
      so: { thue_tncn: phanVan("fee.personal_income_tax_pct"), le_phi_truoc_ba: phanVan("fee.registration_fee_pct"), moi_gioi: phanVan("fee.brokerage_pct") },
    },
  ];
}

/** Các hằng lệch sổ; mỗi lệch nêu tên hằng và khoá. */
export function soHangSo(so: readonly DiemSo[] = SO_DIEM): string[] {
  return bangHangSo(so)
    .filter((r) => JSON.stringify(r.ma) !== JSON.stringify(r.so))
    .map((r) => `${r.hang} lệch ${r.khoa}: hằng ${JSON.stringify(r.ma)}, sổ ${JSON.stringify(r.so)}`);
}
