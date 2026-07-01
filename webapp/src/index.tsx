import manifest from 'manifest';
import EnhancedEmojisPlugin from 'plugin';

import './styles.css';

declare global {
    interface Window {
        registerPlugin(pluginId: string, plugin: EnhancedEmojisPlugin): void;
    }
}

window.registerPlugin(manifest.id, new EnhancedEmojisPlugin());
