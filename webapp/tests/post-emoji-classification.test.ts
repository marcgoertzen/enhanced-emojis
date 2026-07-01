/** @jest-environment jsdom */

import {classifyAllPostEmojiContainers, classifyPostEmojiMutations, clearPostEmojiClassification} from 'features/posts/post-emoji-classifier';

function createPostMessageHtml(content: string): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<div class="post-message__text">${content}</div>`;
    return wrapper;
}

function getEmojiElements(root: HTMLElement): HTMLElement[] {
    return Array.from(root.querySelectorAll('.emoticon'));
}

describe('post emoji classification', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    test('standalone emoji uses the standalone class', () => {
        const root = createPostMessageHtml('<span class="emoticon" style="background-image:url(/api/v4/emoji/cat)"></span>');
        document.body.appendChild(root);

        classifyAllPostEmojiContainers(root);

        const [emoji] = getEmojiElements(root);
        expect(emoji.classList.contains('enhanced-emojis-standalone')).toBe(true);
        expect(emoji.classList.contains('enhanced-emojis-inline')).toBe(false);
    });

    test('multiple emoji-only message uses the standalone class', () => {
        const root = createPostMessageHtml(
            '<span class="emoticon" style="background-image:url(/api/v4/emoji/cat)"></span> <span class="emoticon" style="background-image:url(/api/v4/emoji/dog)"></span>',
        );
        document.body.appendChild(root);

        classifyAllPostEmojiContainers(root);

        for (const emoji of getEmojiElements(root)) {
            expect(emoji.classList.contains('enhanced-emojis-standalone')).toBe(true);
            expect(emoji.classList.contains('enhanced-emojis-inline')).toBe(false);
        }
    });

    test('inline emoji with text uses the inline class', () => {
        const root = createPostMessageHtml('Hello <span class="emoticon" style="background-image:url(/api/v4/emoji/cat)"></span>');
        document.body.appendChild(root);

        classifyAllPostEmojiContainers(root);

        const [emoji] = getEmojiElements(root);
        expect(emoji.classList.contains('enhanced-emojis-inline')).toBe(true);
        expect(emoji.classList.contains('enhanced-emojis-standalone')).toBe(false);
    });

    test('inline emoji with punctuation uses the inline class', () => {
        const root = createPostMessageHtml('<span class="emoticon" style="background-image:url(/api/v4/emoji/cat)"></span> wow!');
        document.body.appendChild(root);

        classifyAllPostEmojiContainers(root);

        const [emoji] = getEmojiElements(root);
        expect(emoji.classList.contains('enhanced-emojis-inline')).toBe(true);
        expect(emoji.classList.contains('enhanced-emojis-standalone')).toBe(false);
    });

    test('style attribute mutations on custom emoji nodes trigger reclassification of the post container', () => {
        const root = createPostMessageHtml('Hello <span class="emoticon" style="background-image:url(/api/v4/emoji/cat)"></span>');
        document.body.appendChild(root);

        const emoji = root.querySelector('span.emoticon') as HTMLElement;
        const mutationRecord = {
            addedNodes: [],
            attributeName: 'style',
            attributeNamespace: null,
            nextSibling: null,
            oldValue: '',
            previousSibling: null,
            removedNodes: [],
            target: emoji,
            type: 'attributes',
        } as unknown as MutationRecord;

        const containers = classifyPostEmojiMutations([mutationRecord]);
        expect(Array.from(containers)).toEqual([root.querySelector('.post-message__text')]);
    });

    test('clearing classification removes both classes', () => {
        const root = createPostMessageHtml('Hello <span class="emoticon enhanced-emojis-inline enhanced-emojis-standalone" style="background-image:url(/api/v4/emoji/cat)"></span>');
        document.body.appendChild(root);

        clearPostEmojiClassification(root);

        const [emoji] = getEmojiElements(root);
        expect(emoji.classList.contains('enhanced-emojis-inline')).toBe(false);
        expect(emoji.classList.contains('enhanced-emojis-standalone')).toBe(false);
    });
});
