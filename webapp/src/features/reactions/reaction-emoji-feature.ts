import type {EnhancedEmojisEffectiveConfig} from 'config';

export default class ReactionEmojiFeature {
    private rootElement?: HTMLElement;

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
        if (this.rootElement) {
            this.rootElement.classList.remove('enhanced-emojis-reactions-enabled');
            this.rootElement.style.removeProperty('--enhanced-reaction-emojis-size');
            this.rootElement.style.removeProperty('--enhanced-reaction-chip-padding-inline');
            this.rootElement.style.removeProperty('--enhanced-reaction-chip-padding-block');
            this.rootElement.style.removeProperty('--enhanced-reaction-chip-gap');
            this.rootElement.style.removeProperty('--enhanced-reaction-chip-min-height');
        }

        this.rootElement = undefined;
    }

    private applyConfig(config: EnhancedEmojisEffectiveConfig): void {
        if (!this.rootElement) {
            return;
        }

        this.rootElement.classList.toggle('enhanced-emojis-reactions-enabled', config.enableReactionEmojis);
        this.rootElement.style.setProperty('--enhanced-reaction-emojis-size', config.reactionEmojiSize);
        this.applyReactionLayoutConfig(config.reactionEmojiSize);
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
}
