// Dữ liệu mẫu của bài thử đồng bộ: hai sàn, bốn người, sáu căn. Mọi bản ghi mang nhãn «Mẫu»; số chủ dạng 0900 000 0xx.

export const SAN_A = '00000000-0000-4000-8000-0000000000a1';
export const SAN_B = '00000000-0000-4000-8000-0000000000b1';

export const NGUOI = {
  a1: { ten: 'Đầu chủ A1', san: SAN_A, vai: 'dau-chu' },
  a2: { ten: 'Đầu chủ A2', san: SAN_A, vai: 'dau-chu' },
  tnA: { ten: 'Trưởng nhóm A', san: SAN_A, vai: 'truong-nhom' },
  b1: { ten: 'Đầu chủ B1', san: SAN_B, vai: 'dau-chu' },
};

export const CAN = [
  { id: 'A-01', san: SAN_A, ma: 'Mẫu A-01', gia: 3200, dau_chu: 'a1', so_chu: '0900 000 001' },
  { id: 'A-02', san: SAN_A, ma: 'Mẫu A-02', gia: 4100, dau_chu: 'a1', so_chu: '0900 000 002' },
  { id: 'A-03', san: SAN_A, ma: 'Mẫu A-03', gia: 2800, dau_chu: 'a2', so_chu: '0900 000 003' },
  { id: 'A-04', san: SAN_A, ma: 'Mẫu A-04', gia: 5600, dau_chu: 'a2', so_chu: '0900 000 004' },
  { id: 'B-01', san: SAN_B, ma: 'Mẫu B-01', gia: 3900, dau_chu: 'b1', so_chu: '0900 000 005' },
  { id: 'B-02', san: SAN_B, ma: 'Mẫu B-02', gia: 6100, dau_chu: 'b1', so_chu: '0900 000 006' },
];

/** Ma trận viết trước: số chủ mỗi người được thấy (đầu chủ: căn mình giữ; trưởng nhóm: mọi căn của sàn). */
export function soChuDuocThay(nguoiId) {
  const n = NGUOI[nguoiId];
  if (!n) return new Set();
  return new Set(
    CAN.filter((c) => c.san === n.san && (n.vai === 'truong-nhom' || c.dau_chu === nguoiId)).map((c) => c.so_chu),
  );
}

export const MOI_SO_CHU = CAN.map((c) => c.so_chu);
