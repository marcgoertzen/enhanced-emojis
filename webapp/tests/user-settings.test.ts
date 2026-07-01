import {getEnhancedEmojisTranslations} from 'i18n';
import {registerEnhancedEmojisUserSettings} from 'user-settings';

function makeRegistry() {
    return {
        registerUserSettings: jest.fn(),
    };
}

function getRegisteredSettings(registry: ReturnType<typeof makeRegistry>) {
    expect(registry.registerUserSettings).toHaveBeenCalledTimes(1);
    return registry.registerUserSettings.mock.calls[0][0];
}

describe('registerEnhancedEmojisUserSettings', () => {
    test.each([
        {
            name: 'post enabled / reactions enabled',
            locale: 'en',
            adminConfig: {
                enableEnhancedPostEmojis: true,
                enableEnhancedReactionEmojis: true,
                enableDeveloperMode: false,
            },
            expectedSectionKeys: [
                'enhanced_emojis.settings.posts.title',
                'enhanced_emojis.settings.reactions.title',
            ],
        },
        {
            name: 'post enabled / reactions disabled',
            locale: 'de',
            adminConfig: {
                enableEnhancedPostEmojis: true,
                enableEnhancedReactionEmojis: false,
                enableDeveloperMode: false,
            },
            expectedSectionKeys: ['enhanced_emojis.settings.posts.title'],
        },
        {
            name: 'post disabled / reactions enabled',
            locale: 'fr',
            adminConfig: {
                enableEnhancedPostEmojis: false,
                enableEnhancedReactionEmojis: true,
                enableDeveloperMode: false,
            },
            expectedSectionKeys: ['enhanced_emojis.settings.reactions.title'],
        },
        {
            name: 'both disabled',
            locale: 'de',
            adminConfig: {
                enableEnhancedPostEmojis: false,
                enableEnhancedReactionEmojis: false,
                enableDeveloperMode: false,
            },
            expectedSectionKeys: ['enhanced_emojis.settings.title'],
        },
    ])('shows the correct sections for $name', ({adminConfig, expectedSectionKeys, locale}) => {
        const translations = getEnhancedEmojisTranslations(locale);
        const registry = makeRegistry();

        registerEnhancedEmojisUserSettings(registry as never, adminConfig, locale);

        const settings = getRegisteredSettings(registry);
        expect(settings.id).toBe('de.dakosy.enhanced-emojis');
        expect(settings.uiName).toBe(translations['enhanced_emojis.settings.title']);
        expect(settings.sections).toHaveLength(expectedSectionKeys.length);
        expect(settings.sections.map((section: {title: string}) => section.title)).toEqual(
            expectedSectionKeys.map((key) => translations[key as keyof typeof translations]),
        );

        if (adminConfig.enableEnhancedPostEmojis) {
            const postSection = settings.sections.find((section: {title: string}) => section.title === translations['enhanced_emojis.settings.posts.title']);
            expect(postSection).toMatchObject({
                title: translations['enhanced_emojis.settings.posts.title'],
                settings: [
                    expect.objectContaining({
                        title: translations['enhanced_emojis.settings.posts.size'],
                        helpText: translations['enhanced_emojis.settings.posts.help_text'],
                        options: [
                            expect.objectContaining({text: translations['enhanced_emojis.settings.posts.option.default']}),
                            expect.objectContaining({text: translations['enhanced_emojis.settings.posts.option.large']}),
                            expect.objectContaining({text: translations['enhanced_emojis.settings.posts.option.extra_large']}),
                            expect.objectContaining({text: translations['enhanced_emojis.settings.posts.option.max']}),
                        ],
                    }),
                ],
            });
        }

        if (adminConfig.enableEnhancedReactionEmojis) {
            const reactionSection = settings.sections.find((section: {title: string}) => section.title === translations['enhanced_emojis.settings.reactions.title']);
            expect(reactionSection).toMatchObject({
                title: translations['enhanced_emojis.settings.reactions.title'],
                settings: [
                    expect.objectContaining({
                        title: translations['enhanced_emojis.settings.reactions.size'],
                        helpText: translations['enhanced_emojis.settings.reactions.help_text'],
                        options: [
                            expect.objectContaining({text: translations['enhanced_emojis.settings.reactions.option.default']}),
                            expect.objectContaining({text: translations['enhanced_emojis.settings.reactions.option.medium']}),
                            expect.objectContaining({text: translations['enhanced_emojis.settings.reactions.option.large']}),
                            expect.objectContaining({text: translations['enhanced_emojis.settings.reactions.option.max']}),
                        ],
                    }),
                ],
            });
        }
    });

    test('renders the informational message when both features are disabled', () => {
        const locale = 'de';
        const translations = getEnhancedEmojisTranslations(locale);
        const registry = makeRegistry();

        registerEnhancedEmojisUserSettings(registry as never, {
            enableEnhancedPostEmojis: false,
            enableEnhancedReactionEmojis: false,
            enableDeveloperMode: false,
        }, locale);

        const settings = getRegisteredSettings(registry);
        const section = settings.sections[0] as {component: () => {props: {children: string}}};
        const rendered = section.component();

        expect(rendered.props.children).toBe(translations['enhanced_emojis.settings.no_features_enabled']);
    });
});
