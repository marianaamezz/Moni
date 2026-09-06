import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, X, ShieldCheck } from 'lucide-react';

export function Header({ balance, selectedCurrency = 'PEN', onToggleCurrency }) {
  const { user, signOut, isSupabaseConfigured } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const currentBalance = selectedCurrency === 'USD' ? balance.usd : balance.pen;
  const isNegative = currentBalance < 0;

  const handleSignOut = async () => {
    setShowProfileMenu(false);
    await signOut();
  };

  const userInitial = user?.email ? user.email[0].toUpperCase() : 'M';
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuario';

  return (
    <>
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
        {/* Badge de Marca: Moni */}
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
            M
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
              Moni
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

        {/* Píldora de Balance y Perfil */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Balance */}
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

          {/* Botón de Perfil con Inicial */}
          <button
            onClick={() => setShowProfileMenu(true)}
            className="tap-active"
            title={`Conectada como ${user?.email || 'Usuario'}`}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--c-surface-2)',
              border: '1px solid var(--c-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--c-accent)',
              fontWeight: '600',
              fontSize: '13px',
              position: 'relative',
            }}
          >
            {userInitial}
            <span
              style={{
                position: 'absolute',
                bottom: '1px',
                right: '1px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
                border: '1.5px solid #FFFFFF',
              }}
            />
          </button>
        </div>
      </header>

      {/* Modal / Menú de Perfil para Cambiar de Usuario */}
      {showProfileMenu && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(58, 31, 53, 0.35)',
            backdropFilter: 'blur(3px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowProfileMenu(false);
          }}
        >
          <div
            className="animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '360px',
              backgroundColor: 'var(--c-surface)',
              borderRadius: '24px',
              border: '1px solid var(--c-border)',
              padding: '24px',
              boxShadow: 'var(--shadow-card)',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setShowProfileMenu(false)}
              className="tap-active"
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                color: 'var(--c-muted)',
                padding: '4px',
              }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--c-accent)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '600',
                  fontSize: '18px',
                }}
              >
                {userInitial}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--c-text)' }}>
                  {userName}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--c-muted)',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                  }}
                >
                  {user?.email}
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 12px',
                borderRadius: '12px',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                color: '#059669',
                fontSize: '12px',
                marginBottom: '20px',
              }}
            >
              <ShieldCheck size={16} />
              <span>Espacio privado: solo tú ves estos datos</span>
            </div>

            <button
              onClick={handleSignOut}
              className="tap-active"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '14px',
                border: '1px solid var(--c-border)',
                backgroundColor: 'var(--c-surface-2)',
                color: 'var(--c-accent)',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <LogOut size={16} />
              <span>Cerrar sesión / Cambiar usuario</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
