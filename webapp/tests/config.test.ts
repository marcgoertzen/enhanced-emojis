import {
    DEFAULT_ENHANCED_EMOJIS_CONFIG,
    DEFAULT_ENHANCED_EMOJIS_USER_PREFERENCES,
    normalizeEnhancedEmojisConfig,
    normalizeEnhancedEmojisUserPreferences,
    resolveEnhancedEmojisEffectiveConfig,
} from 'config';

test('normalizes missing admin flags to defaults', () => {
    expect(normalizeEnhancedEmojisConfig({})).toEqual(DEFAULT_ENHANCED_EMOJIS_CONFIG);
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

test('user defaults remain default even when admin flags differ', () => {
    const config = resolveEnhancedEmojisEffectiveConfig(
        {
            enableEnhancedEmojis: true,
            enableDeveloperMode: false,
            enableReactionEmojis: true,
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
