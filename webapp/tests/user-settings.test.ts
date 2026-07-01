import {
    type EnhancedEmojisConfig,
} from 'config';
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
            adminConfig: {
                enableEnhancedEmojis: true,
                enableDeveloperMode: false,
                enableReactionEmojis: true,
            },
            expectedSectionTitles: ['Post Emojis', 'Reaction Emojis'],
        },
        {
            name: 'post enabled / reactions disabled',
            adminConfig: {
                enableEnhancedEmojis: true,
                enableDeveloperMode: false,
                enableReactionEmojis: false,
            },
            expectedSectionTitles: ['Post Emojis'],
        },
        {
            name: 'post disabled / reactions enabled',
            adminConfig: {
                enableEnhancedEmojis: false,
                enableDeveloperMode: false,
                enableReactionEmojis: true,
            },
            expectedSectionTitles: ['Reaction Emojis'],
        },
        {
            name: 'both disabled',
            adminConfig: {
                enableEnhancedEmojis: false,
                enableDeveloperMode: false,
                enableReactionEmojis: false,
            },
            expectedSectionTitles: ['Enhanced Emojis'],
        },
    ])('shows the correct sections for $name', ({adminConfig, expectedSectionTitles}) => {
        const registry = makeRegistry();

        registerEnhancedEmojisUserSettings(registry as never, adminConfig as EnhancedEmojisConfig);

        const settings = getRegisteredSettings(registry);
        expect(settings.id).toBe('de.dakosy.enhanced-emojis');
        expect(settings.uiName).toBe('Enhanced Emojis');
        expect(settings.sections).toHaveLength(expectedSectionTitles.length);
        expect(settings.sections.map((section: {title: string}) => section.title)).toEqual(expectedSectionTitles);
    });

    test('renders the informational message when both features are disabled', () => {
        const registry = makeRegistry();

        registerEnhancedEmojisUserSettings(registry as never, {
            enableEnhancedEmojis: false,
            enableDeveloperMode: false,
            enableReactionEmojis: false,
        });

        const settings = getRegisteredSettings(registry);
        const section = settings.sections[0] as {component: () => {props: {children: string}}};
        const rendered = section.component();

        expect(rendered.props.children).toBe('No Enhanced Emojis features are currently enabled by your administrator.');
    });
});
