import {classifyEmojiElement, type EmojiKind} from '../emoji-classifier';

const CUSTOM_POST_EMOJI_CLASS = 'enhanced-emojis-custom-post-emoji';
const INLINE_POST_EMOJI_CLASS = 'enhanced-emojis-post-emoji-inline';
const STANDARD_POST_EMOJI_CLASS = 'enhanced-emojis-standard-post-emoji';
const STANDALONE_POST_EMOJI_CLASS = 'enhanced-emojis-post-emoji-standalone';

const POST_EMOJI_CLASSES = [
    CUSTOM_POST_EMOJI_CLASS,
    INLINE_POST_EMOJI_CLASS,
    STANDARD_POST_EMOJI_CLASS,
    STANDALONE_POST_EMOJI_CLASS,
] as const;

function hasNonEmojiContent(node: Node): boolean {
    if (node.nodeType === Node.TEXT_NODE) {
        return (node.textContent ?? '').trim().length > 0;
    }

    if (!(node instanceof Element)) {
        return false;
    }

    if (classifyEmojiElement(node) !== 'unknown' || node.tagName === 'BR') {
        return false;
    }

    return Array.from(node.childNodes).some((childNode) => hasNonEmojiContent(childNode));
}

interface ClassificationCounts {
    matched: number;
    standalone: number;
    inline: number;
}

export function classifyPostEmojiContainer(container: Element): ClassificationCounts {
    const existingClassifiedEmojiElements = Array.from(container.querySelectorAll<HTMLElement>(POST_EMOJI_CLASSES.map((className) => `.${className}`).join(', ')));
    existingClassifiedEmojiElements.forEach((emojiElement) => {
        emojiElement.classList.remove(...POST_EMOJI_CLASSES);
    });

    const emojiElements = Array.from(container.querySelectorAll<HTMLElement>('.emoticon')).map((element): {
        element: HTMLElement;
        kind: Exclude<EmojiKind, 'unknown'>;
    } | null => {
        const kind = classifyEmojiElement(element);
        return kind === 'unknown' ? null : {element, kind};
    }).filter((entry): entry is {element: HTMLElement; kind: Exclude<EmojiKind, 'unknown'>} => entry !== null);

    if (emojiElements.length === 0) {
        return {
            inline: 0,
            matched: 0,
            standalone: 0,
        };
    }

    const containsNonEmojiContent = Array.from(container.childNodes).some(hasNonEmojiContent);
    const layoutClass = containsNonEmojiContent ? INLINE_POST_EMOJI_CLASS : STANDALONE_POST_EMOJI_CLASS;
    const counts: ClassificationCounts = {
        inline: 0,
        matched: emojiElements.length,
        standalone: 0,
    };

    for (const {element: emojiElement, kind} of emojiElements) {
        emojiElement.classList.add(layoutClass);
        emojiElement.classList.add(kind === 'custom' ? CUSTOM_POST_EMOJI_CLASS : STANDARD_POST_EMOJI_CLASS);

        if (containsNonEmojiContent) {
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
    for (const emojiElement of root.querySelectorAll<HTMLElement>(POST_EMOJI_CLASSES.map((className) => `.${className}`).join(', '))) {
        emojiElement.classList.remove(...POST_EMOJI_CLASSES);
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

            const closestContainer = addedNode.closest('.post-message__text');
            if (closestContainer) {
                containers.add(closestContainer);
            }

            for (const nestedContainer of addedNode.querySelectorAll('.post-message__text')) {
                containers.add(nestedContainer);
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
