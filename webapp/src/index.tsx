import manifest from 'manifest';
import type {Store} from 'redux';

import type {GlobalState} from '@mattermost/types/store';

import type {PluginRegistry} from 'types/mattermost-webapp';

import './styles.css';

const ENABLED_ROOT_CLASS = 'enhanced-emojis-enabled';

export default class EnhancedEmojisPlugin {
    public async initialize(registry: PluginRegistry, store: Store<GlobalState>): Promise<void> {
        await Promise.all([Promise.resolve(registry), Promise.resolve(store)]);
        globalThis.document?.documentElement?.classList.add(ENABLED_ROOT_CLASS);
    }

    public uninitialize(): void {
        globalThis.document?.documentElement?.classList.remove(ENABLED_ROOT_CLASS);
    }
}

declare global {
    interface Window {
        registerPlugin(pluginId: string, plugin: EnhancedEmojisPlugin): void;
    }
}

window.registerPlugin(manifest.id, new EnhancedEmojisPlugin());
