const PLUGIN_ID = 'de.dakosy.enhanced-emojis';
const USER_PREFERENCES_PREFIX = `pp_${PLUGIN_ID}`;

interface StoredPreference {
    category: string;
    name: string;
    user_id: string;
    value: string;
}

type StoredPreferences = Record<string, StoredPreference>;

export function makePreference(name: string, value: string): StoredPreference {
    return {
        category: USER_PREFERENCES_PREFIX,
        name,
        user_id: 'user-id',
        value,
    };
}

export function makeStore(preferences: StoredPreferences, locale: string) {
    const currentUserId = 'user-id';
    return {
        getState: jest.fn(() => ({
            entities: {
                preferences: {
                    myPreferences: preferences,
                },
                users: {
                    currentUserId,
                    profiles: {
                        [currentUserId]: {
                            locale,
                        },
                    },
                },
            },
        })),
        subscribe: jest.fn(() => jest.fn()),
    };
}

export function makeHydratableStore(locale: string) {
    const currentUserId = 'user-id';
    let currentPreferences: StoredPreferences = {};
    let subscriber: (() => void) | undefined;

    return {
        emitChange(): void {
            subscriber?.();
        },
        getState: jest.fn(() => ({
            entities: {
                preferences: {
                    myPreferences: currentPreferences,
                },
                users: {
                    currentUserId,
                    profiles: {
                        [currentUserId]: {
                            locale,
                        },
                    },
                },
            },
        })),
        setPreferences(preferences: StoredPreferences): void {
            currentPreferences = preferences;
        },
        subscribe: jest.fn((listener: () => void) => {
            subscriber = listener;
            return jest.fn();
        }),
    };
}
