import {
    DEFAULT_ENHANCED_EMOJIS_CONFIG,
    applyEnhancedEmojisConfig,
    clearEnhancedEmojisConfig,
    normalizeEnhancedEmojisConfig,
    type EnhancedEmojisConfig,
} from 'config';
import manifest from 'manifest';
import type {Store} from 'redux';

import type {GlobalState} from '@mattermost/types/store';

import type {PluginRegistry} from 'types/mattermost-webapp';

import './styles.css';

export default class EnhancedEmojisPlugin {
    public async initialize(registry: PluginRegistry, store: Store<GlobalState>): Promise<void> {
        await Promise.all([Promise.resolve(registry), Promise.resolve(store)]);
        const rootElement = globalThis.document?.documentElement;
        if (!rootElement) {
            return;
        }

        applyEnhancedEmojisConfig(rootElement, await this.fetchPluginConfig());
    }

    public uninitialize(): void {
        const rootElement = globalThis.document?.documentElement;
        if (rootElement) {
            clearEnhancedEmojisConfig(rootElement);
        }
    }

    private async fetchPluginConfig(): Promise<EnhancedEmojisConfig> {
        if (!globalThis.fetch) {
            return DEFAULT_ENHANCED_EMOJIS_CONFIG;
        }

        try {
            const response = await globalThis.fetch(`/plugins/${manifest.id}/config`);
            if (!response.ok) {
                return DEFAULT_ENHANCED_EMOJIS_CONFIG;
            }

            return normalizeEnhancedEmojisConfig(await response.json() as Partial<EnhancedEmojisConfig>);
        } catch {
            return DEFAULT_ENHANCED_EMOJIS_CONFIG;
        }
    }
}

declare global {
    interface Window {
        registerPlugin(pluginId: string, plugin: EnhancedEmojisPlugin): void;
    }
}

window.registerPlugin(manifest.id, new EnhancedEmojisPlugin());
