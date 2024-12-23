import { isNativeApp } from "webtonative";
import { get, set } from "webtonative/Clipboard";

export async function Copy(text) {
  text = text.toString();
  try {
    let isCopied = false;

    if (isNativeApp) {
      set({
        data: `${text?.trim()}`,
      });
      // get({
      //   callback: (data) => {
      //     isCopied = data?.value === text?.trim();
      //   },
      // });
      isCopied = true;
    } else {
      await navigator.clipboard.writeText(text);
      const clipboardText = (await navigator?.clipboard?.readText()).toString();
      isCopied = clipboardText === text;
    }
    return isCopied;
  } catch (error) {
    return false;
  }
}
