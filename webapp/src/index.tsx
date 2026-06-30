import {
    DEFAULT_ENHANCED_EMOJIS_CONFIG,
    applyEnhancedEmojisConfig,
    clearEnhancedEmojisConfig,
    normalizeEnhancedEmojisConfig,
    resolveEnhancedEmojisEffectiveConfig,
    type EnhancedEmojisConfig,
} from 'config';
import manifest from 'manifest';
import type {Store} from 'redux';
import {getEnhancedEmojisUserPreferences, registerEnhancedEmojisUserSettings} from 'user-settings';

import type {GlobalState} from '@mattermost/types/store';

import type {PluginRegistry} from 'types/mattermost-webapp';

import './styles.css';

export default class EnhancedEmojisPlugin {
    private adminConfig: EnhancedEmojisConfig = DEFAULT_ENHANCED_EMOJIS_CONFIG;

    private rootElement?: HTMLElement;

    private store?: Store<GlobalState>;

    private unsubscribe?: () => void;

    private lastAppliedConfigSignature?: string;

    public async initialize(registry: PluginRegistry, store: Store<GlobalState>): Promise<void> {
        registerEnhancedEmojisUserSettings(registry);

        const rootElement = globalThis.document?.documentElement;
        if (!rootElement) {
            return;
        }

        this.rootElement = rootElement;
        this.store = store;
        this.adminConfig = await this.fetchPluginConfig();
        this.unsubscribe = store.subscribe(() => {
            this.applyCurrentConfig();
        });
        this.applyCurrentConfig();
    }

    public uninitialize(): void {
        this.unsubscribe?.();
        this.unsubscribe = undefined;

        const rootElement = this.rootElement ?? globalThis.document?.documentElement;
        if (rootElement) {
            clearEnhancedEmojisConfig(rootElement);
        }

        this.rootElement = undefined;
        this.store = undefined;
        this.lastAppliedConfigSignature = undefined;
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

    private applyCurrentConfig(): void {
        if (!this.rootElement || !this.store) {
            return;
        }

        const userPreferences = getEnhancedEmojisUserPreferences(this.store.getState());
        const effectiveConfig = resolveEnhancedEmojisEffectiveConfig(this.adminConfig, userPreferences);
        const signature = JSON.stringify(effectiveConfig);

        if (signature === this.lastAppliedConfigSignature) {
            return;
        }

        this.lastAppliedConfigSignature = signature;
        applyEnhancedEmojisConfig(this.rootElement, effectiveConfig);
    }
}

declare global {
    interface Window {
        registerPlugin(pluginId: string, plugin: EnhancedEmojisPlugin): void;
    }
}

window.registerPlugin(manifest.id, new EnhancedEmojisPlugin());
