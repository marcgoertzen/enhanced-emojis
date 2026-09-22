import {
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
            'Standard Emoji Post Size',
            'Standard Emoji Inline Post Size',
            'Standard Emoji Reaction Size',
            'Custom Emoji Post Size',
            'Custom Emoji Inline Post Size',
            'Custom Emoji Reaction Size',
        ]);
        expect(settings.sections.flatMap((section: {settings: Array<{name?: string}>}) => section.settings).map((setting: {name?: string}) => setting.name)).not.toContain('enableStandardEmojis');
        expect(settings.sections.slice(1).every((section: {settings: Array<{name?: string}>}) => section.settings)).toBe(true);
        expect(settings.sections.slice(1).map((section: {settings: Array<{name?: string}>}) => section.settings[0].name)).toEqual([
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
        (settings.sections[1] as {onSubmit?: (changes: {[name: string]: string}) => void}).onSubmit?.({standardPostEmojiSize: 'maxSize'});
        await Promise.resolve();
        expect(mockedSavePreferences).toHaveBeenCalledWith('user-id', [
            {user_id: 'user-id', category: 'enhanced_emojis', name: 'standardPostEmojiSize', value: 'maxSize'},
        ]);
    });

    test('saving custom reaction sends only the custom reaction preference', async () => {
        mockedSavePreferences.mockResolvedValue({status: 'OK'} as never);
        const settings = createEnhancedEmojisUserSettingsConfig({enableEnhancedPostEmojis: true, enableEnhancedReactionEmojis: true, enableDeveloperMode: false}, 'en', sizes, 'user-id');
        (settings.sections[6] as {onSubmit?: (changes: {[name: string]: string}) => void}).onSubmit?.({customReactionEmojiSize: 'maxSize'});
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
            'Standard Emoji Reaction Size',
            'Custom Emoji Post Size',
            'Custom Emoji Inline Post Size',
        ]);
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
