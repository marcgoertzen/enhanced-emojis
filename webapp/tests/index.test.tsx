export {};

const PLUGIN_ID = 'de.dakosy.enhanced-emojis';
const USER_PREFERENCES_PREFIX = `pp_${PLUGIN_ID}`;

function makePreference(name: string, value: string) {
    return {
        category: USER_PREFERENCES_PREFIX,
        name,
        user_id: 'user-id',
        value,
    };
}

function makeStore(preferences: Record<string, {category: string; name: string; user_id: string; value: string}>) {
    return {
        getState: jest.fn(() => ({
            entities: {
                preferences: {
                    myPreferences: preferences,
                },
            },
        })),
        subscribe: jest.fn(() => jest.fn()),
    };
}

describe('EnhancedEmojisPlugin entrypoint', () => {
    beforeEach(() => {
        jest.resetModules();
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

    test.each([
        {
            name: 'posts only',
            adminConfig: {
                enableEnhancedEmojis: true,
                enableDeveloperMode: false,
                enableReactionEmojis: false,
            },
            expectedClasses: {
                posts: true,
                reactions: false,
                developer: false,
            },
        },
        {
            name: 'reactions only',
            adminConfig: {
                enableEnhancedEmojis: false,
                enableDeveloperMode: false,
                enableReactionEmojis: true,
            },
            expectedClasses: {
                posts: false,
                reactions: true,
                developer: false,
            },
        },
        {
            name: 'disabled',
            adminConfig: {
                enableEnhancedEmojis: false,
                enableDeveloperMode: false,
                enableReactionEmojis: false,
            },
            expectedClasses: {
                posts: false,
                reactions: false,
                developer: false,
            },
        },
        {
            name: 'posts and reactions',
            adminConfig: {
                enableEnhancedEmojis: true,
                enableDeveloperMode: false,
                enableReactionEmojis: true,
            },
            expectedClasses: {
                posts: true,
                reactions: true,
                developer: false,
            },
        },
    ])('applies independent feature classes for $name', async ({adminConfig, expectedClasses}) => {
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

        Object.assign(global, {
            fetch,
            document: {
                documentElement: {
                    classList,
                    style,
                },
            },
        });

        const {default: EnhancedEmojisPlugin} = require('../src/index');
        const plugin = new EnhancedEmojisPlugin();
        const store = makeStore({
            [`${USER_PREFERENCES_PREFIX}--postEmojiSize`]: makePreference('postEmojiSize', 'large'),
            [`${USER_PREFERENCES_PREFIX}--reactionEmojiSize`]: makePreference('reactionEmojiSize', 'medium'),
        });

        await plugin.initialize({registerUserSettings} as never, store as never);

        expect(registerUserSettings).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(`/plugins/${PLUGIN_ID}/config`);
        expect(classList.toggle).toHaveBeenCalledWith('enhanced-emojis-posts-enabled', expectedClasses.posts);
        expect(classList.toggle).toHaveBeenCalledWith('enhanced-emojis-reactions-enabled', expectedClasses.reactions);
        expect(classList.toggle).toHaveBeenCalledWith('enhanced-emojis-developer-mode', expectedClasses.developer);
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
                enableEnhancedEmojis: false,
                enableDeveloperMode: true,
                enableReactionEmojis: true,
            }),
        }));

        Object.assign(global, {
            fetch,
            document: {
                documentElement: {
                    classList,
                    style,
                },
            },
        });

        const {default: EnhancedEmojisPlugin} = require('../src/index');
        const plugin = new EnhancedEmojisPlugin();
        const store = makeStore({
            [`${USER_PREFERENCES_PREFIX}--postEmojiSize`]: makePreference('postEmojiSize', 'extraLarge'),
            [`${USER_PREFERENCES_PREFIX}--reactionEmojiSize`]: makePreference('reactionEmojiSize', 'large'),
        });

        await plugin.initialize({registerUserSettings: jest.fn()} as never, store as never);

        expect(classList.toggle).toHaveBeenCalledWith('enhanced-emojis-posts-enabled', false);
        expect(classList.toggle).toHaveBeenCalledWith('enhanced-emojis-developer-mode', true);
        expect(classList.toggle).toHaveBeenCalledWith('enhanced-emojis-reactions-enabled', true);
        expect(style.setProperty).toHaveBeenCalledWith('--enhanced-post-emojis-size', '64px');
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
                enableEnhancedEmojis: true,
                enableDeveloperMode: true,
                enableReactionEmojis: true,
            }),
        }));

        Object.assign(global, {
            fetch,
            document: {
                documentElement: {
                    classList,
                    style,
                },
            },
        });

        const {default: EnhancedEmojisPlugin} = require('../src/index');
        const plugin = new EnhancedEmojisPlugin();
        const store = makeStore({
            [`${USER_PREFERENCES_PREFIX}--postEmojiSize`]: makePreference('postEmojiSize', 'default'),
            [`${USER_PREFERENCES_PREFIX}--reactionEmojiSize`]: makePreference('reactionEmojiSize', 'maxSize'),
        });

        await plugin.initialize({registerUserSettings: jest.fn()} as never, store as never);
        plugin.uninitialize();

        expect(classList.remove).toHaveBeenCalledWith('enhanced-emojis-enabled');
        expect(classList.remove).toHaveBeenCalledWith('enhanced-emojis-posts-enabled');
        expect(classList.remove).toHaveBeenCalledWith('enhanced-emojis-developer-mode');
        expect(classList.remove).toHaveBeenCalledWith('enhanced-emojis-reactions-enabled');
        expect(style.removeProperty).toHaveBeenCalledWith('--enhanced-post-emojis-size');
        expect(style.removeProperty).toHaveBeenCalledWith('--enhanced-reaction-emojis-size');
    });
});
