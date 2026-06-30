package main

import (
    "encoding/json"
    "fmt"
    "net/http"
    "sync"

    "github.com/mattermost/mattermost/server/public/plugin"
)

type EnhancedEmojisPlugin struct {
    plugin.MattermostPlugin

    configurationLock sync.RWMutex
    configuration     EnhancedEmojisConfig
}

func (p *EnhancedEmojisPlugin) OnConfigurationChange() error {
    configuration := new(pluginConfiguration)
    if err := p.API.LoadPluginConfiguration(configuration); err != nil {
        return fmt.Errorf("failed to load plugin configuration: %w", err)
    }

    p.setConfiguration(configuration.normalize())
    return nil
}

func (p *EnhancedEmojisPlugin) ServeHTTP(_ *plugin.Context, w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodGet {
        http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
        return
    }

    if r.URL.Path != "/config" {
        http.NotFound(w, r)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    if err := json.NewEncoder(w).Encode(p.getConfiguration()); err != nil {
        http.Error(w, "failed to encode config response", http.StatusInternalServerError)
    }
}

func (p *EnhancedEmojisPlugin) getConfiguration() EnhancedEmojisConfig {
    p.configurationLock.RLock()
    defer p.configurationLock.RUnlock()

    if p.configuration.EmojiSize == "" {
        return defaultEnhancedEmojisConfig()
    }

    return p.configuration
}

func (p *EnhancedEmojisPlugin) setConfiguration(configuration EnhancedEmojisConfig) {
    p.configurationLock.Lock()
    defer p.configurationLock.Unlock()
    p.configuration = configuration
}
