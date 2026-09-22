package main

type pluginConfiguration struct {
	EnableCustomPostEmojis       *bool `json:"EnableCustomPostEmojis"`
	EnableCustomReactionEmojis   *bool `json:"EnableCustomReactionEmojis"`
	EnableStandardPostEmojis     *bool `json:"EnableStandardPostEmojis"`
	EnableStandardReactionEmojis *bool `json:"EnableStandardReactionEmojis"`
	EnableEnhancedPostEmojis     *bool `json:"EnableEnhancedPostEmojis"`
	EnableEnhancedReactionEmojis *bool `json:"EnableEnhancedReactionEmojis"`
	EnableDeveloperMode          *bool `json:"EnableDeveloperMode"`
	// Deprecated legacy keys kept for backward compatibility with existing plugin configs.
	EnableEnhancedEmojis *bool `json:"EnableEnhancedEmojis"`
	EnableReactionEmojis *bool `json:"EnableReactionEmojis"`
}

type EnhancedEmojisConfig struct {
	EnableCustomPostEmojis       bool `json:"enableCustomPostEmojis"`
	EnableCustomReactionEmojis   bool `json:"enableCustomReactionEmojis"`
	EnableStandardPostEmojis     bool `json:"enableStandardPostEmojis"`
	EnableStandardReactionEmojis bool `json:"enableStandardReactionEmojis"`
	EnableDeveloperMode          bool `json:"enableDeveloperMode"`
}

func defaultEnhancedEmojisConfig() EnhancedEmojisConfig {
	return EnhancedEmojisConfig{
		EnableCustomPostEmojis:       true,
		EnableCustomReactionEmojis:   true,
		EnableStandardPostEmojis:     true,
		EnableStandardReactionEmojis: true,
		EnableDeveloperMode:          false,
	}
}

func (c *pluginConfiguration) normalize() EnhancedEmojisConfig {
	config := defaultEnhancedEmojisConfig()
	if c == nil {
		return config
	}

	legacyPost := c.EnableEnhancedPostEmojis
	if legacyPost == nil {
		legacyPost = c.EnableEnhancedEmojis
	}
	legacyReaction := c.EnableEnhancedReactionEmojis
	if legacyReaction == nil {
		legacyReaction = c.EnableReactionEmojis
	}

	if c.EnableCustomPostEmojis != nil {
		config.EnableCustomPostEmojis = *c.EnableCustomPostEmojis
	} else if legacyPost != nil {
		config.EnableCustomPostEmojis = *legacyPost
	}
	if c.EnableStandardPostEmojis != nil {
		config.EnableStandardPostEmojis = *c.EnableStandardPostEmojis
	} else if legacyPost != nil {
		config.EnableStandardPostEmojis = *legacyPost
	}
	if c.EnableCustomReactionEmojis != nil {
		config.EnableCustomReactionEmojis = *c.EnableCustomReactionEmojis
	} else if legacyReaction != nil {
		config.EnableCustomReactionEmojis = *legacyReaction
	}
	if c.EnableStandardReactionEmojis != nil {
		config.EnableStandardReactionEmojis = *c.EnableStandardReactionEmojis
	} else if legacyReaction != nil {
		config.EnableStandardReactionEmojis = *legacyReaction
	}

	if c.EnableDeveloperMode != nil {
		config.EnableDeveloperMode = *c.EnableDeveloperMode
	}

	return config
}
