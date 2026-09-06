import React, { useState } from 'react';
import { Plus, X, Tag, Landmark, Users } from 'lucide-react';
import { getCategoryIcon } from '../lib/icons';

export function CategoriasView({
  categoriasN1,
  categoriasN2,
  cuentas,
  onAddN1,
  onDeleteN1,
  onAddN2,
  onDeleteN2,
  onAddCuenta,
  onDeleteCuenta,
}) {
  const [activeSubTab, setActiveSubTab] = useState('n1'); // 'n1' | 'n2' | 'cuentas'
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoTipoCuenta, setNuevoTipoCuenta] = useState('débito');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;

    if (activeSubTab === 'n1') {
      onAddN1(nuevoNombre.trim());
    } else if (activeSubTab === 'n2') {
      onAddN2(nuevoNombre.trim());
    } else if (activeSubTab === 'cuentas') {
      onAddCuenta({ nombre: nuevoNombre.trim(), tipo: nuevoTipoCuenta });
    }

    setNuevoNombre('');
  };

  return (
    <div
      style={{
        padding: '20px 20px 100px',
        maxWidth: '520px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      {/* Cabecera */}
      <div style={{ marginBottom: '20px' }}>
        <h2
          style={{
            fontFamily: 'Fraunces, serif',
            fontSize: '24px',
            fontWeight: '600',
            color: 'var(--c-text)',
            lineHeight: 1.2,
          }}
        >
          Categorías y Cuentas
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--c-muted)', marginTop: '2px' }}>
          Personaliza tus listas a tu propio ritmo
        </p>
      </div>

      {/* Sub-tabs segmentados */}
      <div
        style={{
          display: 'flex',
          backgroundColor: 'var(--c-surface-2)',
          borderRadius: '9999px',
          padding: '4px',
          marginBottom: '24px',
          border: '1px solid var(--c-border)',
        }}
      >
        {[
          { id: 'n1', label: 'Para quién (N1)', icon: Users },
          { id: 'n2', label: 'En qué (N2)', icon: Tag },
          { id: 'cuentas', label: 'Cuentas', icon: Landmark },
        ].map((tab) => {
          const isActive = activeSubTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveSubTab(tab.id);
                setNuevoNombre('');
              }}
              className="tap-active"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px 4px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: isActive ? '600' : '500',
                backgroundColor: isActive ? 'var(--c-surface)' : 'transparent',
                color: isActive ? 'var(--c-accent)' : 'var(--c-muted)',
                boxShadow: isActive ? '0 2px 8px rgba(91, 55, 101, 0.06)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Formulario para agregar */}
      <form
        onSubmit={handleAdd}
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          backgroundColor: 'var(--c-surface)',
          padding: '6px',
          borderRadius: '16px',
          border: '1px solid var(--c-border)',
          boxShadow: 'var(--shadow-subtle)',
        }}
      >
        <input
          type="text"
          placeholder={
            activeSubTab === 'n1'
              ? 'Ej. Negocio, Pareja, Mascota...'
              : activeSubTab === 'n2'
              ? 'Ej. Farmacia, Libros, Regalos...'
              : 'Ej. BCP Débito, Efectivo...'
          }
          value={nuevoNombre}
          onChange={(e) => setNuevoNombre(e.target.value)}
          style={{
            flex: 1,
            padding: '10px 14px',
            border: 'none',
            background: 'transparent',
            fontSize: '14px',
            outline: 'none',
          }}
        />

        {activeSubTab === 'cuentas' && (
          <select
            value={nuevoTipoCuenta}
            onChange={(e) => setNuevoTipoCuenta(e.target.value)}
            style={{
              padding: '0 8px',
              border: 'none',
              background: 'transparent',
              fontSize: '12px',
              color: 'var(--c-muted)',
              outline: 'none',
            }}
          >
            <option value="efectivo">Efectivo</option>
            <option value="débito">Débito</option>
            <option value="crédito">Crédito</option>
          </select>
        )}

        <button
          type="submit"
          className="tap-active"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '10px 16px',
            borderRadius: '12px',
            backgroundColor: 'var(--c-accent)',
            color: '#FFFFFF',
            fontSize: '13px',
            fontWeight: '600',
          }}
        >
          <Plus size={16} />
          <span>Agregar</span>
        </button>
      </form>

      {/* Listado de Chips Editables con Ícono Automático y botón X */}
      <div>
        <div
          style={{
            fontSize: '12px',
            color: 'var(--c-muted)',
            marginBottom: '12px',
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {activeSubTab === 'n1'
            ? 'Destinos registrados'
            : activeSubTab === 'n2'
            ? 'Conceptos registrados'
            : 'Cuentas registradas'}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {activeSubTab === 'n1' &&
            categoriasN1.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  borderRadius: '9999px',
                  backgroundColor: 'var(--c-surface)',
                  border: '1px solid var(--c-border)',
                  boxShadow: 'var(--shadow-subtle)',
                  color: 'var(--c-text)',
                  fontSize: '14px',
                }}
              >
                {getCategoryIcon(item.nombre, 15)}
                <span style={{ fontWeight: '500' }}>{item.nombre}</span>
                {categoriasN1.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onDeleteN1(item.id)}
                    className="tap-active"
                    title={`Eliminar ${item.nombre}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      color: 'var(--c-muted)',
                      padding: '2px',
                      marginLeft: '2px',
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}

          {activeSubTab === 'n2' &&
            categoriasN2.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  borderRadius: '9999px',
                  backgroundColor: 'var(--c-surface)',
                  border: '1px solid var(--c-border)',
                  boxShadow: 'var(--shadow-subtle)',
                  color: 'var(--c-text)',
                  fontSize: '14px',
                }}
              >
                {getCategoryIcon(item.nombre, 15)}
                <span style={{ fontWeight: '500' }}>{item.nombre}</span>
                <button
                  type="button"
                  onClick={() => onDeleteN2(item.id)}
                  className="tap-active"
                  title={`Eliminar ${item.nombre}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: 'var(--c-muted)',
                    padding: '2px',
                    marginLeft: '2px',
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            ))}

          {activeSubTab === 'cuentas' &&
            cuentas.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  borderRadius: '9999px',
                  backgroundColor: 'var(--c-surface)',
                  border: '1px solid var(--c-border)',
                  boxShadow: 'var(--shadow-subtle)',
                  color: 'var(--c-text)',
                  fontSize: '14px',
                }}
              >
                {getCategoryIcon(item.tipo || item.nombre, 15)}
                <span style={{ fontWeight: '500' }}>{item.nombre}</span>
                <span style={{ fontSize: '11px', color: 'var(--c-muted)', textTransform: 'capitalize' }}>
                  ({item.tipo})
                </span>
                <button
                  type="button"
                  onClick={() => onDeleteCuenta(item.id)}
                  className="tap-active"
                  title={`Eliminar ${item.nombre}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: 'var(--c-muted)',
                    padding: '2px',
                    marginLeft: '2px',
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
