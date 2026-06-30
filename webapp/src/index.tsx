import manifest from 'manifest';
import type {Store} from 'redux';

import type {GlobalState} from '@mattermost/types/store';

import type {PluginRegistry} from 'types/mattermost-webapp';

import './styles.css';

const ENABLED_ROOT_CLASS = 'enhanced-emojis-enabled';
const DEVELOPER_MODE_ROOT_CLASS = 'enhanced-emojis-developer-mode';
const DEFAULT_ENABLE_ENHANCED_EMOJIS = true;
const DEFAULT_ENABLE_DEVELOPER_MODE = false;

interface PluginConfigResponse {
    enableEnhancedEmojis?: boolean;
    enableDeveloperMode?: boolean;
}

export default class EnhancedEmojisPlugin {
    public async initialize(registry: PluginRegistry, store: Store<GlobalState>): Promise<void> {
        await Promise.all([Promise.resolve(registry), Promise.resolve(store)]);
        this.applyRootClasses(await this.fetchPluginConfig());
    }

    public uninitialize(): void {
        const classList = globalThis.document?.documentElement?.classList;
        classList?.remove(ENABLED_ROOT_CLASS);
        classList?.remove(DEVELOPER_MODE_ROOT_CLASS);
    }

    private applyRootClasses(config: PluginConfigResponse): void {
        const classList = globalThis.document?.documentElement?.classList;
        if (!classList) {
            return;
        }

        classList.toggle(ENABLED_ROOT_CLASS, this.resolveEnhancedEmojisEnabled(config));
        classList.toggle(DEVELOPER_MODE_ROOT_CLASS, this.resolveDeveloperModeEnabled(config));
    }

    private resolveEnhancedEmojisEnabled(config: PluginConfigResponse): boolean {
        if (typeof config.enableEnhancedEmojis === 'boolean') {
            return config.enableEnhancedEmojis;
        }

        return DEFAULT_ENABLE_ENHANCED_EMOJIS;
    }

    private resolveDeveloperModeEnabled(config: PluginConfigResponse): boolean {
        if (typeof config.enableDeveloperMode === 'boolean') {
            return config.enableDeveloperMode;
        }

        return DEFAULT_ENABLE_DEVELOPER_MODE;
    }

    private async fetchPluginConfig(): Promise<PluginConfigResponse> {
        if (!globalThis.fetch) {
            return {};
        }

        try {
            const response = await globalThis.fetch(`/plugins/${manifest.id}/config`);
            if (!response.ok) {
                return {};
            }

            return await response.json() as PluginConfigResponse;
        } catch {
            return {};
        }
    }
}

declare global {
    interface Window {
        registerPlugin(pluginId: string, plugin: EnhancedEmojisPlugin): void;
    }
}

window.registerPlugin(manifest.id, new EnhancedEmojisPlugin());
