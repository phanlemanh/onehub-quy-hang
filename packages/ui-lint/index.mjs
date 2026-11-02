// Plugin ESLint quy-hang-ui: làm "tự vẽ tay UI" phát hiện được bằng máy (chuẩn ReUI + shadcn base-nova).
// Chuyển từ eslint-plugin-onehub-ui của onehub-invest (cùng chủ kho); đổi tên plugin, giữ nguyên mười luật; luật
// thứ mười một `ban-do-khuon` (hàng 59) giữ bản đồ khuôn design/patterns/; ba luật của hệ bố cục
// (hàng 91) giữ bề rộng, chờ tải và ngăn nổi ở bố cục.
import noRawTable from "./rules/no-raw-table.mjs";
import noRawControls from "./rules/no-raw-controls.mjs";
import noNativeDialogs from "./rules/no-native-dialogs.mjs";
import noRawPalette from "./rules/no-raw-palette.mjs";
import noHardcodedColor from "./rules/no-hardcoded-color.mjs";
import noArbitraryTextSize from "./rules/no-arbitrary-text-size.mjs";
import noBannedMotion from "./rules/no-banned-motion.mjs";
import noAsChild from "./rules/no-aschild.mjs";
import noEmojiIcons from "./rules/no-emoji-icons.mjs";
import requireDisableReason from "./rules/require-disable-reason.mjs";
import banDoKhuon from "./rules/ban-do-khuon.mjs";
import noLayoutArbitrary from "./rules/no-layout-arbitrary.mjs";
import noRawSkeleton from "./rules/no-raw-skeleton.mjs";
import noDirectSheet from "./rules/no-direct-sheet.mjs";

export default {
  meta: { name: "quy-hang-ui" },
  rules: {
    "no-raw-table": noRawTable,
    "no-raw-controls": noRawControls,
    "no-native-dialogs": noNativeDialogs,
    "no-raw-palette": noRawPalette,
    "no-hardcoded-color": noHardcodedColor,
    "no-arbitrary-text-size": noArbitraryTextSize,
    "no-banned-motion": noBannedMotion,
    "no-aschild": noAsChild,
    "no-emoji-icons": noEmojiIcons,
    "require-disable-reason": requireDisableReason,
    "ban-do-khuon": banDoKhuon,
    "no-layout-arbitrary": noLayoutArbitrary,
    "no-raw-skeleton": noRawSkeleton,
    "no-direct-sheet": noDirectSheet,
  },
};
