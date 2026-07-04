import {debugError, debugLog, debugWarn} from 'debug/enhanced-emojis-debug';

describe('enhanced emojis debug helper', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('does not emit debug output when developer mode is disabled', () => {
        const consoleLog = jest.spyOn(console, 'log').mockImplementation(() => undefined);
        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
        const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

        debugLog('test_event', {value: true}, {adminDeveloperModeEnabled: false});
        debugError('test_error', new Error('failed'), {value: true}, {adminDeveloperModeEnabled: false});
        debugWarn('test_warn', {value: true}, {adminDeveloperModeEnabled: false});

        expect(consoleLog).not.toHaveBeenCalled();
        expect(consoleError).not.toHaveBeenCalled();
        expect(consoleWarn).not.toHaveBeenCalled();
    });

    test('emits debug output when developer mode is enabled', () => {
        const consoleLog = jest.spyOn(console, 'log').mockImplementation(() => undefined);

        debugLog('test_event', {value: true}, {adminDeveloperModeEnabled: true});

        expect(consoleLog).toHaveBeenCalledWith('[Enhanced Emojis Debug] test_event', {value: true});
    });

    test('emits warning output when developer mode is enabled', () => {
        const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

        debugWarn('test_warn', {value: true}, {adminDeveloperModeEnabled: true});

        expect(consoleWarn).toHaveBeenCalledWith('[Enhanced Emojis Debug] test_warn', {value: true});
    });
});
