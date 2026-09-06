import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useCategorias } from './hooks/useCategorias';
import { useCuentas } from './hooks/useCuentas';
import { useTransacciones } from './hooks/useTransacciones';
import { usePresupuestos } from './hooks/usePresupuestos';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { LoginView } from './views/LoginView';
import { RegistrarView } from './views/RegistrarView';
import { PresupuestosView } from './views/PresupuestosView';
import { CategoriasView } from './views/CategoriasView';
import { ResumenView } from './views/ResumenView';

function MainApp() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('registrar'); // 'registrar' | 'presupuestos' | 'categorias' | 'resumen'
  const [selectedCurrency, setSelectedCurrency] = useState('PEN');

  const {
    categoriasN1,
    categoriasN2,
    addCategoriaN1,
    deleteCategoriaN1,
    addCategoriaN2,
    deleteCategoriaN2,
  } = useCategorias();

  const { cuentas, addCuenta, deleteCuenta } = useCuentas();

  const {
    transacciones,
    balance,
    addTransaccion,
    addTransferencia,
    deleteTransaccion,
  } = useTransacciones();

  const {
    presupuestos,
    addPresupuesto,
    deletePresupuesto,
  } = usePresupuestos(transacciones);

  const toggleCurrency = () => {
    setSelectedCurrency((prev) => (prev === 'PEN' ? 'USD' : 'PEN'));
  };

  // Estado de carga inicial suave
  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--c-bg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '16px',
            backgroundColor: 'var(--c-accent)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Fraunces, serif',
            fontWeight: '600',
            fontSize: '24px',
            boxShadow: '0 4px 14px rgba(91, 55, 101, 0.2)',
          }}
        >
          M
        </div>
        <span style={{ fontSize: '13px', color: 'var(--c-muted)' }}>Cargando Moni...</span>
      </div>
    );
  }

  // Si no hay sesión iniciada, mostramos la pantalla de Login / Crear Cuenta
  if (!user) {
    return <LoginView />;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--c-bg)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header Fijo con Balance e Inicial de Usuario */}
      <Header
        balance={balance}
        selectedCurrency={selectedCurrency}
        onToggleCurrency={toggleCurrency}
      />

      {/* Contenido Principal según la pestaña activa */}
      <main style={{ flex: 1, width: '100%' }}>
        {activeTab === 'registrar' && (
          <RegistrarView
            categoriasN1={categoriasN1}
            categoriasN2={categoriasN2}
            cuentas={cuentas}
            onSaveTransaccion={addTransaccion}
            onSaveTransferencia={addTransferencia}
            selectedCurrency={selectedCurrency}
            onToggleCurrency={toggleCurrency}
          />
        )}

        {activeTab === 'presupuestos' && (
          <PresupuestosView
            presupuestos={presupuestos}
            categoriasN1={categoriasN1}
            categoriasN2={categoriasN2}
            onAddPresupuesto={addPresupuesto}
            onDeletePresupuesto={deletePresupuesto}
            defaultCurrency={selectedCurrency}
          />
        )}

        {activeTab === 'categorias' && (
          <CategoriasView
            categoriasN1={categoriasN1}
            categoriasN2={categoriasN2}
            cuentas={cuentas}
            transacciones={transacciones}
            selectedCurrency={selectedCurrency}
            onAddN1={addCategoriaN1}
            onDeleteN1={deleteCategoriaN1}
            onAddN2={addCategoriaN2}
            onDeleteN2={deleteCategoriaN2}
            onAddCuenta={addCuenta}
            onDeleteCuenta={deleteCuenta}
          />
        )}

        {activeTab === 'resumen' && (
          <ResumenView
            transacciones={transacciones}
            categoriasN1={categoriasN1}
            categoriasN2={categoriasN2}
            cuentas={cuentas}
            selectedCurrency={selectedCurrency}
            onDeleteTransaccion={deleteTransaccion}
          />
        )}
      </main>

      {/* Navegación Inferior */}
      <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
