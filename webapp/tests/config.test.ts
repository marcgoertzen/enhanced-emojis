import {
    DEFAULT_ENHANCED_EMOJIS_CONFIG,
    DEFAULT_ENHANCED_EMOJIS_USER_PREFERENCES,
    isPostEmojiSize,
    isReactionEmojiSize,
    normalizeEnhancedEmojisConfig,
    normalizeEnhancedEmojisUserPreferences,
    resolveEnhancedEmojisEffectiveConfig,
} from 'config';

test('normalizes missing admin flags to defaults', () => {
    expect(normalizeEnhancedEmojisConfig({})).toEqual(DEFAULT_ENHANCED_EMOJIS_CONFIG);
});

test('recognizes post and reaction size presets independently', () => {
    expect(isPostEmojiSize('large')).toBe(true);
    expect(isPostEmojiSize('medium')).toBe(false);
    expect(isReactionEmojiSize('medium')).toBe(true);
    expect(isReactionEmojiSize('extraLarge')).toBe(false);
});

test('normalizes invalid user emoji sizes to default', () => {
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
            reactionEmojiSize: 'large',
        },
    );

    expect(config).toEqual({
        enablePostEmojis: true,
        enableDeveloperMode: true,
        enableReactionEmojis: false,
        postEmojiSize: '64px',
        reactionEmojiSize: '64px',
    });
});

test.each([
    {
        adminConfig: {
            enableEnhancedEmojis: true,
            enableDeveloperMode: false,
            enableReactionEmojis: false,
        },
        expected: {
            enablePostEmojis: true,
            enableDeveloperMode: false,
            enableReactionEmojis: false,
        },
    },
    {
        adminConfig: {
            enableEnhancedEmojis: false,
            enableDeveloperMode: false,
            enableReactionEmojis: true,
        },
        expected: {
            enablePostEmojis: false,
            enableDeveloperMode: false,
            enableReactionEmojis: true,
        },
    },
    {
        adminConfig: {
            enableEnhancedEmojis: false,
            enableDeveloperMode: false,
            enableReactionEmojis: false,
        },
        expected: {
            enablePostEmojis: false,
            enableDeveloperMode: false,
            enableReactionEmojis: false,
        },
    },
    {
        adminConfig: {
            enableEnhancedEmojis: true,
            enableDeveloperMode: false,
            enableReactionEmojis: true,
        },
        expected: {
            enablePostEmojis: true,
            enableDeveloperMode: false,
            enableReactionEmojis: true,
        },
    },
])('maps independent admin feature flags', ({adminConfig, expected}) => {
    const config = resolveEnhancedEmojisEffectiveConfig(adminConfig, DEFAULT_ENHANCED_EMOJIS_USER_PREFERENCES);

    expect(config).toMatchObject(expected);
});

test('maps configured user emoji sizes to css values', () => {
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
        enablePostEmojis: true,
        enableDeveloperMode: false,
        enableReactionEmojis: false,
        postEmojiSize: '32px',
        reactionEmojiSize: '20px',
    });

    expect(resolveEnhancedEmojisEffectiveConfig(
        {
            enableEnhancedEmojis: true,
            enableDeveloperMode: false,
            enableReactionEmojis: false,
        },
        {
            postEmojiSize: 'large',
            reactionEmojiSize: 'medium',
        },
    )).toEqual({
        enablePostEmojis: true,
        enableDeveloperMode: false,
        enableReactionEmojis: false,
        postEmojiSize: '48px',
        reactionEmojiSize: '32px',
    });

    expect(resolveEnhancedEmojisEffectiveConfig(
        {
            enableEnhancedEmojis: true,
            enableDeveloperMode: false,
            enableReactionEmojis: false,
        },
        {
            postEmojiSize: 'extraLarge',
            reactionEmojiSize: 'large',
        },
    )).toEqual({
        enablePostEmojis: true,
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
        enablePostEmojis: true,
        enableDeveloperMode: false,
        enableReactionEmojis: false,
        postEmojiSize: '128px',
        reactionEmojiSize: '128px',
    });
});
