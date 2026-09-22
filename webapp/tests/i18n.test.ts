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
        'enhanced_emojis.settings.title': 'Enhanced Emojis',
        'enhanced_emojis.settings.posts.title': 'Beitrags-Emojis',
        'enhanced_emojis.settings.posts.inline.title': 'Inline-Beitrags-Emojis',
        'enhanced_emojis.settings.posts.inline.size': 'Inline-Emoji-Größe in Beiträgen',
        'enhanced_emojis.settings.reactions.title': 'Reaktions-Emojis',
    });
});

test('includes inline post emoji size translations for English and German', () => {
    expect(getEnhancedEmojisTranslations('en')).toMatchObject({
        'enhanced_emojis.settings.posts.inline.title': 'Inline Post Emojis',
        'enhanced_emojis.settings.posts.inline.size': 'Inline Post Emoji Size',
        'enhanced_emojis.settings.posts.inline.option.default': 'Default',
    });
    expect(getEnhancedEmojisTranslations('de')).toMatchObject({
        'enhanced_emojis.settings.posts.inline.title': 'Inline-Beitrags-Emojis',
        'enhanced_emojis.settings.posts.inline.size': 'Inline-Emoji-Größe in Beiträgen',
        'enhanced_emojis.settings.posts.inline.option.default': 'Standard',
    });
});

test('includes standard and custom emoji section translations for English and German', () => {
    expect(getEnhancedEmojisTranslations('en')).toMatchObject({
        'enhanced_emojis.settings.standard.title': 'Standard Emojis',
        'enhanced_emojis.settings.custom.title': 'Custom Emojis',
        'enhanced_emojis.settings.preset.title': 'Emoji Size Preset',
        'enhanced_emojis.settings.preset.option.balanced': 'Balanced',
        'enhanced_emojis.settings.standard.post.size': 'Standard Emoji Post Size',
        'enhanced_emojis.settings.standard.inline_post.size': 'Standard Emoji Inline Post Size',
        'enhanced_emojis.settings.standard.reaction.size': 'Standard Emoji Reaction Size',
        'enhanced_emojis.settings.custom.post.size': 'Custom Emoji Post Size',
        'enhanced_emojis.settings.custom.inline_post.size': 'Custom Emoji Inline Post Size',
        'enhanced_emojis.settings.custom.reaction.size': 'Custom Emoji Reaction Size',
    });
    expect(getEnhancedEmojisTranslations('de')).toMatchObject({
        'enhanced_emojis.settings.standard.title': 'Standard-Emojis',
        'enhanced_emojis.settings.custom.title': 'Benutzerdefinierte Emojis',
        'enhanced_emojis.settings.preset.option.balanced': 'Ausgewogen',
        'enhanced_emojis.settings.standard.post.size': 'Beitragsgröße für Standard-Emojis',
        'enhanced_emojis.settings.custom.reaction.size': 'Reaktionsgröße für benutzerdefinierte Emojis',
    });
});
