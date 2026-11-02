import { describe, it } from "node:test";
import assert from "node:assert/strict";
import plugin from "../index.mjs";

const TEN = [
  "no-raw-table", "no-raw-controls", "no-native-dialogs", "no-raw-palette",
  "no-hardcoded-color", "no-arbitrary-text-size", "no-banned-motion",
  "no-aschild", "no-emoji-icons", "require-disable-reason", "ban-do-khuon",
  // Hệ bố cục (hàng 91).
  "no-layout-arbitrary", "no-raw-skeleton", "no-direct-sheet",
];

describe("plugin quy-hang-ui", () => {
  it("có tên và đủ mười bốn luật hợp đồng", () => {
    assert.equal(plugin.meta.name, "quy-hang-ui");
    for (const name of TEN) assert.ok(plugin.rules[name], `thiếu luật ${name}`);
    assert.deepEqual(Object.keys(plugin.rules).sort(), [...TEN].sort(), "plugin phải có ĐÚNG mười bốn luật hợp đồng");
  });
  it("mỗi luật có meta chuẩn", () => {
    for (const name of TEN) {
      const { meta } = plugin.rules[name];
      assert.equal(meta.type, "problem", name);
      assert.ok(meta.docs?.description, `${name} thiếu docs.description`);
      assert.ok(meta.messages && Object.keys(meta.messages).length, `${name} thiếu messages`);
      assert.deepEqual(meta.schema, [], name);
    }
  });
});
