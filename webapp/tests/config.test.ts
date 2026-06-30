import {
    DEFAULT_ENHANCED_EMOJIS_CONFIG,
    normalizeEnhancedEmojisConfig,
    resolveEnhancedEmojisSizes,
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
    expect(config.reactionEmojiSize).toBe(DEFAULT_ENHANCED_EMOJIS_CONFIG.reactionEmojiSize);
    expect(resolveEnhancedEmojisSizes(config)).toEqual({
        emojiSize: '32px',
        reactionEmojiSize: '32px',
    });
});

test('developer mode overrides configured emoji size', () => {
    const config = normalizeEnhancedEmojisConfig({
        enableEnhancedEmojis: true,
        enableDeveloperMode: true,
        enableReactionEmojis: false,
        emojiSize: 'small',
    });

    expect(resolveEnhancedEmojisSizes(config)).toEqual({
        emojiSize: '64px',
        reactionEmojiSize: '64px',
    });
});

test('defaults reaction emoji flag to disabled', () => {
    const config = normalizeEnhancedEmojisConfig(null);

    expect(config.enableReactionEmojis).toBe(false);
    expect(config.reactionEmojiSize).toBe(DEFAULT_ENHANCED_EMOJIS_CONFIG.reactionEmojiSize);
});

test('maps configured emoji sizes to css values', () => {
    expect(resolveEnhancedEmojisSizes(normalizeEnhancedEmojisConfig({
        enableEnhancedEmojis: true,
        enableDeveloperMode: false,
        enableReactionEmojis: false,
        emojiSize: 'small',
        reactionEmojiSize: 'small',
    }))).toEqual({
        emojiSize: '24px',
        reactionEmojiSize: '24px',
    });

    expect(resolveEnhancedEmojisSizes(normalizeEnhancedEmojisConfig({
        enableEnhancedEmojis: true,
        enableDeveloperMode: false,
        enableReactionEmojis: false,
        emojiSize: 'default',
        reactionEmojiSize: 'default',
    }))).toEqual({
        emojiSize: '32px',
        reactionEmojiSize: '32px',
    });

    expect(resolveEnhancedEmojisSizes(normalizeEnhancedEmojisConfig({
        enableEnhancedEmojis: true,
        enableDeveloperMode: false,
        enableReactionEmojis: false,
        emojiSize: 'large',
        reactionEmojiSize: 'large',
    }))).toEqual({
        emojiSize: '48px',
        reactionEmojiSize: '48px',
    });

    expect(resolveEnhancedEmojisSizes(normalizeEnhancedEmojisConfig({
        enableEnhancedEmojis: true,
        enableDeveloperMode: false,
        enableReactionEmojis: false,
        emojiSize: 'extraLarge',
        reactionEmojiSize: 'extraLarge',
    }))).toEqual({
        emojiSize: '64px',
        reactionEmojiSize: '64px',
    });

    expect(resolveEnhancedEmojisSizes(normalizeEnhancedEmojisConfig({
        enableEnhancedEmojis: true,
        enableDeveloperMode: false,
        enableReactionEmojis: false,
        emojiSize: 'maxSize',
        reactionEmojiSize: 'maxSize',
    }))).toEqual({
        emojiSize: '128px',
        reactionEmojiSize: '128px',
    });
});
