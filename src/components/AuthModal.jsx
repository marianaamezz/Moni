import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, CheckCircle2, AlertCircle, LogOut } from 'lucide-react';

export function AuthModal({ isOpen, onClose }) {
  const { user, isSupabaseConfigured, signIn, signUp, signOut } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      if (isRegister) {
        const res = await signUp(email, password);
        if (res.error) throw res.error;
        setSuccessMsg('¡Cuenta creada con éxito! Ya puedes iniciar sesión.');
      } else {
        const res = await signIn(email, password);
        if (res.error) throw res.error;
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Ocurrió un error. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  return (
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
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: 'var(--c-surface)',
          borderRadius: '24px',
          border: '1px solid var(--c-border)',
          padding: '24px',
          boxShadow: 'var(--shadow-card)',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          className="tap-active"
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            color: 'var(--c-muted)',
            padding: '6px',
          }}
        >
          <X size={20} />
        </button>

        <div style={{ marginBottom: '20px' }}>
          <h2
            style={{
              fontFamily: 'Fraunces, serif',
              fontSize: '22px',
              fontWeight: '600',
              color: 'var(--c-text)',
              marginBottom: '6px',
            }}
          >
            {user ? 'Tu Cuenta' : isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--c-muted)' }}>
            {isSupabaseConfigured
              ? 'Conectado a la base de datos de Supabase'
              : 'Modo local activo (los datos se guardan en este dispositivo)'}
          </p>
        </div>

        {user ? (
          <div>
            <div
              style={{
                padding: '14px',
                borderRadius: '14px',
                backgroundColor: 'var(--c-surface-2)',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--c-accent)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '600',
                }}
              >
                {user.email ? user.email[0].toUpperCase() : 'U'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--c-text)' }}>
                  {user.email}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--c-muted)' }}>
                  {isSupabaseConfigured ? 'Sincronización en la nube activa' : 'Almacenamiento local'}
                </div>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="tap-active"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '14px',
                border: '1px solid var(--c-border)',
                backgroundColor: 'var(--c-surface)',
                color: 'var(--c-accent)',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <LogOut size={16} /> Cerrar Sesión
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {errorMsg && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(91, 55, 101, 0.08)',
                  color: 'var(--c-accent)',
                  fontSize: '13px',
                }}
              >
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  color: '#059669',
                  fontSize: '13px',
                }}
              >
                <CheckCircle2 size={16} />
                <span>{successMsg}</span>
              </div>
            )}

            <div>
              <label style={{ fontSize: '12px', color: 'var(--c-muted)', display: 'block', marginBottom: '6px' }}>
                Correo electrónico
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  backgroundColor: 'var(--c-bg)',
                  border: '1px solid var(--c-border)',
                }}
              >
                <Mail size={16} color="var(--c-muted)" />
                <input
                  type="email"
                  required
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: '14px',
                    width: '100%',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--c-muted)', display: 'block', marginBottom: '6px' }}>
                Contraseña
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  backgroundColor: 'var(--c-bg)',
                  border: '1px solid var(--c-border)',
                }}
              >
                <Lock size={16} color="var(--c-muted)" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: '14px',
                    width: '100%',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="tap-active"
              style={{
                marginTop: '8px',
                padding: '14px',
                borderRadius: '16px',
                backgroundColor: 'var(--c-accent)',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? 'Procesando...' : isRegister ? 'Crear Cuenta' : 'Entrar'}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              style={{
                fontSize: '13px',
                color: 'var(--c-muted)',
                textAlign: 'center',
                marginTop: '4px',
              }}
            >
              {isRegister ? '¿Ya tienes una cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate aquí'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
