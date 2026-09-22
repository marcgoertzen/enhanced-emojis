import type {InlinePostEmojiSize, PostEmojiSize, ReactionEmojiSize} from './emoji-sizes';
import type {EnhancedEmojisUserPreferences} from './user-preferences';

export type EmojiSizePreset = 'compact' | 'balanced' | 'large' | 'custom';

export interface EmojiSizePresetValues {
    standardPostEmojiSize: PostEmojiSize;
    standardInlinePostEmojiSize: InlinePostEmojiSize;
    standardReactionEmojiSize: ReactionEmojiSize;
    customPostEmojiSize: PostEmojiSize;
    customInlinePostEmojiSize: InlinePostEmojiSize;
    customReactionEmojiSize: ReactionEmojiSize;
}

const COMPACT_PRESET: EmojiSizePresetValues = {
    standardPostEmojiSize: 'default',
    standardInlinePostEmojiSize: 'default',
    standardReactionEmojiSize: 'default',
    customPostEmojiSize: 'default',
    customInlinePostEmojiSize: 'default',
    customReactionEmojiSize: 'default',
};

const BALANCED_PRESET: EmojiSizePresetValues = {
    standardPostEmojiSize: 'large',
    standardInlinePostEmojiSize: 'medium',
    standardReactionEmojiSize: 'medium',
    customPostEmojiSize: 'large',
    customInlinePostEmojiSize: 'medium',
    customReactionEmojiSize: 'medium',
};

const LARGE_PRESET: EmojiSizePresetValues = {
    standardPostEmojiSize: 'extraLarge',
    standardInlinePostEmojiSize: 'large',
    standardReactionEmojiSize: 'large',
    customPostEmojiSize: 'extraLarge',
    customInlinePostEmojiSize: 'large',
    customReactionEmojiSize: 'large',
};

const PRESET_VALUES: Readonly<Record<Exclude<EmojiSizePreset, 'custom'>, EmojiSizePresetValues>> = {
    compact: COMPACT_PRESET,
    balanced: BALANCED_PRESET,
    large: LARGE_PRESET,
};

export function getEmojiSizePresetValues(preset: Exclude<EmojiSizePreset, 'custom'>): EmojiSizePresetValues {
    return PRESET_VALUES[preset];
}

export function detectEmojiSizePreset(preferences: Pick<EnhancedEmojisUserPreferences, keyof EmojiSizePresetValues>): EmojiSizePreset {
    const presetNames = Object.keys(PRESET_VALUES) as Array<Exclude<EmojiSizePreset, 'custom'>>;
    const matchesPreset = (preset: EmojiSizePresetValues): boolean => (
        preset.standardPostEmojiSize === preferences.standardPostEmojiSize &&
        preset.standardInlinePostEmojiSize === preferences.standardInlinePostEmojiSize &&
        preset.standardReactionEmojiSize === preferences.standardReactionEmojiSize &&
        preset.customPostEmojiSize === preferences.customPostEmojiSize &&
        preset.customInlinePostEmojiSize === preferences.customInlinePostEmojiSize &&
        preset.customReactionEmojiSize === preferences.customReactionEmojiSize
    );

    return presetNames.find((presetName) => matchesPreset(PRESET_VALUES[presetName])) ?? 'custom';
}
