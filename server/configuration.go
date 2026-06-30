package main

type emojiSize string

const (
    emojiSizeSmall      emojiSize = "small"
    emojiSizeDefault    emojiSize = "default"
    emojiSizeLarge      emojiSize = "large"
    emojiSizeExtraLarge emojiSize = "extraLarge"
    emojiSizeMaxSize    emojiSize = "maxSize"
)

type pluginConfiguration struct {
    EnableEnhancedEmojis *bool   `json:"EnableEnhancedEmojis"`
    EnableDeveloperMode   *bool   `json:"EnableDeveloperMode"`
    EnableReactionEmojis  *bool   `json:"EnableReactionEmojis"`
    EmojiSize             *string `json:"EmojiSize"`
    ReactionEmojiSize     *string `json:"ReactionEmojiSize"`
}

type EnhancedEmojisConfig struct {
    EnableEnhancedEmojis bool      `json:"enableEnhancedEmojis"`
    EnableDeveloperMode   bool      `json:"enableDeveloperMode"`
    EnableReactionEmojis  bool      `json:"enableReactionEmojis"`
    EmojiSize             emojiSize `json:"emojiSize"`
    ReactionEmojiSize     emojiSize `json:"reactionEmojiSize"`
}

func defaultEnhancedEmojisConfig() EnhancedEmojisConfig {
    return EnhancedEmojisConfig{
        EnableEnhancedEmojis: true,
        EnableDeveloperMode:   false,
        EnableReactionEmojis:  false,
        EmojiSize:             emojiSizeDefault,
        ReactionEmojiSize:     emojiSizeDefault,
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

    if c.EnableReactionEmojis != nil {
        config.EnableReactionEmojis = *c.EnableReactionEmojis
    }

    if normalizedEmojiSize, ok := normalizeEmojiSize(c.EmojiSize); ok {
        config.EmojiSize = normalizedEmojiSize
    }

    if normalizedReactionEmojiSize, ok := normalizeEmojiSize(c.ReactionEmojiSize); ok {
        config.ReactionEmojiSize = normalizedReactionEmojiSize
    }

    return config
}

func normalizeEmojiSize(raw *string) (emojiSize, bool) {
    if raw == nil {
        return emojiSizeDefault, false
    }

    switch emojiSize(*raw) {
    case emojiSizeSmall, emojiSizeDefault, emojiSizeLarge, emojiSizeExtraLarge, emojiSizeMaxSize:
        return emojiSize(*raw), true
    default:
        return emojiSizeDefault, false
    }
}
