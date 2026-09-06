import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, ShieldCheck, Sparkles } from 'lucide-react';

export function Header({ balance, selectedCurrency = 'PEN', onToggleCurrency, onOpenAuth }) {
  const { user, isSupabaseConfigured } = useAuth();
  const currentBalance = selectedCurrency === 'USD' ? balance.usd : balance.pen;
  const isNegative = currentBalance < 0;

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px 12px',
        backgroundColor: 'var(--c-bg)',
        borderBottom: '1px solid var(--c-border)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Badge de Marca */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            backgroundColor: 'var(--c-accent)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Fraunces, serif',
            fontWeight: '600',
            fontSize: '17px',
          }}
        >
          Ñ
        </div>
        <div>
          <h1
            style={{
              fontFamily: 'Fraunces, serif',
              fontSize: '18px',
              fontWeight: '600',
              color: 'var(--c-text)',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            Ñañay
          </h1>
          <span
            style={{
              fontSize: '11px',
              color: 'var(--c-muted)',
              fontWeight: '400',
            }}
          >
            cuentas claras
          </span>
        </div>
      </div>

      {/* Píldora de Balance en vivo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          onClick={onToggleCurrency}
          title="Toca para cambiar de moneda (PEN / USD)"
          className="tap-active"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '9999px',
            backgroundColor: isNegative ? 'rgba(91, 55, 101, 0.08)' : 'var(--c-surface)',
            border: `1px solid ${isNegative ? 'var(--c-accent)' : 'var(--c-border)'}`,
            boxShadow: 'var(--shadow-subtle)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              color: 'var(--c-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              fontWeight: '500',
            }}
          >
            Balance
          </span>
          <span
            className="font-tabular"
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: isNegative ? 'var(--c-accent)' : 'var(--c-text)',
            }}
          >
            {selectedCurrency === 'USD' ? '$' : 'S/'}{' '}
            {Math.abs(currentBalance).toLocaleString('es-PE', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            {isNegative ? ' -' : ''}
          </span>
        </div>

        {/* Botón de Perfil / Estado */}
        <button
          onClick={onOpenAuth}
          className="tap-active"
          title={isSupabaseConfigured ? 'Cuenta conectada' : 'Modo local (configurar Supabase)'}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'var(--c-surface)',
            border: '1px solid var(--c-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--c-accent)',
            position: 'relative',
          }}
        >
          <User size={17} />
          {isSupabaseConfigured && (
            <span
              style={{
                position: 'absolute',
                bottom: '2px',
                right: '2px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
                border: '1.5px solid #FFFFFF',
              }}
            />
          )}
        </button>
      </div>
    </header>
  );
}
