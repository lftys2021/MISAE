import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ko from './ko.json';
import en from './en.json';

const STORED_LANGUAGE_KEY = 'user-language';

const resources = {
  ko: ko,
  en: en,
};

// 앱 시작 시 기존에 저장된 언어 설정을 로드합니다.
const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      const savedLang = await AsyncStorage.getItem(STORED_LANGUAGE_KEY);
      if (savedLang) {
        return callback(savedLang);
      }
      callback('ko'); // 기본값 한국어
    } catch (error) {
      callback('ko');
    }
  },
  init: () => {},
  cacheUserLanguage: async (lng: string) => {
    try {
      await AsyncStorage.setItem(STORED_LANGUAGE_KEY, lng);
    } catch (error) {
      console.error(error);
    }
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ko',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;