import type {EnhancedEmojisConfig} from './admin-config';
import {getInlinePostEmojiSizePixels, getPostEmojiSizePixels, getReactionEmojiSizePixels} from './emoji-sizes';
import {normalizeEnhancedEmojisUserPreferences, type EnhancedEmojisUserPreferenceInput} from './user-preferences';

export interface EnhancedEmojisEffectiveConfig {
    enableCustomPostEmojis: boolean;
    enableCustomReactionEmojis: boolean;
    enableStandardPostEmojis: boolean;
    enableStandardReactionEmojis: boolean;
    enableDeveloperMode: boolean;
    customPostEmojiSize: string;
    customInlinePostEmojiSize: string;
    customReactionEmojiSize: string;
    standardPostEmojiSize: string;
    standardInlinePostEmojiSize: string;
    standardReactionEmojiSize: string;
}

export function resolveEnhancedEmojisEffectiveConfig(
    adminConfig: EnhancedEmojisConfig,
    userPreferences: EnhancedEmojisUserPreferenceInput | null | undefined,
): EnhancedEmojisEffectiveConfig {
    const normalizedUserPreferences = normalizeEnhancedEmojisUserPreferences(userPreferences);
    const enableCustomPostEmojis = adminConfig.enableEnhancedPostEmojis && normalizedUserPreferences.enableEnhancedEmojis;
    const enableCustomReactionEmojis = adminConfig.enableEnhancedReactionEmojis && normalizedUserPreferences.enableEnhancedEmojis;
    const enableStandardPostEmojis = enableCustomPostEmojis;
    const enableStandardReactionEmojis = enableCustomReactionEmojis;
    const enableDeveloperMode = adminConfig.enableDeveloperMode && (enableCustomPostEmojis || enableCustomReactionEmojis);

    if (enableDeveloperMode) {
        return {
            enableCustomPostEmojis,
            enableDeveloperMode,
            enableCustomReactionEmojis,
            enableStandardPostEmojis,
            enableStandardReactionEmojis,
            customPostEmojiSize: '64px',
            customInlinePostEmojiSize: '32px',
            customReactionEmojiSize: '64px',
            standardPostEmojiSize: '64px',
            standardInlinePostEmojiSize: '32px',
            standardReactionEmojiSize: '64px',
        };
    }

    return {
        enableCustomPostEmojis,
        enableDeveloperMode,
        enableCustomReactionEmojis,
        enableStandardPostEmojis,
        enableStandardReactionEmojis,
        customPostEmojiSize: `${getPostEmojiSizePixels(normalizedUserPreferences.customPostEmojiSize)}px`,
        customInlinePostEmojiSize: `${getInlinePostEmojiSizePixels(normalizedUserPreferences.customInlinePostEmojiSize)}px`,
        customReactionEmojiSize: `${getReactionEmojiSizePixels(normalizedUserPreferences.customReactionEmojiSize)}px`,
        standardPostEmojiSize: `${getPostEmojiSizePixels(normalizedUserPreferences.standardPostEmojiSize)}px`,
        standardInlinePostEmojiSize: `${getInlinePostEmojiSizePixels(normalizedUserPreferences.standardInlinePostEmojiSize)}px`,
        standardReactionEmojiSize: `${getReactionEmojiSizePixels(normalizedUserPreferences.standardReactionEmojiSize)}px`,
    };
}
