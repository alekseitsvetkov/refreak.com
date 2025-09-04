import { storage } from '#imports'

interface AppearanceSettings {
  // Removed theme setting - always dark theme
}

interface SystemSettings {
  enabled: boolean
  smurfDetection: boolean
  hideCampaigns: boolean
  grenades: boolean
  language: 'en' | 'ru'
}

interface UISettings {
  activeTab: string
}

// Define storage items
export const appearanceSettings = storage.defineItem<AppearanceSettings>('local:appearanceSettings', {
  fallback: {}
})

export const systemSettings = storage.defineItem<SystemSettings>('local:systemSettings', {
  fallback: {
    enabled: true,
    smurfDetection: true,
    hideCampaigns: false,
    grenades: true,
    language: 'en'
  }
})

export const uiSettings = storage.defineItem<UISettings>('local:uiSettings', {
  fallback: {
    activeTab: 'home'
  }
})

export type { AppearanceSettings, SystemSettings, UISettings } 