export type Language = "en" | "ru";

export interface Translations {
  // Header
  appName: string;
  appDescription: string;

  // Tabs
  home: string;
  features: string;
  settings: string;

  // Home tab
  enabled: string;
  enabledDescription: string;

  // Features tab
  smurfDetection: string;
  smurfDetectionDescription: string;
  hideCampaigns: string;
  hideCampaignsDescription: string;
  grenades: string;
  grenadesDescription: string;

  // Settings tab
  additionalSettings: string;
  language: string;
  languageDescription: string;

  // Common
  loading: string;

  // Smurf detection
  smurf: string;
  playerChecking: string;
  checkingPlayers: string;
  noSmurfsFound: string;
  oneSmurfFound: string;
  multipleSmurfsFound: string;
  multipleSmurfsFoundMany: string;
  smurfDetectionError: string;

  // Grenades feature
  grenadesPlaceholder: string;
  maps: string;
  loadingMaps: string;
  noMapsAvailable: string;
  soon: string;
  instant: string;
  side: string;
  grenadeType: string;
  searchGrenades: string;
  noVideosAvailable: string;
  video: string;
  videos: string;
  t: string;
  ct: string;
  any: string;
  smokes: string;
  molotovs: string;
  flashbangs: string;
  heGrenades: string;
  list: string;
  interactive_map: string;
  view: string;
}

const translations: Record<Language, Translations> = {
  en: {
    appName: "Refreak",
    appDescription: "Enhances your experience on FACEIT",

    home: "Home",
    features: "Features",
    settings: "Settings",

    enabled: "Enabled",
    enabledDescription: "Enable or disable the extension",

    smurfDetection: "Smurf detection",
    smurfDetectionDescription:
      "Detect potential smurf accounts using player stats",
    hideCampaigns: "Hide campaign widget",
    hideCampaignsDescription:
      "Hide campaign widget from FACEIT match room page",
    grenades: "Grenades",
    grenadesDescription: "Grenade lineups",

    additionalSettings: "Additional settings will be available here",
    language: "Language",
    languageDescription:
      "Language is automatically detected based on FACEIT site",

    loading: "Loading...",

    smurf: "SMURF",
    playerChecking: "Checking player",
    checkingPlayers: "Checking players for smurfs...",
    noSmurfsFound: "No smurfs were detected in your game",
    oneSmurfFound: "1 smurf was detected in your game",
    multipleSmurfsFound: "smurfs were detected in your game",
    multipleSmurfsFoundMany: "smurfs were detected in your game",
    smurfDetectionError: "An error occurred while checking players",

    grenadesPlaceholder: "Grenades feature coming soon...",
    maps: "Maps",
    loadingMaps: "Loading maps...",
    noMapsAvailable: "No maps available",
    soon: "Soon",
    instant: "Instant",
    side: "Side",
    grenadeType: "Grenade type",
    searchGrenades: "Search grenades...",
    noVideosAvailable: "No videos available",
    video: "video",
    videos: "videos",
    t: "Terrorists",
    ct: "Counter-Terrorists",
    any: "Any",
    smokes: "Smokes",
    molotovs: "Molotovs",
    flashbangs: "Flashbangs",
    heGrenades: "HE Grenades",
    list: "List",
    interactive_map: "Map",
    view: "View",
  },
  ru: {
    appName: "Refreak",
    appDescription: "Расширение для FACEIT",

    home: "Главная",
    features: "Функции",
    settings: "Настройки",

    enabled: "Включено",
    enabledDescription: "Включить или отключить расширение",

    smurfDetection: "Обнаружение смурфов",
    smurfDetectionDescription:
      "Обнаруживать потенциальные смурф-аккаунты,\n используя статистику игроков",
    hideCampaigns: "Скрыть промо-виджет",
    hideCampaignsDescription: "Скрыть промо-виджет в команте матча на FACEIT",
    grenades: "Гранаты",
    grenadesDescription: "Добавить возможность просмотра лайнапов гранат",

    additionalSettings: "Дополнительные настройки будут доступны здесь",
    language: "Язык",
    languageDescription:
      "Язык определяется автоматически на основе сайта FACEIT",

    loading: "Загрузка...",

    smurf: "СМУРФ",
    playerChecking: "Проверяем игрока",
    checkingPlayers: "Проверка игроков на смурфов...",
    noSmurfsFound: "В вашей игре не было обнаружено смурфов",
    oneSmurfFound: "В вашей игре был обнаружен 1 смурф",
    multipleSmurfsFound: "смурфа",
    multipleSmurfsFoundMany: "смурфов",
    smurfDetectionError: "Произошла ошибка при проверке игроков",

    grenadesPlaceholder: "Функция гранат скоро появится...",
    maps: "Карты",
    loadingMaps: "Загрузка карт...",
    noMapsAvailable: "Карты недоступны",
    soon: "Скоро",
    instant: "Инста",
    side: "Сторона",
    grenadeType: "Тип гранаты",
    searchGrenades: "Поиск гранат...",
    noVideosAvailable: "Видео недоступны",
    video: "видео",
    videos: "видео",
    t: "Террористы",
    ct: "Контр-террористы",
    any: "Любая",
    smokes: "Дымовые",
    molotovs: "Зажигательные",
    flashbangs: "Световые",
    heGrenades: "Осколочные",
    list: "Список",
    interactive_map: "Карта",
    view: "Вид",
  },
};

// Функция для автоматического определения языка сайта FACEIT по URL
export function detectFaceitLanguage(url: string): Language {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    // Если в пути есть /ru/, то используем русский язык
    // Примеры: https://www.faceit.com/ru/matchmaking
    //          https://www.faceit.com/ru/cs2/room/...
    if (pathname.includes("/ru/")) {
      return "ru";
    }

    // Для всех остальных языков (включая /en/, /de/, /fr/ и т.д.) используем английский
    // Примеры: https://www.faceit.com/en/matchmaking
    //          https://www.faceit.com/de/matchmaking
    //          https://www.faceit.com/matchmaking (без языкового префикса)
    return "en";
  } catch (error) {
    console.error("Error detecting FACEIT language from URL:", error);
    return "en"; // По умолчанию английский
  }
}

// Функция для получения языка по умолчанию (всегда английский)
export function getDefaultLanguage(): Language {
  return "en";
}

export function getTranslations(language: Language): Translations {
  return translations[language] || translations.en;
}

export function t(language: Language, key: keyof Translations): string {
  const trans = getTranslations(language);
  return trans[key] || key;
}
