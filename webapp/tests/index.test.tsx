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
});
