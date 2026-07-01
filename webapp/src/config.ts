export type PostEmojiSize = 'default' | 'large' | 'extraLarge' | 'maxSize';
export type ReactionEmojiSize = 'default' | 'medium' | 'large' | 'maxSize';

export interface EnhancedEmojisConfig {
    enableEnhancedEmojis: boolean;
    enableDeveloperMode: boolean;
    enableReactionEmojis: boolean;
}

export interface EnhancedEmojisUserPreferences {
    postEmojiSize: PostEmojiSize;
    reactionEmojiSize: ReactionEmojiSize;
}

export interface EnhancedEmojisEffectiveConfig {
    enablePostEmojis: boolean;
    enableDeveloperMode: boolean;
    enableReactionEmojis: boolean;
    postEmojiSize: string;
    reactionEmojiSize: string;
}

export const DEFAULT_ENHANCED_EMOJIS_CONFIG: EnhancedEmojisConfig = {
    enableEnhancedEmojis: true,
    enableDeveloperMode: false,
    enableReactionEmojis: false,
};

export const DEFAULT_ENHANCED_EMOJIS_USER_PREFERENCES: EnhancedEmojisUserPreferences = {
    postEmojiSize: 'default',
    reactionEmojiSize: 'default',
};

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

const VALID_POST_EMOJI_SIZES: PostEmojiSize[] = ['default', 'large', 'extraLarge', 'maxSize'];
const VALID_REACTION_EMOJI_SIZES: ReactionEmojiSize[] = ['default', 'medium', 'large', 'maxSize'];

export function normalizeEnhancedEmojisConfig(config: Partial<EnhancedEmojisConfig> | null | undefined): EnhancedEmojisConfig {
    return {
        enableEnhancedEmojis: typeof config?.enableEnhancedEmojis === 'boolean' ? config.enableEnhancedEmojis : DEFAULT_ENHANCED_EMOJIS_CONFIG.enableEnhancedEmojis,
        enableDeveloperMode: typeof config?.enableDeveloperMode === 'boolean' ? config.enableDeveloperMode : DEFAULT_ENHANCED_EMOJIS_CONFIG.enableDeveloperMode,
        enableReactionEmojis: typeof config?.enableReactionEmojis === 'boolean' ? config.enableReactionEmojis : DEFAULT_ENHANCED_EMOJIS_CONFIG.enableReactionEmojis,
    };
}

export function normalizeEnhancedEmojisUserPreferences(preferences: Partial<EnhancedEmojisUserPreferences> | null | undefined): EnhancedEmojisUserPreferences {
    const postEmojiSizeValue = preferences?.postEmojiSize;
    const reactionEmojiSizeValue = preferences?.reactionEmojiSize;

    return {
        postEmojiSize: isPostEmojiSize(postEmojiSizeValue) ? postEmojiSizeValue : DEFAULT_ENHANCED_EMOJIS_USER_PREFERENCES.postEmojiSize,
        reactionEmojiSize: isReactionEmojiSize(reactionEmojiSizeValue) ? reactionEmojiSizeValue : DEFAULT_ENHANCED_EMOJIS_USER_PREFERENCES.reactionEmojiSize,
    };
}

export function resolveEnhancedEmojisEffectiveConfig(
    adminConfig: EnhancedEmojisConfig,
    userPreferences: Partial<EnhancedEmojisUserPreferences> | null | undefined,
): EnhancedEmojisEffectiveConfig {
    const normalizedUserPreferences = normalizeEnhancedEmojisUserPreferences(userPreferences);
    const enablePostEmojis = adminConfig.enableEnhancedEmojis;
    const enableReactionEmojis = adminConfig.enableReactionEmojis;

    if (adminConfig.enableDeveloperMode) {
        return {
            enablePostEmojis,
            enableDeveloperMode: adminConfig.enableDeveloperMode,
            enableReactionEmojis,
            postEmojiSize: '64px',
            reactionEmojiSize: '64px',
        };
    }

    return {
        enablePostEmojis,
        enableDeveloperMode: adminConfig.enableDeveloperMode,
        enableReactionEmojis,
        postEmojiSize: `${POST_EMOJI_SIZE_TO_PIXELS[normalizedUserPreferences.postEmojiSize]}px`,
        reactionEmojiSize: `${REACTION_EMOJI_SIZE_TO_PIXELS[normalizedUserPreferences.reactionEmojiSize]}px`,
    };
}

export function isPostEmojiSize(value: unknown): value is PostEmojiSize {
    return typeof value === 'string' && VALID_POST_EMOJI_SIZES.includes(value as PostEmojiSize);
}

export function isReactionEmojiSize(value: unknown): value is ReactionEmojiSize {
    return typeof value === 'string' && VALID_REACTION_EMOJI_SIZES.includes(value as ReactionEmojiSize);
}

export function applyEnhancedEmojisConfig(rootElement: HTMLElement, config: EnhancedEmojisEffectiveConfig): void {
    rootElement.classList.remove('enhanced-emojis-enabled');
    rootElement.classList.toggle('enhanced-emojis-posts-enabled', config.enablePostEmojis);
    rootElement.classList.toggle('enhanced-emojis-developer-mode', config.enableDeveloperMode);
    rootElement.classList.toggle('enhanced-emojis-reactions-enabled', config.enableReactionEmojis);
    rootElement.style.setProperty('--enhanced-post-emojis-size', config.postEmojiSize);
    rootElement.style.setProperty('--enhanced-reaction-emojis-size', config.reactionEmojiSize);
    applyEnhancedEmojisReactionLayoutConfig(rootElement, config.reactionEmojiSize);
}

export function clearEnhancedEmojisConfig(rootElement: HTMLElement): void {
    rootElement.classList.remove('enhanced-emojis-enabled');
    rootElement.classList.remove('enhanced-emojis-posts-enabled');
    rootElement.classList.remove('enhanced-emojis-developer-mode');
    rootElement.classList.remove('enhanced-emojis-reactions-enabled');
    rootElement.style.removeProperty('--enhanced-post-emojis-size');
    rootElement.style.removeProperty('--enhanced-reaction-emojis-size');
    rootElement.style.removeProperty('--enhanced-reaction-chip-padding-inline');
    rootElement.style.removeProperty('--enhanced-reaction-chip-padding-block');
    rootElement.style.removeProperty('--enhanced-reaction-chip-gap');
    rootElement.style.removeProperty('--enhanced-reaction-chip-min-height');
}

function applyEnhancedEmojisReactionLayoutConfig(rootElement: HTMLElement, reactionEmojiSize: string): void {
    const reactionSize = Number.parseInt(reactionEmojiSize, 10);
    const reactionChipPaddingInline = Math.max(4, Math.min(16, Math.round(reactionSize * 0.2)));
    const reactionChipPaddingBlock = Math.max(2, Math.min(10, Math.round(reactionSize * 0.1)));
    const reactionChipGap = Math.max(2, Math.min(8, Math.round(reactionSize * 0.12)));
    const reactionChipMinHeight = Math.max(reactionSize + (reactionChipPaddingBlock * 2), 24);

    rootElement.style.setProperty('--enhanced-reaction-chip-padding-inline', `${reactionChipPaddingInline}px`);
    rootElement.style.setProperty('--enhanced-reaction-chip-padding-block', `${reactionChipPaddingBlock}px`);
    rootElement.style.setProperty('--enhanced-reaction-chip-gap', `${reactionChipGap}px`);
    rootElement.style.setProperty('--enhanced-reaction-chip-min-height', `${reactionChipMinHeight}px`);
}
