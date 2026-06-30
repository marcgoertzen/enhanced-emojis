import manifest from 'manifest';
import type {Store} from 'redux';

import type {GlobalState} from '@mattermost/types/store';

import type {PluginRegistry} from 'types/mattermost-webapp';

import './styles.css';

export default class EnhancedEmojisPlugin {
    public async initialize(registry: PluginRegistry, store: Store<GlobalState>): Promise<void> {
        await Promise.all([Promise.resolve(registry), Promise.resolve(store)]);
    }
}

declare global {
    interface Window {
        registerPlugin(pluginId: string, plugin: EnhancedEmojisPlugin): void;
    }
}

window.registerPlugin(manifest.id, new EnhancedEmojisPlugin());
