/** @jest-environment jsdom */

export {};

import {makePreference, makeStore} from './helpers';

const PLUGIN_ID = 'de.dakosy.enhanced-emojis';
const USER_PREFERENCES_PREFIX = `pp_${PLUGIN_ID}`;

describe('EnhancedEmojisPlugin post classification', () => {
    beforeEach(() => {
        jest.resetModules();
        jest.useFakeTimers();
        document.documentElement.className = '';
        document.documentElement.removeAttribute('style');
        document.body.innerHTML = '';
        Object.assign(window, {
            registerPlugin: jest.fn(),
        });
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.clearAllTimers();
        jest.useRealTimers();
        document.documentElement.className = '';
        document.documentElement.removeAttribute('style');
        document.body.innerHTML = '';
    });

    test('classifier runs after effective config is resolved on initial load', async () => {
        document.body.innerHTML = '<div class="post-message__text">Hello <span class="emoticon" style="background-image:url(/api/v4/emoji/cat)"></span></div>';
        const fetch = jest.fn(async () => ({
            ok: true,
            json: async () => ({
                enableEnhancedPostEmojis: true,
                enableEnhancedReactionEmojis: false,
                enableDeveloperMode: false,
            }),
        }));

        Object.assign(global, {fetch});

        const {default: EnhancedEmojisPlugin} = require('../src/plugin');
        const plugin = new EnhancedEmojisPlugin();
        const store = makeStore({
            [`${USER_PREFERENCES_PREFIX}--enableEnhancedEmojis`]: makePreference('EnableEnhancedEmojis', 'true'),
            [`${USER_PREFERENCES_PREFIX}--postEmojiSize`]: makePreference('postEmojiSize', 'large'),
            [`${USER_PREFERENCES_PREFIX}--inlinePostEmojiSize`]: makePreference('InlinePostEmojiSize', 'medium'),
        }, 'en');

        await plugin.initialize({registerUserSettings: jest.fn(), registerTranslations: jest.fn()} as never, store as never);

        const emoji = document.body.querySelector('.emoticon') as HTMLElement;
        expect(emoji.classList.contains('enhanced-emojis-inline')).toBe(true);
        plugin.uninitialize();
    });

    test('classifier runs when custom emoji style attributes are updated', async () => {
        document.body.innerHTML = '<div class="post-message__text">Hello <span class="emoticon"></span></div>';
        const fetch = jest.fn(async () => ({
            ok: true,
            json: async () => ({
                enableEnhancedPostEmojis: true,
                enableEnhancedReactionEmojis: false,
                enableDeveloperMode: false,
            }),
        }));

        Object.assign(global, {fetch});

        const {default: EnhancedEmojisPlugin} = require('../src/plugin');
        const plugin = new EnhancedEmojisPlugin();
        const store = makeStore({
            [`${USER_PREFERENCES_PREFIX}--enableEnhancedEmojis`]: makePreference('EnableEnhancedEmojis', 'true'),
        }, 'en');

        await plugin.initialize({registerUserSettings: jest.fn(), registerTranslations: jest.fn()} as never, store as never);

        const emoji = document.body.querySelector('.emoticon') as HTMLElement;
        emoji.setAttribute('style', 'background-image:url(/api/v4/emoji/cat)');
        await Promise.resolve();

        expect(emoji.classList.contains('enhanced-emojis-inline')).toBe(true);
        plugin.uninitialize();
    });
});
