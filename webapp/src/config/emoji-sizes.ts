export type PostEmojiSize = 'default' | 'large' | 'extraLarge' | 'maxSize';
export type InlinePostEmojiSize = 'default' | 'medium' | 'large' | 'extraLarge' | 'maxSize';
export type ReactionEmojiSize = 'default' | 'medium' | 'large' | 'maxSize';

const POST_EMOJI_SIZE_TO_PIXELS: Record<PostEmojiSize, number> = {
    default: 32,
    large: 48,
    extraLarge: 64,
    maxSize: 128,
};

const REACTION_EMOJI_SIZE_TO_PIXELS: Record<ReactionEmojiSize, number> = {
    default: 20,
    medium: 32,
    large: 64,
    maxSize: 128,
};

const INLINE_POST_EMOJI_SIZE_TO_PIXELS: Record<InlinePostEmojiSize, number> = {
    default: 20,
    medium: 32,
    large: 48,
    extraLarge: 64,
    maxSize: 128,
};

const VALID_POST_EMOJI_SIZES: PostEmojiSize[] = ['default', 'large', 'extraLarge', 'maxSize'];
const VALID_INLINE_POST_EMOJI_SIZES: InlinePostEmojiSize[] = ['default', 'medium', 'large', 'extraLarge', 'maxSize'];
const VALID_REACTION_EMOJI_SIZES: ReactionEmojiSize[] = ['default', 'medium', 'large', 'maxSize'];

export function isPostEmojiSize(value: unknown): value is PostEmojiSize {
    return typeof value === 'string' && VALID_POST_EMOJI_SIZES.includes(value as PostEmojiSize);
}

export function isReactionEmojiSize(value: unknown): value is ReactionEmojiSize {
    return typeof value === 'string' && VALID_REACTION_EMOJI_SIZES.includes(value as ReactionEmojiSize);
}

export function isInlinePostEmojiSize(value: unknown): value is InlinePostEmojiSize {
    return typeof value === 'string' && VALID_INLINE_POST_EMOJI_SIZES.includes(value as InlinePostEmojiSize);
}

export function getPostEmojiSizePixels(size: PostEmojiSize): number {
    return POST_EMOJI_SIZE_TO_PIXELS[size];
}

export function getInlinePostEmojiSizePixels(size: InlinePostEmojiSize): number {
    return INLINE_POST_EMOJI_SIZE_TO_PIXELS[size];
}

export function getReactionEmojiSizePixels(size: ReactionEmojiSize): number {
    return REACTION_EMOJI_SIZE_TO_PIXELS[size];
}
