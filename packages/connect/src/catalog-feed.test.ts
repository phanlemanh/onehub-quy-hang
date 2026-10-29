import assert from "node:assert/strict";
import { test } from "node:test";
import { CatalogFeed } from "./catalog-feed";

const feed = {
  schemaVersion: 0,
  provider: "onehub-invest",
  measuredAt: "2026-10-29T08:00:00+07:00",
  projects: [
    {
      projectKey: "p-1",
      projectName: "[Tên dự án]",
      complexName: null,
      buildings: [
        {
          buildingKey: "b-a",
          buildingName: "Toà A",
          units: [
            {
              upi: "urn:onehub:upi:vn-test:b-a:2305",
              unitNumber: "A.2305",
              stack: "05",
              floor: 23,
              livingArea: 42.9,
              bedroomsTotal: 1,
              directionFaces: "Đông Nam",
            },
          ],
        },
      ],
    },
  ],
};

test("gói đúng khuôn thì nhận", () => {
  assert.equal(CatalogFeed.safeParse(feed).success, true);
});

test("khoá lạ bị từ chối — đường dẫn bài gốc không lọt vào được", () => {
  const withUrl = structuredClone(feed);
  Object.assign(withUrl.projects[0]!.buildings[0]!.units[0]!, { sourceUrl: "https://example.com/tin/1" });
  assert.equal(CatalogFeed.safeParse(withUrl).success, false);
});

test("sai phiên bản khuôn thì từ chối cả gói", () => {
  assert.equal(CatalogFeed.safeParse({ ...feed, schemaVersion: 1 }).success, false);
});

test("UPI sai dạng thì từ chối", () => {
  const bad = structuredClone(feed);
  bad.projects[0]!.buildings[0]!.units[0]!.upi = "A.2305";
  assert.equal(CatalogFeed.safeParse(bad).success, false);
});
