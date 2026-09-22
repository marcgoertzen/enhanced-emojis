import type {EnhancedEmojisUserPreferences} from 'config';

export type EmojiSizeDraft = Pick<EnhancedEmojisUserPreferences,
'standardPostEmojiSize' |
'standardInlinePostEmojiSize' |
'standardReactionEmojiSize' |
'customPostEmojiSize' |
'customInlinePostEmojiSize' |
'customReactionEmojiSize'
>;

type DraftListener = () => void;

let persistedDraft: EmojiSizeDraft | undefined;
let currentDraft: EmojiSizeDraft | undefined;
const listeners = new Set<DraftListener>();

export function initializeEmojiSizeDraft(preferences: EnhancedEmojisUserPreferences): void {
    const nextPersisted = toEmojiSizeDraft(preferences);
    persistedDraft = nextPersisted;
    currentDraft = {...nextPersisted};
    listeners.forEach((listener) => listener());
}

export function toEmojiSizeDraft(preferences: EnhancedEmojisUserPreferences): EmojiSizeDraft {
    return {
        standardPostEmojiSize: preferences.standardPostEmojiSize,
        standardInlinePostEmojiSize: preferences.standardInlinePostEmojiSize,
        standardReactionEmojiSize: preferences.standardReactionEmojiSize,
        customPostEmojiSize: preferences.customPostEmojiSize,
        customInlinePostEmojiSize: preferences.customInlinePostEmojiSize,
        customReactionEmojiSize: preferences.customReactionEmojiSize,
    };
}

export function getEmojiSizeDraft(): EmojiSizeDraft {
    if (!currentDraft) {
        throw new Error('Emoji size draft has not been initialized');
    }

    return currentDraft;
}

export function updateEmojiSizeDraft(changes: Partial<EmojiSizeDraft>): EmojiSizeDraft {
    currentDraft = {...getEmojiSizeDraft(), ...changes};
    listeners.forEach((listener) => listener());
    return currentDraft;
}

export function commitEmojiSizeDraft(preferences: EnhancedEmojisUserPreferences | EmojiSizeDraft): void {
    const nextPersisted = 'enableEnhancedEmojis' in preferences ? toEmojiSizeDraft(preferences) : preferences;
    persistedDraft = nextPersisted;
    currentDraft = {...nextPersisted};
    listeners.forEach((listener) => listener());
}

export function resetEmojiSizeDraft(): void {
    if (!persistedDraft) {
        return;
    }

    currentDraft = {...persistedDraft};
    listeners.forEach((listener) => listener());
}

export function subscribeToEmojiSizeDraft(listener: DraftListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}
