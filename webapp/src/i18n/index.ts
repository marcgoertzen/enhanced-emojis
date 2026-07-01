import type {PluginRegistry} from 'types/mattermost-webapp';

import germanTranslations from './de.json';
import englishTranslations from './en.json';

type SupportedLocale = 'de' | 'en';

export type EnhancedEmojisTranslationKey = keyof typeof englishTranslations;
export type EnhancedEmojisTranslations = Record<EnhancedEmojisTranslationKey, string>;

const TRANSLATIONS: Record<SupportedLocale, EnhancedEmojisTranslations> = {
    en: englishTranslations,
    de: germanTranslations,
};

export function normalizeEnhancedEmojisLocale(locale: string | null | undefined): SupportedLocale {
    const normalizedLocale = (locale ?? '').toLowerCase();

    if (normalizedLocale.startsWith('de')) {
        return 'de';
    }

    return 'en';
}

export function getEnhancedEmojisTranslations(locale: string | null | undefined): EnhancedEmojisTranslations {
    return TRANSLATIONS[normalizeEnhancedEmojisLocale(locale)];
}

export function registerEnhancedEmojisTranslations(registry: PluginRegistry): void {
    registry.registerTranslations({
        getTranslationsForLocale: (locale: string) => getEnhancedEmojisTranslations(locale),
    });
}
