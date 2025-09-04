import type { SmurfData } from "./types";

export class SmurfDetectionState {
  private static instance: SmurfDetectionState;
  private _currentUI: any = null;
  private _detectionCompleted = false;
  private _detectedSmurfs: SmurfData[] = [];
  private _loadingUIs = new Map<string, any>();

  static getInstance(): SmurfDetectionState {
    if (!SmurfDetectionState.instance) {
      SmurfDetectionState.instance = new SmurfDetectionState();
    }
    return SmurfDetectionState.instance;
  }

  get currentUI() {
    return this._currentUI;
  }
  set currentUI(value: any) {
    this._currentUI = value;
  }

  get detectionCompleted() {
    return this._detectionCompleted;
  }
  set detectionCompleted(value: boolean) {
    this._detectionCompleted = value;
  }

  get detectedSmurfs() {
    return this._detectedSmurfs;
  }
  set detectedSmurfs(value: SmurfData[]) {
    this._detectedSmurfs = value;
  }

  get loadingUIs() {
    return this._loadingUIs;
  }

  reset(): void {
    this._detectionCompleted = false;
    this._detectedSmurfs = [];
    this._loadingUIs.clear();
    if (this._currentUI) {
      this._currentUI.remove();
      this._currentUI = null;
    }
  }
}
