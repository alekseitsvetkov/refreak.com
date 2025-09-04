import { DomQueryService } from "../../lib/match-room";
import { DOM_SELECTORS, TIMEOUTS } from "./constants";

export class DomUtils {
  static extractNickname(element: Element): string | null {
    let nickname = DomQueryService.extractNickname(element);
    if (nickname) return nickname;

    for (const selector of DOM_SELECTORS.NICKNAME_SELECTORS) {
      const nicknameElement = element.querySelector(selector);
      if (nicknameElement?.textContent?.trim()) {
        return nicknameElement.textContent.trim();
      }
    }

    const textElements = Array.from(element.querySelectorAll("*"))
      .filter((el) => el.children.length === 0 && el.textContent?.trim())
      .filter((el) => {
        const text = el.textContent?.trim();
        return text && this.isValidNickname(text);
      });

    return textElements.length > 0
      ? textElements[0].textContent?.trim() || null
      : null;
  }

  private static isValidNickname(text: string): boolean {
    return (
      text.length > 0 &&
      text.length < 50 &&
      !text.includes(" ") &&
      !text.includes("\n") &&
      !text.match(/^\d+$/) &&
      !text.match(/^[A-Z\s]+$/)
    );
  }

  static findPlayerCards(): Element[] {
    const primaryCards = [
      ...document.querySelectorAll(DOM_SELECTORS.PLAYER_BUTTONS),
      ...document.querySelectorAll(DOM_SELECTORS.AVATARS),
      ...DOM_SELECTORS.PLAYER_CARDS.flatMap((selector) => [
        ...document.querySelectorAll(selector),
      ]),
    ];

    if (primaryCards.length === 0) {
      return DOM_SELECTORS.ADDITIONAL_PLAYER_CARDS.flatMap((selector) => [
        ...document.querySelectorAll(selector),
      ]);
    }

    return primaryCards;
  }

  static async extractPlayerNicknames(): Promise<string[]> {
    await new Promise((resolve) =>
      setTimeout(resolve, TIMEOUTS.PLAYER_CARDS_WAIT_DELAY)
    );

    const teamElements = DomQueryService.findTeamContainers(document.body);
    const processedNicknames = new Set<string>();
    const allNicknames: string[] = [];

    if (teamElements?.length > 0) {
      for (const teamElement of teamElements) {
        const playerCards = DomQueryService.findPlayerCards(teamElement);
        this.processPlayerCards(playerCards, allNicknames, processedNicknames);
      }
    } else {
      const playerCards = this.findPlayerCards();
      this.processPlayerCards(playerCards, allNicknames, processedNicknames);
    }

    return allNicknames;
  }

  private static processPlayerCards(
    playerCards: Element[],
    allNicknames: string[],
    processedNicknames: Set<string>
  ): void {
    for (const card of playerCards) {
      const nickname = this.extractNickname(card);
      if (nickname && !processedNicknames.has(nickname)) {
        allNicknames.push(nickname);
        processedNicknames.add(nickname);
      }
    }
  }

  static clearExistingIndicators(): void {
    const selectorsToRemove = [
      DOM_SELECTORS.EXISTING_INDICATORS,
      DOM_SELECTORS.LOADING_INDICATORS,
      DOM_SELECTORS.HEADER_LOADING_INDICATORS,
    ];

    selectorsToRemove.forEach((selector) => {
      document
        .querySelectorAll(selector)
        .forEach((element) => element.remove());
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
  }

  static async waitForPlayerCards(
    maxWaitTime = TIMEOUTS.MAX_PLAYER_CARDS_WAIT_TIME
  ): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const playerCards = document.querySelectorAll(
        DOM_SELECTORS.PLAYER_CARD_BACKGROUND
      );
      if (playerCards.length > 0) {
        return true;
      }
      await new Promise((resolve) =>
        setTimeout(resolve, TIMEOUTS.POLLING_INTERVAL)
      );
    }

    return false;
  }

  static findPlayerCardByNickname(nickname: string): Element | null {
    const playerCards = document.querySelectorAll(
      DOM_SELECTORS.PLAYER_CARD_BACKGROUND
    );

    for (const card of playerCards) {
      const nicknameElement = card.querySelector(DOM_SELECTORS.NICKNAME_NAME);
      if (nicknameElement?.textContent?.trim() === nickname) {
        return card;
      }
    }

    return null;
  }
}
