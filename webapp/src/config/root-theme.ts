import type {EnhancedEmojisEffectiveConfig} from './effective-config';

// Retained only to remove the legacy marker left by older plugin builds.
const LEGACY_ROOT_ENABLED_CLASS = 'enhanced-emojis-enabled';

export function applyEnhancedEmojisRootState(rootElement: HTMLElement, config: EnhancedEmojisEffectiveConfig): void {
    rootElement.classList.remove(LEGACY_ROOT_ENABLED_CLASS);
    rootElement.classList.toggle('enhanced-emojis-developer-mode', config.enableDeveloperMode);
}

export function clearEnhancedEmojisRootState(rootElement: HTMLElement): void {
    rootElement.classList.remove(LEGACY_ROOT_ENABLED_CLASS);
    rootElement.classList.remove('enhanced-emojis-developer-mode');
}
