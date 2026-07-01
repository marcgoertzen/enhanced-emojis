import {getEnhancedEmojisTranslations, type EnhancedEmojisTranslationKey} from 'i18n';

import {makeHydratableStore, makePreference, makeStore} from './helpers';

const PLUGIN_ID = 'de.dakosy.enhanced-emojis';
const USER_PREFERENCES_PREFIX = `pp_${PLUGIN_ID}`;

describe('EnhancedEmojisPlugin entrypoint', () => {
    beforeEach(() => {
        jest.resetModules();
        jest.useFakeTimers();
        Object.assign(global, {
            window: {
                registerPlugin: jest.fn(),
            },
        });
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    test('registers the plugin on window', () => {
        const registerPlugin = jest.fn();
        Object.assign(global, {
            window: {
                registerPlugin,
            },
        });

        jest.isolateModules(() => {
            require('../src/index');
        });

        expect(registerPlugin).toHaveBeenCalledTimes(1);
        expect(registerPlugin).toHaveBeenCalledWith(
            PLUGIN_ID,
            expect.objectContaining({
                initialize: expect.any(Function),
            }),
        );
    });

    test('hydrates preferences during initialization before the first config application', async () => {
        const classList = {
            remove: jest.fn(),
            toggle: jest.fn(),
        };
        const style = {
            setProperty: jest.fn(),
            removeProperty: jest.fn(),
        };
        const fetch = jest.fn(async () => ({
            ok: true,
            json: async () => ({
                enableEnhancedPostEmojis: true,
                enableEnhancedReactionEmojis: false,
                enableDeveloperMode: false,
            }),
        }));
        const registerUserSettings = jest.fn();
        const registerTranslations = jest.fn();
        const store = makeHydratableStore('en');

        Object.assign(global, {
            fetch,
            document: {
                body: null,
                documentElement: {
                    classList,
                    style,
                },
            },
        });

        const {default: EnhancedEmojisPlugin} = require('../src/plugin');
        const plugin = new EnhancedEmojisPlugin();

        registerUserSettings.mockImplementation(() => {
            store.setPreferences({
                [`${USER_PREFERENCES_PREFIX}--enableEnhancedEmojis`]: makePreference('EnableEnhancedEmojis', 'true'),
                [`${USER_PREFERENCES_PREFIX}--postEmojiSize`]: makePreference('postEmojiSize', 'large'),
                [`${USER_PREFERENCES_PREFIX}--inlinePostEmojiSize`]: makePreference('InlinePostEmojiSize', 'extraLarge'),
                [`${USER_PREFERENCES_PREFIX}--reactionEmojiSize`]: makePreference('reactionEmojiSize', 'default'),
            });
            store.emitChange();
        });

        await plugin.initialize({registerUserSettings, registerTranslations} as never, store as never);

        expect(style.setProperty).toHaveBeenCalledWith('--enhanced-post-emojis-size', '48px');
        expect(style.setProperty).toHaveBeenCalledWith('--enhanced-inline-post-emojis-size', '64px');
        expect(style.setProperty).toHaveBeenCalledWith('--enhanced-reaction-emojis-size', '20px');
        expect(classList.toggle).toHaveBeenCalledWith('enhanced-emojis-posts-enabled', true);
    });

    test('reapplies css variables when preferences are saved after initialization', async () => {
        const classList = {
            remove: jest.fn(),
            toggle: jest.fn(),
        };
        const style = {
            setProperty: jest.fn(),
            removeProperty: jest.fn(),
        };
        const fetch = jest.fn(async () => ({
            ok: true,
            json: async () => ({
                enableEnhancedPostEmojis: true,
                enableEnhancedReactionEmojis: false,
                enableDeveloperMode: false,
            }),
        }));
        const registerTranslations = jest.fn();
        const registerUserSettings = jest.fn();
        const store = makeHydratableStore('en');

        store.setPreferences({
            [`${USER_PREFERENCES_PREFIX}--enableEnhancedEmojis`]: makePreference('EnableEnhancedEmojis', 'true'),
            [`${USER_PREFERENCES_PREFIX}--postEmojiSize`]: makePreference('postEmojiSize', 'large'),
            [`${USER_PREFERENCES_PREFIX}--inlinePostEmojiSize`]: makePreference('InlinePostEmojiSize', 'default'),
            [`${USER_PREFERENCES_PREFIX}--reactionEmojiSize`]: makePreference('reactionEmojiSize', 'default'),
        });

        Object.assign(global, {
            fetch,
            document: {
                body: null,
                documentElement: {
                    classList,
                    style,
                },
            },
        });

        const {default: EnhancedEmojisPlugin} = require('../src/plugin');
        const plugin = new EnhancedEmojisPlugin();

        await plugin.initialize({registerUserSettings, registerTranslations} as never, store as never);

        expect(style.setProperty).toHaveBeenCalledWith('--enhanced-post-emojis-size', '48px');

        store.setPreferences({
            [`${USER_PREFERENCES_PREFIX}--enableEnhancedEmojis`]: makePreference('EnableEnhancedEmojis', 'true'),
            [`${USER_PREFERENCES_PREFIX}--postEmojiSize`]: makePreference('postEmojiSize', 'maxSize'),
            [`${USER_PREFERENCES_PREFIX}--inlinePostEmojiSize`]: makePreference('InlinePostEmojiSize', 'medium'),
            [`${USER_PREFERENCES_PREFIX}--reactionEmojiSize`]: makePreference('reactionEmojiSize', 'default'),
        });
        store.emitChange();

        expect(style.setProperty).toHaveBeenCalledWith('--enhanced-post-emojis-size', '128px');
        expect(style.setProperty).toHaveBeenCalledWith('--enhanced-inline-post-emojis-size', '32px');
    });

    test('applies hydrated preferences on the deferred startup sync after a reload', async () => {
        const classList = {
            remove: jest.fn(),
            toggle: jest.fn(),
        };
        const style = {
            setProperty: jest.fn(),
            removeProperty: jest.fn(),
        };
        const fetch = jest.fn(async () => ({
            ok: true,
            json: async () => ({
                enableEnhancedPostEmojis: true,
                enableEnhancedReactionEmojis: false,
                enableDeveloperMode: false,
            }),
        }));
        const registerTranslations = jest.fn();
        const registerUserSettings = jest.fn();
        const store = makeHydratableStore('en');

        store.setPreferences({
            [`${USER_PREFERENCES_PREFIX}--enableEnhancedEmojis`]: makePreference('EnableEnhancedEmojis', 'true'),
        });

        Object.assign(global, {
            fetch,
            document: {
                body: null,
                documentElement: {
                    classList,
                    style,
                },
            },
        });

        const {default: EnhancedEmojisPlugin} = require('../src/plugin');
        const plugin = new EnhancedEmojisPlugin();

        await plugin.initialize({registerUserSettings, registerTranslations} as never, store as never);

        expect(style.setProperty).toHaveBeenCalledWith('--enhanced-post-emojis-size', '32px');
        expect(style.setProperty).toHaveBeenCalledWith('--enhanced-inline-post-emojis-size', '20px');

        store.setPreferences({
            [`${USER_PREFERENCES_PREFIX}--enableEnhancedEmojis`]: makePreference('EnableEnhancedEmojis', 'true'),
            [`${USER_PREFERENCES_PREFIX}--postEmojiSize`]: makePreference('postEmojiSize', 'maxSize'),
            [`${USER_PREFERENCES_PREFIX}--inlinePostEmojiSize`]: makePreference('InlinePostEmojiSize', 'extraLarge'),
            [`${USER_PREFERENCES_PREFIX}--reactionEmojiSize`]: makePreference('reactionEmojiSize', 'default'),
        });

        jest.runOnlyPendingTimers();

        expect(style.setProperty).toHaveBeenCalledWith('--enhanced-post-emojis-size', '128px');
        expect(style.setProperty).toHaveBeenCalledWith('--enhanced-inline-post-emojis-size', '64px');
    });

    test.each([
        {
            name: 'admin enabled / user disabled',
            locale: 'en',
            adminConfig: {
                enableEnhancedPostEmojis: true,
                enableEnhancedReactionEmojis: true,
                enableDeveloperMode: false,
            },
            userPreferences: {
                EnableEnhancedEmojis: 'false',
                InlinePostEmojiSize: 'default',
                postEmojiSize: 'large',
                reactionEmojiSize: 'medium',
            },
            expectedSectionTitles: ['enhanced_emojis.settings.title'] as EnhancedEmojisTranslationKey[],
            expectedClasses: {
                posts: false,
                reactions: false,
                developer: false,
            },
        },
        {
            name: 'reactions only',
            locale: 'de',
            adminConfig: {
                enableEnhancedPostEmojis: false,
                enableEnhancedReactionEmojis: true,
                enableDeveloperMode: false,
            },
            userPreferences: {
                EnableEnhancedEmojis: 'true',
                InlinePostEmojiSize: 'medium',
                postEmojiSize: 'large',
                reactionEmojiSize: 'medium',
            },
            expectedSectionTitles: ['enhanced_emojis.settings.title', 'enhanced_emojis.settings.reactions.title'] as EnhancedEmojisTranslationKey[],
            expectedClasses: {
                posts: false,
                reactions: true,
                developer: false,
            },
        },
        {
            name: 'admin disabled / user enabled',
            locale: 'en',
            adminConfig: {
                enableEnhancedPostEmojis: false,
                enableEnhancedReactionEmojis: false,
                enableDeveloperMode: false,
            },
            userPreferences: {
                EnableEnhancedEmojis: 'true',
                InlinePostEmojiSize: 'medium',
                postEmojiSize: 'large',
                reactionEmojiSize: 'medium',
            },
            expectedSectionTitles: ['enhanced_emojis.settings.title'] as EnhancedEmojisTranslationKey[],
            expectedClasses: {
                posts: false,
                reactions: false,
                developer: false,
            },
        },
        {
            name: 'posts and reactions',
            locale: 'de',
            adminConfig: {
                enableEnhancedPostEmojis: true,
                enableEnhancedReactionEmojis: true,
                enableDeveloperMode: false,
            },
            userPreferences: {
                EnableEnhancedEmojis: 'true',
                InlinePostEmojiSize: 'medium',
                postEmojiSize: 'large',
                reactionEmojiSize: 'medium',
            },
            expectedSectionTitles: [
                'enhanced_emojis.settings.title',
                'enhanced_emojis.settings.posts.title',
                'enhanced_emojis.settings.posts.inline.title',
                'enhanced_emojis.settings.reactions.title',
            ] as EnhancedEmojisTranslationKey[],
            expectedClasses: {
                posts: true,
                reactions: true,
                developer: false,
            },
        },
    ])('applies independent feature classes for $name', async ({adminConfig, expectedClasses, expectedSectionTitles, locale, userPreferences}) => {
        const classList = {
            remove: jest.fn(),
            toggle: jest.fn(),
        };
        const style = {
            setProperty: jest.fn(),
            removeProperty: jest.fn(),
        };
        const fetch = jest.fn(async () => ({
            ok: true,
            json: async () => adminConfig,
        }));
        const registerUserSettings = jest.fn();
        const registerTranslations = jest.fn();
        const translations = getEnhancedEmojisTranslations(locale);

        Object.assign(global, {
            fetch,
            document: {
                body: null,
                documentElement: {
                    classList,
                    style,
                },
            },
        });

        const {default: EnhancedEmojisPlugin} = require('../src/plugin');
        const plugin = new EnhancedEmojisPlugin();
        const store = makeStore({
            [`${USER_PREFERENCES_PREFIX}--enableEnhancedEmojis`]: makePreference('EnableEnhancedEmojis', userPreferences.EnableEnhancedEmojis),
            [`${USER_PREFERENCES_PREFIX}--inlinePostEmojiSize`]: makePreference('InlinePostEmojiSize', userPreferences.InlinePostEmojiSize),
            [`${USER_PREFERENCES_PREFIX}--postEmojiSize`]: makePreference('postEmojiSize', userPreferences.postEmojiSize),
            [`${USER_PREFERENCES_PREFIX}--reactionEmojiSize`]: makePreference('reactionEmojiSize', userPreferences.reactionEmojiSize),
        }, locale);

        await plugin.initialize({registerUserSettings, registerTranslations} as never, store as never);

        expect(registerTranslations).toHaveBeenCalledTimes(1);
        expect(registerUserSettings).toHaveBeenCalledTimes(1);
        expect(registerUserSettings).toHaveBeenCalledWith(expect.objectContaining({
            id: PLUGIN_ID,
            uiName: translations['enhanced_emojis.settings.title'],
            sections: expect.arrayContaining(
                expectedSectionTitles.map((title) => expect.objectContaining({title: translations[title]})),
            ),
        }));
        expect(fetch).toHaveBeenCalledWith(`/plugins/${PLUGIN_ID}/config`);
        expect(classList.toggle).toHaveBeenCalledWith('enhanced-emojis-posts-enabled', expectedClasses.posts);
        expect(classList.toggle).toHaveBeenCalledWith('enhanced-emojis-reactions-enabled', expectedClasses.reactions);
        expect(classList.toggle).toHaveBeenCalledWith('enhanced-emojis-developer-mode', expectedClasses.developer);
        expect(style.setProperty).toHaveBeenCalledWith('--enhanced-inline-post-emojis-size', userPreferences.InlinePostEmojiSize === 'default' ? '20px' : '32px');
        expect(style.setProperty).toHaveBeenCalledWith('--enhanced-post-emojis-size', '48px');
        expect(style.setProperty).toHaveBeenCalledWith('--enhanced-reaction-emojis-size', '32px');
    });

    test('developer mode still follows the independent feature flags', async () => {
        const classList = {
            remove: jest.fn(),
            toggle: jest.fn(),
        };
        const style = {
            setProperty: jest.fn(),
            removeProperty: jest.fn(),
        };
        const fetch = jest.fn(async () => ({
            ok: true,
            json: async () => ({
                enableEnhancedPostEmojis: false,
                enableEnhancedReactionEmojis: true,
                enableDeveloperMode: true,
            }),
        }));

        Object.assign(global, {
            fetch,
            document: {
                body: null,
                documentElement: {
                    classList,
                    style,
                },
            },
        });

        const {default: EnhancedEmojisPlugin} = require('../src/plugin');
        const plugin = new EnhancedEmojisPlugin();
        const store = makeStore({
            [`${USER_PREFERENCES_PREFIX}--enableEnhancedEmojis`]: makePreference('EnableEnhancedEmojis', 'true'),
            [`${USER_PREFERENCES_PREFIX}--inlinePostEmojiSize`]: makePreference('InlinePostEmojiSize', 'large'),
            [`${USER_PREFERENCES_PREFIX}--postEmojiSize`]: makePreference('postEmojiSize', 'extraLarge'),
            [`${USER_PREFERENCES_PREFIX}--reactionEmojiSize`]: makePreference('reactionEmojiSize', 'large'),
        }, 'de');

        const registerTranslations = jest.fn();
        await plugin.initialize({registerUserSettings: jest.fn(), registerTranslations} as never, store as never);

        expect(registerTranslations).toHaveBeenCalledTimes(1);
        expect(classList.toggle).toHaveBeenCalledWith('enhanced-emojis-posts-enabled', false);
        expect(classList.toggle).toHaveBeenCalledWith('enhanced-emojis-developer-mode', true);
        expect(classList.toggle).toHaveBeenCalledWith('enhanced-emojis-reactions-enabled', true);
        expect(style.setProperty).toHaveBeenCalledWith('--enhanced-post-emojis-size', '64px');
        expect(style.setProperty).toHaveBeenCalledWith('--enhanced-inline-post-emojis-size', '32px');
        expect(style.setProperty).toHaveBeenCalledWith('--enhanced-reaction-emojis-size', '64px');
        expect(style.setProperty).toHaveBeenCalledWith('--enhanced-reaction-chip-padding-inline', '13px');
        expect(style.setProperty).toHaveBeenCalledWith('--enhanced-reaction-chip-padding-block', '6px');
        expect(style.setProperty).toHaveBeenCalledWith('--enhanced-reaction-chip-gap', '8px');
        expect(style.setProperty).toHaveBeenCalledWith('--enhanced-reaction-chip-min-height', '76px');
    });

    test('removes the enabled class during uninitialize', async () => {
        const classList = {
            toggle: jest.fn(),
            remove: jest.fn(),
        };
        const style = {
            setProperty: jest.fn(),
            removeProperty: jest.fn(),
        };
        const fetch = jest.fn(async () => ({
            ok: true,
            json: async () => ({
                enableEnhancedPostEmojis: true,
                enableEnhancedReactionEmojis: true,
                enableDeveloperMode: true,
            }),
        }));

        Object.assign(global, {
            fetch,
            document: {
                body: null,
                documentElement: {
                    classList,
                    style,
                },
            },
        });

        const {default: EnhancedEmojisPlugin} = require('../src/plugin');
        const plugin = new EnhancedEmojisPlugin();
        const store = makeStore({
            [`${USER_PREFERENCES_PREFIX}--enableEnhancedEmojis`]: makePreference('EnableEnhancedEmojis', 'true'),
            [`${USER_PREFERENCES_PREFIX}--inlinePostEmojiSize`]: makePreference('InlinePostEmojiSize', 'default'),
            [`${USER_PREFERENCES_PREFIX}--postEmojiSize`]: makePreference('postEmojiSize', 'default'),
            [`${USER_PREFERENCES_PREFIX}--reactionEmojiSize`]: makePreference('reactionEmojiSize', 'maxSize'),
        }, 'en');

        await plugin.initialize({registerUserSettings: jest.fn(), registerTranslations: jest.fn()} as never, store as never);
        plugin.uninitialize();

        expect(classList.remove).toHaveBeenCalledWith('enhanced-emojis-enabled');
        expect(classList.remove).toHaveBeenCalledWith('enhanced-emojis-posts-enabled');
        expect(classList.remove).toHaveBeenCalledWith('enhanced-emojis-developer-mode');
        expect(classList.remove).toHaveBeenCalledWith('enhanced-emojis-reactions-enabled');
        expect(style.removeProperty).toHaveBeenCalledWith('--enhanced-post-emojis-size');
        expect(style.removeProperty).toHaveBeenCalledWith('--enhanced-inline-post-emojis-size');
        expect(style.removeProperty).toHaveBeenCalledWith('--enhanced-reaction-emojis-size');
    });

    test('developer mode is suppressed when the user has not enabled the plugin', async () => {
        const classList = {
            remove: jest.fn(),
            toggle: jest.fn(),
        };
        const style = {
            setProperty: jest.fn(),
            removeProperty: jest.fn(),
        };
        const fetch = jest.fn(async () => ({
            ok: true,
            json: async () => ({
                enableEnhancedPostEmojis: true,
                enableEnhancedReactionEmojis: true,
                enableDeveloperMode: true,
            }),
        }));

        Object.assign(global, {
            fetch,
            document: {
                body: null,
                documentElement: {
                    classList,
                    style,
                },
            },
        });

        const {default: EnhancedEmojisPlugin} = require('../src/plugin');
        const plugin = new EnhancedEmojisPlugin();
        const store = makeStore({
            [`${USER_PREFERENCES_PREFIX}--enableEnhancedEmojis`]: makePreference('EnableEnhancedEmojis', 'false'),
            [`${USER_PREFERENCES_PREFIX}--inlinePostEmojiSize`]: makePreference('InlinePostEmojiSize', 'extraLarge'),
            [`${USER_PREFERENCES_PREFIX}--postEmojiSize`]: makePreference('postEmojiSize', 'extraLarge'),
            [`${USER_PREFERENCES_PREFIX}--reactionEmojiSize`]: makePreference('reactionEmojiSize', 'large'),
        }, 'en');

        await plugin.initialize({registerUserSettings: jest.fn(), registerTranslations: jest.fn()} as never, store as never);

        expect(classList.toggle).toHaveBeenCalledWith('enhanced-emojis-posts-enabled', false);
        expect(classList.toggle).toHaveBeenCalledWith('enhanced-emojis-reactions-enabled', false);
        expect(classList.toggle).toHaveBeenCalledWith('enhanced-emojis-developer-mode', false);
        expect(style.setProperty).toHaveBeenCalledWith('--enhanced-inline-post-emojis-size', '64px');
        expect(style.setProperty).toHaveBeenCalledWith('--enhanced-post-emojis-size', '64px');
        expect(style.setProperty).toHaveBeenCalledWith('--enhanced-reaction-emojis-size', '64px');
    });
});
