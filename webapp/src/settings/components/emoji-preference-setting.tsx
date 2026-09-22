import React from 'react';

import type {PluginConfiguration} from 'types/mattermost-webapp';

import {
    getEmojiSizeDraft,
    resetEmojiSizeDraft,
    subscribeToEmojiSizeDraft,
    updateEmojiSizeDraft,
} from './emoji-size-draft';

export interface EmojiPreferenceSettingDescriptor<ValueType extends string> {
    settingName: string;
    settingTitle: string;
    helpText: string;
    defaultValue: ValueType;
    options: Array<{ text: string; value: ValueType }>;
    onValueChange?: (value: ValueType, informChange: (name: string, value: string) => void) => void;
}

export interface EmojiPreferenceSectionDescriptor<ValueType extends string> extends EmojiPreferenceSettingDescriptor<ValueType> {
    sectionTitle: string;
    onSubmit?: (changes: { [name: string]: string }) => void;
}

function createEmojiPreferenceComponent<ValueType extends string>(
    descriptor: EmojiPreferenceSettingDescriptor<ValueType>,
): (props: {informChange: (name: string, value: string) => void}) => React.ReactElement {
    return function EmojiPreferenceSetting({informChange}: {informChange: (name: string, value: string) => void}): React.ReactElement {
        const getDraftValue = (): ValueType => {
            const draftValue = getEmojiSizeDraft()[descriptor.settingName as keyof ReturnType<typeof getEmojiSizeDraft>] as ValueType | undefined;
            return draftValue ?? descriptor.defaultValue;
        };
        const [selectedValue, setSelectedValue] = React.useState<ValueType>(getDraftValue());

        React.useEffect(() => {
            const unsubscribe = subscribeToEmojiSizeDraft(() => {
                if (!descriptor.onValueChange) {
                    setSelectedValue(getDraftValue());
                }
            });
            return () => {
                unsubscribe();
                resetEmojiSizeDraft();
            };
        }, []);

        const selectValue = (value: ValueType): void => {
            setSelectedValue(value);
            if (descriptor.onValueChange) {
                descriptor.onValueChange(value, informChange);
                return;
            }

            updateEmojiSizeDraft({[descriptor.settingName]: value});
            informChange(descriptor.settingName, value);
        };

        return React.createElement('div', {className: 'enhanced-emojis-preference-setting'},
            React.createElement('div', {
                'aria-label': descriptor.settingTitle,
                className: 'enhanced-emojis-preference-setting__options',
                role: 'radiogroup',
            }, descriptor.options.map((option) => {
                const optionId = `enhanced-emojis-${descriptor.settingName}-${option.value}`;
                return React.createElement('div', {key: option.value, className: 'enhanced-emojis-preference-setting__option'},
                    React.createElement('input', {
                        checked: selectedValue === option.value,
                        id: optionId,
                        name: descriptor.settingName,
                        onChange: () => selectValue(option.value),
                        type: 'radio',
                        value: option.value,
                    }),
                    React.createElement('label', {htmlFor: optionId}, option.text),
                );
            })),
            React.createElement('p', {className: 'enhanced-emojis-preference-setting__help'}, descriptor.helpText),
        );
    };
}

export function createEmojiPreferenceSection<ValueType extends string>(
    descriptor: EmojiPreferenceSectionDescriptor<ValueType>,
): PluginConfiguration['sections'][number] {
    return {
        title: descriptor.sectionTitle,
        onSubmit: descriptor.onSubmit,
        settings: [
            {
                type: 'custom',
                name: descriptor.settingName,
                title: descriptor.settingTitle,
                helpText: descriptor.helpText,
                default: descriptor.defaultValue,
                component: createEmojiPreferenceComponent(descriptor),
            },
        ],
    };
}
