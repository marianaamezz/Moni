import React, { useState, useMemo } from 'react';
import { getCategoryIcon } from '../lib/icons';
import { PieChart, Trash2, Calendar, FileSpreadsheet, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { exportCategoryToExcel } from '../lib/exportExcel';

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
  transacciones,
  categoriasN1,
  categoriasN2,
  cuentas = [],
  selectedCurrency,
  onDeleteTransaccion,
}) {
  const [viewMode, setViewMode] = useState('n1'); // 'n1' (por destino) | 'n2' (por categoría)

  // Filtrar gastos y transferencias de la moneda actual
  const gastosYTransferencias = useMemo(() => {
    return transacciones.filter(
      (t) => (t.tipo === 'gasto' || t.tipo === 'transferencia') && t.moneda === selectedCurrency
    );
  }, [transacciones, selectedCurrency]);

  const totalGastado = useMemo(() => {
    return gastosYTransferencias.reduce((acc, t) => acc + (Number(t.monto) || 0), 0);
  }, [gastosYTransferencias]);

  // Agrupar por N1 o N2
  const breakdown = useMemo(() => {
    if (totalGastado === 0) return [];

    const map = new Map();

    gastosYTransferencias.forEach((t) => {
      let id = 'sin-definir';
      let nombre = 'Sin definir';
      let catN1Obj = null;

      if (viewMode === 'n1') {
        const cat = categoriasN1.find((c) => c.id === t.categoria_n1_id);
        if (cat) {
          id = cat.id;
          nombre = cat.nombre;
          catN1Obj = cat;
        }
      } else {
        const cat = categoriasN2.find((c) => c.id === t.categoria_n2_id);
        if (cat) {
          id = cat.id;
          nombre = cat.nombre;
        } else {
          nombre = t.tipo === 'transferencia' ? 'Transferencias' : 'General / Otros';
        }
      }

      const current = map.get(id) || { id, nombre, total: 0, catN1Obj };
      current.total += Number(t.monto) || 0;
      map.set(id, current);
    });

    const list = Array.from(map.values())
      .sort((a, b) => b.total - a.total)
      .map((item, index) => ({
        ...item,
        porcentaje: Math.round((item.total / totalGastado) * 100),
        color: PALETTE_COLORS[index % PALETTE_COLORS.length],
      }));

    return list;
  }, [gastosYTransferencias, viewMode, categoriasN1, categoriasN2, totalGastado]);

  // Cálculo de segmentos para el donut SVG
  const donutSegments = useMemo(() => {
    if (totalGastado === 0 || breakdown.length === 0) return [];

    const radius = 68;
    const circumference = 2 * Math.PI * radius;
    let accumulatedAngle = 0;

    return breakdown.map((item) => {
      const strokeDasharray = `${(item.total / totalGastado) * circumference} ${circumference}`;
      const strokeDashoffset = -accumulatedAngle;
      accumulatedAngle += (item.total / totalGastado) * circumference;

      return {
        ...item,
        strokeDasharray,
        strokeDashoffset,
      };
    });
  }, [breakdown, totalGastado]);

  const handleExportCategory = (catN1) => {
    if (!catN1) return;
    exportCategoryToExcel({
      categoriaN1: catN1,
      transacciones,
      categoriasN2,
      cuentas,
    });
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
          Resumen de Gastos
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--c-muted)', marginTop: '2px' }}>
          Visualiza a dónde va tu dinero con total claridad
        </p>
      </div>

      {/* Toggle entre 'Por destino' y 'Por categoría' */}
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
          Por destino (Para quién)
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
          Por concepto (En qué)
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
              {selectedCurrency === 'USD' ? '$' : 'S/'}{' '}
              {totalGastado.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Barras Horizontales con montos exactos */}
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
          Desglose detallado
        </div>

        {breakdown.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--c-muted)', fontSize: '13px' }}>
            No hay gastos ni salidas registradas en esta moneda aún.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {breakdown.map((item) => (
              <div key={item.id}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '6px',
                    fontSize: '13px',
                  }}
                >
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
                    <span style={{ fontWeight: '500', color: 'var(--c-text)' }}>{item.nombre}</span>

                    {/* Botón rápido de exportación si estamos en vista N1 */}
                    {viewMode === 'n1' && item.catN1Obj && (
                      <button
                        type="button"
                        onClick={() => handleExportCategory(item.catN1Obj)}
                        className="tap-active"
                        title={`Descargar Excel de ${item.nombre}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          backgroundColor: 'rgba(16, 185, 129, 0.08)',
                          color: '#059669',
                          fontSize: '11px',
                          fontWeight: '600',
                          border: '1px solid rgba(16, 185, 129, 0.2)',
                          marginLeft: '4px',
                        }}
                      >
                        <FileSpreadsheet size={12} />
                        <span>Excel</span>
                      </button>
                    )}
                  </div>

                  <div className="font-tabular" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--c-muted)', fontSize: '12px' }}>{item.porcentaje}%</span>
                    <span style={{ fontWeight: '600', color: 'var(--c-text)' }}>
                      {selectedCurrency === 'USD' ? '$' : 'S/'}{' '}
                      {item.total.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Barra horizontal de progreso */}
                <div
                  style={{
                    height: '6px',
                    backgroundColor: 'var(--c-surface-2)',
                    borderRadius: '9999px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${item.porcentaje}%`,
                      backgroundColor: item.color,
                      borderRadius: '9999px',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>
            ))}
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
              const isGasto = t.tipo === 'gasto';
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
                        {catN1?.nombre || 'Destino'}
                        {catN2 && <span style={{ color: 'var(--c-muted)', fontWeight: '400' }}> · {catN2.nombre}</span>}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--c-muted)', marginTop: '1px' }}>
                        {t.nota ? (
                          <span>{t.nota}</span>
                        ) : (
                          new Date(t.fecha).toLocaleDateString('es-PE')
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
                      {sign}
                      {t.moneda === 'USD' ? '$' : 'S/'} {Number(t.monto).toFixed(2)}
                    </span>
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
    </div>
  );
}
