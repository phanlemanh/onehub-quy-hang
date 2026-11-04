"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Tab Lead trên điện thoại (hàng 51): hai phần «Nhập lead» · «Lead đã nhập» — Tham chiếu vai Telesales «nhập lead, theo dõi
// bốn nấc», vo-va-ia §2 «cột phải thành tab Lead». Máy tính chỉ có phần nhập, như hàng 24. Phần nhập giữ trạng thái khi đổi
// phần (năm mục không mất); phần Lead đã nhập tải lại mỗi lần mở.
type PhanLead = "nhap" | "da-nhap";

/** Lối «Xem ở Lead đã nhập» dưới kết quả gửi: trong tab Lead thì đổi sang phần ấy; ngoài tab thì null (màn dùng liên kết). */
const XemDaNhap = createContext<(() => void) | null>(null);
export const useXemDaNhap = () => useContext(XemDaNhap);

export function TabLead({ nhap, daNhap }: { nhap: ReactNode; daNhap: ReactNode }) {
  const [phan, setPhan] = useState<PhanLead>("nhap");
  return (
    <XemDaNhap.Provider value={() => setPhan("da-nhap")}>
      <Tabs value={phan} onValueChange={(v) => setPhan(v as PhanLead)} className="flex flex-col gap-khung">
        <TabsList className="w-full md:hidden">
          <TabsTrigger value="nhap" className="flex-1">
            Nhập lead
          </TabsTrigger>
          <TabsTrigger value="da-nhap" className="flex-1">
            Lead đã nhập
          </TabsTrigger>
        </TabsList>
        <TabsContent value="nhap" keepMounted>
          {nhap}
        </TabsContent>
        <TabsContent value="da-nhap" className="md:hidden">
          {daNhap}
        </TabsContent>
      </Tabs>
    </XemDaNhap.Provider>
  );
}
