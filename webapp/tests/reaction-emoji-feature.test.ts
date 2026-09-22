/** @jest-environment jsdom */

import type {EnhancedEmojisEffectiveConfig} from 'config';
import ReactionEmojiFeature from 'features/reactions/reaction-emoji-feature';

const BASE_CONFIG: EnhancedEmojisEffectiveConfig = {
    enableDeveloperMode: false,
    enableCustomPostEmojis: true,
    enableCustomReactionEmojis: true,
    enableStandardPostEmojis: false,
    enableStandardReactionEmojis: false,
    customPostEmojiSize: '32px',
    customInlinePostEmojiSize: '20px',
    customReactionEmojiSize: '32px',
    standardPostEmojiSize: '32px',
    standardInlinePostEmojiSize: '20px',
    standardReactionEmojiSize: '32px',
};

describe('reaction emoji feature', () => {
    afterEach(() => {
        document.documentElement.className = '';
        document.documentElement.removeAttribute('style');
        document.body.innerHTML = '';
    });

    test('keeps standard reactions disabled by default', () => {
        const feature = new ReactionEmojiFeature();
        feature.start(document.documentElement, BASE_CONFIG);

        expect(document.documentElement.classList.contains('enhanced-emojis-custom-reactions-enabled')).toBe(true);
        expect(document.documentElement.classList.contains('enhanced-emojis-standard-reactions-enabled')).toBe(false);
    });

    test('enables standard reactions independently from custom reaction styling', () => {
        const feature = new ReactionEmojiFeature();
        feature.start(document.documentElement, {
            ...BASE_CONFIG,
            enableStandardReactionEmojis: true,
        });

        expect(document.documentElement.classList.contains('enhanced-emojis-custom-reactions-enabled')).toBe(true);
        expect(document.documentElement.classList.contains('enhanced-emojis-standard-reactions-enabled')).toBe(true);

        feature.stop();
        expect(document.documentElement.classList.contains('enhanced-emojis-custom-reactions-enabled')).toBe(false);
        expect(document.documentElement.classList.contains('enhanced-emojis-standard-reactions-enabled')).toBe(false);
    });
});
