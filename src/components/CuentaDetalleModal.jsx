import React, { useState } from 'react';
import { X, Trash2, ArrowUpRight, ArrowDownLeft, FileText, Printer, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { getCategoryIcon } from '../lib/icons';

export function CuentaDetalleModal({
  isOpen,
  onClose,
  categoriaN1,
  transacciones = [],
  categoriasN2 = [],
  cuentas = [],
  selectedCurrency = 'PEN',
  onDeleteTransaccion,
  onOpenReporte,
}) {
  const [expandedTxId, setExpandedTxId] = useState(null);
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
            <span style={{ fontSize: '10px', color: 'var(--c-muted)', fontWeight: 'normal', marginLeft: '6px', textTransform: 'none' }}>
              (Toca un movimiento para ver detalles y fecha completa)
            </span>
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
                const cta = cuentas?.find((c) => c.id === t.cuenta_id);
                const isIngreso = t.tipo === 'ingreso';
                const isTransf = t.tipo === 'transferencia';
                const isExpanded = expandedTxId === t.id;

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

                // Formateo seguro de fecha
                const fechaObj = t.fecha ? new Date(t.fecha) : null;
                const isValidDate = fechaObj && !isNaN(fechaObj.getTime());
                const fechaCorta = isValidDate
                  ? fechaObj.toLocaleDateString('es-PE', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Sin fecha';
                const fechaCompleta = isValidDate
                  ? fechaObj.toLocaleDateString('es-PE', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : 'Sin fecha';

                return (
                  <div
                    key={t.id}
                    style={{
                      borderRadius: '16px',
                      backgroundColor: 'var(--c-bg)',
                      border: isExpanded ? '1.5px solid var(--c-accent)' : '1px solid var(--c-border)',
                      overflow: 'hidden',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {/* Fila principal del movimiento (al tocar se expande) */}
                    <div
                      onClick={() => setExpandedTxId(isExpanded ? null : t.id)}
                      className="tap-active"
                      title="Toca para ver fecha y detalles de este movimiento"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '11px 13px',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '11px',
                            backgroundColor: iconBg,
                            color: iconColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {isTransf ? (
                            <ArrowUpRight size={16} />
                          ) : isIngreso ? (
                            <ArrowDownLeft size={16} />
                          ) : (
                            getCategoryIcon(catN2?.nombre || '', 15)
                          )}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--c-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>{catN2?.nombre || (isTransf ? 'Transferencia' : isIngreso ? 'Ingreso' : 'Consumo')}</span>
                            {cta && (
                              <span style={{ fontSize: '10px', color: 'var(--c-muted)', backgroundColor: 'var(--c-surface-2)', padding: '1px 6px', borderRadius: '6px', fontWeight: 'normal' }}>
                                {cta.nombre}
                              </span>
                            )}
                          </div>
                          {/* Fecha SIEMPRE visible en cada movimiento */}
                          <div style={{ fontSize: '11px', color: 'var(--c-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: '600', color: 'var(--c-accent)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <Calendar size={11} />
                              {fechaCorta}
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
                            fontSize: '13px',
                            fontWeight: '600',
                            color: amountColor,
                          }}
                        >
                          {sign}{t.moneda === 'USD' ? '$' : 'S/'} {Number(t.monto).toFixed(2)}
                        </span>
                        {isExpanded ? (
                          <ChevronUp size={15} color="var(--c-muted)" />
                        ) : (
                          <ChevronDown size={15} color="var(--c-muted)" />
                        )}
                      </div>
                    </div>

                    {/* Detalle desplegable con Fecha Completa al hacer clic */}
                    {isExpanded && (
                      <div
                        style={{
                          padding: '12px 14px',
                          backgroundColor: 'var(--c-surface)',
                          borderTop: '1px solid var(--c-border)',
                          fontSize: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: 'var(--c-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={13} />
                            Fecha del movimiento:
                          </span>
                          <strong style={{ color: 'var(--c-accent)', textTransform: 'capitalize' }}>
                            {fechaCompleta}
                          </strong>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: 'var(--c-muted)' }}>Cuenta:</span>
                          <strong style={{ color: 'var(--c-text)' }}>{categoriaN1.nombre}</strong>
                        </div>

                        {catN2 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--c-muted)' }}>Concepto:</span>
                            <strong style={{ color: 'var(--c-text)' }}>{catN2.nombre}</strong>
                          </div>
                        )}

                        {cta && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--c-muted)' }}>Método de pago:</span>
                            <strong style={{ color: 'var(--c-text)' }}>{cta.nombre} ({cta.tipo})</strong>
                          </div>
                        )}

                        {t.nota && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--c-muted)' }}>Descripción / Nota:</span>
                            <strong style={{ color: 'var(--c-text)' }}>{t.nota}</strong>
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: 'var(--c-muted)' }}>Tipo y Monto:</span>
                          <strong style={{ color: amountColor }}>
                            {isIngreso ? 'Ingreso (+)' : isTransf ? 'Transferencia (-)' : 'Gasto (-)'} {t.moneda === 'USD' ? '$' : 'S/'} {Number(t.monto).toFixed(2)}
                          </strong>
                        </div>

                        {onDeleteTransaccion && (
                          <div style={{ marginTop: '6px', paddingTop: '8px', borderTop: '1px dashed var(--c-border)', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteTransaccion(t.id);
                              }}
                              className="tap-active"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '11px',
                                color: '#DC2626',
                                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                              }}
                            >
                              <Trash2 size={13} />
                              <span>Eliminar este movimiento</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
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
