import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export function LoginView() {
  const { signIn, signUp } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setLoading(true);

    try {
      if (isRegister) {
        const { data, error } = await signUp(email.trim(), password);
        if (error) throw error;

        // Si Supabase tiene confirmación de email activada
        if (data?.user && !data?.session) {
          setInfoMsg(
            '¡Cuenta creada! Por favor revisa tu correo electrónico para confirmar tu cuenta antes de iniciar sesión (o desactiva la confirmación en Supabase).'
          );
        } else {
          setInfoMsg('¡Bienvenida a Moni! Iniciando sesión...');
        }
      } else {
        const { error } = await signIn(email.trim(), password);
        if (error) throw error;
      }
    } catch (err) {
      console.error(err);
      let msg = err.message || 'Ocurrió un error al ingresar.';
      if (msg.includes('Invalid login credentials')) {
        msg = 'Correo o contraseña incorrectos. Verifica tus datos.';
      } else if (msg.includes('User already registered')) {
        msg = 'Ya existe una cuenta con este correo. Prueba iniciando sesión.';
      } else if (msg.includes('Password should be at least')) {
        msg = 'La contraseña debe tener al menos 6 caracteres.';
      } else if (msg.includes('Email not confirmed')) {
        msg = 'Debes confirmar tu correo antes de entrar, o desactivar la confirmación en Supabase.';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--c-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 20px',
      }}
    >
      <div
        className="animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '380px',
          backgroundColor: 'var(--c-surface)',
          borderRadius: '28px',
          padding: '32px 24px',
          border: '1px solid var(--c-border)',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Logo Moni */}
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '18px',
            backgroundColor: 'var(--c-accent)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Fraunces, serif',
            fontWeight: '600',
            fontSize: '30px',
            marginBottom: '14px',
            boxShadow: '0 4px 14px rgba(91, 55, 101, 0.2)',
          }}
        >
          M
        </div>

        <h1
          style={{
            fontFamily: 'Fraunces, serif',
            fontSize: '28px',
            fontWeight: '600',
            color: 'var(--c-text)',
            letterSpacing: '-0.02em',
            marginBottom: '4px',
          }}
        >
          Moni
        </h1>
        <p
          style={{
            fontSize: '13px',
            color: 'var(--c-muted)',
            marginBottom: '24px',
            textAlign: 'center',
          }}
        >
          Tus finanzas en calma, privadas y en orden
        </p>

        {/* Toggle Segmentado: Iniciar Sesión / Crear Cuenta */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--c-surface-2)',
            borderRadius: '9999px',
            padding: '4px',
            width: '100%',
            marginBottom: '20px',
            border: '1px solid var(--c-border)',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setErrorMsg('');
              setInfoMsg('');
            }}
            className="tap-active"
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: '9999px',
              fontSize: '13px',
              fontWeight: !isRegister ? '600' : '500',
              backgroundColor: !isRegister ? 'var(--c-surface)' : 'transparent',
              color: !isRegister ? 'var(--c-accent)' : 'var(--c-muted)',
              boxShadow: !isRegister ? '0 2px 8px rgba(91, 55, 101, 0.06)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setErrorMsg('');
              setInfoMsg('');
            }}
            className="tap-active"
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: '9999px',
              fontSize: '13px',
              fontWeight: isRegister ? '600' : '500',
              backgroundColor: isRegister ? 'var(--c-surface)' : 'transparent',
              color: isRegister ? 'var(--c-accent)' : 'var(--c-muted)',
              boxShadow: isRegister ? '0 2px 8px rgba(91, 55, 101, 0.06)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Crear Cuenta
          </button>
        </div>

        {/* Mensaje de Error */}
        {errorMsg && (
          <div
            className="animate-fade-in"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '14px',
              backgroundColor: 'rgba(91, 55, 101, 0.08)',
              color: 'var(--c-accent)',
              fontSize: '12px',
              width: '100%',
              marginBottom: '16px',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Mensaje de Éxito / Info */}
        {infoMsg && (
          <div
            className="animate-fade-in"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '14px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: '#059669',
              fontSize: '12px',
              width: '100%',
              marginBottom: '16px',
            }}
          >
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label
              style={{
                fontSize: '12px',
                color: 'var(--c-muted)',
                display: 'block',
                marginBottom: '6px',
                fontWeight: '500',
              }}
            >
              Correo electrónico
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
                borderRadius: '16px',
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
            <label
              style={{
                fontSize: '12px',
                color: 'var(--c-muted)',
                display: 'block',
                marginBottom: '6px',
                fontWeight: '500',
              }}
            >
              Contraseña
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
                borderRadius: '16px',
                backgroundColor: 'var(--c-bg)',
                border: '1px solid var(--c-border)',
              }}
            >
              <Lock size={16} color="var(--c-muted)" />
              <input
                type="password"
                required
                placeholder="Mínimo 6 caracteres"
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
            disabled={loading}
            className="tap-active"
            style={{
              marginTop: '10px',
              padding: '14px',
              borderRadius: '16px',
              backgroundColor: 'var(--c-accent)',
              color: '#FFFFFF',
              fontSize: '15px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(91, 55, 101, 0.2)',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            <span>{loading ? 'Entrando...' : isRegister ? 'Crear mi cuenta' : 'Entrar a Moni'}</span>
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <p
          style={{
            fontSize: '11px',
            color: 'var(--c-muted)',
            textAlign: 'center',
            marginTop: '20px',
            lineHeight: 1.4,
          }}
        >
          Cada persona entra con su propio correo y contraseña. Los datos son 100% privados y nunca se mezclan.
        </p>
      </div>
    </div>
  );
}
