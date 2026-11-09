// Tên riêng cho loại hình trên Postgres thật (hàng loai-hinh-trong-cach-goi: E2, E3c, E7). Sàn, người, căn dựng qua đường ghi
// thật. Địa chỉ «Đường Mẫu N» với tỉnh, xã của danh mục đơn vị hành chính công — không địa chỉ thật.
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { cleanup } from "../helpers";
import { sanMoi, send, type San } from "../san-thu";

after(cleanup);

const VAI = { dc: { vai: ["listing_agent"] } };
const URL_NHAN = "/api/v1/company/labels";
const URL_CAN = "/api/v1/off-compound-units";
const ck = (s: San, k: string) => s.nguoi[k]!.cookie;

type Bang = { values: { field: string; value: string; label: string; custom: boolean }[] };
async function doc(s: San): Promise<Bang> {
  const r = await send("GET", URL_NHAN, undefined, ck(s, "qt"));
  assert.equal(r.status, 200, await r.clone().text());
  return (await r.json()) as Bang;
}
const dong = (b: Bang, value: string) => b.values.find((v) => v.field === "propertySubType" && v.value === value)!;
const gt = (value: string, label: string) => ({ field: "propertySubType", value, label });
const ghi = (s: San, values: unknown[]) => send("PUT", URL_NHAN, { fields: [], values }, ck(s, "qt"));

/** Một căn ngoài khu nhà phố của sàn qua đường ghi thật; trả hàm đọc lại loại hình đang lưu của căn. */
async function canNhaPho(s: San, diaChi: string) {
  const r = await send("POST", URL_CAN, { address: diaChi, propertySubType: "Townhouse" }, ck(s, "dc"));
  assert.equal(r.status, 201, await r.clone().text());
  const { id } = (await r.json()) as { id: string };
  return async () => {
    const ds = await send("GET", URL_CAN, undefined, ck(s, "dc"));
    assert.equal(ds.status, 200);
    return ((await ds.json()) as { units: { id: string; propertySubType: string }[] }).units.find((u) => u.id === id)!.propertySubType;
  };
}

test("loại hình: lưu tên riêng neo RESO", async () => {
  const a = await sanMoi(VAI);
  const b = await sanMoi(VAI, 60);
  const loaiCuaCan = await canNhaPho(a, "31 Đường Mẫu 3, Phường Phú Xuân, Thành phố Huế");
  const truoc = await loaiCuaCan();
  const r = await ghi(a, [gt("Townhouse", "Liền kề")]);
  assert.equal(r.status, 200, await r.clone().text());
  const da = dong(await doc(a), "Townhouse");
  assert.deepEqual([da.label, da.custom], ["Liền kề", true]);
  const db = dong(await doc(b), "Townhouse");
  assert.deepEqual([db.label, db.custom], ["Nhà phố", false], "sàn B không thấy tên của sàn A");
  assert.equal(truoc, "Townhouse");
  assert.equal(await loaiCuaCan(), truoc, "căn giữ giá trị RESO");
});

test("loại hình: giá trị có dấu cách", async () => {
  const a = await sanMoi(VAI);
  const r = await ghi(a, [gt("Single Family Residence", "Dinh thự")]);
  assert.equal(r.status, 200, await r.clone().text());
  const d = dong(await doc(a), "Single Family Residence");
  assert.deepEqual([d.label, d.custom], ["Dinh thự", true]);
});

test("loại hình: neo lạ bị từ chối", async () => {
  const a = await sanMoi(VAI);
  const lanh = await ghi(a, [gt("Townhouse", "Liền kề")]);
  assert.equal(lanh.status, 200, "đối chứng dương: neo đúng được nhận");
  const r = await ghi(a, [gt("Shophouse", "Shop")]);
  assert.equal(r.status, 400);
  assert.match(((await r.json()) as { reason: string }).reason, /«Shophouse»/);
  assert.deepEqual(dong(await doc(a), "Townhouse").label, "Liền kề", "lượt bị từ chối không đổi gì");
});

test("loại hình: máy chủ từ chối chữ sai và trùng", async () => {
  const a = await sanMoi(VAI);
  const BANG: [string, unknown[], RegExp][] = [
    ["trùng riêng–mặc định", [gt("Townhouse", "biệt THỰ")], /Trùng tên của «Biệt thự»$/],
    ["trùng riêng–riêng", [gt("Townhouse", "Liền kề"), gt("Single Family Residence", "liền  KỀ")], /Trùng tên của «(Nhà phố|Biệt thự)»$/],
    ["rỗng", [gt("Townhouse", "   ")], /chữ rỗng$/],
    ["41 ký tự", [gt("Townhouse", "x".repeat(41))], /dài hơn 40 ký tự$/],
    ["số điện thoại", [gt("Townhouse", "Gọi 0900 000 001")], /chứa số điện thoại$/],
  ];
  for (const [ten, values, loi] of BANG) {
    const r = await ghi(a, values);
    assert.equal(r.status, 400, ten);
    assert.match(((await r.json()) as { reason: string }).reason, loi, ten);
    assert.equal(dong(await doc(a), "Townhouse").custom, false, `${ten}: không đổi gì`);
  }
  assert.equal((await ghi(a, [gt("Townhouse", "Liền kề")])).status, 200, "đối chứng trên cùng sàn");
});

test("loại hình: trả về mặc định", async () => {
  const a = await sanMoi(VAI);
  const loaiCuaCan = await canNhaPho(a, "32 Đường Mẫu 3, Phường Phú Xuân, Thành phố Huế");
  assert.equal((await ghi(a, [gt("Townhouse", "Liền kề")])).status, 200);
  const truoc = await loaiCuaCan();
  assert.equal((await ghi(a, [])).status, 200);
  const d = dong(await doc(a), "Townhouse");
  assert.deepEqual([d.label, d.custom], ["Nhà phố", false]);
  assert.equal(await loaiCuaCan(), truoc, "căn không đổi dữ liệu");
});
