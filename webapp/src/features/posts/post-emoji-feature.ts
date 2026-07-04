import type {EnhancedEmojisEffectiveConfig} from 'config';
import * as enhancedEmojisDebug from 'debug/enhanced-emojis-debug';

import {
    classifyAllPostEmojiContainers,
    classifyPostEmojiMutations,
    clearPostEmojiClassification,
} from './post-emoji-classifier';

const POST_EMOJI_INITIAL_SCAN_INTERVAL_MS = 250;
const POST_EMOJI_INITIAL_SCAN_ATTEMPTS = 8;

export default class PostEmojiFeature {
    private rootElement?: HTMLElement;

    private postEmojiObserver?: MutationObserver;

    private postEmojiBodyObserver?: MutationObserver;

    private postEmojiInitialScanTimeoutId?: ReturnType<typeof globalThis.setTimeout>;

    private postEmojiInitialScanAttemptsRemaining = 0;

    private currentConfig?: EnhancedEmojisEffectiveConfig;

    private debugLoggingEnabled = false;

    public start(rootElement: HTMLElement, config: EnhancedEmojisEffectiveConfig, debugLoggingEnabled = false): void {
        this.rootElement = rootElement;
        this.debugLoggingEnabled = debugLoggingEnabled;
        this.applyConfig(config);
    }

    public update(config: EnhancedEmojisEffectiveConfig, debugLoggingEnabled = false): void {
        if (!this.rootElement) {
            return;
        }

        this.debugLoggingEnabled = debugLoggingEnabled;
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

        this.debugLoggingEnabled = false;
        this.rootElement = undefined;
    }

    private applyConfig(config: EnhancedEmojisEffectiveConfig): void {
        if (!this.rootElement) {
            return;
        }

        this.currentConfig = config;
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
        this.logPostEmojiClassification(classifyAllPostEmojiContainers(body));
        this.startPostEmojiInitialScans();

        if (!this.hasMutationObserver() || this.postEmojiObserver) {
            return;
        }

        this.postEmojiObserver = new MutationObserver((mutationRecords) => {
            const containers = classifyPostEmojiMutations(mutationRecords);
            containers.forEach((container) => {
                this.logPostEmojiClassification(classifyAllPostEmojiContainers(container));
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
                this.logPostEmojiClassification(classifyAllPostEmojiContainers(body));
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

    private logPostEmojiClassification(counts: {
        inline: number;
        matched: number;
        standalone: number;
    }): void {
        let postMode: 'inline' | 'mixed' | 'none' | 'standalone' = 'none';
        if (counts.matched > 0) {
            if (counts.inline > 0 && counts.standalone > 0) {
                postMode = 'mixed';
            } else if (counts.inline > 0) {
                postMode = 'inline';
            } else {
                postMode = 'standalone';
            }
        }

        enhancedEmojisDebug.debugLog('post_emojis_applied', {
            affectedElementCount: counts.matched,
            postMode,
            selectedSize: this.currentConfig?.postEmojiSize,
        }, {
            adminDeveloperModeEnabled: this.debugLoggingEnabled,
        });
    }
}
