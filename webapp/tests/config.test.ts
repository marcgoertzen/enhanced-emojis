import {
    DEFAULT_ENHANCED_EMOJIS_CONFIG,
    DEFAULT_ENHANCED_EMOJIS_USER_PREFERENCES,
    isInlinePostEmojiSize,
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
    expect(isInlinePostEmojiSize('medium')).toBe(true);
    expect(isInlinePostEmojiSize('tiny')).toBe(false);
    expect(isReactionEmojiSize('medium')).toBe(true);
    expect(isReactionEmojiSize('extraLarge')).toBe(false);
});

test('legacy shared sizes initialize both custom and standard preferences', () => {
    expect(normalizeEnhancedEmojisUserPreferences({
        enableEnhancedEmojis: true,
        postEmojiSize: 'large',
        inlinePostEmojiSize: 'medium',
        reactionEmojiSize: 'maxSize',
    })).toEqual({
        enableEnhancedEmojis: true,
        standardPostEmojiSize: 'large',
        standardInlinePostEmojiSize: 'medium',
        standardReactionEmojiSize: 'maxSize',
        customPostEmojiSize: 'large',
        customInlinePostEmojiSize: 'medium',
        customReactionEmojiSize: 'maxSize',
    });
});

test('new values take precedence over legacy shared values', () => {
    expect(normalizeEnhancedEmojisUserPreferences({
        postEmojiSize: 'large',
        customPostEmojiSize: 'maxSize',
        standardPostEmojiSize: 'medium' as never,
    }).customPostEmojiSize).toBe('maxSize');
    expect(normalizeEnhancedEmojisUserPreferences({
        postEmojiSize: 'large',
        customPostEmojiSize: 'maxSize',
        standardPostEmojiSize: 'default',
    }).standardPostEmojiSize).toBe('default');
});

test('missing and invalid sizes use explicit defaults', () => {
    expect(normalizeEnhancedEmojisUserPreferences({
        enableEnhancedEmojis: 'unknown' as never,
        customPostEmojiSize: 'unknown' as never,
        standardInlinePostEmojiSize: 'unknown' as never,
    })).toMatchObject({
        ...DEFAULT_ENHANCED_EMOJIS_USER_PREFERENCES,
        customPostEmojiSize: 'default',
        standardInlinePostEmojiSize: 'default',
    });
});

test('developer mode overrides all custom and standard emoji sizes', () => {
    expect(resolveEnhancedEmojisEffectiveConfig(
        {enableEnhancedPostEmojis: true, enableEnhancedReactionEmojis: true, enableDeveloperMode: true},
        {enableEnhancedEmojis: true, customPostEmojiSize: 'large', standardPostEmojiSize: 'maxSize'},
    )).toMatchObject({
        customPostEmojiSize: '64px',
        customInlinePostEmojiSize: '32px',
        customReactionEmojiSize: '64px',
        standardPostEmojiSize: '64px',
        standardInlinePostEmojiSize: '32px',
        standardReactionEmojiSize: '64px',
    });
});

test('the master switch enables both emoji types under the admin feature gates', () => {
    expect(resolveEnhancedEmojisEffectiveConfig(
        {enableEnhancedPostEmojis: true, enableEnhancedReactionEmojis: true, enableDeveloperMode: false},
        {enableEnhancedEmojis: true},
    )).toMatchObject({
        enableCustomPostEmojis: true,
        enableCustomReactionEmojis: true,
        enableStandardPostEmojis: true,
        enableStandardReactionEmojis: true,
    });
});

test('admin gates apply independently to both emoji types', () => {
    expect(resolveEnhancedEmojisEffectiveConfig(
        {enableEnhancedPostEmojis: false, enableEnhancedReactionEmojis: true, enableDeveloperMode: false},
        {enableEnhancedEmojis: true},
    )).toMatchObject({
        enableCustomPostEmojis: false,
        enableStandardPostEmojis: false,
        enableCustomReactionEmojis: true,
        enableStandardReactionEmojis: true,
    });
});

test('effective config maps independent custom and standard sizes', () => {
    expect(resolveEnhancedEmojisEffectiveConfig(
        {enableEnhancedPostEmojis: true, enableEnhancedReactionEmojis: true, enableDeveloperMode: false},
        {
            enableEnhancedEmojis: true,
            customPostEmojiSize: 'large',
            customInlinePostEmojiSize: 'medium',
            customReactionEmojiSize: 'maxSize',
            standardPostEmojiSize: 'extraLarge',
            standardInlinePostEmojiSize: 'large',
            standardReactionEmojiSize: 'medium',
        },
    )).toMatchObject({
        customPostEmojiSize: '48px',
        customInlinePostEmojiSize: '32px',
        customReactionEmojiSize: '128px',
        standardPostEmojiSize: '64px',
        standardInlinePostEmojiSize: '48px',
        standardReactionEmojiSize: '32px',
    });
});

test('disabling the master switch preserves all six stored sizes', () => {
    const config = resolveEnhancedEmojisEffectiveConfig(
        {enableEnhancedPostEmojis: true, enableEnhancedReactionEmojis: true, enableDeveloperMode: false},
        {
            enableEnhancedEmojis: false,
            customPostEmojiSize: 'extraLarge',
            customInlinePostEmojiSize: 'large',
            customReactionEmojiSize: 'maxSize',
            standardPostEmojiSize: 'large',
            standardInlinePostEmojiSize: 'medium',
            standardReactionEmojiSize: 'default',
        },
    );

    expect(config).toMatchObject({
        enableCustomPostEmojis: false,
        enableCustomReactionEmojis: false,
        enableStandardPostEmojis: false,
        enableStandardReactionEmojis: false,
        customPostEmojiSize: '64px',
        customInlinePostEmojiSize: '48px',
        customReactionEmojiSize: '128px',
        standardPostEmojiSize: '48px',
        standardInlinePostEmojiSize: '32px',
        standardReactionEmojiSize: '20px',
    });
});
