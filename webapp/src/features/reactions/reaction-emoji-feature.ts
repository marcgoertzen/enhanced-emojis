import type {EnhancedEmojisEffectiveConfig} from 'config';
import * as enhancedEmojisDebug from 'debug/enhanced-emojis-debug';

import {classifyEmojiElement} from '../emoji-classifier';

export default class ReactionEmojiFeature {
    private rootElement?: HTMLElement;

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
        if (this.rootElement) {
            this.rootElement.classList.remove('enhanced-emojis-custom-reactions-enabled');
            this.rootElement.classList.remove('enhanced-emojis-standard-reactions-enabled');
            this.rootElement.style.removeProperty('--enhanced-emojis-custom-reaction-size');
            this.rootElement.style.removeProperty('--enhanced-emojis-standard-reaction-size');
            for (const emojiType of ['custom', 'standard'] as const) {
                this.rootElement.style.removeProperty(`--enhanced-emojis-${emojiType}-reaction-chip-padding-inline`);
                this.rootElement.style.removeProperty(`--enhanced-emojis-${emojiType}-reaction-chip-padding-block`);
                this.rootElement.style.removeProperty(`--enhanced-emojis-${emojiType}-reaction-chip-gap`);
                this.rootElement.style.removeProperty(`--enhanced-emojis-${emojiType}-reaction-chip-min-height`);
            }
        }

        this.debugLoggingEnabled = false;
        this.currentConfig = undefined;
        this.rootElement = undefined;
    }

    private applyConfig(config: EnhancedEmojisEffectiveConfig): void {
        if (!this.rootElement) {
            return;
        }

        this.currentConfig = config;
        this.rootElement.classList.toggle('enhanced-emojis-custom-reactions-enabled', config.enableCustomReactionEmojis);
        this.rootElement.classList.toggle('enhanced-emojis-standard-reactions-enabled', config.enableStandardReactionEmojis);
        this.rootElement.style.setProperty('--enhanced-emojis-custom-reaction-size', config.customReactionEmojiSize);
        this.rootElement.style.setProperty('--enhanced-emojis-standard-reaction-size', config.standardReactionEmojiSize);
        this.applyReactionLayoutConfig(config.customReactionEmojiSize, 'custom');
        this.applyReactionLayoutConfig(config.standardReactionEmojiSize, 'standard');
        this.logReactionEmojiApplication();
    }

    private applyReactionLayoutConfig(reactionEmojiSize: string, emojiType: 'custom' | 'standard'): void {
        if (!this.rootElement) {
            return;
        }

        const reactionSize = Number.parseInt(reactionEmojiSize, 10);
        const reactionChipPaddingInline = Math.max(4, Math.min(16, Math.round(reactionSize * 0.2)));
        const reactionChipPaddingBlock = Math.max(2, Math.min(10, Math.round(reactionSize * 0.1)));
        const reactionChipGap = Math.max(2, Math.min(8, Math.round(reactionSize * 0.12)));
        const reactionChipMinHeight = Math.max(reactionSize + (reactionChipPaddingBlock * 2), 24);

        this.rootElement.style.setProperty(`--enhanced-emojis-${emojiType}-reaction-chip-padding-inline`, `${reactionChipPaddingInline}px`);
        this.rootElement.style.setProperty(`--enhanced-emojis-${emojiType}-reaction-chip-padding-block`, `${reactionChipPaddingBlock}px`);
        this.rootElement.style.setProperty(`--enhanced-emojis-${emojiType}-reaction-chip-gap`, `${reactionChipGap}px`);
        this.rootElement.style.setProperty(`--enhanced-emojis-${emojiType}-reaction-chip-min-height`, `${reactionChipMinHeight}px`);
    }

    private logReactionEmojiApplication(): void {
        const reactionElements = Array.from(globalThis.document?.body?.querySelectorAll('img.Reaction__emoji.emoticon') ?? []);
        const reactionCount = reactionElements.filter((element) => {
            const kind = classifyEmojiElement(element);
            return kind === 'custom' || (kind === 'standard' && this.currentConfig?.enableStandardReactionEmojis);
        }).length;

        enhancedEmojisDebug.debugLog('reaction_emojis_applied', {
            affectedReactionCount: reactionCount,
            customSelectedSize: this.currentConfig?.customReactionEmojiSize,
            standardSelectedSize: this.currentConfig?.standardReactionEmojiSize,
        }, {
            adminDeveloperModeEnabled: this.debugLoggingEnabled,
        });
    }
}
