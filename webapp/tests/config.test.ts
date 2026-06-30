import {
    DEFAULT_ENHANCED_EMOJIS_CONFIG,
    normalizeEnhancedEmojisConfig,
    resolveEnhancedEmojisSize,
} from 'config';

test('normalizes invalid emoji size to default', () => {
    const config = normalizeEnhancedEmojisConfig({
        enableEnhancedEmojis: true,
        enableDeveloperMode: false,
        enableReactionEmojis: true,
        emojiSize: 'unknown' as never,
    });

    expect(config.emojiSize).toBe(DEFAULT_ENHANCED_EMOJIS_CONFIG.emojiSize);
    expect(config.enableReactionEmojis).toBe(true);
    expect(resolveEnhancedEmojisSize(config)).toBe('32px');
});

test('developer mode overrides configured emoji size', () => {
    const config = normalizeEnhancedEmojisConfig({
        enableEnhancedEmojis: true,
        enableDeveloperMode: true,
        enableReactionEmojis: false,
        emojiSize: 'small',
    });

    expect(resolveEnhancedEmojisSize(config)).toBe('64px');
});

test('defaults reaction emoji flag to disabled', () => {
    const config = normalizeEnhancedEmojisConfig(null);

    expect(config.enableReactionEmojis).toBe(false);
});

test('maps configured emoji sizes to css values', () => {
    expect(resolveEnhancedEmojisSize(normalizeEnhancedEmojisConfig({
        enableEnhancedEmojis: true,
        enableDeveloperMode: false,
        enableReactionEmojis: false,
        emojiSize: 'small',
    }))).toBe('24px');

    expect(resolveEnhancedEmojisSize(normalizeEnhancedEmojisConfig({
        enableEnhancedEmojis: true,
        enableDeveloperMode: false,
        enableReactionEmojis: false,
        emojiSize: 'default',
    }))).toBe('32px');

    expect(resolveEnhancedEmojisSize(normalizeEnhancedEmojisConfig({
        enableEnhancedEmojis: true,
        enableDeveloperMode: false,
        enableReactionEmojis: false,
        emojiSize: 'large',
    }))).toBe('48px');

    expect(resolveEnhancedEmojisSize(normalizeEnhancedEmojisConfig({
        enableEnhancedEmojis: true,
        enableDeveloperMode: false,
        enableReactionEmojis: false,
        emojiSize: 'extraLarge',
    }))).toBe('64px');

    expect(resolveEnhancedEmojisSize(normalizeEnhancedEmojisConfig({
        enableEnhancedEmojis: true,
        enableDeveloperMode: false,
        enableReactionEmojis: false,
        emojiSize: 'maxSize',
    }))).toBe('128px');
});
