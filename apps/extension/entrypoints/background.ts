import { println } from "@/lib/utils";

export default defineBackground(() => {
  println('Background script loaded!', { id: browser.runtime.id });

  browser.action.onClicked.addListener(async (tab) => {
    if (tab.id) {
      println('Extension icon clicked!', { tabId: tab.id });
    }
  });

  browser.runtime.onInstalled.addListener(async () => {
    println('Extension installed/updated!');
  });
});
