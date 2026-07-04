import type {EnhancedEmojisEffectiveConfig} from 'config';
import * as enhancedEmojisDebug from 'debug/enhanced-emojis-debug';

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
            this.rootElement.classList.remove('enhanced-emojis-reactions-enabled');
            this.rootElement.style.removeProperty('--enhanced-reaction-emojis-size');
            this.rootElement.style.removeProperty('--enhanced-reaction-chip-padding-inline');
            this.rootElement.style.removeProperty('--enhanced-reaction-chip-padding-block');
            this.rootElement.style.removeProperty('--enhanced-reaction-chip-gap');
            this.rootElement.style.removeProperty('--enhanced-reaction-chip-min-height');
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
        this.rootElement.classList.toggle('enhanced-emojis-reactions-enabled', config.enableReactionEmojis);
        this.rootElement.style.setProperty('--enhanced-reaction-emojis-size', config.reactionEmojiSize);
        this.applyReactionLayoutConfig(config.reactionEmojiSize);
        this.logReactionEmojiApplication();
    }

    private applyReactionLayoutConfig(reactionEmojiSize: string): void {
        if (!this.rootElement) {
            return;
        }

        const reactionSize = Number.parseInt(reactionEmojiSize, 10);
        const reactionChipPaddingInline = Math.max(4, Math.min(16, Math.round(reactionSize * 0.2)));
        const reactionChipPaddingBlock = Math.max(2, Math.min(10, Math.round(reactionSize * 0.1)));
        const reactionChipGap = Math.max(2, Math.min(8, Math.round(reactionSize * 0.12)));
        const reactionChipMinHeight = Math.max(reactionSize + (reactionChipPaddingBlock * 2), 24);

        this.rootElement.style.setProperty('--enhanced-reaction-chip-padding-inline', `${reactionChipPaddingInline}px`);
        this.rootElement.style.setProperty('--enhanced-reaction-chip-padding-block', `${reactionChipPaddingBlock}px`);
        this.rootElement.style.setProperty('--enhanced-reaction-chip-gap', `${reactionChipGap}px`);
        this.rootElement.style.setProperty('--enhanced-reaction-chip-min-height', `${reactionChipMinHeight}px`);
    }

    private logReactionEmojiApplication(): void {
        const reactionCount = globalThis.document?.body?.querySelectorAll('img.Reaction__emoji.emoticon[src*="/api/v4/emoji/"]').length ?? 0;

        enhancedEmojisDebug.debugLog('reaction_emojis_applied', {
            affectedReactionCount: reactionCount,
            selectedSize: this.currentConfig?.reactionEmojiSize,
        }, {
            adminDeveloperModeEnabled: this.debugLoggingEnabled,
        });
    }
}
