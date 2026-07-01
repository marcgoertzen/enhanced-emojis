import {getEnhancedEmojisTranslations, normalizeEnhancedEmojisLocale} from 'i18n';

test('normalizes locale codes for supported languages', () => {
    expect(normalizeEnhancedEmojisLocale('de')).toBe('de');
    expect(normalizeEnhancedEmojisLocale('de-DE')).toBe('de');
    expect(normalizeEnhancedEmojisLocale('en')).toBe('en');
    expect(normalizeEnhancedEmojisLocale('en-GB')).toBe('en');
    expect(normalizeEnhancedEmojisLocale('fr')).toBe('en');
});

test('falls back to English translations for unsupported locales', () => {
    expect(getEnhancedEmojisTranslations('fr')).toEqual(getEnhancedEmojisTranslations('en'));
});

test('returns German translations for German locales', () => {
    expect(getEnhancedEmojisTranslations('de')).toMatchObject({
        'enhanced_emojis.settings.title': 'Erweiterte Emojis',
        'enhanced_emojis.settings.posts.title': 'Beitrags-Emojis',
        'enhanced_emojis.settings.reactions.title': 'Reaktions-Emojis',
    });
});
