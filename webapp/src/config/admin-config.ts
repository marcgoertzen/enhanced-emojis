import manifest from 'manifest';

export interface EnhancedEmojisConfig {
    enableCustomPostEmojis: boolean;
    enableCustomReactionEmojis: boolean;
    enableStandardPostEmojis: boolean;
    enableStandardReactionEmojis: boolean;
    enableDeveloperMode: boolean;
}

export type EnhancedEmojisConfigInput = Partial<EnhancedEmojisConfig> & {
    enableEnhancedPostEmojis?: boolean;
    enableEnhancedReactionEmojis?: boolean;
};

export const DEFAULT_ENHANCED_EMOJIS_CONFIG: EnhancedEmojisConfig = {
    enableCustomPostEmojis: true,
    enableCustomReactionEmojis: true,
    enableStandardPostEmojis: true,
    enableStandardReactionEmojis: true,
    enableDeveloperMode: false,
};

export function normalizeEnhancedEmojisConfig(config: EnhancedEmojisConfigInput | null | undefined): EnhancedEmojisConfig {
    const legacyPost = typeof config?.enableEnhancedPostEmojis === 'boolean' ? config.enableEnhancedPostEmojis : undefined;
    const legacyReaction = typeof config?.enableEnhancedReactionEmojis === 'boolean' ? config.enableEnhancedReactionEmojis : undefined;

    return {
        enableCustomPostEmojis: typeof config?.enableCustomPostEmojis === 'boolean' ? config.enableCustomPostEmojis : legacyPost ?? DEFAULT_ENHANCED_EMOJIS_CONFIG.enableCustomPostEmojis,
        enableCustomReactionEmojis: typeof config?.enableCustomReactionEmojis === 'boolean' ? config.enableCustomReactionEmojis : legacyReaction ?? DEFAULT_ENHANCED_EMOJIS_CONFIG.enableCustomReactionEmojis,
        enableStandardPostEmojis: typeof config?.enableStandardPostEmojis === 'boolean' ? config.enableStandardPostEmojis : legacyPost ?? DEFAULT_ENHANCED_EMOJIS_CONFIG.enableStandardPostEmojis,
        enableStandardReactionEmojis: typeof config?.enableStandardReactionEmojis === 'boolean' ? config.enableStandardReactionEmojis : legacyReaction ?? DEFAULT_ENHANCED_EMOJIS_CONFIG.enableStandardReactionEmojis,
        enableDeveloperMode: typeof config?.enableDeveloperMode === 'boolean' ? config.enableDeveloperMode : DEFAULT_ENHANCED_EMOJIS_CONFIG.enableDeveloperMode,
    };
}

export async function fetchEnhancedEmojisAdminConfig(fetchImpl: typeof globalThis.fetch = globalThis.fetch): Promise<EnhancedEmojisConfig> {
    if (!fetchImpl) {
        return DEFAULT_ENHANCED_EMOJIS_CONFIG;
    }

    try {
        const response = await fetchImpl(`/plugins/${manifest.id}/config`);
        if (!response.ok) {
            return DEFAULT_ENHANCED_EMOJIS_CONFIG;
        }

        return normalizeEnhancedEmojisConfig(await response.json() as EnhancedEmojisConfigInput);
    } catch {
        return DEFAULT_ENHANCED_EMOJIS_CONFIG;
    }
}
