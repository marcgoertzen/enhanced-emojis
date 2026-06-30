export type EmojiSize = 'small' | 'default' | 'large' | 'extraLarge' | 'maxSize';

export interface EnhancedEmojisConfig {
    enableEnhancedEmojis: boolean;
    enableDeveloperMode: boolean;
    enableReactionEmojis: boolean;
}

export interface EnhancedEmojisUserPreferences {
    postEmojiSize: EmojiSize;
    reactionEmojiSize: EmojiSize;
}

export interface EnhancedEmojisEffectiveConfig {
    enableEnhancedEmojis: boolean;
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

const EMOJI_SIZE_TO_PIXELS: Record<EmojiSize, number> = {
    small: 24,
    default: 32,
    large: 48,
    extraLarge: 64,
    maxSize: 128,
};

const VALID_EMOJI_SIZES: EmojiSize[] = ['small', 'default', 'large', 'extraLarge', 'maxSize'];

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
        postEmojiSize: isEmojiSize(postEmojiSizeValue) ? postEmojiSizeValue : DEFAULT_ENHANCED_EMOJIS_USER_PREFERENCES.postEmojiSize,
        reactionEmojiSize: isEmojiSize(reactionEmojiSizeValue) ? reactionEmojiSizeValue : DEFAULT_ENHANCED_EMOJIS_USER_PREFERENCES.reactionEmojiSize,
    };
}

export function resolveEnhancedEmojisEffectiveConfig(
    adminConfig: EnhancedEmojisConfig,
    userPreferences: Partial<EnhancedEmojisUserPreferences> | null | undefined,
): EnhancedEmojisEffectiveConfig {
    const normalizedUserPreferences = normalizeEnhancedEmojisUserPreferences(userPreferences);

    if (adminConfig.enableDeveloperMode) {
        return {
            enableEnhancedEmojis: adminConfig.enableEnhancedEmojis,
            enableDeveloperMode: adminConfig.enableDeveloperMode,
            enableReactionEmojis: adminConfig.enableReactionEmojis,
            postEmojiSize: '64px',
            reactionEmojiSize: '64px',
        };
    }

    return {
        enableEnhancedEmojis: adminConfig.enableEnhancedEmojis,
        enableDeveloperMode: adminConfig.enableDeveloperMode,
        enableReactionEmojis: adminConfig.enableReactionEmojis,
        postEmojiSize: `${EMOJI_SIZE_TO_PIXELS[normalizedUserPreferences.postEmojiSize]}px`,
        reactionEmojiSize: `${EMOJI_SIZE_TO_PIXELS[normalizedUserPreferences.reactionEmojiSize]}px`,
    };
}

export function isEmojiSize(value: unknown): value is EmojiSize {
    return typeof value === 'string' && VALID_EMOJI_SIZES.includes(value as EmojiSize);
}

export function applyEnhancedEmojisConfig(rootElement: HTMLElement, config: EnhancedEmojisEffectiveConfig): void {
    rootElement.classList.toggle('enhanced-emojis-enabled', config.enableEnhancedEmojis);
    rootElement.classList.toggle('enhanced-emojis-developer-mode', config.enableDeveloperMode);
    rootElement.classList.toggle('enhanced-emojis-reactions-enabled', config.enableReactionEmojis);
    rootElement.style.setProperty('--enhanced-post-emojis-size', config.postEmojiSize);
    rootElement.style.setProperty('--enhanced-reaction-emojis-size', config.reactionEmojiSize);
}

export function clearEnhancedEmojisConfig(rootElement: HTMLElement): void {
    rootElement.classList.remove('enhanced-emojis-enabled');
    rootElement.classList.remove('enhanced-emojis-developer-mode');
    rootElement.classList.remove('enhanced-emojis-reactions-enabled');
    rootElement.style.removeProperty('--enhanced-post-emojis-size');
    rootElement.style.removeProperty('--enhanced-reaction-emojis-size');
}
