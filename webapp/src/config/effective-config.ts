import type {EnhancedEmojisConfig} from './admin-config';
import {getInlinePostEmojiSizePixels, getPostEmojiSizePixels, getReactionEmojiSizePixels} from './emoji-sizes';
import {normalizeEnhancedEmojisUserPreferences, type EnhancedEmojisUserPreferences} from './user-preferences';

export interface EnhancedEmojisEffectiveConfig {
    enablePostEmojis: boolean;
    enableReactionEmojis: boolean;
    enableDeveloperMode: boolean;
    postEmojiSize: string;
    inlinePostEmojiSize: string;
    reactionEmojiSize: string;
}

export function resolveEnhancedEmojisEffectiveConfig(
    adminConfig: EnhancedEmojisConfig,
    userPreferences: Partial<EnhancedEmojisUserPreferences> | null | undefined,
): EnhancedEmojisEffectiveConfig {
    const normalizedUserPreferences = normalizeEnhancedEmojisUserPreferences(userPreferences);
    const enablePostEmojis = adminConfig.enableEnhancedPostEmojis && normalizedUserPreferences.enableEnhancedEmojis;
    const enableReactionEmojis = adminConfig.enableEnhancedReactionEmojis && normalizedUserPreferences.enableEnhancedEmojis;
    const enableDeveloperMode = adminConfig.enableDeveloperMode && (enablePostEmojis || enableReactionEmojis);

    if (enableDeveloperMode) {
        return {
            enablePostEmojis,
            enableDeveloperMode,
            enableReactionEmojis,
            postEmojiSize: '64px',
            inlinePostEmojiSize: '32px',
            reactionEmojiSize: '64px',
        };
    }

    return {
        enablePostEmojis,
        enableDeveloperMode,
        enableReactionEmojis,
        postEmojiSize: `${getPostEmojiSizePixels(normalizedUserPreferences.postEmojiSize)}px`,
        inlinePostEmojiSize: `${getInlinePostEmojiSizePixels(normalizedUserPreferences.inlinePostEmojiSize)}px`,
        reactionEmojiSize: `${getReactionEmojiSizePixels(normalizedUserPreferences.reactionEmojiSize)}px`,
    };
}
