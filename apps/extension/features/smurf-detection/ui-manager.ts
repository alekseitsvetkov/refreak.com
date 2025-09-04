import React from "react";
import ReactDOM from "react-dom/client";
import { createShadowRootUi } from "wxt/utils/content-script-ui/shadow-root";
import { SmurfIndicator } from "../../components/smurf-indicator";
import { SmurfDetectionLoader } from "../../components/smurf-detection-loader";
import { DomQueryService } from "../../lib/match-room";
import { SmurfDetectionState } from "./state";
import { DomUtils } from "./dom-utils";
import { DOM_SELECTORS } from "./constants";
import type { SmurfData } from "./types";

export class UIManager {
  private static instance: UIManager;

  static getInstance(): UIManager {
    if (!UIManager.instance) {
      UIManager.instance = new UIManager();
    }
    return UIManager.instance;
  }

  clearExistingIndicators(): void {
    const existingIndicators = DomQueryService.selectAll(
      DOM_SELECTORS.EXISTING_INDICATORS
    );
    existingIndicators.forEach((indicator: Element) => indicator.remove());

    const loadingIndicators = DomQueryService.selectAll(
      DOM_SELECTORS.LOADING_INDICATORS
    );
    loadingIndicators.forEach((indicator: Element) => indicator.remove());

    const headerLoadingIndicators = DomQueryService.selectAll(
      DOM_SELECTORS.HEADER_LOADING_INDICATORS
    );
    headerLoadingIndicators.forEach((indicator: Element) => indicator.remove());

    const smurfIndicators = document.querySelectorAll(
      DOM_SELECTORS.EXISTING_INDICATORS
    );
    smurfIndicators.forEach((smurfIndicator) => {
      const loadingInsideSmurf = smurfIndicator.querySelectorAll(
        DOM_SELECTORS.LOADING_INDICATORS
      );
      if (loadingInsideSmurf.length > 0) {
        loadingInsideSmurf.forEach((indicator) => indicator.remove());
      }
    });

    document
      .querySelectorAll(DOM_SELECTORS.PROCESSED_CARDS)
      .forEach((element) =>
        element.removeAttribute("data-refreak-smurf-processed")
      );

    document
      .querySelectorAll(DOM_SELECTORS.LOADER_PROCESSED_CARDS)
      .forEach((element) =>
        element.removeAttribute("data-refreak-loader-processed")
      );

    SmurfDetectionState.getInstance().loadingUIs.forEach((ui: any) =>
      ui.remove()
    );
    SmurfDetectionState.getInstance().loadingUIs.clear();
  }

  private createValidElementName(
    nickname: string,
    type: "loader" | "indicator"
  ): string {
    const hash = Math.abs(
      nickname.split("").reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0);
        return a & a;
      }, 0)
    ).toString(36);

    return `refreak-smurf-${type}-${hash}`;
  }

  async createLoaderForPlayer(
    ctx: any,
    playerCard: Element,
    nickname: string
  ): Promise<any> {
    try {
      const elementName = this.createValidElementName(nickname, "loader");

      const holderElement = playerCard.querySelector(
        DOM_SELECTORS.PLAYER_CARD_HOLDER
      );
      if (!holderElement) {
        console.warn(
          `ListContentPlayer__Holder not found for player ${nickname}`
        );
        return null;
      }

      const ui = await createShadowRootUi(ctx, {
        name: elementName,
        position: "inline",
        anchor: playerCard,
        onMount: (container) => {
          const app = document.createElement("div");
          app.id = `${elementName}-container`;
          app.style.position = "absolute";
          app.style.top = "-17px";
          app.style.right = "0px";
          app.style.zIndex = "10";
          container.append(app);

          const root = ReactDOM.createRoot(app);
          root.render(React.createElement(SmurfDetectionLoader));
          return root;
        },
        onRemove: (root) => {
          root?.unmount();
        },
      });

      ui.mount();
      return ui;
    } catch (error) {
      console.error(`Failed to create smurf loader for ${nickname}:`, error);
      return null;
    }
  }

  async createIndicatorForPlayer(
    ctx: any,
    playerCard: Element,
    smurf: SmurfData
  ): Promise<any> {
    try {
      const elementName = this.createValidElementName(
        smurf.nickname,
        "indicator"
      );

      const holderElement = playerCard.querySelector(
        DOM_SELECTORS.PLAYER_CARD_HOLDER
      );
      if (!holderElement) {
        console.warn(
          `ListContentPlayer__Holder not found for player ${smurf.nickname}`
        );
        return null;
      }

      const ui = await createShadowRootUi(ctx, {
        name: elementName,
        position: "inline",
        anchor: playerCard,
        onMount: (container) => {
          const app = document.createElement("div");
          app.id = `${elementName}-container`;
          app.style.position = "absolute";
          app.style.top = "-17px";
          app.style.right = "0px";
          app.style.zIndex = "10";
          container.append(app);

          const root = ReactDOM.createRoot(app);
          root.render(
            React.createElement(SmurfIndicator, {
              nickname: smurf.nickname,
              confidence: smurf.confidence,
              reasons: smurf.reasons,
              stats: smurf.stats,
            })
          );
          return root;
        },
        onRemove: (root) => {
          root?.unmount();
        },
      });

      ui.mount();
      return ui;
    } catch (error) {
      console.error(
        `Failed to create smurf indicator for ${smurf.nickname}:`,
        error
      );
      return null;
    }
  }

  async showLoadersForPlayers(ctx: any, nicknames: string[]): Promise<void> {
    SmurfDetectionState.getInstance().loadingUIs.forEach((ui: any) =>
      ui.remove()
    );
    SmurfDetectionState.getInstance().loadingUIs.clear();

    const playerCardsFound = await DomUtils.waitForPlayerCards();
    if (!playerCardsFound) {
      console.warn("Could not find player cards, skipping loader creation");
      return;
    }

    for (const nickname of nicknames) {
      const playerCard = DomUtils.findPlayerCardByNickname(nickname);

      if (
        playerCard &&
        !playerCard.hasAttribute("data-refreak-loader-processed")
      ) {
        playerCard.setAttribute("data-refreak-loader-processed", "1");
        const ui = await this.createLoaderForPlayer(ctx, playerCard, nickname);
        if (ui) {
          SmurfDetectionState.getInstance().loadingUIs.set(nickname, ui);
        }
      } else if (!playerCard) {
        console.warn(`Could not find player card for player: ${nickname}`);
      }
    }
  }

  async mountSmurfIndicators(
    ctx: any,
    smurfs: SmurfData[],
    allNicknames: string[]
  ): Promise<void> {
    const createdUIs: any[] = [];

    await DomUtils.waitForPlayerCards();

    SmurfDetectionState.getInstance().loadingUIs.forEach(
      (ui: any, nickname: string) => {
        ui.remove();
      }
    );
    SmurfDetectionState.getInstance().loadingUIs.clear();

    document
      .querySelectorAll(DOM_SELECTORS.LOADER_PROCESSED_CARDS)
      .forEach((element) => {
        element.removeAttribute("data-refreak-loader-processed");
      });

    for (const smurf of smurfs) {
      const playerCard = DomUtils.findPlayerCardByNickname(smurf.nickname);

      if (
        playerCard &&
        !playerCard.hasAttribute("data-refreak-smurf-processed")
      ) {
        playerCard.setAttribute("data-refreak-smurf-processed", "1");
        const ui = await this.createIndicatorForPlayer(ctx, playerCard, smurf);
        if (ui) {
          createdUIs.push(ui);
        }
      } else if (!playerCard) {
        console.warn(`Could not find player card for smurf: ${smurf.nickname}`);
      }
    }

    if (!(ctx as any).smurfDetectionCleanup) {
      (ctx as any).smurfDetectionCleanup = () => {
        createdUIs.forEach((ui) => ui.remove());
        SmurfDetectionState.getInstance().loadingUIs.forEach((ui: any) =>
          ui.remove()
        );
        SmurfDetectionState.getInstance().loadingUIs.clear();
      };
    }
  }
}
