package main

import (
	"encoding/json"
	"strings"
	"testing"
)

func boolPointer(value bool) *bool {
	return &value
}

func TestPluginConfigurationNormalizeDefaults(t *testing.T) {
	got := (*pluginConfiguration)(nil).normalize()
	want := defaultEnhancedEmojisConfig()
	if got != want {
		t.Fatalf("normalize(nil) = %#v, want %#v", got, want)
	}
}

func TestPluginConfigurationNormalizeLegacyFallback(t *testing.T) {
	got := (&pluginConfiguration{
		EnableEnhancedPostEmojis:     boolPointer(false),
		EnableEnhancedReactionEmojis: boolPointer(true),
	}).normalize()
	if got.EnableCustomPostEmojis || got.EnableStandardPostEmojis {
		t.Fatalf("legacy post setting should disable both post gates: %#v", got)
	}
	if !got.EnableCustomReactionEmojis || !got.EnableStandardReactionEmojis {
		t.Fatalf("legacy reaction setting should enable both reaction gates: %#v", got)
	}
}

func TestPluginConfigurationNormalizeExplicitValuesOverrideLegacy(t *testing.T) {
	got := (&pluginConfiguration{
		EnableEnhancedPostEmojis:     boolPointer(false),
		EnableEnhancedReactionEmojis: boolPointer(false),
		EnableCustomPostEmojis:       boolPointer(true),
		EnableStandardPostEmojis:     boolPointer(false),
		EnableCustomReactionEmojis:   boolPointer(false),
		EnableStandardReactionEmojis: boolPointer(true),
		EnableDeveloperMode:          boolPointer(true),
	}).normalize()
	want := EnhancedEmojisConfig{
		EnableCustomPostEmojis:       true,
		EnableStandardPostEmojis:     false,
		EnableCustomReactionEmojis:   false,
		EnableStandardReactionEmojis: true,
		EnableDeveloperMode:          true,
	}
	if got != want {
		t.Fatalf("normalize(explicit) = %#v, want %#v", got, want)
	}
}

func TestPluginConfigurationNormalizeDeprecatedAliases(t *testing.T) {
	got := (&pluginConfiguration{
		EnableEnhancedEmojis: boolPointer(false),
		EnableReactionEmojis: boolPointer(true),
	}).normalize()
	if got.EnableCustomPostEmojis || got.EnableStandardPostEmojis || !got.EnableCustomReactionEmojis || !got.EnableStandardReactionEmojis {
		t.Fatalf("deprecated aliases were not applied independently: %#v", got)
	}
}

func TestEnhancedEmojisConfigJSONUsesExplicitFields(t *testing.T) {
	data, err := json.Marshal(EnhancedEmojisConfig{
		EnableCustomPostEmojis:       true,
		EnableCustomReactionEmojis:   false,
		EnableStandardPostEmojis:     false,
		EnableStandardReactionEmojis: true,
		EnableDeveloperMode:          false,
	})
	if err != nil {
		t.Fatal(err)
	}
	got := string(data)
	for _, field := range []string{"enableCustomPostEmojis", "enableCustomReactionEmojis", "enableStandardPostEmojis", "enableStandardReactionEmojis", "enableDeveloperMode"} {
		if !containsJSONField(got, field) {
			t.Fatalf("JSON payload %q does not contain %q", got, field)
		}
	}
	for _, legacyField := range []string{"enableEnhancedPostEmojis", "enableEnhancedReactionEmojis"} {
		if containsJSONField(got, legacyField) {
			t.Fatalf("JSON payload %q unexpectedly contains legacy field %q", got, legacyField)
		}
	}
}

func containsJSONField(payload, field string) bool {
	return strings.Contains(payload, `"`+field+`"`)
}
