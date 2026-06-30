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
    configuration     *configuration
}

func (p *EnhancedEmojisPlugin) OnConfigurationChange() error {
    configuration := new(configuration)
    if err := p.API.LoadPluginConfiguration(configuration); err != nil {
        return fmt.Errorf("failed to load plugin configuration: %w", err)
    }

    p.setConfiguration(configuration)
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
    if err := json.NewEncoder(w).Encode(configResponse{
        EnableEnhancedEmojis: p.getConfiguration().isEnhancedEmojisEnabled(),
    }); err != nil {
        http.Error(w, "failed to encode config response", http.StatusInternalServerError)
    }
}

func (p *EnhancedEmojisPlugin) getConfiguration() *configuration {
    p.configurationLock.RLock()
    defer p.configurationLock.RUnlock()

    if p.configuration == nil {
        return &configuration{}
    }

    return p.configuration
}

func (p *EnhancedEmojisPlugin) setConfiguration(configuration *configuration) {
    p.configurationLock.Lock()
    defer p.configurationLock.Unlock()
    p.configuration = configuration
}
