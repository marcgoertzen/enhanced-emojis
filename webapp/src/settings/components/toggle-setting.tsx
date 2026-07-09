import React from 'react';

interface ToggleSettingProps {
    checked: boolean;
    label: string;
    onText: string;
    offText: string;
    onToggle: () => void;
}

export default function renderToggleSetting({
    checked,
    label,
    offText,
    onText,
    onToggle,
}: ToggleSettingProps): React.ReactElement {
    return React.createElement('button', {
        'aria-checked': checked,
        'aria-label': label,
        className: `enhanced-emojis-toggle${checked ? ' enhanced-emojis-toggle--checked' : ''}`,
        onClick: onToggle,
        onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onToggle();
            }
        },
        role: 'switch',
        type: 'button',
    }, React.createElement('span', {
        'aria-hidden': 'true',
        className: 'enhanced-emojis-toggle__label',
    }, checked ? onText : offText),
    React.createElement('span', {
        'aria-hidden': 'true',
        className: 'enhanced-emojis-toggle__thumb',
    }));
}
