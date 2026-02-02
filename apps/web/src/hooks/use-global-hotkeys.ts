import { useHotkeys } from "react-hotkeys-hook";
import { filterDialog } from "@/stores/handlers";

/**
 * 全局快捷键监听
 * - ⌘+K / Ctrl+K: 打开 Filter Dialog
 */
export function useGlobalHotkeys() {
  useHotkeys("mod+k", (e) => {
    e.preventDefault();
    filterDialog.openWithPayload(undefined);
  });
}
