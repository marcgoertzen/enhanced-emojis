import type {PluginConfiguration} from 'types/mattermost-webapp';

export interface EmojiPreferenceSectionDescriptor<ValueType extends string> {
    sectionTitle: string;
    settingName: string;
    settingTitle: string;
    helpText: string;
    defaultValue: ValueType;
    options: Array<{ text: string; value: ValueType }>;
    onSubmit?: (changes: { [name: string]: string }) => void;
}

export function createEmojiPreferenceSection<ValueType extends string>(
    descriptor: EmojiPreferenceSectionDescriptor<ValueType>,
): PluginConfiguration['sections'][number] {
    return {
        title: descriptor.sectionTitle,
        onSubmit: descriptor.onSubmit,
        settings: [
            {
                type: 'radio',
                name: descriptor.settingName,
                title: descriptor.settingTitle,
                helpText: descriptor.helpText,
                default: descriptor.defaultValue,
                options: descriptor.options,
            },
        ],
    };
}
