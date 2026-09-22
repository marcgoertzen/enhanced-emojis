/** @jest-environment jsdom */

import {classifyEmojiElement} from 'features/emoji-classifier';

function createElement(html: string): Element {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    return wrapper.firstElementChild as Element;
}

describe('emoji classification', () => {
    test('classifies custom emoji API assets', () => {
        expect(classifyEmojiElement(createElement('<span class="emoticon" style="background-image:url(/api/v4/emoji/cat/image)"></span>'))).toBe('custom');
        expect(classifyEmojiElement(createElement('<img class="Reaction__emoji emoticon" src="/api/v4/emoji/cat/image">'))).toBe('custom');
    });

    test('classifies standard Mattermost emoji assets', () => {
        expect(classifyEmojiElement(createElement('<span class="emoticon" style="background-image:url(/static/emoji/1f604.png)"></span>'))).toBe('standard');
        expect(classifyEmojiElement(createElement('<img class="Reaction__emoji emoticon" src="/static/emoji/1f604.png">'))).toBe('standard');
    });

    test('classifies native Unicode emoji fallbacks', () => {
        expect(classifyEmojiElement(createElement('<span class="emoticon emoticon--unicode">😮‍💨</span>'))).toBe('standard');
    });

    test('leaves unrelated elements unknown', () => {
        expect(classifyEmojiElement(createElement('<img class="Reaction__emoji emoticon" src="/images/icon.png">'))).toBe('unknown');
        expect(classifyEmojiElement(createElement('<span class="icon" style="background-image:url(/static/emoji/1f604.png)"></span>'))).toBe('unknown');
    });
});
