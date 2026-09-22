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
    standardPostEmojiSize: PostEmojiSize;
    standardInlinePostEmojiSize: InlinePostEmojiSize;
    standardReactionEmojiSize: ReactionEmojiSize;
    customPostEmojiSize: PostEmojiSize;
    customInlinePostEmojiSize: InlinePostEmojiSize;
    customReactionEmojiSize: ReactionEmojiSize;
}

interface LegacySharedEmojiPreferences {
    postEmojiSize: PostEmojiSize;
    inlinePostEmojiSize: InlinePostEmojiSize;
    reactionEmojiSize: ReactionEmojiSize;
}

interface ObsoletePreferenceValues {

    /** Stored by the previous standard-emoji toggle; intentionally ignored after the split. */
    enableStandardEmojis: boolean;
}

export type EnhancedEmojisUserPreferenceInput = Partial<EnhancedEmojisUserPreferences> & Partial<LegacySharedEmojiPreferences> & Partial<ObsoletePreferenceValues>;

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

// Persisted as enableEnhancedEmojis for compatibility; internally this is the shared master switch.
export const MASTER_ENABLE_PREFERENCE_NAME = 'enableEnhancedEmojis';

export const STANDARD_POST_EMOJI_SIZE_PREFERENCE_NAME = 'standardPostEmojiSize';
export const STANDARD_INLINE_POST_EMOJI_SIZE_PREFERENCE_NAME = 'standardInlinePostEmojiSize';
export const STANDARD_REACTION_EMOJI_SIZE_PREFERENCE_NAME = 'standardReactionEmojiSize';
export const CUSTOM_POST_EMOJI_SIZE_PREFERENCE_NAME = 'customPostEmojiSize';
export const CUSTOM_INLINE_POST_EMOJI_SIZE_PREFERENCE_NAME = 'customInlinePostEmojiSize';
export const CUSTOM_REACTION_EMOJI_SIZE_PREFERENCE_NAME = 'customReactionEmojiSize';

// Legacy shared keys remain readable for migration and are intentionally not removed from Mattermost.
export const LEGACY_POST_EMOJI_SIZE_PREFERENCE_NAME = 'postEmojiSize';
export const LEGACY_INLINE_POST_EMOJI_SIZE_PREFERENCE_NAME = 'inlinePostEmojiSize';
export const LEGACY_REACTION_EMOJI_SIZE_PREFERENCE_NAME = 'reactionEmojiSize';

export const DEFAULT_ENHANCED_EMOJIS_USER_PREFERENCES: EnhancedEmojisUserPreferences = {
    enableEnhancedEmojis: false,
    standardPostEmojiSize: 'default',
    standardInlinePostEmojiSize: 'default',
    standardReactionEmojiSize: 'default',
    customPostEmojiSize: 'default',
    customInlinePostEmojiSize: 'default',
    customReactionEmojiSize: 'default',
};

export const ENHANCED_EMOJIS_PREFERENCE_NAMES = [
    MASTER_ENABLE_PREFERENCE_NAME,
    STANDARD_POST_EMOJI_SIZE_PREFERENCE_NAME,
    STANDARD_INLINE_POST_EMOJI_SIZE_PREFERENCE_NAME,
    STANDARD_REACTION_EMOJI_SIZE_PREFERENCE_NAME,
    CUSTOM_POST_EMOJI_SIZE_PREFERENCE_NAME,
    CUSTOM_INLINE_POST_EMOJI_SIZE_PREFERENCE_NAME,
    CUSTOM_REACTION_EMOJI_SIZE_PREFERENCE_NAME,
] as const;

function toEnhancedEmojisPreferenceValues(preferences: EnhancedEmojisUserPreferenceInput | null | undefined): Record<(typeof ENHANCED_EMOJIS_PREFERENCE_NAMES)[number], string> {
    const normalizedPreferences = normalizeEnhancedEmojisUserPreferences(preferences);

    return {
        enableEnhancedEmojis: normalizedPreferences.enableEnhancedEmojis ? 'true' : 'false',
        standardPostEmojiSize: normalizedPreferences.standardPostEmojiSize,
        standardInlinePostEmojiSize: normalizedPreferences.standardInlinePostEmojiSize,
        standardReactionEmojiSize: normalizedPreferences.standardReactionEmojiSize,
        customPostEmojiSize: normalizedPreferences.customPostEmojiSize,
        customInlinePostEmojiSize: normalizedPreferences.customInlinePostEmojiSize,
        customReactionEmojiSize: normalizedPreferences.customReactionEmojiSize,
    };
}

export function normalizeEnhancedEmojisUserPreferences(preferences: EnhancedEmojisUserPreferenceInput | null | undefined): EnhancedEmojisUserPreferences {
    const standardPostEmojiSize = preferences?.standardPostEmojiSize ?? preferences?.postEmojiSize;
    const standardInlinePostEmojiSize = preferences?.standardInlinePostEmojiSize ?? preferences?.inlinePostEmojiSize;
    const standardReactionEmojiSize = preferences?.standardReactionEmojiSize ?? preferences?.reactionEmojiSize;
    const customPostEmojiSize = preferences?.customPostEmojiSize ?? preferences?.postEmojiSize;
    const customInlinePostEmojiSize = preferences?.customInlinePostEmojiSize ?? preferences?.inlinePostEmojiSize;
    const customReactionEmojiSize = preferences?.customReactionEmojiSize ?? preferences?.reactionEmojiSize;

    return {
        enableEnhancedEmojis: typeof preferences?.enableEnhancedEmojis === 'boolean' ? preferences.enableEnhancedEmojis : DEFAULT_ENHANCED_EMOJIS_USER_PREFERENCES.enableEnhancedEmojis,
        standardPostEmojiSize: isPostEmojiSize(standardPostEmojiSize) ? standardPostEmojiSize : DEFAULT_ENHANCED_EMOJIS_USER_PREFERENCES.standardPostEmojiSize,
        standardInlinePostEmojiSize: isInlinePostEmojiSize(standardInlinePostEmojiSize) ? standardInlinePostEmojiSize : DEFAULT_ENHANCED_EMOJIS_USER_PREFERENCES.standardInlinePostEmojiSize,
        standardReactionEmojiSize: isReactionEmojiSize(standardReactionEmojiSize) ? standardReactionEmojiSize : DEFAULT_ENHANCED_EMOJIS_USER_PREFERENCES.standardReactionEmojiSize,
        customPostEmojiSize: isPostEmojiSize(customPostEmojiSize) ? customPostEmojiSize : DEFAULT_ENHANCED_EMOJIS_USER_PREFERENCES.customPostEmojiSize,
        customInlinePostEmojiSize: isInlinePostEmojiSize(customInlinePostEmojiSize) ? customInlinePostEmojiSize : DEFAULT_ENHANCED_EMOJIS_USER_PREFERENCES.customInlinePostEmojiSize,
        customReactionEmojiSize: isReactionEmojiSize(customReactionEmojiSize) ? customReactionEmojiSize : DEFAULT_ENHANCED_EMOJIS_USER_PREFERENCES.customReactionEmojiSize,
    };
}

export function getRawEnhancedEmojisUserPreferences(state: GlobalState): MattermostUserPreference[] {
    return Object.values(state?.entities?.preferences?.myPreferences ?? {}).filter((preference): preference is MattermostUserPreference => preference.category === USER_PREFERENCES_CATEGORY);
}

export function getEnhancedEmojisUserPreferenceDiagnostics(state: GlobalState): EnhancedEmojisUserPreferenceDiagnostics {
    const rawPreferences = getRawEnhancedEmojisUserPreferences(state);
    const normalizedPreferences = getEnhancedEmojisUserPreferences(state);
    const defaultsApplied: Array<keyof EnhancedEmojisUserPreferences> = [];
    const rawPreferenceNames = new Set(rawPreferences.map((preference) => preference.name));
    const hasPreference = (name: string, legacyName?: string): boolean => rawPreferenceNames.has(name) || (legacyName !== undefined && rawPreferenceNames.has(legacyName));

    if (!rawPreferenceNames.has(MASTER_ENABLE_PREFERENCE_NAME)) {
        defaultsApplied.push('enableEnhancedEmojis');
    }
    if (!hasPreference(STANDARD_POST_EMOJI_SIZE_PREFERENCE_NAME, LEGACY_POST_EMOJI_SIZE_PREFERENCE_NAME)) {
        defaultsApplied.push('standardPostEmojiSize');
    }
    if (!hasPreference(STANDARD_INLINE_POST_EMOJI_SIZE_PREFERENCE_NAME, LEGACY_INLINE_POST_EMOJI_SIZE_PREFERENCE_NAME)) {
        defaultsApplied.push('standardInlinePostEmojiSize');
    }
    if (!hasPreference(STANDARD_REACTION_EMOJI_SIZE_PREFERENCE_NAME, LEGACY_REACTION_EMOJI_SIZE_PREFERENCE_NAME)) {
        defaultsApplied.push('standardReactionEmojiSize');
    }
    if (!hasPreference(CUSTOM_POST_EMOJI_SIZE_PREFERENCE_NAME, LEGACY_POST_EMOJI_SIZE_PREFERENCE_NAME)) {
        defaultsApplied.push('customPostEmojiSize');
    }
    if (!hasPreference(CUSTOM_INLINE_POST_EMOJI_SIZE_PREFERENCE_NAME, LEGACY_INLINE_POST_EMOJI_SIZE_PREFERENCE_NAME)) {
        defaultsApplied.push('customInlinePostEmojiSize');
    }
    if (!hasPreference(CUSTOM_REACTION_EMOJI_SIZE_PREFERENCE_NAME, LEGACY_REACTION_EMOJI_SIZE_PREFERENCE_NAME)) {
        defaultsApplied.push('customReactionEmojiSize');
    }

    return {defaultsApplied, normalizedPreferences, rawPreferences};
}

export function mergeEnhancedEmojisUserPreferenceChanges(
    currentPreferences: EnhancedEmojisUserPreferenceInput | null | undefined,
    changes: Partial<Record<(typeof ENHANCED_EMOJIS_PREFERENCE_NAMES)[number], string>>,
): EnhancedEmojisUserPreferences {
    const currentValues = toEnhancedEmojisPreferenceValues(currentPreferences);

    return normalizeEnhancedEmojisUserPreferences({
        enableEnhancedEmojis: (changes.enableEnhancedEmojis ?? currentValues.enableEnhancedEmojis) === 'true',
        standardPostEmojiSize: (changes.standardPostEmojiSize as PostEmojiSize | undefined) ?? currentValues.standardPostEmojiSize as PostEmojiSize,
        standardInlinePostEmojiSize: (changes.standardInlinePostEmojiSize as InlinePostEmojiSize | undefined) ?? currentValues.standardInlinePostEmojiSize as InlinePostEmojiSize,
        standardReactionEmojiSize: (changes.standardReactionEmojiSize as ReactionEmojiSize | undefined) ?? currentValues.standardReactionEmojiSize as ReactionEmojiSize,
        customPostEmojiSize: (changes.customPostEmojiSize as PostEmojiSize | undefined) ?? currentValues.customPostEmojiSize as PostEmojiSize,
        customInlinePostEmojiSize: (changes.customInlinePostEmojiSize as InlinePostEmojiSize | undefined) ?? currentValues.customInlinePostEmojiSize as InlinePostEmojiSize,
        customReactionEmojiSize: (changes.customReactionEmojiSize as ReactionEmojiSize | undefined) ?? currentValues.customReactionEmojiSize as ReactionEmojiSize,
    });
}

export function createEnhancedEmojisPreferenceSavePayload(userId: string, preferences: EnhancedEmojisUserPreferenceInput | null | undefined): MattermostUserPreference[] {
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
    currentPreferences: EnhancedEmojisUserPreferenceInput | null | undefined,
    changedPreference: {name: (typeof ENHANCED_EMOJIS_PREFERENCE_NAMES)[number]; value: string},
): EnhancedEmojisPreferenceSavePlan {
    const previousPreferences = normalizeEnhancedEmojisUserPreferences(currentPreferences);
    const nextPreferences = mergeEnhancedEmojisUserPreferenceChanges(previousPreferences, {[changedPreference.name]: changedPreference.value});

    return {changedKey: changedPreference.name, previousPreferences, nextPreferences, payload: createEnhancedEmojisPreferenceSavePayload(userId, nextPreferences)};
}

export async function saveEnhancedEmojisUserPreferences(userId: string, preferences: MattermostUserPreference[]): Promise<void> {
    await Client4.savePreferences(userId, preferences);
}

export function getEnhancedEmojisUserPreferences(state: GlobalState): EnhancedEmojisUserPreferences {
    const preferences = Object.values(state?.entities?.preferences?.myPreferences ?? {}).filter((preference) => preference.category === USER_PREFERENCES_CATEGORY);
    const preferencesByName = new Map(preferences.map((preference) => [preference.name, preference.value]));

    return normalizeEnhancedEmojisUserPreferences({
        enableEnhancedEmojis: preferencesByName.get(MASTER_ENABLE_PREFERENCE_NAME) === 'true',
        standardPostEmojiSize: preferencesByName.get(STANDARD_POST_EMOJI_SIZE_PREFERENCE_NAME) as PostEmojiSize | undefined,
        standardInlinePostEmojiSize: preferencesByName.get(STANDARD_INLINE_POST_EMOJI_SIZE_PREFERENCE_NAME) as InlinePostEmojiSize | undefined,
        standardReactionEmojiSize: preferencesByName.get(STANDARD_REACTION_EMOJI_SIZE_PREFERENCE_NAME) as ReactionEmojiSize | undefined,
        customPostEmojiSize: preferencesByName.get(CUSTOM_POST_EMOJI_SIZE_PREFERENCE_NAME) as PostEmojiSize | undefined,
        customInlinePostEmojiSize: preferencesByName.get(CUSTOM_INLINE_POST_EMOJI_SIZE_PREFERENCE_NAME) as InlinePostEmojiSize | undefined,
        customReactionEmojiSize: preferencesByName.get(CUSTOM_REACTION_EMOJI_SIZE_PREFERENCE_NAME) as ReactionEmojiSize | undefined,
        postEmojiSize: preferencesByName.get(LEGACY_POST_EMOJI_SIZE_PREFERENCE_NAME) as PostEmojiSize | undefined,
        inlinePostEmojiSize: preferencesByName.get(LEGACY_INLINE_POST_EMOJI_SIZE_PREFERENCE_NAME) as InlinePostEmojiSize | undefined,
        reactionEmojiSize: preferencesByName.get(LEGACY_REACTION_EMOJI_SIZE_PREFERENCE_NAME) as ReactionEmojiSize | undefined,
    });
}
