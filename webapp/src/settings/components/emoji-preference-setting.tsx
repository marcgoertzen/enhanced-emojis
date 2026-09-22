import type {PluginConfiguration} from 'types/mattermost-webapp';

export interface EmojiPreferenceSettingDescriptor<ValueType extends string> {
    settingName: string;
    settingTitle: string;
    helpText: string;
    defaultValue: ValueType;
    options: Array<{ text: string; value: ValueType }>;
}

export interface EmojiPreferenceSectionDescriptor<ValueType extends string> extends EmojiPreferenceSettingDescriptor<ValueType> {
    sectionTitle: string;
    onSubmit?: (changes: { [name: string]: string }) => void;
}

export interface EmojiPreferenceGroupDescriptor {
    sectionTitle: string;
    settings: Array<EmojiPreferenceSettingDescriptor<string>>;
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

export function createEmojiPreferenceGroupSection(
    descriptor: EmojiPreferenceGroupDescriptor,
): PluginConfiguration['sections'][number] {
    return {
        title: descriptor.sectionTitle,
        onSubmit: descriptor.onSubmit,
        settings: descriptor.settings.map((setting) => ({
            type: 'radio' as const,
            name: setting.settingName,
            title: setting.settingTitle,
            helpText: setting.helpText,
            default: setting.defaultValue,
            options: setting.options,
        })),
    };
}
