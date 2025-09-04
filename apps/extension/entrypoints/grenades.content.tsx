import { systemSettings, updateLanguageFromUrl } from "../hooks/use-settings";
import "~/assets/tailwind.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { GrenadesDialog } from "../components/grenades-dialog";
import { Toaster } from "../components/ui/sonner";
import { createShadowRootUi } from "wxt/utils/content-script-ui/shadow-root";
import { ShadowRootProvider } from "../lib/shadow-root-context";

let currentUI: any = null;

async function waitForSidebarElement(): Promise<HTMLElement | null> {
  return new Promise((resolve) => {
    const checkForElement = () => {
      // Look for the main nav wrapper first
      const mainNavWrapper = document.querySelector(
        '[class*="styles__MainNavWrapper"]'
      );

      if (mainNavWrapper) {
        // Find the scrollable section and footer section
        const scrollableSection = mainNavWrapper.querySelector(
          '[class*="styles__ScrollableNavSectionWrapper"]'
        );
        const footerSection = mainNavWrapper.querySelector(
          '[class*="styles__FooterNavSectionWrapper"]'
        );

        if (scrollableSection && footerSection) {
          resolve(mainNavWrapper as HTMLElement);
          return;
        }
      }

      // If not found, try again after a short delay
      setTimeout(checkForElement, 100);
    };

    checkForElement();

    // Timeout after 10 seconds
    setTimeout(() => resolve(null), 10000);
  });
}

async function createReactButton(ctx: any) {
  try {
    const sidebarElement = await waitForSidebarElement();

    if (!sidebarElement) {
      console.warn("Sidebar element not found, using fallback positioning");
      return createFallbackButton(ctx);
    }

    // Find the scrollable and footer sections for positioning
    const scrollableSection = sidebarElement.querySelector(
      '[class*="styles__ScrollableNavSectionWrapper"]'
    );
    const footerSection = sidebarElement.querySelector(
      '[class*="styles__FooterNavSectionWrapper"]'
    );

    if (!scrollableSection || !footerSection) {
      console.warn("Required sections not found, using fallback");
      return createFallbackButton(ctx);
    }

    // Create a temporary anchor element in the correct position
    const tempAnchor = document.createElement("div");
    tempAnchor.id = "faceit-grenades-anchor";
    // Don't hide the anchor - shadow-root needs it to be visible

    // Insert the anchor between sections
    if (footerSection.parentNode) {
      footerSection.parentNode.insertBefore(tempAnchor, footerSection);
    } else {
      return createFallbackButton(ctx);
    }

    const ui = await createShadowRootUi(ctx, {
      name: "faceit-grenades-button",
      position: "inline",
      anchor: tempAnchor, // Use the temporary anchor
      onMount: (container) => {
        const app = document.createElement("div");
        app.id = "faceit-grenades-button-container";

        app.style.cssText = `
          max-width: 246px;
          padding: 20px 24px;
          background-color: rgb(18, 18, 18);
        `;

        container.append(app);

        const root = ReactDOM.createRoot(app);

        const ReactButton = ({ container }: { container: HTMLElement }) => {
          return (
            <ShadowRootProvider container={container}>
              <GrenadesDialog container={container} />
              <Toaster container={container} />
            </ShadowRootProvider>
          );
        };

        root.render(<ReactButton container={container} />);
        return root;
      },
      onRemove: (root) => {
        root?.unmount();
        // Clean up the temporary anchor when UI is removed
        if (tempAnchor.parentNode) {
          tempAnchor.parentNode.removeChild(tempAnchor);
        }
      },
    });

    // Mount without await, like in smurf-detection
    ui.mount();

    return ui;
  } catch (error) {
    console.error("Failed to create grenades button:", error);
    return createFallbackButton(ctx);
  }
}

async function createFallbackButton(ctx: any) {
  try {
    const ui = await createShadowRootUi(ctx, {
      name: "faceit-react-button-fallback",
      position: "inline",
      anchor: "body", // String anchor, so autoMount is OK
      onMount: (container) => {
        const app = document.createElement("div");
        app.id = "faceit-react-button-fallback-container";
        container.append(app);

        const root = ReactDOM.createRoot(app);

        const ReactButton = ({ container }: { container: HTMLElement }) => {
          return (
            <ShadowRootProvider container={container}>
              <div className="fixed top-6 right-40 z-[9999]">
                <GrenadesDialog container={container} />
              </div>
              <Toaster container={container} />
            </ShadowRootProvider>
          );
        };

        root.render(<ReactButton container={container} />);
        return root;
      },
      onRemove: (root) => {
        root?.unmount();
      },
    });

    // autoMount is safe here since anchor is a string
    ui.autoMount();

    return ui;
  } catch (error) {
    console.error("Failed to create fallback grenades button:", error);
    return null;
  }
}

async function initGrenades(ctx: any) {
  let extensionEnabled = false;
  let grenadesEnabled = false;

  try {
    const settings = await systemSettings.getValue();
    extensionEnabled = settings.enabled;
    grenadesEnabled = settings.grenades;
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
    return;
  }

  if (!extensionEnabled || !grenadesEnabled) {
    if (currentUI) {
      currentUI.remove();
      currentUI = null;
    }
    return;
  }

  if (currentUI) {
    currentUI.remove();
    currentUI = null;
  }

  currentUI = await createReactButton(ctx);
}

async function handleLocationChange(ctx: any, newUrl: URL) {
  await initGrenades(ctx);

  // Автоматически обновляем язык при изменении URL
  await updateLanguageFromUrl(newUrl.href);
}

export default defineContentScript({
  matches: ["*://*.faceit.com/*"],
  cssInjectionMode: "ui",
  main(ctx) {
    initGrenades(ctx);

    ctx.addEventListener(window, "wxt:locationchange", ({ newUrl }) => {
      handleLocationChange(ctx, newUrl);
    });
  },
});
