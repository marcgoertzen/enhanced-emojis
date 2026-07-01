import type {EnhancedEmojisEffectiveConfig} from './effective-config';

export function applyEnhancedEmojisRootState(rootElement: HTMLElement, config: EnhancedEmojisEffectiveConfig): void {
    rootElement.classList.remove('enhanced-emojis-enabled');
    rootElement.classList.toggle('enhanced-emojis-developer-mode', config.enableDeveloperMode);
}

export function clearEnhancedEmojisRootState(rootElement: HTMLElement): void {
    rootElement.classList.remove('enhanced-emojis-enabled');
    rootElement.classList.remove('enhanced-emojis-developer-mode');
}
