import React from 'react';

interface ToggleSettingProps {
    checked: boolean;
    label: string;
    onText: string;
    offText: string;
    onToggle: () => void;
}

export default function renderToggleSetting({checked, label, offText, onText, onToggle}: ToggleSettingProps): React.ReactElement {
    return React.createElement('button', {
        'aria-checked': checked,
        'aria-label': label,
        onClick: onToggle,
        onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onToggle();
            }
        },
        role: 'switch',
        style: {
            backgroundColor: checked ? '#1c58d9' : '#d9dbdd',
            border: 0,
            borderRadius: '999px',
            boxShadow: checked ? 'inset 0 0 0 1px rgba(0, 0, 0, 0.08)' : 'inset 0 0 0 1px rgba(63, 67, 80, 0.16)',
            cursor: 'pointer',
            display: 'inline-block',
            height: '32px',
            padding: '4px',
            position: 'relative',
            transition: 'background-color 120ms ease',
            width: '96px',
        },
        type: 'button',
    }, React.createElement('span', {
        'aria-hidden': 'true',
        style: {
            color: checked ? '#ffffff' : '#3f4350',
            display: 'flex',
            fontSize: '12px',
            fontWeight: 600,
            height: '100%',
            justifyContent: checked ? 'flex-start' : 'flex-end',
            letterSpacing: '0.01em',
            lineHeight: '24px',
            paddingLeft: checked ? '14px' : '0',
            paddingRight: checked ? '0' : '14px',
            textTransform: 'uppercase',
            width: '100%',
        },
    }, checked ? onText : offText),
    React.createElement('span', {
        'aria-hidden': 'true',
        style: {
            backgroundColor: '#ffffff',
            borderRadius: '50%',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.25)',
            display: 'block',
            height: '24px',
            left: '4px',
            position: 'absolute',
            top: '4px',
            transform: checked ? 'translateX(64px)' : 'translateX(0)',
            transition: 'transform 120ms ease',
            width: '24px',
        },
    }));
}
