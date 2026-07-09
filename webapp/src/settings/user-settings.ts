import buildInfo from 'build-info';
import {
    buildEnhancedEmojisPreferenceSavePayload,
    DEFAULT_ENHANCED_EMOJIS_USER_PREFERENCES,
    type EnhancedEmojisConfig,
    type EnhancedEmojisUserPreferences,
    getEnhancedEmojisUserPreferences,
    INLINE_POST_EMOJI_SIZE_PREFERENCE_NAME,
    type InlinePostEmojiSize,
    normalizeEnhancedEmojisUserPreferences,
    POST_EMOJI_SIZE_PREFERENCE_NAME,
    type PostEmojiSize,
    REACTION_EMOJI_SIZE_PREFERENCE_NAME,
    type ReactionEmojiSize,
    saveEnhancedEmojisUserPreferences,
    USER_ENABLE_PREFERENCE_NAME,
    USER_PREFERENCES_CATEGORY,
} from 'config';
import * as enhancedEmojisDebug from 'debug/enhanced-emojis-debug';
import {type EnhancedEmojisTranslations, getEnhancedEmojisTranslations} from 'i18n';
import manifest from 'manifest';
import React from 'react';
import {useSelector} from 'react-redux';

import {createEmojiPreferenceSection} from './components/emoji-preference-setting';
import renderToggleSetting from './components/toggle-setting';

type GlobalState = import('@mattermost/types/store').GlobalState;
type PluginConfiguration = import('types/mattermost-webapp').PluginConfiguration;
type PluginConfigurationSetting = import('types/mattermost-webapp').PluginConfigurationSetting;
type PluginRegistry = import('types/mattermost-webapp').PluginRegistry;

function getPostEmojiSizeOptions(translations: EnhancedEmojisTranslations): Array<{
    text: string;
    value: PostEmojiSize;
}> {
    return [
        {text: translations['enhanced_emojis.settings.posts.option.default'], value: 'default'},
        {text: translations['enhanced_emojis.settings.posts.option.large'], value: 'large'},
        {text: translations['enhanced_emojis.settings.posts.option.extra_large'], value: 'extraLarge'},
        {text: translations['enhanced_emojis.settings.posts.option.max'], value: 'maxSize'},
    ];
}

function getReactionEmojiSizeOptions(translations: EnhancedEmojisTranslations): Array<{
    text: string;
    value: ReactionEmojiSize;
}> {
    return [
        {text: translations['enhanced_emojis.settings.reactions.option.default'], value: 'default'},
        {text: translations['enhanced_emojis.settings.reactions.option.medium'], value: 'medium'},
        {text: translations['enhanced_emojis.settings.reactions.option.large'], value: 'large'},
        {text: translations['enhanced_emojis.settings.reactions.option.max'], value: 'maxSize'},
    ];
}

function getInlinePostEmojiSizeOptions(translations: EnhancedEmojisTranslations): Array<{
    text: string;
    value: InlinePostEmojiSize;
}> {
    return [
        {text: translations['enhanced_emojis.settings.posts.inline.option.default'], value: 'default'},
        {text: translations['enhanced_emojis.settings.posts.inline.option.medium'], value: 'medium'},
        {text: translations['enhanced_emojis.settings.posts.inline.option.large'], value: 'large'},
        {text: translations['enhanced_emojis.settings.posts.inline.option.extra_large'], value: 'extraLarge'},
        {text: translations['enhanced_emojis.settings.posts.inline.option.max'], value: 'maxSize'},
    ];
}

function createMessageSettingComponent(message: string): () => React.ReactElement {
    return function MessageSetting(): React.ReactElement {
        return React.createElement('div', null, message);
    };
}

function createDeveloperBuildInfoComponent(): () => React.ReactElement {
    return function DeveloperBuildInfo(): React.ReactElement {
        const rows = [
            ['Plugin Version', buildInfo.pluginVersion],
            ['Build Timestamp', buildInfo.buildTimestamp],
            ['Build ID', buildInfo.buildId],
            ['Git Commit', buildInfo.gitCommit ?? 'null'],
            ['Preference Category', USER_PREFERENCES_CATEGORY],
        ];

        return React.createElement(
            'div',
            null,
            rows.map(([label, value]) => React.createElement(
                'div',
                {key: label},
                React.createElement('strong', null, `${label}: `),
                value,
            )),
        );
    };
}

function createUserPreferencesSubmitHandler(
    currentUserId: string | undefined,
    getCurrentUserPreferences: () => Partial<EnhancedEmojisUserPreferences> | null | undefined,
    enableDeveloperMode: boolean,
): (changes: { [name: string]: string }) => void {
    return (changes: { [name: string]: string }): void => {
        if (!currentUserId) {
            return;
        }

        const changedEntry = Object.entries(changes)[0] as [typeof USER_ENABLE_PREFERENCE_NAME | typeof POST_EMOJI_SIZE_PREFERENCE_NAME | typeof INLINE_POST_EMOJI_SIZE_PREFERENCE_NAME | typeof REACTION_EMOJI_SIZE_PREFERENCE_NAME, string] | undefined;
        if (!changedEntry) {
            return;
        }

        const currentUserPreferences = getCurrentUserPreferences();
        const savePlan = buildEnhancedEmojisPreferenceSavePayload(currentUserId, currentUserPreferences, {
            name: changedEntry[0],
            value: changedEntry[1],
        });

        enhancedEmojisDebug.debugLog('settings_change', {
            changedKey: savePlan.changedKey,
            newValue: changedEntry[1],
            oldValue: savePlan.previousPreferences[savePlan.changedKey],
        }, {
            adminDeveloperModeEnabled: enableDeveloperMode,
        });

        enhancedEmojisDebug.debugLog('settings_save_attempt', {
            changedKey: savePlan.changedKey,
            newNormalizedPreferences: savePlan.nextPreferences,
            oldNormalizedPreferences: savePlan.previousPreferences,
            payload: savePlan.payload,
            unchangedValues: {
                enableEnhancedEmojis: savePlan.changedKey === USER_ENABLE_PREFERENCE_NAME ? 'changed' : savePlan.nextPreferences.enableEnhancedEmojis,
                inlinePostEmojiSize: savePlan.changedKey === INLINE_POST_EMOJI_SIZE_PREFERENCE_NAME ? 'changed' : savePlan.nextPreferences.inlinePostEmojiSize,
                postEmojiSize: savePlan.changedKey === POST_EMOJI_SIZE_PREFERENCE_NAME ? 'changed' : savePlan.nextPreferences.postEmojiSize,
                reactionEmojiSize: savePlan.changedKey === REACTION_EMOJI_SIZE_PREFERENCE_NAME ? 'changed' : savePlan.nextPreferences.reactionEmojiSize,
            },
        }, {
            adminDeveloperModeEnabled: enableDeveloperMode,
        });

        saveEnhancedEmojisUserPreferences(currentUserId, savePlan.payload).then(() => {
            enhancedEmojisDebug.debugLog('settings_save_success', {
                savedPreferences: savePlan.nextPreferences,
            }, {
                adminDeveloperModeEnabled: enableDeveloperMode,
            });
        }).catch((error: unknown) => {
            enhancedEmojisDebug.debugError('settings_save_failed', error, {
                changedKey: savePlan.changedKey,
                payload: savePlan.payload,
            }, {
                adminDeveloperModeEnabled: enableDeveloperMode,
            });
        });
    };
}

export function createEnableEnhancedEmojisSettingComponent(
    translations: EnhancedEmojisTranslations,
): (props: { informChange: (name: string, value: string) => void }) => React.ReactElement {
    return function EnableEnhancedEmojisSetting({informChange}: {
        informChange: (name: string, value: string) => void;
    }): React.ReactElement {
        const savedEnabled = useSelector((state: GlobalState) => getEnhancedEmojisUserPreferences(state).enableEnhancedEmojis);
        const [enabled, setEnabled] = React.useState(savedEnabled);

        React.useEffect(() => {
            setEnabled(savedEnabled);
        }, [savedEnabled]);

        const toggleEnabled = (): void => {
            const nextEnabled = !enabled;
            setEnabled(nextEnabled);
            informChange(USER_ENABLE_PREFERENCE_NAME, nextEnabled ? 'true' : 'false');
        };

        return renderToggleSetting({
            checked: enabled,
            label: translations['enhanced_emojis.settings.enable.title'],
            offText: translations['enhanced_emojis.settings.enable.state.off'],
            onText: translations['enhanced_emojis.settings.enable.state.on'],
            onToggle: toggleEnabled,
        });
    };
}

export function createEnhancedEmojisUserSettingsConfig(
    adminConfig: EnhancedEmojisConfig,
    locale: string,
    userPreferences: Partial<EnhancedEmojisUserPreferences> | null | undefined,
    currentUserId?: string,
    getCurrentUserPreferences: () => Partial<EnhancedEmojisUserPreferences> | null | undefined = () => userPreferences,
): PluginConfiguration {
    const translations = getEnhancedEmojisTranslations(locale);
    const normalizedUserPreferences = normalizeEnhancedEmojisUserPreferences(userPreferences);
    const onSubmit = createUserPreferencesSubmitHandler(currentUserId, getCurrentUserPreferences, adminConfig.enableDeveloperMode);
    const sections: PluginConfiguration['sections'] = [];
    const generalSettings: PluginConfigurationSetting[] = [
        {
            type: 'custom' as const,
            name: USER_ENABLE_PREFERENCE_NAME,
            title: translations['enhanced_emojis.settings.enable.title'],
            helpText: translations['enhanced_emojis.settings.enable.help_text'],
            component: createEnableEnhancedEmojisSettingComponent(translations),
        },
    ];

    if (normalizedUserPreferences.enableEnhancedEmojis) {
        generalSettings.push({
            type: 'custom' as const,
            name: 'enableEnhancedEmojisEnabledMessage',
            component: createMessageSettingComponent(translations['enhanced_emojis.settings.enable.enabled_message']),
        });
    }

    if (!normalizedUserPreferences.enableEnhancedEmojis) {
        generalSettings.push({
            type: 'custom' as const,
            name: 'enableEnhancedEmojisDisabledMessage',
            component: createMessageSettingComponent(translations['enhanced_emojis.settings.enable.disabled_message']),
        });
    }

    if (normalizedUserPreferences.enableEnhancedEmojis && !adminConfig.enableEnhancedPostEmojis && !adminConfig.enableEnhancedReactionEmojis) {
        generalSettings.push({
            type: 'custom' as const,
            name: 'noFeaturesEnabledMessage',
            component: createMessageSettingComponent(translations['enhanced_emojis.settings.no_features_enabled']),
        });
    }

    if (adminConfig.enableDeveloperMode) {
        generalSettings.push({
            type: 'custom' as const,
            name: 'developerBuildInfo',
            title: 'Debug Build Info',
            component: createDeveloperBuildInfoComponent(),
        });
    }

    sections.push({
        title: translations['enhanced_emojis.settings.title'],
        onSubmit,
        settings: generalSettings,
    });

    if (normalizedUserPreferences.enableEnhancedEmojis && adminConfig.enableEnhancedPostEmojis) {
        sections.push(createEmojiPreferenceSection({
            sectionTitle: translations['enhanced_emojis.settings.posts.title'],
            settingName: POST_EMOJI_SIZE_PREFERENCE_NAME,
            settingTitle: translations['enhanced_emojis.settings.posts.size'],
            helpText: translations['enhanced_emojis.settings.posts.help_text'],
            defaultValue: DEFAULT_ENHANCED_EMOJIS_USER_PREFERENCES.postEmojiSize,
            options: getPostEmojiSizeOptions(translations),
            onSubmit,
        }));

        sections.push(createEmojiPreferenceSection({
            sectionTitle: translations['enhanced_emojis.settings.posts.inline.title'],
            settingName: INLINE_POST_EMOJI_SIZE_PREFERENCE_NAME,
            settingTitle: translations['enhanced_emojis.settings.posts.inline.size'],
            helpText: translations['enhanced_emojis.settings.posts.inline.help_text'],
            defaultValue: DEFAULT_ENHANCED_EMOJIS_USER_PREFERENCES.inlinePostEmojiSize,
            options: getInlinePostEmojiSizeOptions(translations),
            onSubmit,
        }));
    }

    if (normalizedUserPreferences.enableEnhancedEmojis && adminConfig.enableEnhancedReactionEmojis) {
        sections.push(createEmojiPreferenceSection({
            sectionTitle: translations['enhanced_emojis.settings.reactions.title'],
            settingName: REACTION_EMOJI_SIZE_PREFERENCE_NAME,
            settingTitle: translations['enhanced_emojis.settings.reactions.size'],
            helpText: translations['enhanced_emojis.settings.reactions.help_text'],
            defaultValue: DEFAULT_ENHANCED_EMOJIS_USER_PREFERENCES.reactionEmojiSize,
            options: getReactionEmojiSizeOptions(translations),
            onSubmit,
        }));
    }

    enhancedEmojisDebug.debugLog('settings_render', {
        currentValues: normalizedUserPreferences,
        visibleSettings: sections.flatMap((section) => {
            if (!('settings' in section)) {
                return [];
            }

            return section.settings.map((setting) => setting.name);
        }),
    }, {
        adminDeveloperModeEnabled: adminConfig.enableDeveloperMode,
    });

    return {
        id: manifest.id,
        uiName: translations['enhanced_emojis.settings.title'],
        sections,
    };
}

export function registerEnhancedEmojisUserSettings(
    registry: PluginRegistry,
    adminConfig: EnhancedEmojisConfig,
    locale: string,
    userPreferences: Partial<EnhancedEmojisUserPreferences> | null | undefined,
    currentUserId?: string,
    getCurrentUserPreferences: () => Partial<EnhancedEmojisUserPreferences> | null | undefined = () => userPreferences,
): void {
    registry.registerUserSettings(createEnhancedEmojisUserSettingsConfig(adminConfig, locale, userPreferences, currentUserId, getCurrentUserPreferences));
}
