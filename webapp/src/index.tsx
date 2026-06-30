import manifest from 'manifest';
import type {Store} from 'redux';

import type {GlobalState} from '@mattermost/types/store';

import type {PluginRegistry} from 'types/mattermost-webapp';

import './styles.css';

const ENABLED_ROOT_CLASS = 'enhanced-emojis-enabled';
const DEFAULT_ENABLE_ENHANCED_EMOJIS = true;

interface PluginConfigResponse {
    enableEnhancedEmojis?: boolean;
}

export default class EnhancedEmojisPlugin {
    public async initialize(registry: PluginRegistry, store: Store<GlobalState>): Promise<void> {
        await Promise.all([Promise.resolve(registry), Promise.resolve(store)]);
        this.applyEnabledState(await this.fetchEnhancedEmojisEnabled());
    }

    public uninitialize(): void {
        globalThis.document?.documentElement?.classList.remove(ENABLED_ROOT_CLASS);
    }

    private applyEnabledState(isEnabled: boolean): void {
        globalThis.document?.documentElement?.classList.toggle(ENABLED_ROOT_CLASS, isEnabled);
    }

    private async fetchEnhancedEmojisEnabled(): Promise<boolean> {
        if (!globalThis.fetch) {
            return DEFAULT_ENABLE_ENHANCED_EMOJIS;
        }

        try {
            const response = await globalThis.fetch(`/plugins/${manifest.id}/config`);
            if (!response.ok) {
                return DEFAULT_ENABLE_ENHANCED_EMOJIS;
            }

            const config = await response.json() as PluginConfigResponse;
            if (typeof config.enableEnhancedEmojis === 'boolean') {
                return config.enableEnhancedEmojis;
            }
        } catch {
            return DEFAULT_ENABLE_ENHANCED_EMOJIS;
        }

        return DEFAULT_ENABLE_ENHANCED_EMOJIS;
    }
}

declare global {
    interface Window {
        registerPlugin(pluginId: string, plugin: EnhancedEmojisPlugin): void;
    }
}

window.registerPlugin(manifest.id, new EnhancedEmojisPlugin());
