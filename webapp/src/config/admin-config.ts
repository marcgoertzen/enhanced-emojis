import manifest from 'manifest';

export interface EnhancedEmojisConfig {
    enableEnhancedPostEmojis: boolean;
    enableEnhancedReactionEmojis: boolean;
    enableDeveloperMode: boolean;
}

export const DEFAULT_ENHANCED_EMOJIS_CONFIG: EnhancedEmojisConfig = {
    enableEnhancedPostEmojis: true,
    enableEnhancedReactionEmojis: true,
    enableDeveloperMode: false,
};

export function normalizeEnhancedEmojisConfig(config: Partial<EnhancedEmojisConfig> | null | undefined): EnhancedEmojisConfig {
    return {
        enableEnhancedPostEmojis: typeof config?.enableEnhancedPostEmojis === 'boolean' ? config.enableEnhancedPostEmojis : DEFAULT_ENHANCED_EMOJIS_CONFIG.enableEnhancedPostEmojis,
        enableEnhancedReactionEmojis: typeof config?.enableEnhancedReactionEmojis === 'boolean' ? config.enableEnhancedReactionEmojis : DEFAULT_ENHANCED_EMOJIS_CONFIG.enableEnhancedReactionEmojis,
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

        return normalizeEnhancedEmojisConfig(await response.json() as Partial<EnhancedEmojisConfig>);
    } catch {
        return DEFAULT_ENHANCED_EMOJIS_CONFIG;
    }
}
