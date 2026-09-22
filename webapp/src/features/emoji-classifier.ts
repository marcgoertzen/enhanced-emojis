export type EmojiKind = 'custom' | 'standard' | 'unknown';

const CUSTOM_EMOJI_PATH = '/api/v4/emoji/';
const STANDARD_EMOJI_PATH = '/static/emoji/';

function getEmojiAssetReference(element: Element): string {
    return `${element.getAttribute('src') ?? ''} ${element.getAttribute('style') ?? ''}`;
}

export function classifyEmojiElement(element: Element): EmojiKind {
    if (!element.classList.contains('emoticon')) {
        return 'unknown';
    }

    const assetReference = getEmojiAssetReference(element);
    if (assetReference.includes(CUSTOM_EMOJI_PATH)) {
        return 'custom';
    }

    if (assetReference.includes(STANDARD_EMOJI_PATH) || element.classList.contains('emoticon--unicode')) {
        return 'standard';
    }

    return 'unknown';
}
