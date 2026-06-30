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
        const fetch = jest.fn(async () => ({
            ok: true,
            json: async () => ({
                enableEnhancedEmojis: true,
            }),
        }));

        Object.assign(global, {
            fetch,
            document: {
                documentElement: {
                    classList,
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
    });

    test('removes the enabled class when the server config disables it', async () => {
        const classList = {
            toggle: jest.fn(),
        };
        const fetch = jest.fn(async () => ({
            ok: true,
            json: async () => ({
                enableEnhancedEmojis: false,
            }),
        }));

        Object.assign(global, {
            fetch,
            document: {
                documentElement: {
                    classList,
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
    });

    test('falls back to enabled when the config fetch fails', async () => {
        const classList = {
            toggle: jest.fn(),
        };
        const fetch = jest.fn(async () => {
            throw new Error('network error');
        });

        Object.assign(global, {
            fetch,
            document: {
                documentElement: {
                    classList,
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
    });

    test('removes the enabled class during uninitialize', async () => {
        const classList = {
            toggle: jest.fn(),
            remove: jest.fn(),
        };
        const fetch = jest.fn(async () => ({
            ok: true,
            json: async () => ({
                enableEnhancedEmojis: true,
            }),
        }));

        Object.assign(global, {
            fetch,
            document: {
                documentElement: {
                    classList,
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
    });
});
