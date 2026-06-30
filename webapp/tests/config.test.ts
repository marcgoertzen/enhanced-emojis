import {
    DEFAULT_ENHANCED_EMOJIS_CONFIG,
    normalizeEnhancedEmojisConfig,
    resolveEnhancedEmojisSize,
} from 'config';

test('normalizes invalid emoji size to default', () => {
    const config = normalizeEnhancedEmojisConfig({
        enableEnhancedEmojis: true,
        enableDeveloperMode: false,
        emojiSize: 'unknown' as never,
    });

    expect(config.emojiSize).toBe(DEFAULT_ENHANCED_EMOJIS_CONFIG.emojiSize);
    expect(resolveEnhancedEmojisSize(config)).toBe('32px');
});

test('developer mode overrides configured emoji size', () => {
    const config = normalizeEnhancedEmojisConfig({
        enableEnhancedEmojis: true,
        enableDeveloperMode: true,
        emojiSize: 'small',
    });

    expect(resolveEnhancedEmojisSize(config)).toBe('64px');
});

test('maps configured emoji sizes to css values', () => {
    expect(resolveEnhancedEmojisSize(normalizeEnhancedEmojisConfig({
        enableEnhancedEmojis: true,
        enableDeveloperMode: false,
        emojiSize: 'small',
    }))).toBe('24px');

    expect(resolveEnhancedEmojisSize(normalizeEnhancedEmojisConfig({
        enableEnhancedEmojis: true,
        enableDeveloperMode: false,
        emojiSize: 'default',
    }))).toBe('32px');

    expect(resolveEnhancedEmojisSize(normalizeEnhancedEmojisConfig({
        enableEnhancedEmojis: true,
        enableDeveloperMode: false,
        emojiSize: 'large',
    }))).toBe('48px');

    expect(resolveEnhancedEmojisSize(normalizeEnhancedEmojisConfig({
        enableEnhancedEmojis: true,
        enableDeveloperMode: false,
        emojiSize: 'extraLarge',
    }))).toBe('64px');
});
