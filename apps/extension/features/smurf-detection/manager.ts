import { systemSettings } from "../../hooks/use-settings";
import { SmurfDetector } from "./detector";
import { UIManager } from "./ui-manager";
import { SmurfDetectionState } from "./state";
import { DomUtils } from "./dom-utils";
import { TIMEOUTS } from "./constants";
import type { SmurfDetectionSettings } from "./types";
import { toast } from "sonner";
import { detectFaceitLanguage, t } from "../../lib/i18n";

const matchRoomPattern = new MatchPattern("*://*.faceit.com/*/cs2/room/*");

export class SmurfDetectionManager {
  private static instance: SmurfDetectionManager;
  private detector: SmurfDetector;
  private uiManager: UIManager;
  private state: SmurfDetectionState;

  private constructor() {
    this.detector = new SmurfDetector();
    this.uiManager = UIManager.getInstance();
    this.state = SmurfDetectionState.getInstance();
  }

  static getInstance(): SmurfDetectionManager {
    if (!SmurfDetectionManager.instance) {
      SmurfDetectionManager.instance = new SmurfDetectionManager();
    }
    return SmurfDetectionManager.instance;
  }

  async initializeDetection(ctx: any): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, TIMEOUTS.INITIAL_DELAY));

    const settings = await this.loadSettings();
    if (!settings.enabled || !settings.smurfDetection) {
      this.cleanup(ctx);
      return;
    }

    this.forceCleanup(ctx);

    try {
      await this.runDetection(ctx);
    } catch (error) {
      this.handleDetectionError();
    }
  }

  private async runDetection(ctx: any): Promise<void> {
    this.detector.clearProcessedPlayers();

    const allNicknames = await DomUtils.extractPlayerNicknames();
    if (allNicknames.length > 0) {
      await this.uiManager.showLoadersForPlayers(ctx, allNicknames);
    }

    const language = detectFaceitLanguage(window.location.href);

    const detectionPromise = new Promise<{ smurfsCount: number }>(
      (resolve, reject) => {
        this.detector
          .detectSmurfsInMatch()
          .then((smurfs) => {
            this.state.detectedSmurfs = smurfs;
            this.state.detectionCompleted = true;

            this.uiManager
              .mountSmurfIndicators(ctx, smurfs, allNicknames)
              .then(() => {
                if (this.state.currentUI) {
                  this.state.currentUI.remove();
                  this.state.currentUI = null;
                }
                resolve({ smurfsCount: smurfs.length });
              })
              .catch(reject);
          })
          .catch(reject);
      }
    );

    toast.promise(detectionPromise, {
      loading: t(language, "checkingPlayers"),
      success: (data: { smurfsCount: number }) => {
        if (data.smurfsCount === 0) {
          return t(language, "noSmurfsFound");
        } else if (data.smurfsCount === 1) {
          return t(language, "oneSmurfFound");
        } else {
          if (language === "ru") {
            if (data.smurfsCount >= 2 && data.smurfsCount <= 4) {
              return `В вашей игре было обнаружено ${data.smurfsCount} ${t(
                language,
                "multipleSmurfsFound"
              )}`;
            } else {
              return `В вашей игре было обнаружено ${data.smurfsCount} ${t(
                language,
                "multipleSmurfsFoundMany"
              )}`;
            }
          } else {
            return `${data.smurfsCount} ${t(language, "multipleSmurfsFound")}`;
          }
        }
      },
      error: t(language, "smurfDetectionError"),
    });

    await detectionPromise;
  }

  async handleLocationChange(ctx: any, newUrl: URL): Promise<void> {
    const urlString = newUrl.href;

    this.cleanup(ctx);

    const isScoreboardPage = urlString.includes("/scoreboard");
    const isMatchRoomPage = matchRoomPattern.includes(urlString);

    if (isMatchRoomPage && !isScoreboardPage) {
      await this.initializeDetection(ctx);
    }
  }

  private async loadSettings(): Promise<SmurfDetectionSettings> {
    try {
      const settings = await systemSettings.getValue();
      return {
        enabled: settings.enabled,
        smurfDetection: settings.smurfDetection,
      };
    } catch (e) {
      if (
        e &&
        typeof e === "object" &&
        e !== null &&
        "message" in e &&
        typeof e.message === "string" &&
        e.message.includes("Extension context invalidated")
      ) {
        throw e;
      }
      console.error("Failed to load extension settings:", e);
      return { enabled: false, smurfDetection: false };
    }
  }

  private reset(): void {
    this.state.reset();
  }

  private cleanup(ctx: any): void {
    this.uiManager.clearExistingIndicators();

    if ((ctx as any).smurfDetectionCleanup) {
      (ctx as any).smurfDetectionCleanup();
      (ctx as any).smurfDetectionCleanup = null;
    }

    this.reset();
  }

  private forceCleanup(ctx: any): void {
    const loadingUIs = SmurfDetectionState.getInstance().loadingUIs;
    loadingUIs.forEach((ui: any, nickname: string) => {
      try {
        ui.remove();
      } catch (error) {}
    });
    loadingUIs.clear();

    this.cleanup(ctx);
  }

  private handleDetectionError(): void {
    this.state.detectionCompleted = false;
    this.state.detectedSmurfs = [];

    if (this.state.currentUI) {
      this.state.currentUI.remove();
      this.state.currentUI = null;
    }
  }
}
