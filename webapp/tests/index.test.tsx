export {};

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
            'de.dakosy.enhanced-emojis',
            expect.objectContaining({
                initialize: expect.any(Function),
            }),
        );
    });

    test('adds the enabled class when the server config enables it', async () => {
        const classList = {
            toggle: jest.fn(),
        };
        const style = {
            setProperty: jest.fn(),
            removeProperty: jest.fn(),
        };
        const fetch = jest.fn(async () => ({
            ok: true,
            json: async () => ({
                enableEnhancedEmojis: true,
                enableDeveloperMode: false,
                enableReactionEmojis: true,
                emojiSize: 'small',
                reactionEmojiSize: 'large',
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
        const store = {
            getState: jest.fn(() => ({
                entities: {
                    admin: {
                        config: {},
                    },
                },
            })),
        };

        await plugin.initialize({} as never, store as never);

        expect(fetch).toHaveBeenCalledWith('/plugins/de.dakosy.enhanced-emojis/config');
        expect(classList.toggle).toHaveBeenCalledWith('enhanced-emojis-enabled', true);
        expect(classList.toggle).toHaveBeenCalledWith('enhanced-emojis-developer-mode', false);
        expect(classList.toggle).toHaveBeenCalledWith('enhanced-emojis-reactions-enabled', true);
        expect(style.setProperty).toHaveBeenCalledWith('--enhanced-emojis-size', '24px');
        expect(style.setProperty).toHaveBeenCalledWith('--enhanced-reaction-emojis-size', '48px');
    });

    test('removes the enabled class when the server config disables it', async () => {
        const classList = {
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
                enableReactionEmojis: false,
                emojiSize: 'large',
                reactionEmojiSize: 'extraLarge',
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
        const store = {
            getState: jest.fn(() => ({
                entities: {
                    admin: {
                        config: {},
                    },
                },
            })),
        };

        await plugin.initialize({} as never, store as never);

        expect(classList.toggle).toHaveBeenCalledWith('enhanced-emojis-enabled', false);
        expect(classList.toggle).toHaveBeenCalledWith('enhanced-emojis-developer-mode', true);
        expect(classList.toggle).toHaveBeenCalledWith('enhanced-emojis-reactions-enabled', false);
        expect(style.setProperty).toHaveBeenCalledWith('--enhanced-emojis-size', '64px');
        expect(style.setProperty).toHaveBeenCalledWith('--enhanced-reaction-emojis-size', '64px');
    });

    test('falls back to default classes when the config fetch fails', async () => {
        const classList = {
            toggle: jest.fn(),
        };
        const style = {
            setProperty: jest.fn(),
            removeProperty: jest.fn(),
        };
        const fetch = jest.fn(async () => {
            throw new Error('network error');
        });

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
        const store = {
            getState: jest.fn(() => ({
                entities: {
                    admin: {
                        config: {},
                    },
                },
            })),
        };

        await plugin.initialize({} as never, store as never);

        expect(classList.toggle).toHaveBeenCalledWith('enhanced-emojis-enabled', true);
        expect(classList.toggle).toHaveBeenCalledWith('enhanced-emojis-developer-mode', false);
        expect(classList.toggle).toHaveBeenCalledWith('enhanced-emojis-reactions-enabled', false);
        expect(style.setProperty).toHaveBeenCalledWith('--enhanced-emojis-size', '32px');
        expect(style.setProperty).toHaveBeenCalledWith('--enhanced-reaction-emojis-size', '32px');
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
                emojiSize: 'default',
                reactionEmojiSize: 'maxSize',
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
        const store = {
            getState: jest.fn(() => ({
                entities: {
                    admin: {
                        config: {},
                    },
                },
            })),
        };

        await plugin.initialize({} as never, store as never);
        plugin.uninitialize();

        expect(classList.remove).toHaveBeenCalledWith('enhanced-emojis-enabled');
        expect(classList.remove).toHaveBeenCalledWith('enhanced-emojis-developer-mode');
        expect(classList.remove).toHaveBeenCalledWith('enhanced-emojis-reactions-enabled');
        expect(style.removeProperty).toHaveBeenCalledWith('--enhanced-emojis-size');
        expect(style.removeProperty).toHaveBeenCalledWith('--enhanced-reaction-emojis-size');
    });
});
