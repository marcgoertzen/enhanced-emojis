package main

type configuration struct {
    EnableEnhancedEmojis *bool `json:"EnableEnhancedEmojis"`
}

type configResponse struct {
    EnableEnhancedEmojis bool `json:"enableEnhancedEmojis"`
}

func (c *configuration) isEnhancedEmojisEnabled() bool {
    if c == nil || c.EnableEnhancedEmojis == nil {
        return true
    }

    return *c.EnableEnhancedEmojis
}
