package main

type pluginConfiguration struct {
	EnableEnhancedPostEmojis     *bool `json:"EnableEnhancedPostEmojis"`
	EnableEnhancedReactionEmojis *bool `json:"EnableEnhancedReactionEmojis"`
	EnableDeveloperMode         *bool `json:"EnableDeveloperMode"`
	// Deprecated legacy keys kept for backward compatibility with existing plugin configs.
	EnableEnhancedEmojis *bool `json:"EnableEnhancedEmojis"`
	EnableReactionEmojis *bool `json:"EnableReactionEmojis"`
}

type EnhancedEmojisConfig struct {
	EnableEnhancedPostEmojis     bool `json:"enableEnhancedPostEmojis"`
	EnableEnhancedReactionEmojis bool `json:"enableEnhancedReactionEmojis"`
	EnableDeveloperMode          bool `json:"enableDeveloperMode"`
}

func defaultEnhancedEmojisConfig() EnhancedEmojisConfig {
	return EnhancedEmojisConfig{
		EnableEnhancedPostEmojis:     true,
		EnableEnhancedReactionEmojis: false,
		EnableDeveloperMode:          false,
	}
}

func (c *pluginConfiguration) normalize() EnhancedEmojisConfig {
	config := defaultEnhancedEmojisConfig()
	if c == nil {
		return config
	}

	if c.EnableEnhancedPostEmojis != nil {
		config.EnableEnhancedPostEmojis = *c.EnableEnhancedPostEmojis
	} else if c.EnableEnhancedEmojis != nil {
		config.EnableEnhancedPostEmojis = *c.EnableEnhancedEmojis
	}

	if c.EnableEnhancedReactionEmojis != nil {
		config.EnableEnhancedReactionEmojis = *c.EnableEnhancedReactionEmojis
	} else if c.EnableReactionEmojis != nil {
		config.EnableEnhancedReactionEmojis = *c.EnableReactionEmojis
	}

	if c.EnableDeveloperMode != nil {
		config.EnableDeveloperMode = *c.EnableDeveloperMode
	}

	return config
}
