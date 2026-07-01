import {
    DEFAULT_ENHANCED_EMOJIS_CONFIG,
    applyEnhancedEmojisConfig,
    clearEnhancedEmojisConfig,
    normalizeEnhancedEmojisConfig,
    resolveEnhancedEmojisEffectiveConfig,
    type EnhancedEmojisConfig,
} from 'config';
import {registerEnhancedEmojisTranslations} from 'i18n';
import manifest from 'manifest';
import type {Store} from 'redux';
import {getEnhancedEmojisUserPreferences, registerEnhancedEmojisUserSettings} from 'user-settings';

import type {GlobalState} from '@mattermost/types/store';

import type {PluginRegistry} from 'types/mattermost-webapp';

import './styles.css';

function getCurrentUserLocale(state: GlobalState): string {
    const currentUserId = state.entities.users.currentUserId;
    return state.entities.users.profiles[currentUserId]?.locale ?? 'en';
}

export default class EnhancedEmojisPlugin {
    private adminConfig: EnhancedEmojisConfig = DEFAULT_ENHANCED_EMOJIS_CONFIG;

    private registry?: PluginRegistry;

    private rootElement?: HTMLElement;

    private store?: Store<GlobalState>;

    private unsubscribe?: () => void;

    private lastAppliedConfigSignature?: string;

    private lastRegisteredUserSettingsSignature?: string;

    public async initialize(registry: PluginRegistry, store: Store<GlobalState>): Promise<void> {
        this.registry = registry;
        this.adminConfig = await this.fetchPluginConfig();
        registerEnhancedEmojisTranslations(registry);

        const rootElement = globalThis.document?.documentElement;
        this.store = store;
        this.registerUserSettingsForCurrentLocale(store);

        if (!rootElement) {
            return;
        }

        this.rootElement = rootElement;
        this.unsubscribe = store.subscribe(() => {
            this.registerUserSettingsForCurrentLocale(store);
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
        this.registry = undefined;
        this.lastAppliedConfigSignature = undefined;
        this.lastRegisteredUserSettingsSignature = undefined;
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

    private registerUserSettingsForCurrentLocale(store: Store<GlobalState>): void {
        if (!this.registry) {
            return;
        }

        const state = store.getState();
        const locale = getCurrentUserLocale(state);
        const userPreferences = getEnhancedEmojisUserPreferences(state);
        const signature = JSON.stringify({
            locale,
            enableEnhancedPostEmojis: this.adminConfig.enableEnhancedPostEmojis,
            enableEnhancedReactionEmojis: this.adminConfig.enableEnhancedReactionEmojis,
            enableEnhancedEmojis: userPreferences.enableEnhancedEmojis,
        });

        if (signature === this.lastRegisteredUserSettingsSignature) {
            return;
        }

        this.lastRegisteredUserSettingsSignature = signature;
        registerEnhancedEmojisUserSettings(this.registry, this.adminConfig, locale, userPreferences);
    }
}

declare global {
    interface Window {
        registerPlugin(pluginId: string, plugin: EnhancedEmojisPlugin): void;
    }
}

window.registerPlugin(manifest.id, new EnhancedEmojisPlugin());
