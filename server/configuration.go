package main

type pluginConfiguration struct {
	EnableEnhancedEmojis *bool `json:"EnableEnhancedEmojis"`
	EnableDeveloperMode  *bool `json:"EnableDeveloperMode"`
	EnableReactionEmojis *bool `json:"EnableReactionEmojis"`
}

type EnhancedEmojisConfig struct {
	EnableEnhancedEmojis bool `json:"enableEnhancedEmojis"`
	EnableDeveloperMode  bool `json:"enableDeveloperMode"`
	EnableReactionEmojis bool `json:"enableReactionEmojis"`
}

func defaultEnhancedEmojisConfig() EnhancedEmojisConfig {
	return EnhancedEmojisConfig{
		EnableEnhancedEmojis: true,
		EnableDeveloperMode:  false,
		EnableReactionEmojis: false,
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

	return config
}
