import type {EnhancedEmojisEffectiveConfig} from 'config';

import {classifyAllPostEmojiContainers, classifyPostEmojiMutations, clearPostEmojiClassification} from './post-emoji-classifier';

const POST_EMOJI_INITIAL_SCAN_INTERVAL_MS = 250;
const POST_EMOJI_INITIAL_SCAN_ATTEMPTS = 8;

export default class PostEmojiFeature {
    private rootElement?: HTMLElement;

    private postEmojiObserver?: MutationObserver;

    private postEmojiBodyObserver?: MutationObserver;

    private postEmojiInitialScanTimeoutId?: ReturnType<typeof globalThis.setTimeout>;

    private postEmojiInitialScanAttemptsRemaining = 0;

    public start(rootElement: HTMLElement, config: EnhancedEmojisEffectiveConfig): void {
        this.rootElement = rootElement;
        this.applyConfig(config);
    }

    public update(config: EnhancedEmojisEffectiveConfig): void {
        if (!this.rootElement) {
            return;
        }

        this.applyConfig(config);
    }

    public stop(): void {
        this.stopPostEmojiObserver();
        this.stopPostEmojiBodyObserver();
        this.clearPostEmojiInitialScanTimeout();
        this.clearPostEmojiClasses();

        if (this.rootElement) {
            this.rootElement.classList.remove('enhanced-emojis-posts-enabled');
            this.rootElement.style.removeProperty('--enhanced-post-emojis-size');
            this.rootElement.style.removeProperty('--enhanced-inline-post-emojis-size');
        }

        this.rootElement = undefined;
    }

    private applyConfig(config: EnhancedEmojisEffectiveConfig): void {
        if (!this.rootElement) {
            return;
        }

        this.rootElement.classList.toggle('enhanced-emojis-posts-enabled', config.enablePostEmojis);
        this.rootElement.style.setProperty('--enhanced-post-emojis-size', config.postEmojiSize);
        this.rootElement.style.setProperty('--enhanced-inline-post-emojis-size', config.inlinePostEmojiSize);
        this.syncPostEmojiClassification(config.enablePostEmojis);
    }

    private hasMutationObserver(): boolean {
        return typeof globalThis.MutationObserver === 'function';
    }

    private syncPostEmojiClassification(enablePostEmojis: boolean): void {
        const body = globalThis.document?.body;
        const root = globalThis.document?.documentElement;

        if (!root) {
            return;
        }

        if (!enablePostEmojis) {
            this.stopPostEmojiObserver();
            this.stopPostEmojiBodyObserver();
            this.clearPostEmojiInitialScanTimeout();
            this.clearPostEmojiClasses();
            return;
        }

        if (!body) {
            this.startPostEmojiInitialScans();
            this.startPostEmojiBodyObserver(root);
            return;
        }

        this.stopPostEmojiBodyObserver();
        classifyAllPostEmojiContainers(body);
        this.startPostEmojiInitialScans();

        if (!this.hasMutationObserver() || this.postEmojiObserver) {
            return;
        }

        this.postEmojiObserver = new MutationObserver((mutationRecords) => {
            const containers = classifyPostEmojiMutations(mutationRecords);
            containers.forEach((container) => {
                classifyAllPostEmojiContainers(container);
            });
        });
        this.postEmojiObserver.observe(body, {
            attributes: true,
            attributeFilter: ['style'],
            childList: true,
            subtree: true,
        });
    }

    private startPostEmojiBodyObserver(rootElement: HTMLElement): void {
        if (!this.hasMutationObserver() || this.postEmojiBodyObserver) {
            return;
        }

        this.postEmojiBodyObserver = new MutationObserver(() => {
            const body = globalThis.document?.body;

            if (!body) {
                return;
            }

            this.stopPostEmojiBodyObserver();
            this.syncPostEmojiClassification(true);
        });
        this.postEmojiBodyObserver.observe(rootElement, {
            childList: true,
        });
    }

    private stopPostEmojiObserver(): void {
        this.postEmojiObserver?.disconnect();
        this.postEmojiObserver = undefined;
    }

    private stopPostEmojiBodyObserver(): void {
        this.postEmojiBodyObserver?.disconnect();
        this.postEmojiBodyObserver = undefined;
    }

    private clearPostEmojiClasses(): void {
        if (!globalThis.document?.body) {
            return;
        }

        clearPostEmojiClassification(globalThis.document.body);
    }

    private startPostEmojiInitialScans(): void {
        this.clearPostEmojiInitialScanTimeout();
        this.postEmojiInitialScanAttemptsRemaining = POST_EMOJI_INITIAL_SCAN_ATTEMPTS;
        this.scheduleNextPostEmojiInitialScan();
    }

    private scheduleNextPostEmojiInitialScan(): void {
        if (this.postEmojiInitialScanAttemptsRemaining <= 0 || typeof globalThis.setTimeout !== 'function') {
            this.postEmojiInitialScanTimeoutId = undefined;
            return;
        }

        this.postEmojiInitialScanTimeoutId = globalThis.setTimeout(() => {
            this.postEmojiInitialScanTimeoutId = undefined;
            this.postEmojiInitialScanAttemptsRemaining -= 1;

            const body = globalThis.document?.body;
            if (body) {
                classifyAllPostEmojiContainers(body);
            }

            this.scheduleNextPostEmojiInitialScan();
        }, POST_EMOJI_INITIAL_SCAN_INTERVAL_MS);
    }

    private clearPostEmojiInitialScanTimeout(): void {
        if (this.postEmojiInitialScanTimeoutId === undefined) {
            return;
        }

        globalThis.clearTimeout(this.postEmojiInitialScanTimeoutId);
        this.postEmojiInitialScanTimeoutId = undefined;
        this.postEmojiInitialScanAttemptsRemaining = 0;
    }
}
