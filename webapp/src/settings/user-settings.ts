import {
    DEFAULT_ENHANCED_EMOJIS_USER_PREFERENCES,
    INLINE_POST_EMOJI_SIZE_PREFERENCE_NAME,
    POST_EMOJI_SIZE_PREFERENCE_NAME,
    REACTION_EMOJI_SIZE_PREFERENCE_NAME,
    USER_ENABLE_PREFERENCE_NAME,
    getEnhancedEmojisUserPreferences,
    normalizeEnhancedEmojisUserPreferences,
    type EnhancedEmojisConfig,
    type EnhancedEmojisUserPreferences,
    type InlinePostEmojiSize,
    type PostEmojiSize,
    type ReactionEmojiSize,
} from 'config';
import {getEnhancedEmojisTranslations, type EnhancedEmojisTranslations} from 'i18n';
import manifest from 'manifest';
import React from 'react';
import {useSelector} from 'react-redux';

import {createEmojiPreferenceSection} from './components/emoji-preference-setting';
import renderToggleSetting from './components/toggle-setting';

type GlobalState = import('@mattermost/types/store').GlobalState;
type PluginConfiguration = import('types/mattermost-webapp').PluginConfiguration;
type PluginConfigurationSetting = import('types/mattermost-webapp').PluginConfigurationSetting;
type PluginRegistry = import('types/mattermost-webapp').PluginRegistry;

function getPostEmojiSizeOptions(translations: EnhancedEmojisTranslations): Array<{text: string; value: PostEmojiSize}> {
    return [
        {text: translations['enhanced_emojis.settings.posts.option.default'], value: 'default'},
        {text: translations['enhanced_emojis.settings.posts.option.large'], value: 'large'},
        {text: translations['enhanced_emojis.settings.posts.option.extra_large'], value: 'extraLarge'},
        {text: translations['enhanced_emojis.settings.posts.option.max'], value: 'maxSize'},
    ];
}

function getReactionEmojiSizeOptions(translations: EnhancedEmojisTranslations): Array<{text: string; value: ReactionEmojiSize}> {
    return [
        {text: translations['enhanced_emojis.settings.reactions.option.default'], value: 'default'},
        {text: translations['enhanced_emojis.settings.reactions.option.medium'], value: 'medium'},
        {text: translations['enhanced_emojis.settings.reactions.option.large'], value: 'large'},
        {text: translations['enhanced_emojis.settings.reactions.option.max'], value: 'maxSize'},
    ];
}

function getInlinePostEmojiSizeOptions(translations: EnhancedEmojisTranslations): Array<{text: string; value: InlinePostEmojiSize}> {
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

export function createEnableEnhancedEmojisSettingComponent(
    translations: EnhancedEmojisTranslations,
): (props: {informChange: (name: string, value: string) => void}) => React.ReactElement {
    return function EnableEnhancedEmojisSetting({informChange}: {informChange: (name: string, value: string) => void}): React.ReactElement {
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
): PluginConfiguration {
    const translations = getEnhancedEmojisTranslations(locale);
    const normalizedUserPreferences = normalizeEnhancedEmojisUserPreferences(userPreferences);
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

    sections.push({
        title: translations['enhanced_emojis.settings.title'],
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
        }));

        sections.push(createEmojiPreferenceSection({
            sectionTitle: translations['enhanced_emojis.settings.posts.inline.title'],
            settingName: INLINE_POST_EMOJI_SIZE_PREFERENCE_NAME,
            settingTitle: translations['enhanced_emojis.settings.posts.inline.size'],
            helpText: translations['enhanced_emojis.settings.posts.inline.help_text'],
            defaultValue: DEFAULT_ENHANCED_EMOJIS_USER_PREFERENCES.inlinePostEmojiSize,
            options: getInlinePostEmojiSizeOptions(translations),
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
        }));
    }

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
): void {
    registry.registerUserSettings(createEnhancedEmojisUserSettingsConfig(adminConfig, locale, userPreferences));
}
