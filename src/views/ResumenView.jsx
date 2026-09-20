import React, { useState, useMemo } from 'react';
import { getCategoryIcon } from '../lib/icons';
import { PieChart, Trash2, Pencil, Calendar, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { EditarTransaccionModal } from '../components/EditarTransaccionModal';

const PALETTE_COLORS = [
  '#5B3765', // accent principal
  '#9E6899', // accent2
  '#D6A8C4', // accent-soft
  '#BA88AE', // income tone
  '#7D5A86',
  '#9E7C97',
  '#B895B1',
];

export function ResumenView({
  transacciones = [],
  categoriasN1 = [],
  categoriasN2 = [],
  cuentas = [],
  selectedCurrency = 'PEN',
  onDeleteTransaccion,
  onUpdateTransaccion,
}) {
  const [viewMode, setViewMode] = useState('n1'); // 'n1' (por cuenta) | 'n2' (por concepto)
  const [editingTransaccion, setEditingTransaccion] = useState(null);

  // Filtrar gastos y transferencias de la moneda actual
  const gastosYTransferencias = useMemo(() => {
    return transacciones.filter(
      (t) => (t.tipo === 'gasto' || t.tipo === 'transferencia') && (t.moneda || 'PEN') === selectedCurrency
    );
  }, [transacciones, selectedCurrency]);

  const totalGastado = useMemo(() => {
    return gastosYTransferencias.reduce((acc, t) => acc + (Number(t.monto) || 0), 0);
  }, [gastosYTransferencias]);

  // Agrupar por Cuenta (N1) o Concepto (N2)
  const breakdown = useMemo(() => {
    if (viewMode === 'n1') {
      // Para cada cuenta N1 calculamos lo que se ha gastado Y lo que queda (ingresos - gastos)
      const list = categoriasN1.map((cat, index) => {
        const catTx = transacciones.filter(
          (t) => t.categoria_n1_id === cat.id && (t.moneda || 'PEN') === selectedCurrency
        );

        let gastado = 0;
        let ingresos = 0;

        catTx.forEach((t) => {
          const monto = Number(t.monto) || 0;
          if (t.tipo === 'ingreso') {
            ingresos += monto;
          } else if (t.tipo === 'gasto' || t.tipo === 'transferencia') {
            gastado += monto;
          }
        });

        const queda = ingresos - gastado;
        const porcentaje = totalGastado > 0 ? Math.round((gastado / totalGastado) * 100) : 0;

        return {
          id: cat.id,
          nombre: cat.nombre,
          total: gastado,
          gastado,
          ingresos,
          queda,
          porcentaje,
          color: PALETTE_COLORS[index % PALETTE_COLORS.length],
        };
      });

      // Ordenar por mayor gasto primero
      return list.sort((a, b) => b.gastado - a.gastado);
    }

    // Modo N2 (Por concepto)
    if (totalGastado === 0) return [];
    const map = new Map();

    gastosYTransferencias.forEach((t) => {
      let id = 'sin-definir';
      let nombre = 'Sin definir';

      const cat = categoriasN2.find((c) => c.id === t.categoria_n2_id);
      if (cat) {
        id = cat.id;
        nombre = cat.nombre;
      } else {
        nombre = t.tipo === 'transferencia' ? 'Transferencias' : 'General / Otros';
      }

      const current = map.get(id) || { id, nombre, total: 0 };
      current.total += Number(t.monto) || 0;
      map.set(id, current);
    });

    return Array.from(map.values())
      .sort((a, b) => b.total - a.total)
      .map((item, index) => ({
        ...item,
        gastado: item.total,
        porcentaje: Math.round((item.total / totalGastado) * 100),
        color: PALETTE_COLORS[index % PALETTE_COLORS.length],
      }));
  }, [gastosYTransferencias, viewMode, categoriasN1, categoriasN2, totalGastado, transacciones, selectedCurrency]);

  // Cálculo de segmentos para el donut SVG
  const donutSegments = useMemo(() => {
    if (totalGastado === 0 || breakdown.length === 0) return [];

    const radius = 68;
    const circumference = 2 * Math.PI * radius;
    let accumulatedAngle = 0;

    return breakdown
      .filter((b) => b.gastado > 0)
      .map((item) => {
        const strokeDasharray = `${(item.gastado / totalGastado) * circumference} ${circumference}`;
        const strokeDashoffset = -accumulatedAngle;
        accumulatedAngle += (item.gastado / totalGastado) * circumference;

        return {
          ...item,
          strokeDasharray,
          strokeDashoffset,
        };
      });
  }, [breakdown, totalGastado]);

  const currSymbol = selectedCurrency === 'USD' ? '$' : 'S/';

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
          Resumen
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--c-muted)', marginTop: '2px' }}>
          Lo que has gastado y lo que queda disponible en cada cuenta
        </p>
      </div>

      {/* Toggle entre 'Por cuenta' y 'Por concepto' */}
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
        <button
          type="button"
          onClick={() => setViewMode('n1')}
          className="tap-active"
          style={{
            flex: 1,
            padding: '8px 0',
            borderRadius: '9999px',
            fontSize: '13px',
            fontWeight: viewMode === 'n1' ? '600' : '500',
            backgroundColor: viewMode === 'n1' ? 'var(--c-surface)' : 'transparent',
            color: viewMode === 'n1' ? 'var(--c-accent)' : 'var(--c-muted)',
            boxShadow: viewMode === 'n1' ? '0 2px 8px rgba(91, 55, 101, 0.06)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          Por cuenta
        </button>
        <button
          type="button"
          onClick={() => setViewMode('n2')}
          className="tap-active"
          style={{
            flex: 1,
            padding: '8px 0',
            borderRadius: '9999px',
            fontSize: '13px',
            fontWeight: viewMode === 'n2' ? '600' : '500',
            backgroundColor: viewMode === 'n2' ? 'var(--c-surface)' : 'transparent',
            color: viewMode === 'n2' ? 'var(--c-accent)' : 'var(--c-muted)',
            boxShadow: viewMode === 'n2' ? '0 2px 8px rgba(91, 55, 101, 0.06)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          Por concepto de gasto
        </button>
      </div>

      {/* Gráfico de Dona con Total al Centro */}
      <div
        style={{
          backgroundColor: 'var(--c-surface)',
          borderRadius: '24px',
          padding: '24px 20px',
          border: '1px solid var(--c-border)',
          boxShadow: 'var(--shadow-subtle)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <div style={{ position: 'relative', width: '180px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="180" height="180" viewBox="0 0 180 180" style={{ transform: 'rotate(-90deg)' }}>
            {/* Círculo base de fondo */}
            <circle
              cx="90"
              cy="90"
              r="68"
              fill="none"
              stroke="var(--c-surface-2)"
              strokeWidth="16"
            />

            {/* Segmentos de categorías */}
            {donutSegments.map((seg) => (
              <circle
                key={seg.id}
                cx="90"
                cy="90"
                r="68"
                fill="none"
                stroke={seg.color}
                strokeWidth="16"
                strokeDasharray={seg.strokeDasharray}
                strokeDashoffset={seg.strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
            ))}
          </svg>

          {/* Texto central con Total Gastado */}
          <div
            style={{
              position: 'absolute',
              textAlign: 'center',
              pointerEvents: 'none',
            }}
          >
            <div style={{ fontSize: '11px', color: 'var(--c-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total salidas
            </div>
            <div
              className="font-serif font-tabular"
              style={{
                fontSize: '22px',
                fontWeight: '600',
                color: 'var(--c-text)',
                marginTop: '2px',
              }}
            >
              {currSymbol}{' '}
              {totalGastado.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Desglose Detallado: Lo que se ha gastado y lo que queda en cada cuenta */}
      <div
        style={{
          backgroundColor: 'var(--c-surface)',
          borderRadius: '24px',
          padding: '20px',
          border: '1px solid var(--c-border)',
          boxShadow: 'var(--shadow-subtle)',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            fontSize: '11px',
            color: 'var(--c-muted)',
            marginBottom: '16px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {viewMode === 'n1'
            ? 'Desglose detallado por cuenta (Gastado y lo que queda)'
            : 'Desglose detallado por concepto de gasto'}
        </div>

        {breakdown.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--c-muted)', fontSize: '13px' }}>
            No hay movimientos registrados en esta moneda aún.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {breakdown.map((item) => {
              const hasQueda = viewMode === 'n1' && typeof item.queda === 'number';
              const quedaNegative = hasQueda && item.queda < 0;

              return (
                <div
                  key={item.id}
                  style={{
                    paddingBottom: '12px',
                    borderBottom: '1px solid rgba(235, 217, 230, 0.6)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '6px',
                      fontSize: '13px',
                    }}
                  >
                    {/* Nombre e ícono (SIN botón de excel) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '8px',
                          backgroundColor: 'var(--c-surface-2)',
                          color: item.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {getCategoryIcon(item.nombre, 14)}
                      </div>
                      <span style={{ fontWeight: '600', color: 'var(--c-text)' }}>{item.nombre}</span>
                    </div>

                    {/* Cifras: Gastado y Lo que queda */}
                    <div
                      className="font-tabular"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: '2px',
                      }}
                    >
                      <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--c-text)' }}>
                        <span style={{ fontSize: '11px', color: 'var(--c-muted)', fontWeight: '400', marginRight: '4px' }}>
                          Gastado:
                        </span>
                        {currSymbol}{' '}
                        {item.gastado.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>

                      {hasQueda && (
                        <div
                          style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: quedaNegative ? 'var(--c-accent)' : '#059669',
                          }}
                        >
                          <span style={{ fontSize: '10px', color: 'var(--c-muted)', fontWeight: '400', marginRight: '4px' }}>
                            Queda:
                          </span>
                          {quedaNegative ? '-' : ''}{currSymbol}{' '}
                          {Math.abs(item.queda).toLocaleString('es-PE', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Barra horizontal de proporción de gasto */}
                  <div
                    style={{
                      height: '5px',
                      backgroundColor: 'var(--c-surface-2)',
                      borderRadius: '9999px',
                      overflow: 'hidden',
                      marginTop: '4px',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(item.porcentaje || 0, 100)}%`,
                        backgroundColor: item.color,
                        borderRadius: '9999px',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Historial Reciente de Movimientos */}
      {transacciones.length > 0 && (
        <div
          style={{
            backgroundColor: 'var(--c-surface)',
            borderRadius: '24px',
            padding: '20px',
            border: '1px solid var(--c-border)',
            boxShadow: 'var(--shadow-subtle)',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              color: 'var(--c-muted)',
              marginBottom: '14px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Últimos movimientos
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {transacciones.slice(0, 15).map((t) => {
              const catN1 = categoriasN1.find((c) => c.id === t.categoria_n1_id);
              const catN2 = categoriasN2.find((c) => c.id === t.categoria_n2_id);
              const isIngreso = t.tipo === 'ingreso';
              const isTransferencia = t.tipo === 'transferencia';

              let sign = '- ';
              let amountColor = 'var(--c-text)';
              let iconBg = 'var(--c-surface-2)';
              let iconColor = 'var(--c-accent)';

              if (isIngreso) {
                sign = '+ ';
                amountColor = '#059669';
                iconBg = 'rgba(16, 185, 129, 0.12)';
                iconColor = '#059669';
              } else if (isTransferencia) {
                sign = '- ';
                amountColor = 'var(--c-accent2)';
                iconBg = 'var(--c-surface-2)';
                iconColor = 'var(--c-accent2)';
              }

              return (
                <div
                  key={t.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '14px',
                    backgroundColor: 'var(--c-bg)',
                    border: '1px solid var(--c-border)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '10px',
                        backgroundColor: iconBg,
                        color: iconColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {isTransferencia ? (
                        <ArrowUpRight size={16} />
                      ) : isIngreso && !t.categoria_n2_id ? (
                        <ArrowDownLeft size={16} />
                      ) : (
                        getCategoryIcon(catN2?.nombre || catN1?.nombre || '', 15)
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--c-text)' }}>
                        {catN1?.nombre || 'Cuenta'}
                        {catN2 && <span style={{ color: 'var(--c-muted)', fontWeight: '400' }}> · {catN2.nombre}</span>}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--c-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: '500', color: 'var(--c-accent)' }}>
                          {t.fecha ? new Date(t.fecha).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                        </span>
                        {t.nota && (
                          <>
                            <span>·</span>
                            <span style={{ color: 'var(--c-text)' }}>{t.nota}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      className="font-tabular"
                      style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: amountColor,
                      }}
                    >
                      {sign}{t.moneda === 'USD' ? '$' : 'S/'} {Number(t.monto).toFixed(2)}
                    </span>
                    {onUpdateTransaccion && (
                      <button
                        type="button"
                        onClick={() => setEditingTransaccion(t)}
                        className="tap-active"
                        title="Editar movimiento"
                        style={{
                          color: 'var(--c-accent)',
                          padding: '4px',
                        }}
                      >
                        <Pencil size={14} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onDeleteTransaccion(t.id)}
                      className="tap-active"
                      title="Eliminar movimiento"
                      style={{
                        color: 'var(--c-muted)',
                        padding: '4px',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Editar Movimiento */}
      <EditarTransaccionModal
        isOpen={Boolean(editingTransaccion)}
        onClose={() => setEditingTransaccion(null)}
        transaccion={editingTransaccion}
        categoriasN1={categoriasN1}
        categoriasN2={categoriasN2}
        cuentas={cuentas}
        onUpdate={onUpdateTransaccion}
      />
    </div>
  );
}
