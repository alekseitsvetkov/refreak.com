import "~/assets/tailwind.css";
import { systemSettings, updateLanguageFromUrl } from "../hooks/use-settings";

const faceitPattern = new MatchPattern("*://*.faceit.com/*");

const campaignSelectors = [
  'div[class*="Card"][class*="CampaignWidget__StyledSingleCampaignWidget"]',
  'div[class*="CampaignWidget__Styled"]',
  'div[class*="SingleCampaignWidget"]',
  'div[class*="Card"][class*="CampaignWidget"]',
];

let observer: MutationObserver | null = null;

function isCampaignWidget(element: Element): boolean {
  const hasRewardTag = !!element.querySelector('[class*="RewardTag"]');
  const hasMissionProgress = !!element.querySelector(
    '[class*="MissionProgressCounterText"]'
  );
  const hasCampaignContent = !!element.querySelector(
    '[class*="BaseCampaignWidget__Content"]'
  );
  const hasOverline = !!element.querySelector(
    '[class*="BaseCampaignWidget__Overline"]'
  );

  const textContent = element.textContent || "";
  const hasCampaignText =
    textContent.includes("In progress") ||
    textContent.includes("Ends in") ||
    textContent.includes("Go to") ||
    textContent.includes("Complete") ||
    textContent.includes("Mission") ||
    textContent.includes("Reward") ||
    textContent.includes("депозит") ||
    textContent.includes("Winline");

  return (
    (hasRewardTag || hasMissionProgress || hasCampaignContent || hasOverline) &&
    hasCampaignText
  );
}

function hideCampaignWidgets() {
  campaignSelectors.forEach((selector) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      if (isCampaignWidget(element)) {
        (element as HTMLElement).style.display = "none";
      }
    });
  });
}

function startObserving() {
  if (observer) {
    observer.disconnect();
  }

  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;

            campaignSelectors.forEach((selector) => {
              if (
                element.matches &&
                element.matches(selector) &&
                isCampaignWidget(element)
              ) {
                (element as HTMLElement).style.display = "none";
              }

              const campaigns = element.querySelectorAll(selector);
              campaigns.forEach((campaign) => {
                if (isCampaignWidget(campaign)) {
                  (campaign as HTMLElement).style.display = "none";
                }
              });
            });
          }
        });
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function stopObserving() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}

function restoreCampaignWidgets() {
  campaignSelectors.forEach((selector) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      const style = (element as HTMLElement).style;
      if (style.display === "none") {
        style.removeProperty("display");
      }
    });
  });
}

async function initCampaignHiding() {
  if (typeof browser === "undefined" || !browser?.runtime) {
    return;
  }

  let extensionEnabled = false;
  let hideCampaignsEnabled = false;

  try {
    const settings = await systemSettings.getValue();
    extensionEnabled = settings.enabled;
    hideCampaignsEnabled = settings.hideCampaigns;
  } catch (e) {
    if (
      e &&
      typeof e === "object" &&
      e !== null &&
      "message" in e &&
      typeof e.message === "string" &&
      (e.message.includes("Extension context invalidated") ||
        e.message.includes("Cannot read properties of undefined"))
    ) {
      return;
    }
    console.error("Failed to load extension settings:", e);
    return;
  }

  if (!extensionEnabled || !hideCampaignsEnabled) {
    stopObserving();
    restoreCampaignWidgets();
    return;
  }

  try {
    hideCampaignWidgets();
    startObserving();
  } catch (error) {
    console.error("Failed to hide campaigns:", error);
  }
}

async function handleLocationChange(ctx: any, newUrl: URL) {
  if (typeof browser === "undefined" || !browser?.runtime) {
    return;
  }

  const urlString = newUrl.href;
  if (faceitPattern.includes(urlString)) {
    await initCampaignHiding();
    // Автоматически обновляем язык при изменении URL
    await updateLanguageFromUrl(urlString);
  } else {
    stopObserving();
    restoreCampaignWidgets();
  }
}

export default defineContentScript({
  matches: ["*://*.faceit.com/*"],
  cssInjectionMode: "ui",
  main(ctx) {
    if (typeof browser === "undefined" || !browser?.runtime) {
      return;
    }

    if (faceitPattern.includes(window.location.href)) {
      initCampaignHiding();
    }

    ctx.addEventListener(window, "wxt:locationchange", ({ newUrl }) => {
      handleLocationChange(ctx, newUrl);
    });
  },
});
