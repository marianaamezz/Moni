import React from 'react';
import { AlertTriangle, X, Check, Landmark, Calendar, Tag, FileText, CreditCard } from 'lucide-react';
import { formatFechaCompleta } from '../lib/dateUtils';

export function DuplicadoAlertaModal({
  isOpen,
  onClose,
  onConfirm,
  duplicado,
  selectedN1Id,
  categoriasN1 = [],
  categoriasN2 = [],
  cuentas = [],
}) {
  if (!isOpen || !duplicado) return null;

  const cuentaOrigen = categoriasN1.find((c) => c.id === duplicado.categoria_n1_id);
  const cuentaActual = categoriasN1.find((c) => c.id === selectedN1Id);
  const conceptoN2 = categoriasN2.find((c) => c.id === duplicado.categoria_n2_id);
  const metodoPago = cuentas.find((c) => c.id === duplicado.cuenta_id);

  const isDiferenteCuenta = duplicado.categoria_n1_id !== selectedN1Id;
  const currSymbol = duplicado.moneda === 'USD' ? '$' : 'S/';
  const montoFormateado = Number(duplicado.monto).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(58, 31, 53, 0.55)',
        backdropFilter: 'blur(5px)',
        zIndex: 120,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid var(--c-border)',
          boxShadow: '0 20px 40px rgba(58, 31, 53, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Cabecera con alerta */}
        <div
          style={{
            padding: '24px 20px 16px 20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#FEF3C7',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
              boxShadow: '0 4px 12px rgba(217, 119, 6, 0.15)',
            }}
          >
            <AlertTriangle size={30} />
          </div>

          <h3
            style={{
              fontSize: '19px',
              fontWeight: '700',
              color: '#111827',
              margin: '0 0 6px 0',
            }}
          >
            ¿Posible gasto duplicado?
          </h3>

          <p
            style={{
              fontSize: '13px',
              color: '#4B5563',
              margin: 0,
              lineHeight: 1.45,
            }}
          >
            Ya existe un gasto registrado con los mismos datos en tus cuentas:
          </p>
        </div>

        {/* Tarjeta del gasto existente */}
        <div style={{ padding: '0 20px 20px 20px' }}>
          <div
            style={{
              backgroundColor: '#FFFBEB',
              border: '1.5px solid #FDE68A',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {/* Monto y Moneda destacados */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #FDE68A',
                paddingBottom: '10px',
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#92400E', textTransform: 'uppercase' }}>
                Gasto existente
              </span>
              <span
                className="font-tabular"
                style={{
                  fontSize: '22px',
                  fontWeight: '800',
                  color: '#DC2626',
                }}
              >
                - {currSymbol} {montoFormateado}
              </span>
            </div>

            {/* Datos detallados */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              {/* Cuenta donde fue registrado */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151' }}>
                <Landmark size={15} color="#D97706" style={{ flexShrink: 0 }} />
                <span>
                  Cuenta:{' '}
                  <strong style={{ color: cuentaOrigen?.color || '#111827' }}>
                    {cuentaOrigen?.nombre || 'Cuenta registrada'}
                  </strong>
                  {isDiferenteCuenta && cuentaActual && (
                    <span
                      style={{
                        display: 'inline-block',
                        marginLeft: '6px',
                        fontSize: '11px',
                        padding: '1px 6px',
                        borderRadius: '6px',
                        backgroundColor: '#F3F4F6',
                        color: '#4B5563',
                        fontWeight: '500',
                      }}
                    >
                      (estás en: {cuentaActual.nombre})
                    </span>
                  )}
                </span>
              </div>

              {/* Fecha */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151' }}>
                <Calendar size={15} color="#D97706" style={{ flexShrink: 0 }} />
                <span>
                  Fecha: <strong>{formatFechaCompleta(duplicado.fecha)}</strong>
                </span>
              </div>

              {/* Concepto N2 si existe */}
              {conceptoN2 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151' }}>
                  <Tag size={15} color="#D97706" style={{ flexShrink: 0 }} />
                  <span>
                    Concepto: <strong>{conceptoN2.nombre}</strong>
                  </span>
                </div>
              )}

              {/* Nota / Descripción si existe */}
              {duplicado.nota && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#374151' }}>
                  <FileText size={15} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>
                    Detalle: <strong style={{ color: '#111827' }}>{duplicado.nota}</strong>
                  </span>
                </div>
              )}

              {/* Método de pago si existe */}
              {metodoPago && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151' }}>
                  <CreditCard size={15} color="#D97706" style={{ flexShrink: 0 }} />
                  <span>
                    Método: <strong>{metodoPago.nombre}</strong>
                  </span>
                </div>
              )}
            </div>
          </div>

          <p
            style={{
              fontSize: '12.5px',
              color: '#6B7280',
              textAlign: 'center',
              marginTop: '14px',
              marginBottom: 0,
            }}
          >
            ¿Deseas cancelar el registro para no duplicarlo, o continuar igualmente?
          </p>
        </div>

        {/* Botones de Acción */}
        <div
          style={{
            padding: '14px 20px',
            backgroundColor: '#F9FAFB',
            borderTop: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="btn-press"
            style={{
              flex: 1,
              padding: '12px 14px',
              borderRadius: '12px',
              border: '1.5px solid #D1D5DB',
              backgroundColor: '#FFFFFF',
              color: '#374151',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            <X size={17} />
            Cancelar registro
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="btn-press"
            style={{
              flex: 1,
              padding: '12px 14px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: 'var(--c-accent, #5B3765)',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(91, 55, 101, 0.3)',
            }}
          >
            <Check size={17} />
            Continuar igualmente
          </button>
        </div>
      </div>
    </div>
  );
}
