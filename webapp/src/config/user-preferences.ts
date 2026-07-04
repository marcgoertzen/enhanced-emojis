import type {GlobalState} from '@mattermost/types/store';

import {Client4} from 'mattermost-redux/client';

import {
    type InlinePostEmojiSize,
    isInlinePostEmojiSize,
    isPostEmojiSize,
    isReactionEmojiSize,
    type PostEmojiSize,
    type ReactionEmojiSize,
} from './emoji-sizes';

export interface EnhancedEmojisUserPreferences {
    enableEnhancedEmojis: boolean;
    postEmojiSize: PostEmojiSize;
    inlinePostEmojiSize: InlinePostEmojiSize;
    reactionEmojiSize: ReactionEmojiSize;
}

export interface MattermostUserPreference {
    user_id: string;
    category: string;
    name: string;
    value: string;
}

export interface EnhancedEmojisUserPreferenceDiagnostics {
    defaultsApplied: Array<keyof EnhancedEmojisUserPreferences>;
    normalizedPreferences: EnhancedEmojisUserPreferences;
    rawPreferences: MattermostUserPreference[];
}

export interface EnhancedEmojisPreferenceSavePlan {
    changedKey: (typeof ENHANCED_EMOJIS_PREFERENCE_NAMES)[number];
    previousPreferences: EnhancedEmojisUserPreferences;
    nextPreferences: EnhancedEmojisUserPreferences;
    payload: MattermostUserPreference[];
}

export const USER_PREFERENCES_CATEGORY = 'enhanced_emojis';
export const USER_ENABLE_PREFERENCE_NAME = 'enableEnhancedEmojis';
export const POST_EMOJI_SIZE_PREFERENCE_NAME = 'postEmojiSize';
export const INLINE_POST_EMOJI_SIZE_PREFERENCE_NAME = 'inlinePostEmojiSize';
export const REACTION_EMOJI_SIZE_PREFERENCE_NAME = 'reactionEmojiSize';

export const DEFAULT_ENHANCED_EMOJIS_USER_PREFERENCES: EnhancedEmojisUserPreferences = {
    enableEnhancedEmojis: false,
    postEmojiSize: 'default',
    inlinePostEmojiSize: 'default',
    reactionEmojiSize: 'default',
};

export const ENHANCED_EMOJIS_PREFERENCE_NAMES = [
    USER_ENABLE_PREFERENCE_NAME,
    POST_EMOJI_SIZE_PREFERENCE_NAME,
    INLINE_POST_EMOJI_SIZE_PREFERENCE_NAME,
    REACTION_EMOJI_SIZE_PREFERENCE_NAME,
] as const;

function toEnhancedEmojisPreferenceValues(preferences: Partial<EnhancedEmojisUserPreferences> | null | undefined): Record<(typeof ENHANCED_EMOJIS_PREFERENCE_NAMES)[number], string> {
    const normalizedPreferences = normalizeEnhancedEmojisUserPreferences(preferences);

    return {
        enableEnhancedEmojis: normalizedPreferences.enableEnhancedEmojis ? 'true' : 'false',
        postEmojiSize: normalizedPreferences.postEmojiSize,
        inlinePostEmojiSize: normalizedPreferences.inlinePostEmojiSize,
        reactionEmojiSize: normalizedPreferences.reactionEmojiSize,
    };
}

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

export function getRawEnhancedEmojisUserPreferences(state: GlobalState): MattermostUserPreference[] {
    return Object.values(state?.entities?.preferences?.myPreferences ?? {}).filter((preference): preference is MattermostUserPreference => {
        return preference.category === USER_PREFERENCES_CATEGORY;
    });
}

export function getEnhancedEmojisUserPreferenceDiagnostics(state: GlobalState): EnhancedEmojisUserPreferenceDiagnostics {
    const rawPreferences = getRawEnhancedEmojisUserPreferences(state);
    const normalizedPreferences = getEnhancedEmojisUserPreferences(state);
    const defaultsApplied: Array<keyof EnhancedEmojisUserPreferences> = [];
    const rawPreferenceNames = new Set(rawPreferences.map((preference) => preference.name));

    if (!rawPreferenceNames.has(USER_ENABLE_PREFERENCE_NAME)) {
        defaultsApplied.push('enableEnhancedEmojis');
    }

    if (!rawPreferenceNames.has(POST_EMOJI_SIZE_PREFERENCE_NAME)) {
        defaultsApplied.push('postEmojiSize');
    }

    if (!rawPreferenceNames.has(INLINE_POST_EMOJI_SIZE_PREFERENCE_NAME)) {
        defaultsApplied.push('inlinePostEmojiSize');
    }

    if (!rawPreferenceNames.has(REACTION_EMOJI_SIZE_PREFERENCE_NAME)) {
        defaultsApplied.push('reactionEmojiSize');
    }

    return {
        defaultsApplied,
        normalizedPreferences,
        rawPreferences,
    };
}

export function mergeEnhancedEmojisUserPreferenceChanges(
    currentPreferences: Partial<EnhancedEmojisUserPreferences> | null | undefined,
    changes: Partial<Record<(typeof ENHANCED_EMOJIS_PREFERENCE_NAMES)[number], string>>,
): EnhancedEmojisUserPreferences {
    const currentValues = toEnhancedEmojisPreferenceValues(currentPreferences);

    return normalizeEnhancedEmojisUserPreferences({
        enableEnhancedEmojis: (changes.enableEnhancedEmojis ?? currentValues.enableEnhancedEmojis) === 'true',
        postEmojiSize: (changes.postEmojiSize as EnhancedEmojisUserPreferences['postEmojiSize'] | undefined) ?? (currentValues.postEmojiSize as EnhancedEmojisUserPreferences['postEmojiSize']),
        inlinePostEmojiSize: (changes.inlinePostEmojiSize as EnhancedEmojisUserPreferences['inlinePostEmojiSize'] | undefined) ?? (currentValues.inlinePostEmojiSize as EnhancedEmojisUserPreferences['inlinePostEmojiSize']),
        reactionEmojiSize: (changes.reactionEmojiSize as EnhancedEmojisUserPreferences['reactionEmojiSize'] | undefined) ?? (currentValues.reactionEmojiSize as EnhancedEmojisUserPreferences['reactionEmojiSize']),
    });
}

export function createEnhancedEmojisPreferenceSavePayload(
    userId: string,
    preferences: Partial<EnhancedEmojisUserPreferences> | null | undefined,
): MattermostUserPreference[] {
    const preferenceValues = toEnhancedEmojisPreferenceValues(preferences);

    return ENHANCED_EMOJIS_PREFERENCE_NAMES.map((name) => ({
        user_id: userId,
        category: USER_PREFERENCES_CATEGORY,
        name,
        value: preferenceValues[name],
    }));
}

export function buildEnhancedEmojisPreferenceSavePayload(
    userId: string,
    currentPreferences: Partial<EnhancedEmojisUserPreferences> | null | undefined,
    changedPreference: {
        name: (typeof ENHANCED_EMOJIS_PREFERENCE_NAMES)[number];
        value: string;
    },
): EnhancedEmojisPreferenceSavePlan {
    const previousPreferences = normalizeEnhancedEmojisUserPreferences(currentPreferences);
    const nextPreferences = mergeEnhancedEmojisUserPreferenceChanges(previousPreferences, {
        [changedPreference.name]: changedPreference.value,
    });

    return {
        changedKey: changedPreference.name,
        previousPreferences,
        nextPreferences,
        payload: createEnhancedEmojisPreferenceSavePayload(userId, nextPreferences),
    };
}

export async function saveEnhancedEmojisUserPreferences(
    userId: string,
    preferences: MattermostUserPreference[],
): Promise<void> {
    await Client4.savePreferences(userId, preferences);
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
