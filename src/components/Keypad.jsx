import React from 'react';
import { Delete } from 'lucide-react';

export function Keypad({ value, onChange }) {
  const handlePress = (key) => {
    if (key === 'backspace') {
      if (value.length <= 1) {
        onChange('0');
      } else {
        onChange(value.slice(0, -1));
      }
      return;
    }

    if (key === '.') {
      if (value.includes('.')) return;
      onChange(value === '0' || value === '' ? '0.' : value + '.');
      return;
    }

    // Si ya hay punto decimal, no permitir más de 2 decimales
    if (value.includes('.')) {
      const parts = value.split('.');
      if (parts[1] && parts[1].length >= 2) return;
    }

    // Número regular
    if (value === '0') {
      onChange(key);
    } else {
      // Limitar a máximo 9 dígitos
      if (value.replace('.', '').length >= 9) return;
      onChange(value + key);
    }
  };

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', 'backspace'],
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: 'repeat(4, 1fr)',
        gap: '10px',
        width: '100%',
        maxWidth: '380px',
        margin: '0 auto',
      }}
    >
      {keys.map((row, rIdx) => (
        <div key={rIdx} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {row.map((k) => {
            const isBack = k === 'backspace';
            return (
              <button
                key={k}
                type="button"
                onClick={() => handlePress(k)}
                className="tap-active"
                style={{
                  height: '56px',
                  backgroundColor: 'var(--c-surface)',
                  border: '1px solid var(--c-border)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isBack ? '18px' : '22px',
                  fontWeight: '500',
                  color: isBack ? 'var(--c-muted)' : 'var(--c-text)',
                  boxShadow: 'var(--shadow-subtle)',
                  userSelect: 'none',
                  transition: 'background-color 0.1s ease, transform 0.08s ease',
                }}
              >
                {isBack ? <Delete size={22} /> : k}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
