"use client";

import { DauMan, type DuongDan } from "@/components/bo-cuc";

import { useSoViec } from "./viec/kho-so";

const DUONG: [DuongDan, DuongDan] = [{ nhan: "Quỹ hàng", href: "/" }, { nhan: "Hôm nay" }];

/** Đầu màn của Hôm nay: số đọc từ kho chung nên luôn bằng số dòng của thân. */
export function DauManHomNay() {
  const s = useSoViec();
  const moTa = s ? (s.so ? `${s.so} việc${s.quaHan ? ` · ${s.quaHan} quá hạn` : ""}` : "Không còn việc") : undefined;
  return <DauMan duongDan={DUONG} tieuDe="Hôm nay" moTa={moTa} />;
}
