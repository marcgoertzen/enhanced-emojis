import {getEnhancedEmojisUserPreferences} from 'config';
import {getEnhancedEmojisTranslations} from 'i18n';
import React from 'react';
import {useSelector} from 'react-redux';
import {createEnableEnhancedEmojisSettingComponent, registerEnhancedEmojisUserSettings} from 'settings';

jest.mock('react-redux', () => ({
    useSelector: jest.fn(),
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
        expect(settings.sections.map((section: {title: string}) => section.title)).toEqual(
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
            const postSection = settings.sections.find((section: {title: string}) => section.title === translations['enhanced_emojis.settings.posts.title']);
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

            const inlinePostSection = settings.sections.find((section: {title: string}) => section.title === translations['enhanced_emojis.settings.posts.inline.title']);
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
            const reactionSection = settings.sections.find((section: {title: string}) => section.title === translations['enhanced_emojis.settings.reactions.title']);
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
        const messageSetting = settings.sections[0].settings[1] as {component: () => {props: {children: string}}};
        const rendered = messageSetting.component();

        expect(rendered.props.children).toBe(translations['enhanced_emojis.settings.no_features_enabled']);
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
        const messageSetting = settings.sections[0].settings[1] as {component: () => {props: {children: string}}};
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
        expect(hiddenSettings.sections.find((section: {title: string}) => section.title === translations['enhanced_emojis.settings.posts.title'])).toBeUndefined();

        const visibleRegistry = makeRegistry();
        registerEnhancedEmojisUserSettings(visibleRegistry as never, {
            enableEnhancedPostEmojis: true,
            enableEnhancedReactionEmojis: true,
            enableDeveloperMode: false,
        }, locale, savedPreferences);

        const visibleSettings = getRegisteredSettings(visibleRegistry);
        const postSection = visibleSettings.sections.find((section: {title: string}) => section.title === translations['enhanced_emojis.settings.posts.title']);

        expect(postSection).toMatchObject({
            settings: expect.arrayContaining([
                expect.objectContaining({
                    name: 'postEmojiSize',
                    default: 'default',
                }),
            ]),
        });

        const inlinePostSection = visibleSettings.sections.find((section: {title: string}) => section.title === translations['enhanced_emojis.settings.posts.inline.title']);
        expect(inlinePostSection).toMatchObject({
            settings: expect.arrayContaining([
                expect.objectContaining({
                    name: 'InlinePostEmojiSize',
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
        const postSection = settings.sections.find((section: {title: string}) => section.title === translations['enhanced_emojis.settings.posts.title']);
        const inlinePostSection = settings.sections.find((section: {title: string}) => section.title === translations['enhanced_emojis.settings.posts.inline.title']);

        expect(postSection).toMatchObject({
            settings: [expect.objectContaining({name: 'postEmojiSize'})],
        });
        expect(inlinePostSection).toMatchObject({
            settings: [expect.objectContaining({name: 'InlinePostEmojiSize'})],
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
                            category: 'pp_io.github.marcgoertzen.enhanced-emojis',
                            name: 'EnableEnhancedEmojis',
                            user_id: 'user-id',
                            value: 'true',
                        },
                        post: {
                            category: 'pp_io.github.marcgoertzen.enhanced-emojis',
                            name: 'postEmojiSize',
                            user_id: 'user-id',
                            value: 'extraLarge',
                        },
                        inline: {
                            category: 'pp_io.github.marcgoertzen.enhanced-emojis',
                            name: 'InlinePostEmojiSize',
                            user_id: 'user-id',
                            value: 'medium',
                        },
                        reaction: {
                            category: 'pp_io.github.marcgoertzen.enhanced-emojis',
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

describe('createEnableEnhancedEmojisSettingComponent', () => {
    const mockedUseSelector = useSelector as jest.MockedFunction<typeof useSelector>;

    afterEach(() => {
        jest.restoreAllMocks();
        mockedUseSelector.mockReset();
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
        expect(rendered.props.style.width).toBe('96px');
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
        expect(informChange).toHaveBeenCalledWith('EnableEnhancedEmojis', 'true');
        expect(rendered.props.children[1].props.style.transform).toBe('translateX(0)');
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
        expect(informChange).toHaveBeenCalledWith('EnableEnhancedEmojis', 'true');
    });

    test('enabled state positions the knob on the right and shows the localized on label', () => {
        const translations = getEnhancedEmojisTranslations('de');

        mockedUseSelector.mockReturnValue(true);
        jest.spyOn(React, 'useState').mockReturnValue([true, jest.fn()]);
        jest.spyOn(React, 'useEffect').mockImplementation(() => undefined);

        const Component = createEnableEnhancedEmojisSettingComponent(translations);
        const rendered = Component({informChange: jest.fn()});

        expect(rendered.props['aria-checked']).toBe(true);
        expect(rendered.props.children[0].props.children).toBe(translations['enhanced_emojis.settings.enable.state.on']);
        expect(rendered.props.children[1].props.style.transform).toBe('translateX(64px)');
    });
});
