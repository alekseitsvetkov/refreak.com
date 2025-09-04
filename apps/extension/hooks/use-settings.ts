import { useEffect, useState } from "react";
import {
  systemSettings,
  uiSettings,
  type SystemSettings,
  type UISettings,
} from "../lib/storage";
import { getDefaultLanguage, detectFaceitLanguage } from "../lib/i18n";

// Re-export storage items for content script
export { systemSettings };

// Content script utilities
export async function runFeatureIf(
  featureName: string,
  featureFunction: () => void | Promise<void>
) {
  try {
    const settings = await systemSettings.getValue();

    // Check if the feature is enabled
    const isEnabled = settings[featureName as keyof typeof settings] === true;

    if (isEnabled) {
      await featureFunction();
    }
  } catch (error) {}
}

export async function isFeatureEnabled(featureName: string): Promise<boolean> {
  try {
    const settings = await systemSettings.getValue();
    return settings[featureName as keyof typeof settings] === true;
  } catch (error) {
    console.error(`Failed to check feature ${featureName}:`, error);
    return false;
  }
}

// Функция для автоматического обновления языка на основе URL сайта FACEIT
export async function updateLanguageFromUrl(url: string): Promise<void> {
  try {
    const detectedLanguage = detectFaceitLanguage(url);
    const currentSettings = await systemSettings.getValue();

    // Обновляем язык только если он изменился
    if (currentSettings.language !== detectedLanguage) {
      const updatedSettings = {
        ...currentSettings,
        language: detectedLanguage,
      };
      await systemSettings.setValue(updatedSettings);
    }
  } catch (error) {
    console.error("Failed to update language from URL:", error);
  }
}

// React hook for popup
export function useSettings() {
  // Инициализируем с английским языком по умолчанию
  const [system, setSystem] = useState<SystemSettings>({
    enabled: true,
    smurfDetection: true,
    hideCampaigns: false,
    grenades: true,
    language: getDefaultLanguage(),
  });
  const [ui, setUI] = useState<UISettings>({ activeTab: "home" });
  const [loading, setLoading] = useState(true);

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [systemData, uiData] = await Promise.all([
          systemSettings.getValue(),
          uiSettings.getValue(),
        ]);

        // Initialize language if not set (for existing users)
        if (!systemData.language) {
          systemData.language = getDefaultLanguage();
          await systemSettings.setValue(systemData);
        }

        setSystem(systemData);
        setUI(uiData);
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Update system settings
  const updateSystem = async (updates: Partial<SystemSettings>) => {
    const newSettings = { ...system, ...updates };

    // Сначала обновляем локальное состояние синхронно
    setSystem(newSettings);

    // Затем сохраняем в storage асинхронно
    try {
      await systemSettings.setValue(newSettings);
    } catch (error) {
      console.error("Failed to save system settings:", error);
      // В случае ошибки откатываем изменения
      setSystem(system);
    }
  };

  // Update UI settings
  const updateUI = async (updates: Partial<UISettings>) => {
    const newSettings = { ...ui, ...updates };
    setUI(newSettings);
    try {
      await uiSettings.setValue(newSettings);
    } catch (error) {
      console.error("Failed to save UI settings:", error);
    }
  };

  // Reset all settings
  const resetSettings = async () => {
    try {
      await Promise.all([
        systemSettings.removeValue(),
        uiSettings.removeValue(),
      ]);

      // Reset to default values
      const defaultSystem = {
        enabled: true,
        smurfDetection: true,
        hideCampaigns: false,
        grenades: true,
        language: getDefaultLanguage(),
      };
      const defaultUI = { activeTab: "home" };

      setSystem(defaultSystem);
      setUI(defaultUI);
    } catch (error) {
      console.error("Failed to reset settings:", error);
    }
  };

  return {
    system,
    ui,
    loading,
    updateSystem,
    updateUI,
    resetSettings,
  };
}
