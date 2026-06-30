export type EmojiSize = 'small' | 'default' | 'large' | 'extraLarge' | 'maxSize';

export interface EnhancedEmojisConfig {
    enableEnhancedEmojis: boolean;
    enableDeveloperMode: boolean;
    enableReactionEmojis: boolean;
    emojiSize: EmojiSize;
}

export const DEFAULT_ENHANCED_EMOJIS_CONFIG: EnhancedEmojisConfig = {
    enableEnhancedEmojis: true,
    enableDeveloperMode: false,
    enableReactionEmojis: false,
    emojiSize: 'default',
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
    const enableEnhancedEmojisValue = config?.enableEnhancedEmojis;
    const enableDeveloperModeValue = config?.enableDeveloperMode;
    const enableReactionEmojisValue = config?.enableReactionEmojis;
    const emojiSizeValue = config?.emojiSize;

    const enableEnhancedEmojis = typeof enableEnhancedEmojisValue === 'boolean' ? enableEnhancedEmojisValue : DEFAULT_ENHANCED_EMOJIS_CONFIG.enableEnhancedEmojis;
    const enableDeveloperMode = typeof enableDeveloperModeValue === 'boolean' ? enableDeveloperModeValue : DEFAULT_ENHANCED_EMOJIS_CONFIG.enableDeveloperMode;
    const enableReactionEmojis = typeof enableReactionEmojisValue === 'boolean' ? enableReactionEmojisValue : DEFAULT_ENHANCED_EMOJIS_CONFIG.enableReactionEmojis;
    const emojiSize = isEmojiSize(emojiSizeValue) ? emojiSizeValue : DEFAULT_ENHANCED_EMOJIS_CONFIG.emojiSize;

    return {
        enableEnhancedEmojis,
        enableDeveloperMode,
        enableReactionEmojis,
        emojiSize,
    };
}

export function resolveEnhancedEmojisSize(config: EnhancedEmojisConfig): string {
    if (config.enableDeveloperMode) {
        return '64px';
    }

    return `${EMOJI_SIZE_TO_PIXELS[config.emojiSize]}px`;
}

export function isEmojiSize(value: unknown): value is EmojiSize {
    return typeof value === 'string' && VALID_EMOJI_SIZES.includes(value as EmojiSize);
}

export function applyEnhancedEmojisConfig(rootElement: HTMLElement, config: EnhancedEmojisConfig): void {
    rootElement.classList.toggle('enhanced-emojis-enabled', config.enableEnhancedEmojis);
    rootElement.classList.toggle('enhanced-emojis-developer-mode', config.enableDeveloperMode);
    rootElement.classList.toggle('enhanced-emojis-reactions-enabled', config.enableReactionEmojis);
    rootElement.style.setProperty('--enhanced-emojis-size', resolveEnhancedEmojisSize(config));
}

export function clearEnhancedEmojisConfig(rootElement: HTMLElement): void {
    rootElement.classList.remove('enhanced-emojis-enabled');
    rootElement.classList.remove('enhanced-emojis-developer-mode');
    rootElement.classList.remove('enhanced-emojis-reactions-enabled');
    rootElement.style.removeProperty('--enhanced-emojis-size');
}
