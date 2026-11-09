import type { CatalogFeedV2 } from "./catalog-feed";

/**
 * Gói v2 mẫu (hàng 94): hình đúng khuôn, đủ ba nhãn độ chắc và cả ba phần, không có dữ liệu thật. Tệp
 * `catalog-feed-v2.example.json` sinh từ hàm này; bên đẩy dùng để thử, hàng 102 dùng làm dữ liệu dựng màn.
 */
export function goiMauV2(): CatalogFeedV2 {
  return {
    schemaVersion: 2,
    provider: "[Mẫu] Nguồn danh mục và thị trường",
    measuredAt: "2026-11-09T08:00:00+07:00",
    subdivisions: [
      {
        subdivisionKey: "mau-v2-khu-can-ho",
        subdivisionName: "[Mẫu] Khu căn hộ",
        complexName: "[Mẫu] Phân khu 1",
        buildings: [
          {
            buildingKey: "a",
            buildingName: "[Mẫu] Toà A",
            units: [
              {
                upi: "urn:onehub:upi:mau:v2:a:2305",
                unitNumber: "A.2305",
                stack: "05",
                floor: 23,
                livingArea: 68.5,
                bedroomsTotal: 2,
                directionFaces: "Đông Nam",
                propertyType: "Residential",
                propertySubType: "Condominium",
                fieldConfidence: {
                  stack: "verified",
                  floor: "verified",
                  livingArea: "single_source",
                  bedroomsTotal: "single_source",
                  directionFaces: "inferred",
                },
              },
              {
                upi: "urn:onehub:upi:mau:v2:a:1201",
                unitNumber: "A.1201",
                stack: "01",
                floor: 12,
                livingArea: null,
                bedroomsTotal: 1,
                directionFaces: null,
                propertyType: "Residential",
                propertySubType: "Condominium",
                fieldConfidence: { stack: "inferred", floor: "inferred", bedroomsTotal: "inferred" },
              },
            ],
          },
        ],
      },
      {
        subdivisionKey: "mau-v2-khu-dat",
        subdivisionName: "[Mẫu] Khu đất nền",
        complexName: null,
        buildings: [
          {
            buildingKey: "lo-a",
            buildingName: "[Mẫu] Dãy lô A",
            units: [
              {
                upi: "urn:onehub:upi:mau:v2:lo-a:07",
                unitNumber: "LA-07",
                stack: null,
                floor: null,
                livingArea: null,
                bedroomsTotal: null,
                directionFaces: null,
                propertyType: "Land",
                propertySubType: "Unimproved Land",
                lotSizeArea: 90,
                frontageLength: 6,
                accessRoadWidth: 13.5,
                fieldConfidence: { lotSizeArea: "verified", frontageLength: "verified", accessRoadWidth: "single_source" },
              },
            ],
          },
        ],
      },
    ],
    marketStats: [
      {
        subdivisionKey: "mau-v2-khu-can-ho",
        measuredAt: "2026-11-09T08:00:00+07:00",
        segments: [
          {
            buildingKey: "a",
            propertyType: "Residential",
            propertySubType: "Condominium",
            bedroomsTotal: 2,
            listPriceLow: 3_200_000_000,
            listPriceHigh: 4_100_000_000,
            listPriceMedian: 3_650_000_000,
            listingCount: 14,
          },
        ],
      },
      {
        subdivisionKey: "mau-v2-khu-dat",
        measuredAt: "2026-11-09T08:00:00+07:00",
        segments: [
          {
            buildingKey: "lo-a",
            propertyType: "Land",
            propertySubType: "Unimproved Land",
            bedroomsTotal: null,
            listPriceLow: 5_400_000_000,
            listPriceHigh: 7_000_000_000,
            listPriceMedian: 6_000_000_000,
            listingCount: 3,
          },
        ],
      },
    ],
    publicListings: [
      {
        subdivisionKey: "mau-v2-khu-can-ho",
        measuredAt: "2026-11-09T08:00:00+07:00",
        listings: [
          { listingKey: "tin-mau-so-mot", upi: "urn:onehub:upi:mau:v2:a:2305", listPrice: 3_650_000_000, feeInclusion: "included", onMarketDate: "2026-11-02" },
          { listingKey: "tin-mau-so-hai", upi: "urn:onehub:upi:mau:v2:a:1201", listPrice: 2_450_000_000, feeInclusion: null, onMarketDate: "2026-10-28" },
        ],
      },
    ],
  };
}
