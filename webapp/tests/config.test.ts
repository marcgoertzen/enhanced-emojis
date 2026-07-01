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
        enableEnhancedEmojis: 'unknown' as never,
        postEmojiSize: 'unknown' as never,
        reactionEmojiSize: 'unknown' as never,
    });

    expect(preferences).toEqual(DEFAULT_ENHANCED_EMOJIS_USER_PREFERENCES);
});

test('developer mode overrides configured user emoji sizes', () => {
    const config = resolveEnhancedEmojisEffectiveConfig(
        {
            enableEnhancedPostEmojis: true,
            enableEnhancedReactionEmojis: false,
            enableDeveloperMode: true,
        },
        {
            enableEnhancedEmojis: true,
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
        name: 'admin enabled / user disabled',
        adminConfig: {
            enableEnhancedPostEmojis: true,
            enableEnhancedReactionEmojis: true,
            enableDeveloperMode: false,
        },
        userPreferences: {
            enableEnhancedEmojis: false,
            postEmojiSize: 'large' as const,
            reactionEmojiSize: 'large' as const,
        },
        expected: {
            enablePostEmojis: false,
            enableDeveloperMode: false,
            enableReactionEmojis: false,
        },
    },
    {
        name: 'post disabled / reactions enabled / user enabled',
        adminConfig: {
            enableEnhancedPostEmojis: false,
            enableEnhancedReactionEmojis: true,
            enableDeveloperMode: false,
        },
        userPreferences: {
            enableEnhancedEmojis: true,
            postEmojiSize: 'large' as const,
            reactionEmojiSize: 'large' as const,
        },
        expected: {
            enablePostEmojis: false,
            enableDeveloperMode: false,
            enableReactionEmojis: true,
        },
    },
    {
        name: 'admin disabled / user enabled',
        adminConfig: {
            enableEnhancedPostEmojis: false,
            enableEnhancedReactionEmojis: false,
            enableDeveloperMode: false,
        },
        userPreferences: {
            enableEnhancedEmojis: true,
            postEmojiSize: 'large' as const,
            reactionEmojiSize: 'large' as const,
        },
        expected: {
            enablePostEmojis: false,
            enableDeveloperMode: false,
            enableReactionEmojis: false,
        },
    },
    {
        name: 'admin enabled / user enabled',
        adminConfig: {
            enableEnhancedPostEmojis: true,
            enableEnhancedReactionEmojis: true,
            enableDeveloperMode: false,
        },
        userPreferences: {
            enableEnhancedEmojis: true,
            postEmojiSize: 'large' as const,
            reactionEmojiSize: 'large' as const,
        },
        expected: {
            enablePostEmojis: true,
            enableDeveloperMode: false,
            enableReactionEmojis: true,
        },
    },
])('maps effective feature flags for $name', ({adminConfig, expected, userPreferences}) => {
    const config = resolveEnhancedEmojisEffectiveConfig(adminConfig, userPreferences);

    expect(config).toMatchObject(expected);
});

test('maps configured user emoji sizes to css values', () => {
    expect(resolveEnhancedEmojisEffectiveConfig(
        {
            enableEnhancedPostEmojis: true,
            enableEnhancedReactionEmojis: false,
            enableDeveloperMode: false,
        },
        {
            enableEnhancedEmojis: true,
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
            enableEnhancedPostEmojis: true,
            enableEnhancedReactionEmojis: false,
            enableDeveloperMode: false,
        },
        {
            enableEnhancedEmojis: true,
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
            enableEnhancedPostEmojis: true,
            enableEnhancedReactionEmojis: false,
            enableDeveloperMode: false,
        },
        {
            enableEnhancedEmojis: true,
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
            enableEnhancedPostEmojis: true,
            enableEnhancedReactionEmojis: false,
            enableDeveloperMode: false,
        },
        {
            enableEnhancedEmojis: true,
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

test('disabling the plugin preserves stored size preferences but disables all enhancements', () => {
    const config = resolveEnhancedEmojisEffectiveConfig(
        {
            enableEnhancedPostEmojis: true,
            enableEnhancedReactionEmojis: true,
            enableDeveloperMode: false,
        },
        {
            enableEnhancedEmojis: false,
            postEmojiSize: 'extraLarge',
            reactionEmojiSize: 'maxSize',
        },
    );

    expect(config).toEqual({
        enablePostEmojis: false,
        enableDeveloperMode: false,
        enableReactionEmojis: false,
        postEmojiSize: '64px',
        reactionEmojiSize: '128px',
    });
});
