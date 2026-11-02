import { BoCuc } from "@/components/bo-cuc";

// Chờ tải cấp tuyến (ADR-0024 §4): hình chung là lưới của Tràn; màn nào cần hình riêng đặt `loading.tsx` của tuyến nó.
export default function Loading() {
  return <BoCuc kieu="tran" dauMan={null} trangThai="cho-tai" />;
}
