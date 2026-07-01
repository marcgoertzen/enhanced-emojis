const INLINE_POST_EMOJI_CLASS = 'enhanced-emojis-inline';
const STANDALONE_POST_EMOJI_CLASS = 'enhanced-emojis-standalone';

function hasMeaningfulContent(node: Node): boolean {
    if (node.nodeType === Node.TEXT_NODE) {
        return (node.textContent ?? '').trim().length > 0;
    }

    if (!(node instanceof Element)) {
        return false;
    }

    if (node.matches('span.emoticon[style*="/api/v4/emoji/"]') || node.tagName === 'BR') {
        return false;
    }

    return Array.from(node.childNodes).some((childNode) => hasMeaningfulContent(childNode));
}

interface ClassificationCounts {
    matched: number;
    standalone: number;
    inline: number;
}

export function classifyPostEmojiContainer(container: Element): ClassificationCounts {
    const existingClassifiedEmojiElements = Array.from(container.querySelectorAll<HTMLElement>(`.${INLINE_POST_EMOJI_CLASS}, .${STANDALONE_POST_EMOJI_CLASS}`));
    existingClassifiedEmojiElements.forEach((emojiElement) => {
        emojiElement.classList.remove(INLINE_POST_EMOJI_CLASS);
        emojiElement.classList.remove(STANDALONE_POST_EMOJI_CLASS);
    });

    const customEmojiElements = Array.from(container.querySelectorAll<HTMLElement>('span.emoticon[style*="/api/v4/emoji/"]'));

    if (customEmojiElements.length === 0) {
        return {
            inline: 0,
            matched: 0,
            standalone: 0,
        };
    }

    const hasNonEmojiContent = Array.from(container.childNodes).some(hasMeaningfulContent);
    const classificationClass = hasNonEmojiContent ? INLINE_POST_EMOJI_CLASS : STANDALONE_POST_EMOJI_CLASS;
    const counts: ClassificationCounts = {
        inline: 0,
        matched: customEmojiElements.length,
        standalone: 0,
    };

    for (const emojiElement of customEmojiElements) {
        emojiElement.classList.add(classificationClass);

        if (hasNonEmojiContent) {
            counts.inline += 1;
        } else {
            counts.standalone += 1;
        }
    }

    return counts;
}

export function classifyAllPostEmojiContainers(root: ParentNode): ClassificationCounts {
    const totals: ClassificationCounts = {
        inline: 0,
        matched: 0,
        standalone: 0,
    };

    if (root instanceof Element && root.matches('.post-message__text')) {
        const counts = classifyPostEmojiContainer(root);
        totals.inline += counts.inline;
        totals.matched += counts.matched;
        totals.standalone += counts.standalone;
    }

    for (const container of root.querySelectorAll('.post-message__text')) {
        const counts = classifyPostEmojiContainer(container);
        totals.inline += counts.inline;
        totals.matched += counts.matched;
        totals.standalone += counts.standalone;
    }

    return totals;
}

export function clearPostEmojiClassification(root: ParentNode): void {
    for (const emojiElement of root.querySelectorAll<HTMLElement>(`.${INLINE_POST_EMOJI_CLASS}, .${STANDALONE_POST_EMOJI_CLASS}`)) {
        emojiElement.classList.remove(INLINE_POST_EMOJI_CLASS);
        emojiElement.classList.remove(STANDALONE_POST_EMOJI_CLASS);
    }
}

export function classifyPostEmojiMutations(mutationRecords: MutationRecord[]): Set<Element> {
    const containers = new Set<Element>();

    for (const mutation of mutationRecords) {
        const target = mutation.target instanceof Element ? mutation.target : mutation.target.parentElement;
        const closestContainer = target?.closest('.post-message__text');

        if (closestContainer) {
            containers.add(closestContainer);
        }

        for (const addedNode of mutation.addedNodes) {
            if (!(addedNode instanceof Element)) {
                continue;
            }

            if (addedNode.matches('.post-message__text')) {
                containers.add(addedNode);
            }

            const addedContainer = addedNode.closest('.post-message__text') ?? addedNode.querySelector('.post-message__text');
            if (addedContainer) {
                containers.add(addedContainer);
            }
        }

        if (mutation.type === 'attributes' && mutation.target instanceof Element) {
            const attributeTarget = mutation.target.closest('.post-message__text');

            if (attributeTarget) {
                containers.add(attributeTarget);
            }
        }
    }

    return containers;
}
