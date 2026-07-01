import manifest from 'manifest';

import type {GlobalState} from '@mattermost/types/store';

import {
    isInlinePostEmojiSize,
    isPostEmojiSize,
    isReactionEmojiSize,
    type InlinePostEmojiSize,
    type PostEmojiSize,
    type ReactionEmojiSize,
} from './emoji-sizes';

export interface EnhancedEmojisUserPreferences {
    enableEnhancedEmojis: boolean;
    postEmojiSize: PostEmojiSize;
    inlinePostEmojiSize: InlinePostEmojiSize;
    reactionEmojiSize: ReactionEmojiSize;
}

export const USER_PREFERENCES_CATEGORY = `pp_${manifest.id}`;
export const USER_ENABLE_PREFERENCE_NAME = 'EnableEnhancedEmojis';
export const POST_EMOJI_SIZE_PREFERENCE_NAME = 'postEmojiSize';
export const INLINE_POST_EMOJI_SIZE_PREFERENCE_NAME = 'InlinePostEmojiSize';
export const REACTION_EMOJI_SIZE_PREFERENCE_NAME = 'reactionEmojiSize';

export const DEFAULT_ENHANCED_EMOJIS_USER_PREFERENCES: EnhancedEmojisUserPreferences = {
    enableEnhancedEmojis: false,
    postEmojiSize: 'default',
    inlinePostEmojiSize: 'default',
    reactionEmojiSize: 'default',
};

export function normalizeEnhancedEmojisUserPreferences(preferences: Partial<EnhancedEmojisUserPreferences> | null | undefined): EnhancedEmojisUserPreferences {
    const postEmojiSizeValue = preferences?.postEmojiSize;
    const inlinePostEmojiSizeValue = preferences?.inlinePostEmojiSize;
    const reactionEmojiSizeValue = preferences?.reactionEmojiSize;

    return {
        enableEnhancedEmojis: typeof preferences?.enableEnhancedEmojis === 'boolean' ? preferences.enableEnhancedEmojis : DEFAULT_ENHANCED_EMOJIS_USER_PREFERENCES.enableEnhancedEmojis,
        postEmojiSize: isPostEmojiSize(postEmojiSizeValue) ? postEmojiSizeValue : DEFAULT_ENHANCED_EMOJIS_USER_PREFERENCES.postEmojiSize,
        inlinePostEmojiSize: isInlinePostEmojiSize(inlinePostEmojiSizeValue) ? inlinePostEmojiSizeValue : DEFAULT_ENHANCED_EMOJIS_USER_PREFERENCES.inlinePostEmojiSize,
        reactionEmojiSize: isReactionEmojiSize(reactionEmojiSizeValue) ? reactionEmojiSizeValue : DEFAULT_ENHANCED_EMOJIS_USER_PREFERENCES.reactionEmojiSize,
    };
}

export function getEnhancedEmojisUserPreferences(state: GlobalState): EnhancedEmojisUserPreferences {
    const preferences = Object.values(state?.entities?.preferences?.myPreferences ?? {}).filter((preference) => preference.category === USER_PREFERENCES_CATEGORY);
    const preferencesByName = new Map(preferences.map((preference) => [preference.name, preference.value]));

    return normalizeEnhancedEmojisUserPreferences({
        enableEnhancedEmojis: preferencesByName.get(USER_ENABLE_PREFERENCE_NAME) === 'true',
        postEmojiSize: preferencesByName.get(POST_EMOJI_SIZE_PREFERENCE_NAME) as EnhancedEmojisUserPreferences['postEmojiSize'] | undefined,
        inlinePostEmojiSize: preferencesByName.get(INLINE_POST_EMOJI_SIZE_PREFERENCE_NAME) as EnhancedEmojisUserPreferences['inlinePostEmojiSize'] | undefined,
        reactionEmojiSize: preferencesByName.get(REACTION_EMOJI_SIZE_PREFERENCE_NAME) as EnhancedEmojisUserPreferences['reactionEmojiSize'] | undefined,
    });
}
