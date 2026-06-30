package main

type emojiSize string

const (
    emojiSizeSmall      emojiSize = "small"
    emojiSizeDefault    emojiSize = "default"
    emojiSizeLarge      emojiSize = "large"
    emojiSizeExtraLarge emojiSize = "extraLarge"
)

type pluginConfiguration struct {
    EnableEnhancedEmojis *bool   `json:"EnableEnhancedEmojis"`
    EnableDeveloperMode   *bool   `json:"EnableDeveloperMode"`
    EmojiSize             *string `json:"EmojiSize"`
}

type EnhancedEmojisConfig struct {
    EnableEnhancedEmojis bool      `json:"enableEnhancedEmojis"`
    EnableDeveloperMode   bool      `json:"enableDeveloperMode"`
    EmojiSize             emojiSize `json:"emojiSize"`
}

func defaultEnhancedEmojisConfig() EnhancedEmojisConfig {
    return EnhancedEmojisConfig{
        EnableEnhancedEmojis: true,
        EnableDeveloperMode:   false,
        EmojiSize:             emojiSizeDefault,
    }
}

func (c *pluginConfiguration) normalize() EnhancedEmojisConfig {
    config := defaultEnhancedEmojisConfig()
    if c == nil {
        return config
    }

    if c.EnableEnhancedEmojis != nil {
        config.EnableEnhancedEmojis = *c.EnableEnhancedEmojis
    }

    if c.EnableDeveloperMode != nil {
        config.EnableDeveloperMode = *c.EnableDeveloperMode
    }

    if normalizedEmojiSize, ok := normalizeEmojiSize(c.EmojiSize); ok {
        config.EmojiSize = normalizedEmojiSize
    }

    return config
}

func normalizeEmojiSize(raw *string) (emojiSize, bool) {
    if raw == nil {
        return emojiSizeDefault, false
    }

    switch emojiSize(*raw) {
    case emojiSizeSmall, emojiSizeDefault, emojiSizeLarge, emojiSizeExtraLarge:
        return emojiSize(*raw), true
    default:
        return emojiSizeDefault, false
    }
}
