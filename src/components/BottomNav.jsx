import React from 'react';
import { PlusCircle, Target, Tag, PieChart } from 'lucide-react';

export function BottomNav({ activeTab, onSelectTab }) {
  const tabs = [
    { id: 'registrar', label: 'Registrar', icon: PlusCircle },
    { id: 'presupuestos', label: 'Presupuestos', icon: Target },
    { id: 'categorias', label: 'Categorías', icon: Tag },
    { id: 'resumen', label: 'Resumen', icon: PieChart },
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'var(--c-surface)',
        borderTop: '1px solid var(--c-border)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '8px 12px calc(8px + env(safe-area-inset-bottom, 0px))',
        zIndex: 50,
        boxShadow: '0 -2px 10px rgba(91, 55, 101, 0.03)',
      }}
    >
      {tabs.map((t) => {
        const Icon = t.icon;
        const isActive = activeTab === t.id;

        return (
          <button
            key={t.id}
            onClick={() => onSelectTab(t.id)}
            className="tap-active"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 14px',
              borderRadius: '20px',
              backgroundColor: isActive ? 'var(--c-surface-2)' : 'transparent',
              color: isActive ? 'var(--c-accent)' : 'var(--c-muted)',
              transition: 'all 0.15s ease',
              minWidth: '70px',
            }}
          >
            <Icon size={20} strokeWidth={isActive ? 2.3 : 1.8} />
            <span
              style={{
                fontSize: '11px',
                fontWeight: isActive ? '600' : '400',
                letterSpacing: '-0.01em',
              }}
            >
              {t.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
