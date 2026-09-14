import React from 'react';
import { X, Trash2, ArrowUpRight, ArrowDownLeft, FileText, Printer } from 'lucide-react';
import { getCategoryIcon } from '../lib/icons';

export function CuentaDetalleModal({
  isOpen,
  onClose,
  categoriaN1,
  transacciones = [],
  categoriasN2 = [],
  selectedCurrency = 'PEN',
  onDeleteTransaccion,
  onOpenReporte,
}) {
  if (!isOpen || !categoriaN1) return null;

  // Filtrar todos los movimientos de esta cuenta
  const movimientos = transacciones.filter(
    (t) => t.categoria_n1_id === categoriaN1.id
  );

  let totalIngresos = 0;
  let totalGastado = 0;

  movimientos.forEach((t) => {
    if ((t.moneda || 'PEN') !== selectedCurrency) return;
    const monto = Number(t.monto) || 0;
    if (t.tipo === 'ingreso') {
      totalIngresos += monto;
    } else if (t.tipo === 'gasto' || t.tipo === 'transferencia') {
      totalGastado += monto;
    }
  });

  const saldoRestante = totalIngresos - totalGastado;
  const isNegative = saldoRestante < 0;
  const currSymbol = selectedCurrency === 'USD' ? '$' : 'S/';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(58, 31, 53, 0.4)',
        backdropFilter: 'blur(3px)',
        zIndex: 90,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: 'var(--c-surface)',
          borderRadius: '24px',
          border: '1px solid var(--c-border)',
          boxShadow: 'var(--shadow-card)',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Cabecera del Detalle de Cuenta */}
        <div
          style={{
            padding: '20px 22px 16px',
            borderBottom: '1px solid var(--c-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--c-bg)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '14px',
                backgroundColor: 'var(--c-surface-2)',
                color: 'var(--c-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {getCategoryIcon(categoriaN1.nombre, 20)}
            </div>
            <div>
              <h3
                style={{
                  fontFamily: 'Fraunces, serif',
                  fontSize: '20px',
                  fontWeight: '600',
                  color: 'var(--c-text)',
                  lineHeight: 1.1,
                }}
              >
                Cuenta: {categoriaN1.nombre}
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--c-muted)' }}>
                {movimientos.length} {movimientos.length === 1 ? 'movimiento' : 'movimientos'} registrados
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="tap-active"
            style={{
              color: 'var(--c-muted)',
              padding: '6px',
              borderRadius: '8px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tarjeta de Resumen / Saldo que queda */}
        <div
          style={{
            padding: '16px 22px',
            backgroundColor: 'var(--c-surface)',
            borderBottom: '1px solid var(--c-border)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: 'var(--c-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Saldo actual que queda
              </div>
              <div
                className="font-tabular"
                style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: isNegative ? 'var(--c-accent)' : '#059669',
                  marginTop: '2px',
                }}
              >
                {isNegative ? '-' : ''}{currSymbol} {Math.abs(saldoRestante).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenReporte(categoriaN1);
              }}
              className="tap-active"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '9999px',
                backgroundColor: 'var(--c-surface-2)',
                color: 'var(--c-accent)',
                fontSize: '12px',
                fontWeight: '600',
                border: '1px solid var(--c-border)',
              }}
            >
              <Printer size={14} />
              <span>Ver Reporte / PDF</span>
            </button>
          </div>

          {/* Cifras secundarias */}
          <div
            className="font-tabular"
            style={{
              display: 'flex',
              gap: '16px',
              fontSize: '12px',
              color: 'var(--c-muted)',
              borderTop: '1px dashed var(--c-border)',
              paddingTop: '8px',
            }}
          >
            <span>
              Ingresado: <strong style={{ color: '#059669' }}>+{currSymbol} {totalIngresos.toFixed(2)}</strong>
            </span>
            <span>
              Gastado: <strong style={{ color: 'var(--c-text)' }}>-{currSymbol} {totalGastado.toFixed(2)}</strong>
            </span>
          </div>
        </div>

        {/* Lista de Movimientos de la Cuenta */}
        <div style={{ padding: '16px 22px', overflowY: 'auto', flex: 1 }}>
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
            Historial de esta cuenta
          </div>

          {movimientos.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '30px 0',
                color: 'var(--c-muted)',
                fontSize: '13px',
              }}
            >
              No hay movimientos registrados en la cuenta {categoriaN1.nombre} todavía.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {movimientos.map((t) => {
                const catN2 = categoriasN2.find((c) => c.id === t.categoria_n2_id);
                const isIngreso = t.tipo === 'ingreso';
                const isTransf = t.tipo === 'transferencia';

                let sign = '- ';
                let amountColor = 'var(--c-text)';
                let iconBg = 'var(--c-surface-2)';
                let iconColor = 'var(--c-accent)';

                if (isIngreso) {
                  sign = '+ ';
                  amountColor = '#059669';
                  iconBg = 'rgba(16, 185, 129, 0.12)';
                  iconColor = '#059669';
                } else if (isTransf) {
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
                          width: '32px',
                          height: '32px',
                          borderRadius: '10px',
                          backgroundColor: iconBg,
                          color: iconColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {isTransf ? (
                          <ArrowUpRight size={15} />
                        ) : isIngreso ? (
                          <ArrowDownLeft size={15} />
                        ) : (
                          getCategoryIcon(catN2?.nombre || '', 14)
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--c-text)' }}>
                          {catN2?.nombre || (isTransf ? 'Transferencia' : isIngreso ? 'Ingreso' : 'Consumo')}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--c-muted)', marginTop: '1px' }}>
                          {t.nota ? t.nota : new Date(t.fecha).toLocaleDateString('es-PE')}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        className="font-tabular"
                        style={{
                          fontSize: '13px',
                          fontWeight: '600',
                          color: amountColor,
                        }}
                      >
                        {sign}{t.moneda === 'USD' ? '$' : 'S/'} {Number(t.monto).toFixed(2)}
                      </span>
                      {onDeleteTransaccion && (
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
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
