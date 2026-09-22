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

    test('standalone custom emoji uses the standalone class', () => {
        const root = createPostMessageHtml('<span class="emoticon" style="background-image:url(/api/v4/emoji/cat)"></span>');
        document.body.appendChild(root);

        classifyAllPostEmojiContainers(root);

        const [emoji] = getEmojiElements(root);
        expect(emoji.classList.contains('enhanced-emojis-post-emoji-standalone')).toBe(true);
        expect(emoji.classList.contains('enhanced-emojis-post-emoji-inline')).toBe(false);
        expect(emoji.classList.contains('enhanced-emojis-custom-post-emoji')).toBe(true);
    });

    test('multiple custom emoji-only message uses the standalone class', () => {
        const root = createPostMessageHtml(
            '<span class="emoticon" style="background-image:url(/api/v4/emoji/cat)"></span> <span class="emoticon" style="background-image:url(/api/v4/emoji/dog)"></span>',
        );
        document.body.appendChild(root);

        classifyAllPostEmojiContainers(root);

        for (const emoji of getEmojiElements(root)) {
            expect(emoji.classList.contains('enhanced-emojis-post-emoji-standalone')).toBe(true);
            expect(emoji.classList.contains('enhanced-emojis-post-emoji-inline')).toBe(false);
        }
    });

    test('inline custom emoji with text uses the inline class', () => {
        const root = createPostMessageHtml('Hello <span class="emoticon" style="background-image:url(/api/v4/emoji/cat)"></span>');
        document.body.appendChild(root);

        classifyAllPostEmojiContainers(root);

        const [emoji] = getEmojiElements(root);
        expect(emoji.classList.contains('enhanced-emojis-post-emoji-inline')).toBe(true);
        expect(emoji.classList.contains('enhanced-emojis-post-emoji-standalone')).toBe(false);
    });

    test('inline custom emoji with punctuation uses the inline class', () => {
        const root = createPostMessageHtml('<span class="emoticon" style="background-image:url(/api/v4/emoji/cat)"></span> wow!');
        document.body.appendChild(root);

        classifyAllPostEmojiContainers(root);

        const [emoji] = getEmojiElements(root);
        expect(emoji.classList.contains('enhanced-emojis-post-emoji-inline')).toBe(true);
        expect(emoji.classList.contains('enhanced-emojis-post-emoji-standalone')).toBe(false);
    });

    test.each([
        '<span class="emoticon" style="background-image:url(/static/emoji/1f604.png)"></span>',
        '<span class="emoticon emoticon--unicode">😮‍💨</span>',
    ])('standard standalone emoji uses the standalone and standard classes', (content) => {
        const root = createPostMessageHtml(content);
        document.body.appendChild(root);

        classifyAllPostEmojiContainers(root);

        const [emoji] = getEmojiElements(root);
        expect(emoji.classList.contains('enhanced-emojis-standard-post-emoji')).toBe(true);
        expect(emoji.classList.contains('enhanced-emojis-post-emoji-standalone')).toBe(true);
        expect(emoji.classList.contains('enhanced-emojis-post-emoji-inline')).toBe(false);
    });

    test('standard emoji inside normal text uses the inline class', () => {
        const root = createPostMessageHtml('Hello <span class="emoticon" style="background-image:url(/static/emoji/1f604.png)"></span>');
        document.body.appendChild(root);

        classifyAllPostEmojiContainers(root);

        const [emoji] = getEmojiElements(root);
        expect(emoji.classList.contains('enhanced-emojis-standard-post-emoji')).toBe(true);
        expect(emoji.classList.contains('enhanced-emojis-post-emoji-inline')).toBe(true);
        expect(emoji.classList.contains('enhanced-emojis-post-emoji-standalone')).toBe(false);
    });

    test('mixed custom and standard emoji-only posts remain standalone', () => {
        const root = createPostMessageHtml('<span class="emoticon" style="background-image:url(/api/v4/emoji/cat)"></span> <span class="emoticon emoticon--unicode">😀</span>');
        document.body.appendChild(root);

        classifyAllPostEmojiContainers(root);

        for (const emoji of getEmojiElements(root)) {
            expect(emoji.classList.contains('enhanced-emojis-post-emoji-standalone')).toBe(true);
        }
    });

    test('unknown emoticons are not classified', () => {
        const root = createPostMessageHtml('<span class="emoticon" style="background-image:url(/images/icon.png)"></span>');
        document.body.appendChild(root);

        expect(classifyAllPostEmojiContainers(root).matched).toBe(0);

        const [emoji] = getEmojiElements(root);
        expect(emoji.classList.contains('enhanced-emojis-standard-post-emoji')).toBe(false);
        expect(emoji.classList.contains('enhanced-emojis-custom-post-emoji')).toBe(false);
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

    test('clearing classification removes shared layout and type-specific classes', () => {
        const root = createPostMessageHtml('Hello <span class="emoticon enhanced-emojis-custom-post-emoji enhanced-emojis-standard-post-emoji enhanced-emojis-post-emoji-inline enhanced-emojis-post-emoji-standalone" style="background-image:url(/api/v4/emoji/cat)"></span>');
        document.body.appendChild(root);

        clearPostEmojiClassification(root);

        const [emoji] = getEmojiElements(root);
        expect(emoji.classList.contains('enhanced-emojis-post-emoji-inline')).toBe(false);
        expect(emoji.classList.contains('enhanced-emojis-post-emoji-standalone')).toBe(false);
        expect(emoji.classList.contains('enhanced-emojis-custom-post-emoji')).toBe(false);
        expect(emoji.classList.contains('enhanced-emojis-standard-post-emoji')).toBe(false);
    });
});
