import {
    applyEnhancedEmojisRootState,
    clearEnhancedEmojisRootState,
    DEFAULT_ENHANCED_EMOJIS_CONFIG,
    type EnhancedEmojisConfig,
    fetchEnhancedEmojisAdminConfig,
    getEnhancedEmojisUserPreferences,
    resolveEnhancedEmojisEffectiveConfig,
} from 'config';
import PostEmojiFeature from 'features/posts/post-emoji-feature';
import ReactionEmojiFeature from 'features/reactions/reaction-emoji-feature';
import {registerEnhancedEmojisTranslations} from 'i18n';
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

export default class EnhancedEmojisPlugin {
    private adminConfig: EnhancedEmojisConfig = DEFAULT_ENHANCED_EMOJIS_CONFIG;

    private registry?: PluginRegistry;

    private rootElement?: HTMLElement;

    private store?: Store;

    private unsubscribe?: () => void;

    private lastAppliedConfigSignature?: string;

    private lastRegisteredUserSettingsSignature?: string;

    private initialConfigSyncTimeoutId?: ReturnType<typeof globalThis.setTimeout>;

    private readonly postEmojiFeature = new PostEmojiFeature();

    private readonly reactionEmojiFeature = new ReactionEmojiFeature();

    public async initialize(
        registry: PluginRegistry,
        store: Store,
    ): Promise<void> {
        this.registry = registry;
        this.store = store;
        this.adminConfig = await fetchEnhancedEmojisAdminConfig();
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

        applyEnhancedEmojisRootState(this.rootElement, effectiveConfig);

        if (isInitialApply) {
            this.postEmojiFeature.start(this.rootElement, effectiveConfig);
            this.reactionEmojiFeature.start(this.rootElement, effectiveConfig);
            return;
        }

        this.postEmojiFeature.update(effectiveConfig);
        this.reactionEmojiFeature.update(effectiveConfig);
    }

    private registerUserSettingsForCurrentLocale(store: Store): void {
        if (!this.registry) {
            return;
        }

        const state = store.getState();
        const locale = getCurrentUserLocale(state);
        const currentUserId = getCurrentUserId(state);
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
