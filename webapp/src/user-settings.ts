import {DEFAULT_ENHANCED_EMOJIS_USER_PREFERENCES, normalizeEnhancedEmojisUserPreferences, type EnhancedEmojisConfig, type EnhancedEmojisUserPreferences, type PostEmojiSize, type ReactionEmojiSize} from 'config';
import manifest from 'manifest';
import React from 'react';

import type {GlobalState} from '@mattermost/types/store';

import type {PluginConfiguration, PluginRegistry} from 'types/mattermost-webapp';

const USER_PREFERENCES_CATEGORY = `pp_${manifest.id}`;

const POST_EMOJI_SIZE_OPTIONS: Array<{text: string; value: PostEmojiSize}> = [
    {text: 'Default (32px)', value: 'default'},
    {text: 'Large (48px)', value: 'large'},
    {text: 'Extra Large (64px)', value: 'extraLarge'},
    {text: 'Max (128px)', value: 'maxSize'},
];

const REACTION_EMOJI_SIZE_OPTIONS: Array<{text: string; value: ReactionEmojiSize}> = [
    {text: 'Default (20px)', value: 'default'},
    {text: 'Medium (32px)', value: 'medium'},
    {text: 'Large (64px)', value: 'large'},
    {text: 'Max (128px)', value: 'maxSize'},
];

function NoEnabledFeaturesSection(): React.ReactElement {
    return React.createElement(
        'div',
        null,
        'No Enhanced Emojis features are currently enabled by your administrator.',
    );
}

export function registerEnhancedEmojisUserSettings(registry: PluginRegistry, adminConfig: EnhancedEmojisConfig): void {
    const sections: PluginConfiguration['sections'] = [];

    if (adminConfig.enableEnhancedEmojis) {
        sections.push({
            title: 'Post Emojis',
            settings: [
                {
                    type: 'radio',
                    name: 'postEmojiSize',
                    title: 'Post Emoji Size',
                    helpText: 'Select the size used for custom emojis in post content.',
                    default: DEFAULT_ENHANCED_EMOJIS_USER_PREFERENCES.postEmojiSize,
                    options: POST_EMOJI_SIZE_OPTIONS,
                },
            ],
        });
    }

    if (adminConfig.enableReactionEmojis) {
        sections.push({
            title: 'Reaction Emojis',
            settings: [
                {
                    type: 'radio',
                    name: 'reactionEmojiSize',
                    title: 'Reaction Emoji Size',
                    helpText: 'Select the size used for custom emoji reactions.',
                    default: DEFAULT_ENHANCED_EMOJIS_USER_PREFERENCES.reactionEmojiSize,
                    options: REACTION_EMOJI_SIZE_OPTIONS,
                },
            ],
        });
    }

    if (sections.length === 0) {
        sections.push({
            title: 'Enhanced Emojis',
            component: NoEnabledFeaturesSection,
        });
    }

    const pluginSettings: PluginConfiguration = {
        id: manifest.id,
        uiName: manifest.name,
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
