package main

type configuration struct {
    EnableEnhancedEmojis *bool `json:"EnableEnhancedEmojis"`
    EnableDeveloperMode   *bool `json:"EnableDeveloperMode"`
}

type configResponse struct {
    EnableEnhancedEmojis bool `json:"enableEnhancedEmojis"`
    EnableDeveloperMode   bool `json:"enableDeveloperMode"`
}

func (c *configuration) isEnhancedEmojisEnabled() bool {
    if c == nil || c.EnableEnhancedEmojis == nil {
        return true
    }

    return *c.EnableEnhancedEmojis
}

func (c *configuration) isDeveloperModeEnabled() bool {
    if c == nil || c.EnableDeveloperMode == nil {
        return false
    }

    return *c.EnableDeveloperMode
}
