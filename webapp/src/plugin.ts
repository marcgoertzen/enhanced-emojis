import buildInfo from 'build-info';
import {
    applyEnhancedEmojisRootState,
    clearEnhancedEmojisRootState,
    DEFAULT_ENHANCED_EMOJIS_CONFIG,
    type EnhancedEmojisConfig,
    fetchEnhancedEmojisAdminConfig,
    getEnhancedEmojisUserPreferenceDiagnostics,
    getEnhancedEmojisUserPreferences,
    resolveEnhancedEmojisEffectiveConfig,
    USER_PREFERENCES_CATEGORY,
} from 'config';
import * as enhancedEmojisDebug from 'debug/enhanced-emojis-debug';
import PostEmojiFeature from 'features/posts/post-emoji-feature';
import ReactionEmojiFeature from 'features/reactions/reaction-emoji-feature';
import {registerEnhancedEmojisTranslations} from 'i18n';
import manifest from 'manifest';
import {registerEnhancedEmojisUserSettings} from 'settings';

type GlobalState = import('@mattermost/types/store').GlobalState;
type Store = import('redux').Store<GlobalState>;
type PluginRegistry = import('types/mattermost-webapp').PluginRegistry;

function getCurrentUserLocale(state: GlobalState): string {
    const currentUserId = state?.entities?.users?.currentUserId;
    if (!currentUserId) {
        return 'en';
    }

    return state.entities.users.profiles[currentUserId]?.locale ?? 'en';
}

function getCurrentUserId(state: GlobalState): string | undefined {
    return state?.entities?.users?.currentUserId;
}

function getBundleFileName(): string | null {
    const bundlePath = manifest.webapp?.bundle_path;
    if (!bundlePath) {
        return null;
    }

    const pathSegments = bundlePath.split('/');
    return pathSegments[pathSegments.length - 1] || null;
}

function validateBuildInfo(pluginVersion: string): {
    missingFields: string[];
    pluginVersionMatches: boolean;
} {
    const missingFields: string[] = [];

    if (!buildInfo.pluginVersion) {
        missingFields.push('pluginVersion');
    }

    if (!buildInfo.buildTimestamp) {
        missingFields.push('buildTimestamp');
    }

    if (!Number.isFinite(buildInfo.buildEpoch)) {
        missingFields.push('buildEpoch');
    }

    if (!buildInfo.buildId) {
        missingFields.push('buildId');
    }

    if (!Object.prototype.hasOwnProperty.call(buildInfo, 'gitCommit')) {
        missingFields.push('gitCommit');
    }

    return {
        missingFields,
        pluginVersionMatches: buildInfo.pluginVersion === pluginVersion,
    };
}

export default class EnhancedEmojisPlugin {
    private adminConfig: EnhancedEmojisConfig = DEFAULT_ENHANCED_EMOJIS_CONFIG;

    private registry?: PluginRegistry;

    private rootElement?: HTMLElement;

    private store?: Store;

    private unsubscribe?: () => void;

    private lastAppliedConfigSignature?: string;

    private lastRegisteredUserSettingsSignature?: string;

    private initialConfigSyncTimeoutId?: ReturnType<typeof globalThis.setTimeout>;

    private hasLoggedRuntimeIdentity = false;

    private readonly postEmojiFeature = new PostEmojiFeature();

    private readonly reactionEmojiFeature = new ReactionEmojiFeature();

    public async initialize(
        registry: PluginRegistry,
        store: Store,
    ): Promise<void> {
        this.registry = registry;
        this.store = store;
        this.adminConfig = await fetchEnhancedEmojisAdminConfig();
        enhancedEmojisDebug.debugLog('admin_config_loaded', {
            adminDeveloperModeEnabled: this.adminConfig.enableDeveloperMode,
            adminPostFeatureEnabled: this.adminConfig.enableEnhancedPostEmojis,
            adminReactionFeatureEnabled: this.adminConfig.enableEnhancedReactionEmojis,
        }, {
            adminDeveloperModeEnabled: this.adminConfig.enableDeveloperMode,
        });
        registerEnhancedEmojisTranslations(registry);

        const rootElement = globalThis.document?.documentElement;
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
            clearEnhancedEmojisRootState(rootElement);
        }

        this.postEmojiFeature.stop();
        this.reactionEmojiFeature.stop();
        this.clearInitialConfigSyncTimeout();

        this.rootElement = undefined;
        this.store = undefined;
        this.registry = undefined;
        this.lastAppliedConfigSignature = undefined;
        this.lastRegisteredUserSettingsSignature = undefined;
        this.hasLoggedRuntimeIdentity = false;
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

        const isInitialApply = this.lastAppliedConfigSignature === undefined;
        this.lastAppliedConfigSignature = signature;

        if (!this.hasLoggedRuntimeIdentity) {
            const buildInfoValidation = validateBuildInfo(manifest.version);
            if (buildInfoValidation.missingFields.length > 0 || !buildInfoValidation.pluginVersionMatches) {
                enhancedEmojisDebug.debugWarn('plugin_runtime_identity_warning', {
                    expectedPluginVersion: manifest.version,
                    missingFields: buildInfoValidation.missingFields,
                    pluginVersionMatches: buildInfoValidation.pluginVersionMatches,
                    runtimeBuildInfo: buildInfo,
                }, {
                    adminDeveloperModeEnabled: this.adminConfig.enableDeveloperMode,
                });
            }

            enhancedEmojisDebug.debugLog('plugin_runtime_identity', {
                buildEpoch: buildInfo.buildEpoch,
                buildId: buildInfo.buildId,
                buildTimestamp: buildInfo.buildTimestamp,
                bundleFileName: getBundleFileName(),
                gitCommit: buildInfo.gitCommit,
                pluginId: manifest.id,
                pluginVersion: buildInfo.pluginVersion,
                preferenceCategory: USER_PREFERENCES_CATEGORY,
            }, {
                adminDeveloperModeEnabled: this.adminConfig.enableDeveloperMode,
            });
            this.hasLoggedRuntimeIdentity = true;
        }

        enhancedEmojisDebug.debugLog('effective_config_resolved', {
            developerModeActive: effectiveConfig.enableDeveloperMode,
            effectiveEnableState: {
                posts: effectiveConfig.enablePostEmojis,
                reactions: effectiveConfig.enableReactionEmojis,
            },
            inlinePostEmojiSize: effectiveConfig.inlinePostEmojiSize,
            postEmojiSize: effectiveConfig.postEmojiSize,
            reactionEmojiSize: effectiveConfig.reactionEmojiSize,
        }, {
            adminDeveloperModeEnabled: this.adminConfig.enableDeveloperMode,
        });

        applyEnhancedEmojisRootState(this.rootElement, effectiveConfig);

        if (isInitialApply) {
            this.postEmojiFeature.start(this.rootElement, effectiveConfig, this.adminConfig.enableDeveloperMode);
            this.reactionEmojiFeature.start(this.rootElement, effectiveConfig, this.adminConfig.enableDeveloperMode);
            return;
        }

        this.postEmojiFeature.update(effectiveConfig, this.adminConfig.enableDeveloperMode);
        this.reactionEmojiFeature.update(effectiveConfig, this.adminConfig.enableDeveloperMode);
    }

    private registerUserSettingsForCurrentLocale(store: Store): void {
        if (!this.registry) {
            return;
        }

        const state = store.getState();
        const locale = getCurrentUserLocale(state);
        const currentUserId = getCurrentUserId(state);
        const preferenceDiagnostics = getEnhancedEmojisUserPreferenceDiagnostics(state);
        const userPreferences = getEnhancedEmojisUserPreferences(state);
        const signature = JSON.stringify({
            currentUserId,
            locale,
            enableEnhancedPostEmojis: this.adminConfig.enableEnhancedPostEmojis,
            enableEnhancedReactionEmojis: this.adminConfig.enableEnhancedReactionEmojis,
            enableEnhancedEmojis: userPreferences.enableEnhancedEmojis,
            postEmojiSize: userPreferences.postEmojiSize,
            inlinePostEmojiSize: userPreferences.inlinePostEmojiSize,
            reactionEmojiSize: userPreferences.reactionEmojiSize,
        });

        if (signature === this.lastRegisteredUserSettingsSignature) {
            return;
        }

        this.lastRegisteredUserSettingsSignature = signature;
        enhancedEmojisDebug.debugLog('preferences_loaded', {
            defaultsApplied: preferenceDiagnostics.defaultsApplied,
            normalizedPreferences: preferenceDiagnostics.normalizedPreferences,
            rawMattermostPreferences: preferenceDiagnostics.rawPreferences,
        }, {
            adminDeveloperModeEnabled: this.adminConfig.enableDeveloperMode,
        });
        registerEnhancedEmojisUserSettings(
            this.registry,
            this.adminConfig,
            locale,
            userPreferences,
            currentUserId,
            () => getEnhancedEmojisUserPreferences(store.getState()),
        );
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
}
