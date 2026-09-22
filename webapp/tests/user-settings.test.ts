import {
    getEmojiSizePresetValues,
    buildEnhancedEmojisPreferenceSavePayload,
    createEnhancedEmojisPreferenceSavePayload,
    getEnhancedEmojisUserPreferences,
} from 'config';
import {getEnhancedEmojisTranslations} from 'i18n';
import React from 'react';
import {useSelector} from 'react-redux';
import {
    createEnhancedEmojisUserSettingsConfig,
    createMasterEnableSettingComponent,
    registerEnhancedEmojisUserSettings,
} from 'settings';

import {Client4} from 'mattermost-redux/client';

jest.mock('react-redux', () => ({useSelector: jest.fn()}));
jest.mock('mattermost-redux/client', () => ({Client4: {savePreferences: jest.fn()}}));

const mockedUseSelector = useSelector as jest.MockedFunction<typeof useSelector>;
const mockedSavePreferences = Client4.savePreferences as jest.MockedFunction<typeof Client4.savePreferences>;

const sizes = {
    enableEnhancedEmojis: true,
    standardPostEmojiSize: 'large' as const,
    standardInlinePostEmojiSize: 'medium' as const,
    standardReactionEmojiSize: 'maxSize' as const,
    customPostEmojiSize: 'default' as const,
    customInlinePostEmojiSize: 'extraLarge' as const,
    customReactionEmojiSize: 'large' as const,
};

function registry() {
    return {registerUserSettings: jest.fn()};
}

function registeredSettings(target: ReturnType<typeof registry>) {
    expect(target.registerUserSettings).toHaveBeenCalledTimes(1);
    return target.registerUserSettings.mock.calls[0][0];
}

describe('user preference migration and persistence', () => {
    test('copies legacy shared sizes to both emoji types', () => {
        expect(getEnhancedEmojisUserPreferences({
            entities: {
                preferences: {
                    myPreferences: {
                        enabled: {category: 'enhanced_emojis', name: 'enableEnhancedEmojis', value: 'true'},
                        post: {category: 'enhanced_emojis', name: 'postEmojiSize', value: 'large'},
                        inline: {category: 'enhanced_emojis', name: 'inlinePostEmojiSize', value: 'medium'},
                        reaction: {category: 'enhanced_emojis', name: 'reactionEmojiSize', value: 'maxSize'},
                        oldToggle: {category: 'enhanced_emojis', name: 'enableStandardEmojis', value: 'false'},
                    },
                },
            },
        } as never)).toEqual({
            enableEnhancedEmojis: true,
            standardPostEmojiSize: 'large',
            standardInlinePostEmojiSize: 'medium',
            standardReactionEmojiSize: 'maxSize',
            customPostEmojiSize: 'large',
            customInlinePostEmojiSize: 'medium',
            customReactionEmojiSize: 'maxSize',
        });
    });

    test('new values remain independent and obsolete standard toggle is ignored', () => {
        const next = buildEnhancedEmojisPreferenceSavePayload('user-id', sizes, {name: 'standardPostEmojiSize', value: 'maxSize'});
        expect(next.nextPreferences.standardPostEmojiSize).toBe('maxSize');
        expect(next.nextPreferences.customPostEmojiSize).toBe('default');
        expect(createEnhancedEmojisPreferenceSavePayload('user-id', next.nextPreferences)).toEqual([
            {user_id: 'user-id', category: 'enhanced_emojis', name: 'enableEnhancedEmojis', value: 'true'},
            {user_id: 'user-id', category: 'enhanced_emojis', name: 'standardPostEmojiSize', value: 'maxSize'},
            {user_id: 'user-id', category: 'enhanced_emojis', name: 'standardInlinePostEmojiSize', value: 'medium'},
            {user_id: 'user-id', category: 'enhanced_emojis', name: 'standardReactionEmojiSize', value: 'maxSize'},
            {user_id: 'user-id', category: 'enhanced_emojis', name: 'customPostEmojiSize', value: 'default'},
            {user_id: 'user-id', category: 'enhanced_emojis', name: 'customInlinePostEmojiSize', value: 'extraLarge'},
            {user_id: 'user-id', category: 'enhanced_emojis', name: 'customReactionEmojiSize', value: 'large'},
        ]);
    });
});

describe('settings UI', () => {
    beforeEach(() => {
        mockedSavePreferences.mockReset();
        mockedUseSelector.mockReset();
    });

    test('shows master, standard, and custom sections with six independent controls', () => {
        const target = registry();
        registerEnhancedEmojisUserSettings(target as never, {enableEnhancedPostEmojis: true, enableEnhancedReactionEmojis: true, enableDeveloperMode: false}, 'en', sizes);
        const settings = registeredSettings(target);
        expect(settings.sections.map((section: {title: string}) => section.title)).toEqual([
            'Enhanced Emojis',
            'Emoji Size Preset',
            'Standard Emoji Post Size',
            'Standard Emoji Inline Post Size',
            'Standard Emoji Reaction Size',
            'Custom Emoji Post Size',
            'Custom Emoji Inline Post Size',
            'Custom Emoji Reaction Size',
        ]);
        expect(settings.sections.flatMap((section: {settings: Array<{name?: string}>}) => section.settings).map((setting: {name?: string}) => setting.name)).not.toContain('enableStandardEmojis');
        expect(settings.sections.slice(2).every((section: {settings: Array<{name?: string}>}) => section.settings)).toBe(true);
        expect(settings.sections.slice(2).map((section: {settings: Array<{name?: string}>}) => section.settings[0].name)).toEqual([
            'standardPostEmojiSize',
            'standardInlinePostEmojiSize',
            'standardReactionEmojiSize',
            'customPostEmojiSize',
            'customInlinePostEmojiSize',
            'customReactionEmojiSize',
        ]);
    });

    test('hides size sections while master switch is disabled', () => {
        const target = registry();
        registerEnhancedEmojisUserSettings(target as never, {enableEnhancedPostEmojis: true, enableEnhancedReactionEmojis: true, enableDeveloperMode: false}, 'en', {...sizes, enableEnhancedEmojis: false});
        expect(registeredSettings(target).sections).toHaveLength(1);
    });

    test('saving one size persists only that preference', async () => {
        mockedSavePreferences.mockResolvedValue({status: 'OK'} as never);
        const settings = createEnhancedEmojisUserSettingsConfig({enableEnhancedPostEmojis: true, enableEnhancedReactionEmojis: true, enableDeveloperMode: false}, 'en', sizes, 'user-id');
        (settings.sections[2] as {onSubmit?: (changes: {[name: string]: string}) => void}).onSubmit?.({standardPostEmojiSize: 'maxSize'});
        await Promise.resolve();
        expect(mockedSavePreferences).toHaveBeenCalledWith('user-id', [
            {user_id: 'user-id', category: 'enhanced_emojis', name: 'standardPostEmojiSize', value: 'maxSize'},
        ]);
    });

    test('saving custom reaction sends only the custom reaction preference', async () => {
        mockedSavePreferences.mockResolvedValue({status: 'OK'} as never);
        const settings = createEnhancedEmojisUserSettingsConfig({enableEnhancedPostEmojis: true, enableEnhancedReactionEmojis: true, enableDeveloperMode: false}, 'en', sizes, 'user-id');
        (settings.sections[7] as {onSubmit?: (changes: {[name: string]: string}) => void}).onSubmit?.({customReactionEmojiSize: 'maxSize'});
        await Promise.resolve();
        expect(mockedSavePreferences).toHaveBeenCalledWith('user-id', [
            {user_id: 'user-id', category: 'enhanced_emojis', name: 'customReactionEmojiSize', value: 'maxSize'},
        ]);
    });

    test('admin gating hides post rows without hiding reactions', () => {
        const target = registry();
        registerEnhancedEmojisUserSettings(target as never, {enableEnhancedPostEmojis: false, enableEnhancedReactionEmojis: true, enableDeveloperMode: false}, 'en', sizes);
        expect(registeredSettings(target).sections.map((section: {title: string}) => section.title)).toEqual([
            'Enhanced Emojis',
            'Emoji Size Preset',
            'Standard Emoji Reaction Size',
            'Custom Emoji Reaction Size',
        ]);
    });

    test('explicit custom and standard gates control their own size rows', () => {
        const target = registry();
        registerEnhancedEmojisUserSettings(target as never, {
            enableCustomPostEmojis: true,
            enableCustomReactionEmojis: false,
            enableStandardPostEmojis: false,
            enableStandardReactionEmojis: true,
            enableDeveloperMode: false,
        }, 'en', sizes);
        expect(registeredSettings(target).sections.map((section: {title: string}) => section.title)).toEqual([
            'Enhanced Emojis',
            'Emoji Size Preset',
            'Standard Emoji Reaction Size',
            'Custom Emoji Post Size',
            'Custom Emoji Inline Post Size',
        ]);
    });

    test('saving a preset persists all six size preferences', async () => {
        mockedSavePreferences.mockResolvedValue({status: 'OK'} as never);
        const settings = createEnhancedEmojisUserSettingsConfig({enableEnhancedPostEmojis: true, enableEnhancedReactionEmojis: true, enableDeveloperMode: false}, 'en', sizes, 'user-id');
        (settings.sections[1] as {onSubmit?: (changes: {[name: string]: string}) => void}).onSubmit?.({emojiSizePreset: 'balanced'});
        await Promise.resolve();
        const expected = getEmojiSizePresetValues('balanced');
        expect(mockedSavePreferences).toHaveBeenCalledWith('user-id', expect.arrayContaining([
            {user_id: 'user-id', category: 'enhanced_emojis', name: 'standardPostEmojiSize', value: expected.standardPostEmojiSize},
            {user_id: 'user-id', category: 'enhanced_emojis', name: 'standardInlinePostEmojiSize', value: expected.standardInlinePostEmojiSize},
            {user_id: 'user-id', category: 'enhanced_emojis', name: 'standardReactionEmojiSize', value: expected.standardReactionEmojiSize},
            {user_id: 'user-id', category: 'enhanced_emojis', name: 'customPostEmojiSize', value: expected.customPostEmojiSize},
            {user_id: 'user-id', category: 'enhanced_emojis', name: 'customInlinePostEmojiSize', value: expected.customInlinePostEmojiSize},
            {user_id: 'user-id', category: 'enhanced_emojis', name: 'customReactionEmojiSize', value: expected.customReactionEmojiSize},
        ]));
    });

    test.each(['compact', 'balanced', 'large'] as const)('selecting %s updates all six rows in the shared draft', (preset) => {
        const settings = createEnhancedEmojisUserSettingsConfig({enableEnhancedPostEmojis: true, enableEnhancedReactionEmojis: true, enableDeveloperMode: false}, 'en', sizes, 'user-id');
        const useStateSpy = jest.spyOn(React, 'useState');
        (useStateSpy as jest.Mock).mockImplementation((initial: unknown) => [initial, jest.fn()]);
        const useEffectSpy = jest.spyOn(React, 'useEffect').mockImplementation(() => undefined);
        try {
            const presetSetting = (settings.sections[1] as {settings: Array<{component: (props: {informChange: (name: string, value: string) => void}) => React.ReactElement}>}).settings[0];
            const presetElement = presetSetting.component({informChange: jest.fn()});
            const options = presetElement.props.children[0].props.children as React.ReactElement[];
            options.find((option) => option.props.children[0].props.value === preset)?.props.children[0].props.onChange();

            const expected = getEmojiSizePresetValues(preset);
            for (const [index, name] of ['standardPostEmojiSize', 'standardInlinePostEmojiSize', 'standardReactionEmojiSize', 'customPostEmojiSize', 'customInlinePostEmojiSize', 'customReactionEmojiSize'].entries()) {
                const setting = settings.sections[index + 2] as {settings: Array<{component: (props: {informChange: (name: string, value: string) => void}) => React.ReactElement}>};
                const element = setting.settings[0].component({informChange: jest.fn()});
                const rows = element.props.children[0].props.children as React.ReactElement[];
                expect(rows.find((row) => row.props.children[0].props.checked)?.props.children[0].props.value).toBe(expected[name as keyof typeof expected]);
            }
        } finally {
            useStateSpy.mockRestore();
            useEffectSpy.mockRestore();
        }
    });

    test.each(['compact', 'balanced', 'large', 'custom'] as const)('preset radio selection changes immediately to %s', (preset) => {
        const settings = createEnhancedEmojisUserSettingsConfig({enableEnhancedPostEmojis: true, enableEnhancedReactionEmojis: true, enableDeveloperMode: false}, 'en', sizes, 'user-id');
        let currentValue: unknown;
        const useStateSpy = jest.spyOn(React, 'useState');
        (useStateSpy as jest.Mock).mockImplementation((initial: unknown) => {
            currentValue ??= initial;
            return [currentValue, (nextValue: unknown) => {
                currentValue = typeof nextValue === 'function' ? (nextValue as (value: unknown) => unknown)(currentValue) : nextValue;
            }];
        });
        const useEffectSpy = jest.spyOn(React, 'useEffect').mockImplementation(() => undefined);
        try {
            const setting = (settings.sections[1] as {settings: Array<{component: (props: {informChange: (name: string, value: string) => void}) => React.ReactElement}>}).settings[0];
            const render = (): React.ReactElement => setting.component({informChange: jest.fn()});
            const initial = render();
            const option = (initial.props.children[0].props.children as React.ReactElement[]).find((row) => row.props.children[0].props.value === preset);
            option?.props.children[0].props.onChange();
            const updated = render();
            const selected = (updated.props.children[0].props.children as React.ReactElement[]).find((row) => row.props.children[0].props.checked);
            expect(selected?.props.children[0].props.value).toBe(preset);
        } finally {
            useStateSpy.mockRestore();
            useEffectSpy.mockRestore();
        }
    });

    test('preset saves retain values for settings hidden by admin gates', async () => {
        mockedSavePreferences.mockResolvedValue({status: 'OK'} as never);
        const settings = createEnhancedEmojisUserSettingsConfig({
            enableCustomPostEmojis: false,
            enableCustomReactionEmojis: false,
            enableStandardPostEmojis: true,
            enableStandardReactionEmojis: false,
            enableDeveloperMode: false,
        }, 'en', sizes, 'user-id');
        (settings.sections[1] as {onSubmit?: (changes: {[name: string]: string}) => void}).onSubmit?.({emojiSizePreset: 'large'});
        await Promise.resolve();
        expect(mockedSavePreferences.mock.calls[0][1]).toHaveLength(6);
        expect(mockedSavePreferences.mock.calls[0][1].map((preference) => preference.name)).toEqual([
            'standardPostEmojiSize',
            'standardInlinePostEmojiSize',
            'standardReactionEmojiSize',
            'customPostEmojiSize',
            'customInlinePostEmojiSize',
            'customReactionEmojiSize',
        ]);
    });

    test('renders size options vertically with explicitly associated radio labels', () => {
        const settings = createEnhancedEmojisUserSettingsConfig({enableEnhancedPostEmojis: true, enableEnhancedReactionEmojis: true, enableDeveloperMode: false}, 'en', sizes);
        const setting = (settings.sections[2] as {settings: Array<{component: (props: {informChange: (name: string, value: string) => void}) => React.ReactElement}>}).settings[0];
        const useStateSpy = jest.spyOn(React, 'useState');
        (useStateSpy as jest.Mock).mockImplementation((initial: unknown) => [initial, jest.fn()]);
        const useEffectSpy = jest.spyOn(React, 'useEffect').mockImplementation(() => undefined);
        try {
            const rendered = setting.component({informChange: jest.fn()});
            const options = rendered.props.children[0].props.children as React.ReactElement[];
            expect(options).toHaveLength(4);
            options.forEach((option) => {
                const input = option.props.children[0] as React.ReactElement;
                const label = option.props.children[1] as React.ReactElement;
                expect(input.type).toBe('input');
                expect(label.type).toBe('label');
                expect(input.props.id).toBe(label.props.htmlFor);
            });
        } finally {
            useStateSpy.mockRestore();
            useEffectSpy.mockRestore();
        }
    });

    test.each([
        ['compact', {...sizes, standardPostEmojiSize: 'default', standardInlinePostEmojiSize: 'default', standardReactionEmojiSize: 'default', customPostEmojiSize: 'default', customInlinePostEmojiSize: 'default', customReactionEmojiSize: 'default'}],
        ['balanced', {...sizes, standardPostEmojiSize: 'large', standardInlinePostEmojiSize: 'medium', standardReactionEmojiSize: 'medium', customPostEmojiSize: 'large', customInlinePostEmojiSize: 'medium', customReactionEmojiSize: 'medium'}],
        ['large', {...sizes, standardPostEmojiSize: 'extraLarge', standardInlinePostEmojiSize: 'large', standardReactionEmojiSize: 'large', customPostEmojiSize: 'extraLarge', customInlinePostEmojiSize: 'large', customReactionEmojiSize: 'large'}],
        ['custom', sizes],
    ] as const)('preset row default reflects the derived %s value', (preset, preferences) => {
        const settings = createEnhancedEmojisUserSettingsConfig({enableEnhancedPostEmojis: true, enableEnhancedReactionEmojis: true, enableDeveloperMode: false}, 'en', preferences);
        expect((settings.sections[1] as {settings: Array<{default?: string}>}).settings[0].default).toBe(preset);
    });

    test('selecting Custom does not overwrite existing values', async () => {
        const settings = createEnhancedEmojisUserSettingsConfig({enableEnhancedPostEmojis: true, enableEnhancedReactionEmojis: true, enableDeveloperMode: false}, 'en', sizes, 'user-id');
        (settings.sections[1] as {onSubmit?: (changes: {[name: string]: string}) => void}).onSubmit?.({emojiSizePreset: 'custom'});
        await Promise.resolve();
        expect(mockedSavePreferences).not.toHaveBeenCalled();
    });

    test('canceling a preset edit does not persist changes', () => {
        const settings = createEnhancedEmojisUserSettingsConfig({enableEnhancedPostEmojis: true, enableEnhancedReactionEmojis: true, enableDeveloperMode: false}, 'en', sizes, 'user-id');
        expect((settings.sections[1] as {onSubmit?: unknown}).onSubmit).toEqual(expect.any(Function));
        expect(mockedSavePreferences).not.toHaveBeenCalled();
    });

    test('master toggle remains the only boolean preference', () => {
        mockedUseSelector.mockReturnValue(false);
        jest.spyOn(React, 'useState').mockReturnValue([false, jest.fn()]);
        jest.spyOn(React, 'useEffect').mockImplementation(() => undefined);
        const Component = createMasterEnableSettingComponent(getEnhancedEmojisTranslations('en'));
        const informChange = jest.fn();
        const rendered = Component({informChange});
        rendered.props.onClick();
        expect(informChange).toHaveBeenCalledWith('enableEnhancedEmojis', 'true');
    });
});
