import { systemSettings, updateLanguageFromUrl } from "../hooks/use-settings";

async function initContent(ctx: any) {
  let extensionEnabled = false;
  try {
    const settings = await systemSettings.getValue();
    extensionEnabled = settings.enabled;
  } catch (e) {
    if (
      e &&
      typeof e === "object" &&
      e !== null &&
      "message" in e &&
      typeof e.message === "string" &&
      e.message.includes("Extension context invalidated")
    ) {
      return;
    }
    console.error("Failed to load extension settings:", e);
    return;
  }

  if (!extensionEnabled) {
    return;
  }

  // Автоматически определяем язык сайта FACEIT
  await updateLanguageFromUrl(window.location.href);
}

export default defineContentScript({
  matches: ["*://*.faceit.com/*"],
  excludeMatches: ["*://*.faceit.com/en/matchmaking*"],
  main(ctx) {
    initContent(ctx);
  },
});
