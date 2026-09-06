import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { useCategorias } from './hooks/useCategorias';
import { useCuentas } from './hooks/useCuentas';
import { useTransacciones } from './hooks/useTransacciones';
import { usePresupuestos } from './hooks/usePresupuestos';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { AuthModal } from './components/AuthModal';
import { RegistrarView } from './views/RegistrarView';
import { PresupuestosView } from './views/PresupuestosView';
import { CategoriasView } from './views/CategoriasView';
import { ResumenView } from './views/ResumenView';

function MainApp() {
  const [activeTab, setActiveTab] = useState('registrar'); // 'registrar' | 'presupuestos' | 'categorias' | 'resumen'
  const [selectedCurrency, setSelectedCurrency] = useState('PEN');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--c-bg)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header Fijo */}
      <Header
        balance={balance}
        selectedCurrency={selectedCurrency}
        onToggleCurrency={toggleCurrency}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Contenido Principal según la pestaña activa */}
      <main style={{ flex: 1, width: '100%' }}>
        {activeTab === 'registrar' && (
          <RegistrarView
            categoriasN1={categoriasN1}
            categoriasN2={categoriasN2}
            cuentas={cuentas}
            onSaveTransaccion={addTransaccion}
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
            selectedCurrency={selectedCurrency}
            onDeleteTransaccion={deleteTransaccion}
          />
        )}
      </main>

      {/* Navegación Inferior */}
      <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Modal de Autenticación / Cuenta */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
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
