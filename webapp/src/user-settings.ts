import {DEFAULT_ENHANCED_EMOJIS_USER_PREFERENCES, normalizeEnhancedEmojisUserPreferences, type EnhancedEmojisConfig, type EnhancedEmojisUserPreferences, type PostEmojiSize, type ReactionEmojiSize} from 'config';
import {getEnhancedEmojisTranslations, type EnhancedEmojisTranslations} from 'i18n';
import manifest from 'manifest';
import React from 'react';
import {useSelector} from 'react-redux';

import type {GlobalState} from '@mattermost/types/store';

import type {PluginConfiguration, PluginConfigurationSetting, PluginRegistry} from 'types/mattermost-webapp';

const USER_PREFERENCES_CATEGORY = `pp_${manifest.id}`;
const USER_ENABLE_PREFERENCE_NAME = 'EnableEnhancedEmojis';

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

function createMessageSettingComponent(message: string): (props: {informChange: (name: string, value: string) => void}) => React.ReactElement {
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

        return React.createElement('button', {
            'aria-checked': enabled,
            'aria-label': translations['enhanced_emojis.settings.enable.title'],
            onClick: toggleEnabled,
            onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    toggleEnabled();
                }
            },
            role: 'switch',
            style: {
                backgroundColor: enabled ? '#1c58d9' : '#d9dbdd',
                border: 0,
                borderRadius: '999px',
                boxShadow: enabled ? 'inset 0 0 0 1px rgba(0, 0, 0, 0.08)' : 'inset 0 0 0 1px rgba(63, 67, 80, 0.16)',
                cursor: 'pointer',
                display: 'inline-block',
                height: '32px',
                padding: '4px',
                position: 'relative',
                transition: 'background-color 120ms ease',
                width: '96px',
            },
            type: 'button',
        }, React.createElement('span', {
            'aria-hidden': 'true',
            style: {
                color: enabled ? '#ffffff' : '#3f4350',
                display: 'flex',
                fontSize: '12px',
                fontWeight: 600,
                height: '100%',
                justifyContent: enabled ? 'flex-start' : 'flex-end',
                letterSpacing: '0.01em',
                lineHeight: '24px',
                paddingLeft: enabled ? '14px' : '0',
                paddingRight: enabled ? '0' : '14px',
                textTransform: 'uppercase',
                width: '100%',
            },
        }, enabled ?
            translations['enhanced_emojis.settings.enable.state.on'] :
            translations['enhanced_emojis.settings.enable.state.off'],
        ),
        React.createElement('span', {
            'aria-hidden': 'true',
            style: {
                backgroundColor: '#ffffff',
                borderRadius: '50%',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.25)',
                display: 'block',
                height: '24px',
                left: '4px',
                position: 'absolute',
                top: '4px',
                transform: enabled ? 'translateX(64px)' : 'translateX(0)',
                transition: 'transform 120ms ease',
                width: '24px',
            },
        }));
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
        sections.push({
            title: translations['enhanced_emojis.settings.posts.title'],
            settings: [
                {
                    type: 'radio',
                    name: 'postEmojiSize',
                    title: translations['enhanced_emojis.settings.posts.size'],
                    helpText: translations['enhanced_emojis.settings.posts.help_text'],
                    default: DEFAULT_ENHANCED_EMOJIS_USER_PREFERENCES.postEmojiSize,
                    options: getPostEmojiSizeOptions(translations),
                },
            ],
        });
    }

    if (normalizedUserPreferences.enableEnhancedEmojis && adminConfig.enableEnhancedReactionEmojis) {
        sections.push({
            title: translations['enhanced_emojis.settings.reactions.title'],
            settings: [
                {
                    type: 'radio',
                    name: 'reactionEmojiSize',
                    title: translations['enhanced_emojis.settings.reactions.size'],
                    helpText: translations['enhanced_emojis.settings.reactions.help_text'],
                    default: DEFAULT_ENHANCED_EMOJIS_USER_PREFERENCES.reactionEmojiSize,
                    options: getReactionEmojiSizeOptions(translations),
                },
            ],
        });
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

export function getEnhancedEmojisUserPreferences(state: GlobalState): EnhancedEmojisUserPreferences {
    const preferences = Object.values(state.entities.preferences.myPreferences ?? {}).filter((preference) => preference.category === USER_PREFERENCES_CATEGORY);
    const preferencesByName = new Map(preferences.map((preference) => [preference.name, preference.value]));

    return normalizeEnhancedEmojisUserPreferences({
        enableEnhancedEmojis: preferencesByName.get(USER_ENABLE_PREFERENCE_NAME) === 'true',
        postEmojiSize: preferencesByName.get('postEmojiSize') as EnhancedEmojisUserPreferences['postEmojiSize'] | undefined,
        reactionEmojiSize: preferencesByName.get('reactionEmojiSize') as EnhancedEmojisUserPreferences['reactionEmojiSize'] | undefined,
    });
}
