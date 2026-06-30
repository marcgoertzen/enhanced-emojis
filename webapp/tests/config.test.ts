import {
    DEFAULT_ENHANCED_EMOJIS_CONFIG,
    DEFAULT_ENHANCED_EMOJIS_USER_PREFERENCES,
    normalizeEnhancedEmojisConfig,
    normalizeEnhancedEmojisUserPreferences,
    resolveEnhancedEmojisEffectiveConfig,
} from 'config';

test('normalizes invalid admin emoji size to default', () => {
    const config = normalizeEnhancedEmojisConfig({
        enableEnhancedEmojis: true,
        enableDeveloperMode: false,
        enableReactionEmojis: true,
        emojiSize: 'unknown' as never,
        reactionEmojiSize: 'unknown' as never,
    });

    expect(config.emojiSize).toBe(DEFAULT_ENHANCED_EMOJIS_CONFIG.emojiSize);
    expect(config.reactionEmojiSize).toBe(DEFAULT_ENHANCED_EMOJIS_CONFIG.reactionEmojiSize);
});

test('normalizes invalid user emoji size to default', () => {
    const preferences = normalizeEnhancedEmojisUserPreferences({
        postEmojiSize: 'unknown' as never,
        reactionEmojiSize: 'unknown' as never,
    });

    expect(preferences).toEqual(DEFAULT_ENHANCED_EMOJIS_USER_PREFERENCES);
});

test('developer mode overrides configured user emoji sizes', () => {
    const config = resolveEnhancedEmojisEffectiveConfig(
        {
            enableEnhancedEmojis: true,
            enableDeveloperMode: true,
            enableReactionEmojis: false,
            emojiSize: 'small',
            reactionEmojiSize: 'maxSize',
        },
        {
            postEmojiSize: 'large',
            reactionEmojiSize: 'extraLarge',
        },
    );

    expect(config).toEqual({
        enableEnhancedEmojis: true,
        enableDeveloperMode: true,
        enableReactionEmojis: false,
        postEmojiSize: '64px',
        reactionEmojiSize: '64px',
    });
});

test('user defaults remain default even when admin sizes differ', () => {
    const config = resolveEnhancedEmojisEffectiveConfig(
        {
            enableEnhancedEmojis: true,
            enableDeveloperMode: false,
            enableReactionEmojis: true,
            emojiSize: 'maxSize',
            reactionEmojiSize: 'large',
        },
        DEFAULT_ENHANCED_EMOJIS_USER_PREFERENCES,
    );

    expect(config).toEqual({
        enableEnhancedEmojis: true,
        enableDeveloperMode: false,
        enableReactionEmojis: true,
        postEmojiSize: '32px',
        reactionEmojiSize: '32px',
    });
});

test('maps configured user emoji sizes to css values', () => {
    expect(resolveEnhancedEmojisEffectiveConfig(
        {
            enableEnhancedEmojis: true,
            enableDeveloperMode: false,
            enableReactionEmojis: false,
            emojiSize: 'small',
            reactionEmojiSize: 'small',
        },
        {
            postEmojiSize: 'small',
            reactionEmojiSize: 'small',
        },
    )).toEqual({
        enableEnhancedEmojis: true,
        enableDeveloperMode: false,
        enableReactionEmojis: false,
        postEmojiSize: '24px',
        reactionEmojiSize: '24px',
    });

    expect(resolveEnhancedEmojisEffectiveConfig(
        {
            enableEnhancedEmojis: true,
            enableDeveloperMode: false,
            enableReactionEmojis: false,
            emojiSize: 'default',
            reactionEmojiSize: 'default',
        },
        {
            postEmojiSize: 'default',
            reactionEmojiSize: 'default',
        },
    )).toEqual({
        enableEnhancedEmojis: true,
        enableDeveloperMode: false,
        enableReactionEmojis: false,
        postEmojiSize: '32px',
        reactionEmojiSize: '32px',
    });

    expect(resolveEnhancedEmojisEffectiveConfig(
        {
            enableEnhancedEmojis: true,
            enableDeveloperMode: false,
            enableReactionEmojis: false,
            emojiSize: 'large',
            reactionEmojiSize: 'large',
        },
        {
            postEmojiSize: 'large',
            reactionEmojiSize: 'large',
        },
    )).toEqual({
        enableEnhancedEmojis: true,
        enableDeveloperMode: false,
        enableReactionEmojis: false,
        postEmojiSize: '48px',
        reactionEmojiSize: '48px',
    });

    expect(resolveEnhancedEmojisEffectiveConfig(
        {
            enableEnhancedEmojis: true,
            enableDeveloperMode: false,
            enableReactionEmojis: false,
            emojiSize: 'extraLarge',
            reactionEmojiSize: 'extraLarge',
        },
        {
            postEmojiSize: 'extraLarge',
            reactionEmojiSize: 'extraLarge',
        },
    )).toEqual({
        enableEnhancedEmojis: true,
        enableDeveloperMode: false,
        enableReactionEmojis: false,
        postEmojiSize: '64px',
        reactionEmojiSize: '64px',
    });

    expect(resolveEnhancedEmojisEffectiveConfig(
        {
            enableEnhancedEmojis: true,
            enableDeveloperMode: false,
            enableReactionEmojis: false,
            emojiSize: 'maxSize',
            reactionEmojiSize: 'maxSize',
        },
        {
            postEmojiSize: 'maxSize',
            reactionEmojiSize: 'maxSize',
        },
    )).toEqual({
        enableEnhancedEmojis: true,
        enableDeveloperMode: false,
        enableReactionEmojis: false,
        postEmojiSize: '128px',
        reactionEmojiSize: '128px',
    });
});
