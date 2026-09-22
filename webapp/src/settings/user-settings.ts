import buildInfo from 'build-info';
import {
    buildEnhancedEmojisPreferenceSavePayload,
    type EnhancedEmojisConfig,
    type EnhancedEmojisUserPreferenceInput,
    type EnhancedEmojisUserPreferences,
    getEnhancedEmojisUserPreferences,
    CUSTOM_INLINE_POST_EMOJI_SIZE_PREFERENCE_NAME,
    CUSTOM_POST_EMOJI_SIZE_PREFERENCE_NAME,
    CUSTOM_REACTION_EMOJI_SIZE_PREFERENCE_NAME,
    type InlinePostEmojiSize,
    normalizeEnhancedEmojisUserPreferences,
    STANDARD_INLINE_POST_EMOJI_SIZE_PREFERENCE_NAME,
    STANDARD_POST_EMOJI_SIZE_PREFERENCE_NAME,
    STANDARD_REACTION_EMOJI_SIZE_PREFERENCE_NAME,
    type PostEmojiSize,
    type ReactionEmojiSize,
    saveEnhancedEmojisUserPreferences,
    MASTER_ENABLE_PREFERENCE_NAME,
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
    getCurrentUserPreferences: () => EnhancedEmojisUserPreferenceInput | null | undefined,
    enableDeveloperMode: boolean,
): (changes: { [name: string]: string }) => void {
    return (changes: { [name: string]: string }): void => {
        if (!currentUserId) {
            return;
        }

        const changedEntry = Object.entries(changes)[0] as [typeof MASTER_ENABLE_PREFERENCE_NAME | typeof STANDARD_POST_EMOJI_SIZE_PREFERENCE_NAME | typeof STANDARD_INLINE_POST_EMOJI_SIZE_PREFERENCE_NAME | typeof STANDARD_REACTION_EMOJI_SIZE_PREFERENCE_NAME | typeof CUSTOM_POST_EMOJI_SIZE_PREFERENCE_NAME | typeof CUSTOM_INLINE_POST_EMOJI_SIZE_PREFERENCE_NAME | typeof CUSTOM_REACTION_EMOJI_SIZE_PREFERENCE_NAME, string] | undefined;
        if (!changedEntry) {
            return;
        }

        const currentUserPreferences = getCurrentUserPreferences();
        const savePlan = buildEnhancedEmojisPreferenceSavePayload(currentUserId, currentUserPreferences, {
            name: changedEntry[0],
            value: changedEntry[1],
        });
        const changedPreferencePayload = savePlan.payload.filter((preference) => preference.name === savePlan.changedKey);

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
            payload: changedPreferencePayload,
            unchangedValues: {
                enableEnhancedEmojis: savePlan.changedKey === MASTER_ENABLE_PREFERENCE_NAME ? 'changed' : savePlan.nextPreferences.enableEnhancedEmojis,
                standardPostEmojiSize: savePlan.changedKey === STANDARD_POST_EMOJI_SIZE_PREFERENCE_NAME ? 'changed' : savePlan.nextPreferences.standardPostEmojiSize,
                standardInlinePostEmojiSize: savePlan.changedKey === STANDARD_INLINE_POST_EMOJI_SIZE_PREFERENCE_NAME ? 'changed' : savePlan.nextPreferences.standardInlinePostEmojiSize,
                standardReactionEmojiSize: savePlan.changedKey === STANDARD_REACTION_EMOJI_SIZE_PREFERENCE_NAME ? 'changed' : savePlan.nextPreferences.standardReactionEmojiSize,
                customPostEmojiSize: savePlan.changedKey === CUSTOM_POST_EMOJI_SIZE_PREFERENCE_NAME ? 'changed' : savePlan.nextPreferences.customPostEmojiSize,
                customInlinePostEmojiSize: savePlan.changedKey === CUSTOM_INLINE_POST_EMOJI_SIZE_PREFERENCE_NAME ? 'changed' : savePlan.nextPreferences.customInlinePostEmojiSize,
                customReactionEmojiSize: savePlan.changedKey === CUSTOM_REACTION_EMOJI_SIZE_PREFERENCE_NAME ? 'changed' : savePlan.nextPreferences.customReactionEmojiSize,
            },
        }, {
            adminDeveloperModeEnabled: enableDeveloperMode,
        });

        saveEnhancedEmojisUserPreferences(currentUserId, changedPreferencePayload).then(() => {
            enhancedEmojisDebug.debugLog('settings_save_success', {
                savedPreferences: savePlan.nextPreferences,
            }, {
                adminDeveloperModeEnabled: enableDeveloperMode,
            });
        }).catch((error: unknown) => {
            enhancedEmojisDebug.debugError('settings_save_failed', error, {
                changedKey: savePlan.changedKey,
                payload: changedPreferencePayload,
            }, {
                adminDeveloperModeEnabled: enableDeveloperMode,
            });
        });
    };
}

function createBooleanPreferenceSettingComponent(
    translations: EnhancedEmojisTranslations,
    preferenceName: typeof MASTER_ENABLE_PREFERENCE_NAME,
    label: string,
): (props: { informChange: (name: string, value: string) => void }) => React.ReactElement {
    return function BooleanPreferenceSetting({informChange}: {
        informChange: (name: string, value: string) => void;
    }): React.ReactElement {
        const savedEnabled = useSelector((state: GlobalState) => getEnhancedEmojisUserPreferences(state)[preferenceName]);
        const [enabled, setEnabled] = React.useState(savedEnabled);

        React.useEffect(() => {
            setEnabled(savedEnabled);
        }, [savedEnabled]);

        const toggleEnabled = (): void => {
            const nextEnabled = !enabled;
            setEnabled(nextEnabled);
            informChange(preferenceName, nextEnabled ? 'true' : 'false');
        };

        return renderToggleSetting({
            checked: enabled,
            label,
            offText: translations['enhanced_emojis.settings.enable.state.off'],
            onText: translations['enhanced_emojis.settings.enable.state.on'],
            onToggle: toggleEnabled,
        });
    };
}

export function createMasterEnableSettingComponent(
    translations: EnhancedEmojisTranslations,
): (props: { informChange: (name: string, value: string) => void }) => React.ReactElement {
    return createBooleanPreferenceSettingComponent(
        translations,
        MASTER_ENABLE_PREFERENCE_NAME,
        translations['enhanced_emojis.settings.enable.title'],
    );
}

function createEmojiSizePreferenceSection(
    emojiType: 'standard' | 'custom',
    preferenceKind: 'post' | 'inlinePost' | 'reaction',
    translations: EnhancedEmojisTranslations,
    preferences: EnhancedEmojisUserPreferences,
    onSubmit: (changes: { [name: string]: string }) => void,
): PluginConfiguration['sections'][number] {
    if (preferenceKind === 'post') {
        const settingTitle = emojiType === 'standard' ? translations['enhanced_emojis.settings.standard.post.size'] : translations['enhanced_emojis.settings.custom.post.size'];
        return createEmojiPreferenceSection({
            sectionTitle: settingTitle,
            settingName: emojiType === 'standard' ? STANDARD_POST_EMOJI_SIZE_PREFERENCE_NAME : CUSTOM_POST_EMOJI_SIZE_PREFERENCE_NAME,
            settingTitle,
            helpText: emojiType === 'standard' ? translations['enhanced_emojis.settings.standard.post.help_text'] : translations['enhanced_emojis.settings.custom.post.help_text'],
            defaultValue: emojiType === 'standard' ? preferences.standardPostEmojiSize : preferences.customPostEmojiSize,
            options: getPostEmojiSizeOptions(translations),
            onSubmit,
        });
    }

    if (preferenceKind === 'inlinePost') {
        const settingTitle = emojiType === 'standard' ? translations['enhanced_emojis.settings.standard.inline_post.size'] : translations['enhanced_emojis.settings.custom.inline_post.size'];
        return createEmojiPreferenceSection({
            sectionTitle: settingTitle,
            settingName: emojiType === 'standard' ? STANDARD_INLINE_POST_EMOJI_SIZE_PREFERENCE_NAME : CUSTOM_INLINE_POST_EMOJI_SIZE_PREFERENCE_NAME,
            settingTitle,
            helpText: emojiType === 'standard' ? translations['enhanced_emojis.settings.standard.inline_post.help_text'] : translations['enhanced_emojis.settings.custom.inline_post.help_text'],
            defaultValue: emojiType === 'standard' ? preferences.standardInlinePostEmojiSize : preferences.customInlinePostEmojiSize,
            options: getInlinePostEmojiSizeOptions(translations),
            onSubmit,
        });
    }

    const settingTitle = emojiType === 'standard' ? translations['enhanced_emojis.settings.standard.reaction.size'] : translations['enhanced_emojis.settings.custom.reaction.size'];
    return createEmojiPreferenceSection({
        sectionTitle: settingTitle,
        settingName: emojiType === 'standard' ? STANDARD_REACTION_EMOJI_SIZE_PREFERENCE_NAME : CUSTOM_REACTION_EMOJI_SIZE_PREFERENCE_NAME,
        settingTitle,
        helpText: emojiType === 'standard' ? translations['enhanced_emojis.settings.standard.reaction.help_text'] : translations['enhanced_emojis.settings.custom.reaction.help_text'],
        defaultValue: emojiType === 'standard' ? preferences.standardReactionEmojiSize : preferences.customReactionEmojiSize,
        options: getReactionEmojiSizeOptions(translations),
        onSubmit,
    });
}

export function createEnhancedEmojisUserSettingsConfig(
    adminConfig: EnhancedEmojisConfig,
    locale: string,
    userPreferences: EnhancedEmojisUserPreferenceInput | null | undefined,
    currentUserId?: string,
    getCurrentUserPreferences: () => EnhancedEmojisUserPreferenceInput | null | undefined = () => userPreferences,
): PluginConfiguration {
    const translations = getEnhancedEmojisTranslations(locale);
    const normalizedUserPreferences = normalizeEnhancedEmojisUserPreferences(userPreferences);
    const onSubmit = createUserPreferencesSubmitHandler(currentUserId, getCurrentUserPreferences, adminConfig.enableDeveloperMode);
    const sections: PluginConfiguration['sections'] = [];
    const generalSettings: PluginConfigurationSetting[] = [
        {
            type: 'custom' as const,
            name: MASTER_ENABLE_PREFERENCE_NAME,
            title: translations['enhanced_emojis.settings.enable.title'],
            helpText: translations['enhanced_emojis.settings.enable.help_text'],
            component: createMasterEnableSettingComponent(translations),
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

    if (normalizedUserPreferences.enableEnhancedEmojis && (adminConfig.enableEnhancedPostEmojis || adminConfig.enableEnhancedReactionEmojis)) {
        const sizeSections = [
            ['standard', 'post'],
            ['standard', 'inlinePost'],
            ['standard', 'reaction'],
            ['custom', 'post'],
            ['custom', 'inlinePost'],
            ['custom', 'reaction'],
        ] as const;

        sizeSections.forEach(([emojiType, preferenceKind]) => {
            const isPostPreference = preferenceKind === 'post' || preferenceKind === 'inlinePost';
            const isEnabled = isPostPreference ? adminConfig.enableEnhancedPostEmojis : adminConfig.enableEnhancedReactionEmojis;
            if (isEnabled) {
                sections.push(createEmojiSizePreferenceSection(emojiType, preferenceKind, translations, normalizedUserPreferences, onSubmit));
            }
        });
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
    userPreferences: EnhancedEmojisUserPreferenceInput | null | undefined,
    currentUserId?: string,
    getCurrentUserPreferences: () => EnhancedEmojisUserPreferenceInput | null | undefined = () => userPreferences,
): void {
    registry.registerUserSettings(createEnhancedEmojisUserSettingsConfig(adminConfig, locale, userPreferences, currentUserId, getCurrentUserPreferences));
}
