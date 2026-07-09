import {
    buildEnhancedEmojisPreferenceSavePayload,
    createEnhancedEmojisPreferenceSavePayload,
    getEnhancedEmojisUserPreferences,
} from 'config';
import * as enhancedEmojisDebug from 'debug/enhanced-emojis-debug';
import {getEnhancedEmojisTranslations} from 'i18n';
import React from 'react';
import {useSelector} from 'react-redux';
import {
    createEnableEnhancedEmojisSettingComponent,
    createEnhancedEmojisUserSettingsConfig,
    registerEnhancedEmojisUserSettings,
} from 'settings';

import {Client4} from 'mattermost-redux/client';

jest.mock('react-redux', () => ({
    useSelector: jest.fn(),
}));

jest.mock('mattermost-redux/client', () => ({
    Client4: {
        savePreferences: jest.fn(),
    },
}));

function makeRegistry() {
    return {
        registerUserSettings: jest.fn(),
    };
}

function getRegisteredSettings(registry: ReturnType<typeof makeRegistry>) {
    expect(registry.registerUserSettings).toHaveBeenCalledTimes(1);
    return registry.registerUserSettings.mock.calls[0][0];
}

const mockedSavePreferences = Client4.savePreferences as jest.MockedFunction<typeof Client4.savePreferences>;
const mockedDebugLog = jest.spyOn(enhancedEmojisDebug, 'debugLog');
const mockedDebugError = jest.spyOn(enhancedEmojisDebug, 'debugError');

describe('registerEnhancedEmojisUserSettings', () => {
    test.each([
        {
            name: 'post enabled / reactions enabled / user enabled',
            locale: 'en',
            adminConfig: {
                enableEnhancedPostEmojis: true,
                enableEnhancedReactionEmojis: true,
                enableDeveloperMode: false,
            },
            userPreferences: {
                enableEnhancedEmojis: true,
                postEmojiSize: 'default' as const,
                inlinePostEmojiSize: 'default' as const,
                reactionEmojiSize: 'default' as const,
            },
            expectedSectionKeys: [
                'enhanced_emojis.settings.title',
                'enhanced_emojis.settings.posts.title',
                'enhanced_emojis.settings.posts.inline.title',
                'enhanced_emojis.settings.reactions.title',
            ],
        },
        {
            name: 'post enabled / reactions disabled / user enabled',
            locale: 'de',
            adminConfig: {
                enableEnhancedPostEmojis: true,
                enableEnhancedReactionEmojis: false,
                enableDeveloperMode: false,
            },
            userPreferences: {
                enableEnhancedEmojis: true,
                postEmojiSize: 'default' as const,
                inlinePostEmojiSize: 'default' as const,
                reactionEmojiSize: 'default' as const,
            },
            expectedSectionKeys: [
                'enhanced_emojis.settings.title',
                'enhanced_emojis.settings.posts.title',
                'enhanced_emojis.settings.posts.inline.title',
            ],
        },
        {
            name: 'post disabled / reactions enabled / user enabled',
            locale: 'fr',
            adminConfig: {
                enableEnhancedPostEmojis: false,
                enableEnhancedReactionEmojis: true,
                enableDeveloperMode: false,
            },
            userPreferences: {
                enableEnhancedEmojis: true,
                postEmojiSize: 'default' as const,
                inlinePostEmojiSize: 'default' as const,
                reactionEmojiSize: 'default' as const,
            },
            expectedSectionKeys: ['enhanced_emojis.settings.title', 'enhanced_emojis.settings.reactions.title'],
        },
        {
            name: 'admin enabled / user disabled',
            locale: 'en',
            adminConfig: {
                enableEnhancedPostEmojis: true,
                enableEnhancedReactionEmojis: true,
                enableDeveloperMode: false,
            },
            userPreferences: {
                enableEnhancedEmojis: false,
                postEmojiSize: 'default' as const,
                inlinePostEmojiSize: 'default' as const,
                reactionEmojiSize: 'default' as const,
            },
            expectedSectionKeys: ['enhanced_emojis.settings.title'],
        },
        {
            name: 'both disabled / user enabled',
            locale: 'de',
            adminConfig: {
                enableEnhancedPostEmojis: false,
                enableEnhancedReactionEmojis: false,
                enableDeveloperMode: false,
            },
            userPreferences: {
                enableEnhancedEmojis: true,
                postEmojiSize: 'default' as const,
                inlinePostEmojiSize: 'default' as const,
                reactionEmojiSize: 'default' as const,
            },
            expectedSectionKeys: ['enhanced_emojis.settings.title'],
        },
    ])('shows the correct sections for $name', ({adminConfig, expectedSectionKeys, locale, userPreferences}) => {
        const translations = getEnhancedEmojisTranslations(locale);
        const registry = makeRegistry();

        registerEnhancedEmojisUserSettings(registry as never, adminConfig, locale, userPreferences);

        const settings = getRegisteredSettings(registry);
        expect(settings.id).toBe('io.github.marcgoertzen.enhanced-emojis');
        expect(settings.uiName).toBe(translations['enhanced_emojis.settings.title']);
        expect(settings.sections).toHaveLength(expectedSectionKeys.length);
        expect(settings.sections.map((section: { title: string }) => section.title)).toEqual(
            expectedSectionKeys.map((key) => translations[key as keyof typeof translations]),
        );

        expect(settings.sections[0]).toEqual(expect.objectContaining({
            title: translations['enhanced_emojis.settings.title'],
            settings: expect.arrayContaining([
                expect.objectContaining({
                    title: translations['enhanced_emojis.settings.enable.title'],
                    helpText: translations['enhanced_emojis.settings.enable.help_text'],
                }),
            ]),
        }));

        if (userPreferences.enableEnhancedEmojis && adminConfig.enableEnhancedPostEmojis) {
            const postSection = settings.sections.find((section: {
                title: string;
            }) => section.title === translations['enhanced_emojis.settings.posts.title']);
            expect(postSection).toMatchObject({
                title: translations['enhanced_emojis.settings.posts.title'],
                settings: [
                    expect.objectContaining({
                        title: translations['enhanced_emojis.settings.posts.size'],
                        helpText: translations['enhanced_emojis.settings.posts.help_text'],
                        options: [
                            expect.objectContaining({text: translations['enhanced_emojis.settings.posts.option.default']}),
                            expect.objectContaining({text: translations['enhanced_emojis.settings.posts.option.large']}),
                            expect.objectContaining({text: translations['enhanced_emojis.settings.posts.option.extra_large']}),
                            expect.objectContaining({text: translations['enhanced_emojis.settings.posts.option.max']}),
                        ],
                    }),
                ],
            });

            const inlinePostSection = settings.sections.find((section: {
                title: string;
            }) => section.title === translations['enhanced_emojis.settings.posts.inline.title']);
            expect(inlinePostSection).toMatchObject({
                title: translations['enhanced_emojis.settings.posts.inline.title'],
                settings: [
                    expect.objectContaining({
                        title: translations['enhanced_emojis.settings.posts.inline.size'],
                        helpText: translations['enhanced_emojis.settings.posts.inline.help_text'],
                        options: [
                            expect.objectContaining({text: translations['enhanced_emojis.settings.posts.inline.option.default']}),
                            expect.objectContaining({text: translations['enhanced_emojis.settings.posts.inline.option.medium']}),
                            expect.objectContaining({text: translations['enhanced_emojis.settings.posts.inline.option.large']}),
                            expect.objectContaining({text: translations['enhanced_emojis.settings.posts.inline.option.extra_large']}),
                            expect.objectContaining({text: translations['enhanced_emojis.settings.posts.inline.option.max']}),
                        ],
                    }),
                ],
            });
        }

        if (userPreferences.enableEnhancedEmojis && adminConfig.enableEnhancedReactionEmojis) {
            const reactionSection = settings.sections.find((section: {
                title: string;
            }) => section.title === translations['enhanced_emojis.settings.reactions.title']);
            expect(reactionSection).toMatchObject({
                title: translations['enhanced_emojis.settings.reactions.title'],
                settings: [
                    expect.objectContaining({
                        title: translations['enhanced_emojis.settings.reactions.size'],
                        helpText: translations['enhanced_emojis.settings.reactions.help_text'],
                        options: [
                            expect.objectContaining({text: translations['enhanced_emojis.settings.reactions.option.default']}),
                            expect.objectContaining({text: translations['enhanced_emojis.settings.reactions.option.medium']}),
                            expect.objectContaining({text: translations['enhanced_emojis.settings.reactions.option.large']}),
                            expect.objectContaining({text: translations['enhanced_emojis.settings.reactions.option.max']}),
                        ],
                    }),
                ],
            });
        }
    });

    test('renders the administrator informational message when both features are disabled for an enabled user', () => {
        const locale = 'de';
        const translations = getEnhancedEmojisTranslations(locale);
        const registry = makeRegistry();

        registerEnhancedEmojisUserSettings(registry as never, {
            enableEnhancedPostEmojis: false,
            enableEnhancedReactionEmojis: false,
            enableDeveloperMode: false,
        }, locale, {
            enableEnhancedEmojis: true,
            postEmojiSize: 'default',
            inlinePostEmojiSize: 'default',
            reactionEmojiSize: 'default',
        });

        const settings = getRegisteredSettings(registry);
        const messageSetting = settings.sections[0].settings[1] as { component: () => { props: { children: string } } };
        const rendered = messageSetting.component();

        expect(rendered.props.children).toBe(translations['enhanced_emojis.settings.enable.enabled_message']);
    });

    test('renders the opt-in prompt when the user has not enabled the plugin', () => {
        const locale = 'en';
        const translations = getEnhancedEmojisTranslations(locale);
        const registry = makeRegistry();

        registerEnhancedEmojisUserSettings(registry as never, {
            enableEnhancedPostEmojis: true,
            enableEnhancedReactionEmojis: true,
            enableDeveloperMode: false,
        }, locale, {
            enableEnhancedEmojis: false,
            postEmojiSize: 'default',
            inlinePostEmojiSize: 'default',
            reactionEmojiSize: 'default',
        });

        const settings = getRegisteredSettings(registry);
        const messageSetting = settings.sections[0].settings[1] as { component: () => { props: { children: string } } };
        const rendered = messageSetting.component();

        expect(rendered.props.children).toBe(translations['enhanced_emojis.settings.enable.disabled_message']);
    });

    test('shows the saved inline post emoji size setting again when post emojis are re-enabled', () => {
        const locale = 'en';
        const translations = getEnhancedEmojisTranslations(locale);
        const savedPreferences = {
            enableEnhancedEmojis: true,
            postEmojiSize: 'large' as const,
            inlinePostEmojiSize: 'extraLarge' as const,
            reactionEmojiSize: 'default' as const,
        };

        const hiddenRegistry = makeRegistry();
        registerEnhancedEmojisUserSettings(hiddenRegistry as never, {
            enableEnhancedPostEmojis: false,
            enableEnhancedReactionEmojis: true,
            enableDeveloperMode: false,
        }, locale, savedPreferences);

        const hiddenSettings = getRegisteredSettings(hiddenRegistry);
        expect(hiddenSettings.sections.find((section: {
            title: string;
        }) => section.title === translations['enhanced_emojis.settings.posts.title'])).toBeUndefined();

        const visibleRegistry = makeRegistry();
        registerEnhancedEmojisUserSettings(visibleRegistry as never, {
            enableEnhancedPostEmojis: true,
            enableEnhancedReactionEmojis: true,
            enableDeveloperMode: false,
        }, locale, savedPreferences);

        const visibleSettings = getRegisteredSettings(visibleRegistry);
        const postSection = visibleSettings.sections.find((section: {
            title: string;
        }) => section.title === translations['enhanced_emojis.settings.posts.title']);

        expect(postSection).toMatchObject({
            settings: expect.arrayContaining([
                expect.objectContaining({
                    name: 'postEmojiSize',
                    default: 'default',
                }),
            ]),
        });

        const inlinePostSection = visibleSettings.sections.find((section: {
            title: string;
        }) => section.title === translations['enhanced_emojis.settings.posts.inline.title']);
        expect(inlinePostSection).toMatchObject({
            settings: expect.arrayContaining([
                expect.objectContaining({
                    name: 'inlinePostEmojiSize',
                    default: 'default',
                }),
            ]),
        });
    });

    test('post emojis and inline post emojis are separate setting rows', () => {
        const locale = 'en';
        const translations = getEnhancedEmojisTranslations(locale);
        const registry = makeRegistry();

        registerEnhancedEmojisUserSettings(registry as never, {
            enableEnhancedPostEmojis: true,
            enableEnhancedReactionEmojis: false,
            enableDeveloperMode: false,
        }, locale, {
            enableEnhancedEmojis: true,
            postEmojiSize: 'large',
            inlinePostEmojiSize: 'medium',
            reactionEmojiSize: 'default',
        });

        const settings = getRegisteredSettings(registry);
        const postSection = settings.sections.find((section: {
            title: string;
        }) => section.title === translations['enhanced_emojis.settings.posts.title']);
        const inlinePostSection = settings.sections.find((section: {
            title: string;
        }) => section.title === translations['enhanced_emojis.settings.posts.inline.title']);

        expect(postSection).toMatchObject({
            settings: [expect.objectContaining({name: 'postEmojiSize'})],
        });
        expect(inlinePostSection).toMatchObject({
            settings: [expect.objectContaining({name: 'inlinePostEmojiSize'})],
        });
    });

    test('saves all preferences through Mattermost user preferences when a section is submitted', async () => {
        mockedSavePreferences.mockResolvedValue({status: 'OK'} as never);

        const settings = createEnhancedEmojisUserSettingsConfig({
            enableEnhancedPostEmojis: true,
            enableEnhancedReactionEmojis: true,
            enableDeveloperMode: false,
        }, 'en', {
            enableEnhancedEmojis: true,
            postEmojiSize: 'large',
            inlinePostEmojiSize: 'medium',
            reactionEmojiSize: 'default',
        }, 'user-id');

        (settings.sections[2] as {
            onSubmit?: (changes: { [name: string]: string }) => void;
        }).onSubmit?.({inlinePostEmojiSize: 'extraLarge'});
        await Promise.resolve();

        expect(mockedSavePreferences).toHaveBeenCalledTimes(1);
        expect(mockedSavePreferences).toHaveBeenCalledWith('user-id', [
            {user_id: 'user-id', category: 'enhanced_emojis', name: 'enableEnhancedEmojis', value: 'true'},
            {user_id: 'user-id', category: 'enhanced_emojis', name: 'postEmojiSize', value: 'large'},
            {user_id: 'user-id', category: 'enhanced_emojis', name: 'inlinePostEmojiSize', value: 'extraLarge'},
            {user_id: 'user-id', category: 'enhanced_emojis', name: 'reactionEmojiSize', value: 'default'},
        ]);
        await Promise.resolve();
        expect(mockedDebugLog.mock.calls).toContainEqual(['settings_save_success', {
            savedPreferences: {
                enableEnhancedEmojis: true,
                postEmojiSize: 'large',
                inlinePostEmojiSize: 'extraLarge',
                reactionEmojiSize: 'default',
            },
        }, {
            adminDeveloperModeEnabled: false,
        }]);
    });

    test('uses the latest stored preferences as merge base for single-setting saves', async () => {
        mockedSavePreferences.mockResolvedValue({status: 'OK'} as never);

        let currentPreferences: {
            enableEnhancedEmojis: boolean;
            postEmojiSize: 'maxSize' | 'default';
            inlinePostEmojiSize: 'medium' | 'large';
            reactionEmojiSize: 'maxSize' | 'default';
        } = {
            enableEnhancedEmojis: true,
            postEmojiSize: 'maxSize' as const,
            inlinePostEmojiSize: 'medium' as const,
            reactionEmojiSize: 'maxSize' as const,
        };

        const settings = createEnhancedEmojisUserSettingsConfig({
            enableEnhancedPostEmojis: true,
            enableEnhancedReactionEmojis: true,
            enableDeveloperMode: false,
        }, 'en', currentPreferences, 'user-id', () => currentPreferences);

        currentPreferences = {
            enableEnhancedEmojis: true,
            postEmojiSize: 'maxSize',
            inlinePostEmojiSize: 'large',
            reactionEmojiSize: 'default',
        };

        (settings.sections[1] as {
            onSubmit?: (changes: { [name: string]: string }) => void;
        }).onSubmit?.({postEmojiSize: 'default'});
        await Promise.resolve();

        expect(mockedSavePreferences).toHaveBeenCalledWith('user-id', [
            {user_id: 'user-id', category: 'enhanced_emojis', name: 'enableEnhancedEmojis', value: 'true'},
            {user_id: 'user-id', category: 'enhanced_emojis', name: 'postEmojiSize', value: 'default'},
            {user_id: 'user-id', category: 'enhanced_emojis', name: 'inlinePostEmojiSize', value: 'large'},
            {user_id: 'user-id', category: 'enhanced_emojis', name: 'reactionEmojiSize', value: 'default'},
        ]);
    });

    test('logs save errors only in developer mode', async () => {
        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
        mockedSavePreferences.mockRejectedValue(new Error('401 Unauthorized'));

        const settings = createEnhancedEmojisUserSettingsConfig({
            enableEnhancedPostEmojis: true,
            enableEnhancedReactionEmojis: true,
            enableDeveloperMode: true,
        }, 'en', {
            enableEnhancedEmojis: true,
            postEmojiSize: 'large',
            inlinePostEmojiSize: 'medium',
            reactionEmojiSize: 'default',
        }, 'user-id');

        (settings.sections[0] as {
            onSubmit?: (changes: { [name: string]: string }) => void;
        }).onSubmit?.({enableEnhancedEmojis: 'false'});
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(mockedDebugLog).toHaveBeenCalledWith('settings_change', {
            changedKey: 'enableEnhancedEmojis',
            newValue: 'false',
            oldValue: true,
        }, {
            adminDeveloperModeEnabled: true,
        });
        expect(consoleError).toHaveBeenCalledWith('[Enhanced Emojis Debug] settings_save_failed', expect.objectContaining({
            changedKey: 'enableEnhancedEmojis',
            message: '401 Unauthorized',
            payload: expect.any(Array),
        }));

        mockedDebugError.mockClear();
        mockedDebugLog.mockClear();
        consoleError.mockClear();
        mockedSavePreferences.mockRejectedValue(new Error('401 Unauthorized'));

        const productionSettings = createEnhancedEmojisUserSettingsConfig({
            enableEnhancedPostEmojis: true,
            enableEnhancedReactionEmojis: true,
            enableDeveloperMode: false,
        }, 'en', {
            enableEnhancedEmojis: true,
            postEmojiSize: 'large',
            inlinePostEmojiSize: 'medium',
            reactionEmojiSize: 'default',
        }, 'user-id');

        (productionSettings.sections[0] as {
            onSubmit?: (changes: { [name: string]: string }) => void;
        }).onSubmit?.({enableEnhancedEmojis: 'false'});
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(consoleError).not.toHaveBeenCalled();
    });

    test('settings render uses the central debug helper', () => {
        createEnhancedEmojisUserSettingsConfig({
            enableEnhancedPostEmojis: true,
            enableEnhancedReactionEmojis: true,
            enableDeveloperMode: true,
        }, 'en', {
            enableEnhancedEmojis: true,
            postEmojiSize: 'large',
            inlinePostEmojiSize: 'medium',
            reactionEmojiSize: 'default',
        }, 'user-id');

        expect(mockedDebugLog).toHaveBeenCalledWith('settings_render', expect.objectContaining({
            currentValues: {
                enableEnhancedEmojis: true,
                postEmojiSize: 'large',
                inlinePostEmojiSize: 'medium',
                reactionEmojiSize: 'default',
            },
            visibleSettings: expect.arrayContaining([
                'enableEnhancedEmojis',
                'postEmojiSize',
                'inlinePostEmojiSize',
                'reactionEmojiSize',
            ]),
        }), {
            adminDeveloperModeEnabled: true,
        });
    });
});

describe('getEnhancedEmojisUserPreferences', () => {
    test('defaults the master switch to disabled', () => {
        const state = {
            entities: {
                preferences: {
                    myPreferences: {},
                },
            },
        };

        expect(getEnhancedEmojisUserPreferences(state as never)).toMatchObject({
            enableEnhancedEmojis: false,
            postEmojiSize: 'default',
            inlinePostEmojiSize: 'default',
            reactionEmojiSize: 'default',
        });
    });

    test('reads the stored master switch and keeps saved size preferences', () => {
        const state = {
            entities: {
                preferences: {
                    myPreferences: {
                        enable: {
                            category: 'enhanced_emojis',
                            name: 'enableEnhancedEmojis',
                            user_id: 'user-id',
                            value: 'true',
                        },
                        post: {
                            category: 'enhanced_emojis',
                            name: 'postEmojiSize',
                            user_id: 'user-id',
                            value: 'extraLarge',
                        },
                        inline: {
                            category: 'enhanced_emojis',
                            name: 'inlinePostEmojiSize',
                            user_id: 'user-id',
                            value: 'medium',
                        },
                        reaction: {
                            category: 'enhanced_emojis',
                            name: 'reactionEmojiSize',
                            user_id: 'user-id',
                            value: 'maxSize',
                        },
                    },
                },
            },
        };

        expect(getEnhancedEmojisUserPreferences(state as never)).toMatchObject({
            enableEnhancedEmojis: true,
            postEmojiSize: 'extraLarge',
            inlinePostEmojiSize: 'medium',
            reactionEmojiSize: 'maxSize',
        });
    });
});

describe('createEnhancedEmojisPreferenceSavePayload', () => {
    test('creates an array payload with canonical keys and string values', () => {
        expect(createEnhancedEmojisPreferenceSavePayload('user-id', {
            enableEnhancedEmojis: true,
            postEmojiSize: 'large',
            inlinePostEmojiSize: 'medium',
            reactionEmojiSize: 'maxSize',
        })).toEqual([
            {user_id: 'user-id', category: 'enhanced_emojis', name: 'enableEnhancedEmojis', value: 'true'},
            {user_id: 'user-id', category: 'enhanced_emojis', name: 'postEmojiSize', value: 'large'},
            {user_id: 'user-id', category: 'enhanced_emojis', name: 'inlinePostEmojiSize', value: 'medium'},
            {user_id: 'user-id', category: 'enhanced_emojis', name: 'reactionEmojiSize', value: 'maxSize'},
        ]);
    });
});

describe('buildEnhancedEmojisPreferenceSavePayload', () => {
    test('saving only post keeps inline and reaction unchanged', () => {
        expect(buildEnhancedEmojisPreferenceSavePayload('user-id', {
            enableEnhancedEmojis: true,
            postEmojiSize: 'maxSize',
            inlinePostEmojiSize: 'medium',
            reactionEmojiSize: 'maxSize',
        }, {
            name: 'postEmojiSize',
            value: 'default',
        })).toMatchObject({
            changedKey: 'postEmojiSize',
            previousPreferences: {
                enableEnhancedEmojis: true,
                postEmojiSize: 'maxSize',
                inlinePostEmojiSize: 'medium',
                reactionEmojiSize: 'maxSize',
            },
            nextPreferences: {
                enableEnhancedEmojis: true,
                postEmojiSize: 'default',
                inlinePostEmojiSize: 'medium',
                reactionEmojiSize: 'maxSize',
            },
            payload: [
                {user_id: 'user-id', category: 'enhanced_emojis', name: 'enableEnhancedEmojis', value: 'true'},
                {user_id: 'user-id', category: 'enhanced_emojis', name: 'postEmojiSize', value: 'default'},
                {user_id: 'user-id', category: 'enhanced_emojis', name: 'inlinePostEmojiSize', value: 'medium'},
                {user_id: 'user-id', category: 'enhanced_emojis', name: 'reactionEmojiSize', value: 'maxSize'},
            ],
        });
    });

    test('saving only inline keeps post and reaction unchanged', () => {
        expect(buildEnhancedEmojisPreferenceSavePayload('user-id', {
            enableEnhancedEmojis: true,
            postEmojiSize: 'maxSize',
            inlinePostEmojiSize: 'medium',
            reactionEmojiSize: 'maxSize',
        }, {
            name: 'inlinePostEmojiSize',
            value: 'large',
        }).nextPreferences).toEqual({
            enableEnhancedEmojis: true,
            postEmojiSize: 'maxSize',
            inlinePostEmojiSize: 'large',
            reactionEmojiSize: 'maxSize',
        });
    });

    test('saving only reaction keeps post and inline unchanged', () => {
        expect(buildEnhancedEmojisPreferenceSavePayload('user-id', {
            enableEnhancedEmojis: true,
            postEmojiSize: 'maxSize',
            inlinePostEmojiSize: 'medium',
            reactionEmojiSize: 'maxSize',
        }, {
            name: 'reactionEmojiSize',
            value: 'default',
        }).nextPreferences).toEqual({
            enableEnhancedEmojis: true,
            postEmojiSize: 'maxSize',
            inlinePostEmojiSize: 'medium',
            reactionEmojiSize: 'default',
        });
    });

    test('saving the master toggle preserves all size values', () => {
        expect(buildEnhancedEmojisPreferenceSavePayload('user-id', {
            enableEnhancedEmojis: false,
            postEmojiSize: 'maxSize',
            inlinePostEmojiSize: 'medium',
            reactionEmojiSize: 'maxSize',
        }, {
            name: 'enableEnhancedEmojis',
            value: 'true',
        }).nextPreferences).toEqual({
            enableEnhancedEmojis: true,
            postEmojiSize: 'maxSize',
            inlinePostEmojiSize: 'medium',
            reactionEmojiSize: 'maxSize',
        });
    });
});

describe('createEnableEnhancedEmojisSettingComponent', () => {
    const mockedUseSelector = useSelector as jest.MockedFunction<typeof useSelector>;

    afterEach(() => {
        jest.restoreAllMocks();
        mockedUseSelector.mockReset();
        mockedSavePreferences.mockReset();
        mockedDebugError.mockClear();
        mockedDebugLog.mockClear();
    });

    test('defaults the toggle to off', () => {
        const translations = getEnhancedEmojisTranslations('en');
        mockedUseSelector.mockReturnValue(false);
        jest.spyOn(React, 'useState').mockReturnValue([false, jest.fn()]);
        jest.spyOn(React, 'useEffect').mockImplementation(() => undefined);

        const Component = createEnableEnhancedEmojisSettingComponent(translations);
        const rendered = Component({informChange: jest.fn()});

        expect(rendered.props.role).toBe('switch');
        expect(rendered.props['aria-checked']).toBe(false);
        expect(rendered.props.children[0].props.children).toBe(translations['enhanced_emojis.settings.enable.state.off']);
    });

    test('toggle can be switched on and updates local settings state immediately', () => {
        const translations = getEnhancedEmojisTranslations('en');
        const setEnabled = jest.fn();
        const informChange = jest.fn();

        mockedUseSelector.mockReturnValue(false);
        jest.spyOn(React, 'useState').mockReturnValue([false, setEnabled]);
        jest.spyOn(React, 'useEffect').mockImplementation(() => undefined);

        const Component = createEnableEnhancedEmojisSettingComponent(translations);
        const rendered = Component({informChange});

        rendered.props.onClick();

        expect(setEnabled).toHaveBeenCalledWith(true);
        expect(informChange).toHaveBeenCalledWith('enableEnhancedEmojis', 'true');
        expect(rendered.props['aria-checked']).toBe(false);
    });

    test('keyboard toggle also updates the pending enabled state', () => {
        const translations = getEnhancedEmojisTranslations('de');
        const setEnabled = jest.fn();
        const informChange = jest.fn();
        const preventDefault = jest.fn();

        mockedUseSelector.mockReturnValue(false);
        jest.spyOn(React, 'useState').mockReturnValue([false, setEnabled]);
        jest.spyOn(React, 'useEffect').mockImplementation(() => undefined);

        const Component = createEnableEnhancedEmojisSettingComponent(translations);
        const rendered = Component({informChange});
        rendered.props.onKeyDown({key: ' ', preventDefault});

        expect(preventDefault).toHaveBeenCalledTimes(1);
        expect(setEnabled).toHaveBeenCalledWith(true);
        expect(informChange).toHaveBeenCalledWith('enableEnhancedEmojis', 'true');
    });

    test('enabled state positions the knob on the right and shows the localized on label', () => {
        const translations = getEnhancedEmojisTranslations('en');
        const setEnabled = jest.fn();

        mockedUseSelector.mockReturnValue(true);
        jest.spyOn(React, 'useState').mockReturnValue([true, setEnabled]);
        jest.spyOn(React, 'useEffect').mockImplementation(() => undefined);

        const Component = createEnableEnhancedEmojisSettingComponent(translations);
        const rendered = Component({informChange: jest.fn()});

        expect(rendered.props['aria-checked']).toBe(true);
        expect(rendered.props.children[0].props.children).toBe(
            translations['enhanced_emojis.settings.enable.state.on'],
        );
    });
});
