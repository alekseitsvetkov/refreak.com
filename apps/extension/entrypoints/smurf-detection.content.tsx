import "~/assets/tailwind.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { SmurfDetectionManager } from "../features/smurf-detection";
import { updateLanguageFromUrl } from "../hooks/use-settings";
import { Toaster } from "../components/ui/sonner";
import { createShadowRootUi } from "wxt/utils/content-script-ui/shadow-root";

const matchRoomPattern = new MatchPattern("*://*.faceit.com/*/cs2/room/*");

let toasterUI: any = null;
let handleLocationTimeout: ReturnType<typeof setTimeout> | null = null;

async function createToasterUI(ctx: any) {
  try {
    const ui = await createShadowRootUi(ctx, {
      name: "smurf-detection-toaster",
      position: "inline",
      anchor: "body",
      onMount: (container) => {
        const app = document.createElement("div");
        app.id = "smurf-detection-toaster-container";
        container.append(app);

        const root = ReactDOM.createRoot(app);
        root.render(React.createElement(Toaster, { container }));
        return root;
      },
      onRemove: (root) => {
        root?.unmount();
      },
    });

    ui.autoMount();
    return ui;
  } catch (error) {
    console.error("Failed to create toaster UI:", error);
    return null;
  }
}

async function handleLocationChange(ctx: any, newUrl: URL) {
  // Отменяем предыдущий таймаут, если он есть
  if (handleLocationTimeout) {
    clearTimeout(handleLocationTimeout);
    handleLocationTimeout = null;
  }

  // Добавляем дебаунсинг для предотвращения множественных вызовов при SPA навигации
  handleLocationTimeout = setTimeout(async () => {
    // Исключаем страницы scoreboard из процесса обнаружения
    const isScoreboardPage = newUrl.href.includes("/scoreboard");
    const isMatchRoomPage = matchRoomPattern.includes(newUrl.href);

    if (isMatchRoomPage && !isScoreboardPage && !toasterUI) {
      toasterUI = await createToasterUI(ctx);
    }

    const manager = SmurfDetectionManager.getInstance();
    await manager.handleLocationChange(ctx, newUrl);

    // Автоматически обновляем язык при изменении URL
    await updateLanguageFromUrl(newUrl.href);

    handleLocationTimeout = null;
  }, 100); // 500ms дебаунс
}

export default defineContentScript({
  matches: ["*://*.faceit.com/*"],
  cssInjectionMode: "ui",
  main(ctx) {
    // Инициализация при первой загрузке, если мы уже на странице матча (но не scoreboard)
    const currentUrl = window.location.href;
    const isMatchRoomPage = matchRoomPattern.includes(currentUrl);
    const isScoreboardPage = currentUrl.includes("/scoreboard");

    if (isMatchRoomPage && !isScoreboardPage) {
      handleLocationChange(ctx, new URL(currentUrl));
    }

    ctx.addEventListener(window, "wxt:locationchange", ({ newUrl }) => {
      handleLocationChange(ctx, newUrl);
    });
  },
});
