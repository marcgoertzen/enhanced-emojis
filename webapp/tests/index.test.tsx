export {};

describe('EnhancedEmojisPlugin entrypoint', () => {
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

    test('adds the enabled class during initialization', async () => {
        const classList = {
            add: jest.fn(),
        };

        Object.assign(global, {
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

        expect(classList.add).toHaveBeenCalledWith('enhanced-emojis-enabled');
    });

    test('removes the enabled class during uninitialize', async () => {
        const classList = {
            add: jest.fn(),
            remove: jest.fn(),
        };

        Object.assign(global, {
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
