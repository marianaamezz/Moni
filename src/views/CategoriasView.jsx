import React, { useState } from 'react';
import { Plus, X, Tag, Landmark, Users, FileSpreadsheet } from 'lucide-react';
import { getCategoryIcon } from '../lib/icons';
import { exportCategoryToExcel } from '../lib/exportExcel';

export function CategoriasView({
  categoriasN1,
  categoriasN2,
  cuentas,
  transacciones = [],
  selectedCurrency = 'PEN',
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

  const handleExportN1 = (catN1) => {
    exportCategoryToExcel({
      categoriaN1: catN1,
      transacciones,
      categoriasN2,
      cuentas,
    });
  };

  // Calcular balance de una categoría N1 (Ingresos - Egresos)
  const getCategoryBalance = (catId) => {
    let pen = 0;
    let usd = 0;
    let totalIngresos = 0;
    let totalEgresos = 0;

    const catTx = transacciones.filter((t) => t.categoria_n1_id === catId);

    catTx.forEach((t) => {
      const monto = Number(t.monto) || 0;
      const isUSD = t.moneda === 'USD';

      if (t.tipo === 'ingreso') {
        totalIngresos++;
        if (isUSD) usd += monto;
        else pen += monto;
      } else if (t.tipo === 'gasto' || t.tipo === 'transferencia') {
        totalEgresos++;
        if (isUSD) usd -= monto;
        else pen -= monto;
      }
    });

    const balanceValue = selectedCurrency === 'USD' ? usd : pen;

    return {
      balanceValue,
      pen,
      usd,
      totalCount: catTx.length,
      totalIngresos,
      totalEgresos,
    };
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
          Balances en vivo por categoría y descargas en Excel
        </p>
      </div>

      {/* Sub-tabs segmentados */}
      <div
        style={{
          display: 'flex',
          backgroundColor: 'var(--c-surface-2)',
          borderRadius: '9999px',
          padding: '4px',
          marginBottom: '22px',
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

      {/* Formulario para agregar nuevo elemento */}
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
              ? 'Ej. Negocio, Hijos, Mascota...'
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

      {/* CONTENIDO SEGÚN SUBTAB */}
      <div>
        <div
          style={{
            fontSize: '11px',
            color: 'var(--c-muted)',
            marginBottom: '12px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {activeSubTab === 'n1'
            ? 'Destinos (Para quién), Balances y Descarga Excel'
            : activeSubTab === 'n2'
            ? 'Conceptos de gasto (En qué)'
            : 'Cuentas registradas'}
        </div>

        {/* N1 con Balance al lado del nombre y botón de Descarga Excel */}
        {activeSubTab === 'n1' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {categoriasN1.map((item) => {
              const { balanceValue, totalCount } = getCategoryBalance(item.id);
              const isNegative = balanceValue < 0;
              const currSymbol = selectedCurrency === 'USD' ? '$' : 'S/';

              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: '18px',
                    backgroundColor: 'var(--c-surface)',
                    border: '1px solid var(--c-border)',
                    boxShadow: 'var(--shadow-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--c-surface-2)',
                        color: 'var(--c-accent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {getCategoryIcon(item.nombre, 18)}
                    </div>
                    <div>
                      {/* Nombre y Balance al lado */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--c-text)' }}>
                          {item.nombre}
                        </span>

                        {/* Píldora de Balance al lado del nombre */}
                        <span
                          className="font-tabular"
                          style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            backgroundColor: isNegative
                              ? 'rgba(91, 55, 101, 0.08)'
                              : 'rgba(16, 185, 129, 0.1)',
                            color: isNegative ? 'var(--c-accent)' : '#059669',
                            border: `1px solid ${
                              isNegative ? 'var(--c-border)' : 'rgba(16, 185, 129, 0.2)'
                            }`,
                          }}
                        >
                          {isNegative ? '-' : '+'}{currSymbol}{' '}
                          {Math.abs(balanceValue).toLocaleString('es-PE', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>

                      {/* Movimientos */}
                      <div style={{ fontSize: '12px', color: 'var(--c-muted)', marginTop: '2px' }}>
                        {totalCount} {totalCount === 1 ? 'movimiento' : 'movimientos'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Botón Descargar Excel para esta categoría */}
                    <button
                      type="button"
                      onClick={() => handleExportN1(item)}
                      className="tap-active"
                      title={`Descargar Excel de ${item.nombre} con balance`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '9999px',
                        backgroundColor: 'rgba(16, 185, 129, 0.08)',
                        color: '#059669',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        fontSize: '12px',
                        fontWeight: '600',
                      }}
                    >
                      <FileSpreadsheet size={15} />
                      <span>Excel</span>
                    </button>

                    {/* Botón Eliminar si hay más de 1 categoría */}
                    {categoriasN1.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onDeleteN1(item.id)}
                        className="tap-active"
                        title={`Eliminar ${item.nombre}`}
                        style={{
                          color: 'var(--c-muted)',
                          padding: '6px',
                          borderRadius: '8px',
                        }}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* N2: Chips tradicionales con X */}
        {activeSubTab === 'n2' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {categoriasN2.map((item) => (
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
          </div>
        )}

        {/* Cuentas */}
        {activeSubTab === 'cuentas' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {cuentas.map((item) => (
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
        )}
      </div>
    </div>
  );
}
