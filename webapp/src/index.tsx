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
import {classifyAllPostEmojiContainers, classifyPostEmojiMutations, clearPostEmojiClassification} from 'post-emoji-classification';
import type {Store} from 'redux';
import {getEnhancedEmojisUserPreferences, registerEnhancedEmojisUserSettings} from 'user-settings';

import type {GlobalState} from '@mattermost/types/store';

import type {PluginRegistry} from 'types/mattermost-webapp';

import './styles.css';

const POST_EMOJI_INITIAL_SCAN_INTERVAL_MS = 250;
const POST_EMOJI_INITIAL_SCAN_ATTEMPTS = 8;

function getCurrentUserLocale(state: GlobalState): string {
    const currentUserId = state?.entities?.users?.currentUserId;
    if (!currentUserId) {
        return 'en';
    }

    return state.entities.users.profiles[currentUserId]?.locale ?? 'en';
}

export default class EnhancedEmojisPlugin {
    private adminConfig: EnhancedEmojisConfig = DEFAULT_ENHANCED_EMOJIS_CONFIG;

    private registry?: PluginRegistry;

    private rootElement?: HTMLElement;

    private store?: Store<GlobalState>;

    private unsubscribe?: () => void;

    private postEmojiObserver?: MutationObserver;

    private postEmojiBodyObserver?: MutationObserver;

    private lastAppliedConfigSignature?: string;

    private lastRegisteredUserSettingsSignature?: string;

    private initialConfigSyncTimeoutId?: ReturnType<typeof globalThis.setTimeout>;

    private postEmojiInitialScanTimeoutId?: ReturnType<typeof globalThis.setTimeout>;

    private postEmojiInitialScanAttemptsRemaining = 0;

    private postEmojiClassifierRunCount = 0;

    private hasMutationObserver(): boolean {
        return typeof globalThis.MutationObserver === 'function';
    }

    private debug(message: string, details?: unknown): void {
        if (typeof globalThis.console?.debug !== 'function') {
            return;
        }

        if (details) {
            globalThis.console.debug(`[enhanced-emojis] ${message}`, details);
            return;
        }

        globalThis.console.debug(`[enhanced-emojis] ${message}`);
    }

    public async initialize(registry: PluginRegistry, store: Store<GlobalState>): Promise<void> {
        this.registry = registry;
        this.adminConfig = await this.fetchPluginConfig();
        registerEnhancedEmojisTranslations(registry);
        this.debug('plugin initialized');
        this.debug('admin config loaded', this.adminConfig);

        const rootElement = globalThis.document?.documentElement;
        this.store = store;

        if (!rootElement) {
            this.registerUserSettingsForCurrentLocale(store);
            return;
        }

        this.rootElement = rootElement;
        this.unsubscribe = store.subscribe(() => {
            this.registerUserSettingsForCurrentLocale(store);
            this.applyCurrentConfig();
        });
        this.registerUserSettingsForCurrentLocale(store);
        this.applyCurrentConfig();
        this.scheduleInitialConfigSync();
    }

    public uninitialize(): void {
        this.unsubscribe?.();
        this.unsubscribe = undefined;

        const rootElement = this.rootElement ?? globalThis.document?.documentElement;
        if (rootElement) {
            clearEnhancedEmojisConfig(rootElement);
        }
        this.stopPostEmojiObserver();
        this.clearPostEmojiClassification();
        this.clearInitialConfigSyncTimeout();
        this.clearPostEmojiInitialScanTimeout();

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
        this.debug('user preferences resolved', {
            enableEnhancedEmojis: userPreferences.enableEnhancedEmojis,
            inlinePostEmojiSize: userPreferences.inlinePostEmojiSize,
            postEmojiSize: userPreferences.postEmojiSize,
            reactionEmojiSize: userPreferences.reactionEmojiSize,
        });
        const effectiveConfig = resolveEnhancedEmojisEffectiveConfig(this.adminConfig, userPreferences);
        this.debug('effective config calculated', effectiveConfig);
        this.debug('post feature enabled', {
            enablePostEmojis: effectiveConfig.enablePostEmojis,
        });
        const signature = JSON.stringify(effectiveConfig);

        if (signature === this.lastAppliedConfigSignature) {
            return;
        }

        this.lastAppliedConfigSignature = signature;
        applyEnhancedEmojisConfig(this.rootElement, effectiveConfig);
        this.syncPostEmojiClassification(effectiveConfig.enablePostEmojis);
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

    private syncPostEmojiClassification(enablePostEmojis: boolean): void {
        const body = globalThis.document?.body;
        const root = globalThis.document?.documentElement;

        if (!root) {
            return;
        }

        if (!enablePostEmojis) {
            this.stopPostEmojiObserver();
            this.stopPostEmojiBodyObserver();
            this.clearPostEmojiInitialScanTimeout();
            this.clearPostEmojiClassification();
            return;
        }

        if (!body) {
            this.startPostEmojiInitialScans();
            this.startPostEmojiBodyObserver(root);
            return;
        }

        this.stopPostEmojiBodyObserver();
        this.runPostEmojiClassification(body, 'initial');
        this.startPostEmojiInitialScans();

        if (!this.hasMutationObserver()) {
            return;
        }

        if (this.postEmojiObserver) {
            return;
        }

        this.debug('classifier started');
        this.postEmojiObserver = new MutationObserver((mutationRecords) => {
            const containers = classifyPostEmojiMutations(mutationRecords);
            containers.forEach((container) => {
                this.runPostEmojiClassification(container, 'mutation');
            });
        });
        this.postEmojiObserver.observe(body, {
            attributes: true,
            attributeFilter: ['style'],
            childList: true,
            subtree: true,
        });
    }

    private startPostEmojiBodyObserver(rootElement: HTMLElement): void {
        if (!this.hasMutationObserver()) {
            return;
        }

        if (this.postEmojiBodyObserver) {
            return;
        }

        this.postEmojiBodyObserver = new MutationObserver(() => {
            const body = globalThis.document?.body;

            if (!body) {
                return;
            }

            this.stopPostEmojiBodyObserver();
            this.syncPostEmojiClassification(true);
        });
        this.postEmojiBodyObserver.observe(rootElement, {
            childList: true,
        });
    }

    private stopPostEmojiObserver(): void {
        this.postEmojiObserver?.disconnect();
        this.postEmojiObserver = undefined;
    }

    private stopPostEmojiBodyObserver(): void {
        this.postEmojiBodyObserver?.disconnect();
        this.postEmojiBodyObserver = undefined;
    }

    private clearPostEmojiClassification(): void {
        if (!globalThis.document?.body) {
            return;
        }

        clearPostEmojiClassification(globalThis.document.body);
    }

    private runPostEmojiClassification(root: ParentNode, reason: 'initial' | 'mutation' | 'retry'): void {
        const counts = classifyAllPostEmojiContainers(root);

        this.postEmojiClassifierRunCount += 1;
        this.debug('classifier run', {
            classifiedInline: counts.inline,
            classifiedStandalone: counts.standalone,
            customPostEmojisFound: counts.matched,
            postEmojiClassifierRunCount: this.postEmojiClassifierRunCount,
            reason,
        });
    }

    private scheduleInitialConfigSync(): void {
        this.clearInitialConfigSyncTimeout();

        if (typeof globalThis.setTimeout !== 'function') {
            return;
        }

        this.initialConfigSyncTimeoutId = globalThis.setTimeout(() => {
            this.initialConfigSyncTimeoutId = undefined;
            this.applyCurrentConfig();
        }, 0);
    }

    private clearInitialConfigSyncTimeout(): void {
        if (this.initialConfigSyncTimeoutId === undefined) {
            return;
        }

        globalThis.clearTimeout(this.initialConfigSyncTimeoutId);
        this.initialConfigSyncTimeoutId = undefined;
    }

    private startPostEmojiInitialScans(): void {
        this.clearPostEmojiInitialScanTimeout();
        this.postEmojiInitialScanAttemptsRemaining = POST_EMOJI_INITIAL_SCAN_ATTEMPTS;
        this.scheduleNextPostEmojiInitialScan();
    }

    private scheduleNextPostEmojiInitialScan(): void {
        if (this.postEmojiInitialScanAttemptsRemaining <= 0 || typeof globalThis.setTimeout !== 'function') {
            this.postEmojiInitialScanTimeoutId = undefined;
            return;
        }

        this.postEmojiInitialScanTimeoutId = globalThis.setTimeout(() => {
            this.postEmojiInitialScanTimeoutId = undefined;
            this.postEmojiInitialScanAttemptsRemaining -= 1;

            const body = globalThis.document?.body;
            if (body) {
                this.runPostEmojiClassification(body, 'retry');
            }

            this.scheduleNextPostEmojiInitialScan();
        }, POST_EMOJI_INITIAL_SCAN_INTERVAL_MS);
    }

    private clearPostEmojiInitialScanTimeout(): void {
        if (this.postEmojiInitialScanTimeoutId === undefined) {
            return;
        }

        globalThis.clearTimeout(this.postEmojiInitialScanTimeoutId);
        this.postEmojiInitialScanTimeoutId = undefined;
        this.postEmojiInitialScanAttemptsRemaining = 0;
    }
}

declare global {
    interface Window {
        registerPlugin(pluginId: string, plugin: EnhancedEmojisPlugin): void;
    }
}

window.registerPlugin(manifest.id, new EnhancedEmojisPlugin());
