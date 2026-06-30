import {DEFAULT_ENHANCED_EMOJIS_USER_PREFERENCES, normalizeEnhancedEmojisUserPreferences, type EnhancedEmojisUserPreferences} from 'config';
import manifest from 'manifest';

import type {GlobalState} from '@mattermost/types/store';

import type {PluginConfiguration, PluginRegistry} from 'types/mattermost-webapp';

const USER_PREFERENCES_CATEGORY = `pp_${manifest.id}`;

const EMOJI_SIZE_OPTIONS = [
    {text: 'Default (32px)', value: 'default'},
    {text: 'Small (24px)', value: 'small'},
    {text: 'Large (40px)', value: 'large'},
    {text: 'Extra Large (48px)', value: 'extraLarge'},
    {text: 'Max (128px)', value: 'maxSize'},
];

export function registerEnhancedEmojisUserSettings(registry: PluginRegistry): void {
    const pluginSettings: PluginConfiguration = {
        id: manifest.id,
        uiName: manifest.name,
        sections: [
            {
                title: 'Enhanced Emojis',
                settings: [
                    {
                        type: 'radio',
                        name: 'postEmojiSize',
                        title: 'Post Emoji Size',
                        helpText: 'Select the size used for custom emojis in post content.',
                        default: DEFAULT_ENHANCED_EMOJIS_USER_PREFERENCES.postEmojiSize,
                        options: EMOJI_SIZE_OPTIONS,
                    },
                    {
                        type: 'radio',
                        name: 'reactionEmojiSize',
                        title: 'Reaction Emoji Size',
                        helpText: 'Select the size used for custom emoji reactions.',
                        default: DEFAULT_ENHANCED_EMOJIS_USER_PREFERENCES.reactionEmojiSize,
                        options: EMOJI_SIZE_OPTIONS,
                    },
                ],
            },
        ],
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
