import {DEFAULT_ENHANCED_EMOJIS_USER_PREFERENCES, normalizeEnhancedEmojisUserPreferences, type EnhancedEmojisConfig, type EnhancedEmojisUserPreferences, type PostEmojiSize, type ReactionEmojiSize} from 'config';
import {getEnhancedEmojisTranslations, type EnhancedEmojisTranslations} from 'i18n';
import manifest from 'manifest';
import React from 'react';

import type {GlobalState} from '@mattermost/types/store';

import type {PluginConfiguration, PluginRegistry} from 'types/mattermost-webapp';

const USER_PREFERENCES_CATEGORY = `pp_${manifest.id}`;

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

function createNoEnabledFeaturesSection(message: string): React.ComponentType {
    return function NoEnabledFeaturesSection(): React.ReactElement {
        return React.createElement('div', null, message);
    };
}

export function registerEnhancedEmojisUserSettings(registry: PluginRegistry, adminConfig: EnhancedEmojisConfig, locale: string): void {
    const translations = getEnhancedEmojisTranslations(locale);
    const sections: PluginConfiguration['sections'] = [];

    if (adminConfig.enableEnhancedPostEmojis) {
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

    if (adminConfig.enableEnhancedReactionEmojis) {
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

    if (sections.length === 0) {
        sections.push({
            title: translations['enhanced_emojis.settings.title'],
            component: createNoEnabledFeaturesSection(translations['enhanced_emojis.settings.no_features_enabled']),
        });
    }

    const pluginSettings: PluginConfiguration = {
        id: manifest.id,
        uiName: translations['enhanced_emojis.settings.title'],
        sections,
    };

    registry.registerUserSettings(pluginSettings);
}

export function getEnhancedEmojisUserPreferences(state: GlobalState): EnhancedEmojisUserPreferences {
    const preferences = Object.values(state.entities.preferences.myPreferences ?? {}).filter((preference) => preference.category === USER_PREFERENCES_CATEGORY);
    const preferencesByName = new Map(preferences.map((preference) => [preference.name, preference.value]));

    return normalizeEnhancedEmojisUserPreferences({
        postEmojiSize: preferencesByName.get('postEmojiSize') as EnhancedEmojisUserPreferences['postEmojiSize'] | undefined,
        reactionEmojiSize: preferencesByName.get('reactionEmojiSize') as EnhancedEmojisUserPreferences['reactionEmojiSize'] | undefined,
    });
}
