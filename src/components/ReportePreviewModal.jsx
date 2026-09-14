import React from 'react';
import { X, Printer, FileSpreadsheet, ArrowDownLeft, ArrowUpRight, Calendar } from 'lucide-react';
import { getCategoryIcon } from '../lib/icons';
import { exportCategoryToExcel } from '../lib/exportExcel';

export function ReportePreviewModal({
  isOpen,
  onClose,
  categoriaN1,
  transacciones = [],
  categoriasN2 = [],
  cuentas = [],
  selectedCurrency = 'PEN',
}) {
  if (!isOpen || !categoriaN1) return null;

  // Filtrar movimientos de esta cuenta
  const movimientos = transacciones.filter(
    (t) => t.categoria_n1_id === categoriaN1.id && (t.moneda || 'PEN') === selectedCurrency
  );

  let totalIngresos = 0;
  let totalGastado = 0;

  movimientos.forEach((t) => {
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

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    exportCategoryToExcel({
      categoriaN1,
      transacciones,
      categoriasN2,
      cuentas,
    });
  };

  const fechaHoy = new Date().toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(58, 31, 53, 0.45)',
        backdropFilter: 'blur(4px)',
        zIndex: 100,
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
        className="animate-fade-in printable-report"
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid var(--c-border)',
          boxShadow: '0 12px 36px rgba(91, 55, 101, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
      >
        {/* Barra superior de acciones (oculta al imprimir) */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            backgroundColor: 'var(--c-bg)',
            borderBottom: '1px solid var(--c-border)',
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--c-accent)' }}>
            Vista previa del reporte
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handlePrint}
              className="tap-active"
              title="Imprimir o guardar como PDF"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '9999px',
                backgroundColor: 'var(--c-accent)',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: '600',
              }}
            >
              <Printer size={14} />
              <span>Guardar PDF</span>
            </button>
            <button
              type="button"
              onClick={handleExportExcel}
              className="tap-active"
              title="Descargar versión Excel"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: '#059669',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                fontSize: '12px',
                fontWeight: '600',
              }}
            >
              <FileSpreadsheet size={14} />
              <span>Excel</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="tap-active"
              style={{
                color: 'var(--c-muted)',
                padding: '4px',
                borderRadius: '8px',
                marginLeft: '4px',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Cuerpo del Documento / Estado de cuenta */}
        <div
          style={{
            padding: '24px 28px',
            overflowY: 'auto',
            flex: 1,
            backgroundColor: '#FFFFFF',
            color: '#2A1728',
          }}
        >
          {/* Cabecera del Documento */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              paddingBottom: '16px',
              borderBottom: '2px solid var(--c-surface-2)',
              marginBottom: '20px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--c-accent)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'Fraunces, serif',
                    fontWeight: '600',
                    fontSize: '15px',
                  }}
                >
                  M
                </div>
                <h2
                  style={{
                    fontFamily: 'Fraunces, serif',
                    fontSize: '22px',
                    fontWeight: '600',
                    color: 'var(--c-text)',
                    lineHeight: 1.1,
                  }}
                >
                  Moni
                </h2>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--c-muted)' }}>
                Reporte de consumos y movimientos
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  backgroundColor: 'var(--c-surface-2)',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'var(--c-accent)',
                  marginBottom: '4px',
                }}
              >
                {getCategoryIcon(categoriaN1.nombre, 15)}
                <span>Cuenta: {categoriaN1.nombre}</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--c-muted)' }}>
                Emisión: {fechaHoy}
              </div>
            </div>
          </div>

          {/* Tarjetas de Resumen Financiero (KPIs) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '10px',
              marginBottom: '22px',
            }}
          >
            <div
              style={{
                padding: '12px',
                borderRadius: '14px',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
              }}
            >
              <div style={{ fontSize: '11px', color: '#047857', fontWeight: '500' }}>Ingresos (+)</div>
              <div
                className="font-tabular"
                style={{ fontSize: '16px', fontWeight: '700', color: '#065F46', marginTop: '2px' }}
              >
                {currSymbol} {totalIngresos.toFixed(2)}
              </div>
            </div>

            <div
              style={{
                padding: '12px',
                borderRadius: '14px',
                backgroundColor: 'var(--c-surface-2)',
                border: '1px solid var(--c-border)',
              }}
            >
              <div style={{ fontSize: '11px', color: 'var(--c-muted)', fontWeight: '500' }}>Consumos / Gastado</div>
              <div
                className="font-tabular"
                style={{ fontSize: '16px', fontWeight: '700', color: 'var(--c-accent)', marginTop: '2px' }}
              >
                {currSymbol} {totalGastado.toFixed(2)}
              </div>
            </div>

            <div
              style={{
                padding: '12px',
                borderRadius: '14px',
                backgroundColor: isNegative ? 'rgba(91, 55, 101, 0.08)' : 'rgba(16, 185, 129, 0.1)',
                border: `1px solid ${isNegative ? 'var(--c-accent)' : 'rgba(16, 185, 129, 0.25)'}`,
              }}
            >
              <div style={{ fontSize: '11px', color: isNegative ? 'var(--c-accent)' : '#047857', fontWeight: '500' }}>
                Lo que queda (Saldo)
              </div>
              <div
                className="font-tabular"
                style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: isNegative ? 'var(--c-accent)' : '#065F46',
                  marginTop: '2px',
                }}
              >
                {isNegative ? '-' : ''}{currSymbol} {Math.abs(saldoRestante).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Tabla Detallada de Consumos */}
          <div style={{ marginBottom: '16px' }}>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--c-muted)',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '10px',
              }}
            >
              Detalle de consumos y movimientos ({movimientos.length})
            </div>

            {movimientos.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '24px 0',
                  color: 'var(--c-muted)',
                  fontSize: '13px',
                  fontStyle: 'italic',
                }}
              >
                No hay movimientos registrados para esta cuenta en {selectedCurrency}.
              </div>
            ) : (
              <div style={{ border: '1px solid var(--c-border)', borderRadius: '14px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--c-bg)', borderBottom: '1px solid var(--c-border)' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--c-muted)' }}>
                        Fecha
                      </th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--c-muted)' }}>
                        Concepto / Detalle
                      </th>
                      <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '600', color: 'var(--c-muted)' }}>
                        Monto
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {movimientos.map((t, idx) => {
                      const catN2 = categoriasN2.find((c) => c.id === t.categoria_n2_id);
                      const isIngreso = t.tipo === 'ingreso';
                      const isTransf = t.tipo === 'transferencia';

                      return (
                        <tr
                          key={t.id || idx}
                          style={{
                            borderBottom: idx < movimientos.length - 1 ? '1px solid var(--c-border)' : 'none',
                            backgroundColor: idx % 2 === 0 ? '#FFFFFF' : 'rgba(251, 243, 248, 0.5)',
                          }}
                        >
                          <td style={{ padding: '10px 12px', color: 'var(--c-muted)', whiteSpace: 'nowrap' }}>
                            {t.fecha ? new Date(t.fecha).toLocaleDateString('es-PE') : '-'}
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <div style={{ fontWeight: '600', color: 'var(--c-text)' }}>
                              {catN2?.nombre || (isTransf ? 'Transferencia' : isIngreso ? 'Ingreso' : 'Consumo')}
                            </div>
                            {t.nota && (
                              <div style={{ fontSize: '11px', color: 'var(--c-muted)', marginTop: '2px' }}>
                                {t.nota}
                              </div>
                            )}
                          </td>
                          <td
                            className="font-tabular"
                            style={{
                              padding: '10px 12px',
                              textAlign: 'right',
                              fontWeight: '600',
                              color: isIngreso ? '#059669' : isTransf ? 'var(--c-accent2)' : 'var(--c-text)',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {isIngreso ? '+' : '-'}{currSymbol} {Number(t.monto).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pie de Documento */}
          <div
            style={{
              paddingTop: '16px',
              borderTop: '1px solid var(--c-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11px',
              color: 'var(--c-muted)',
            }}
          >
            <span>Moni — App de Finanzas Personales</span>
            <span>Generado automáticamente</span>
          </div>
        </div>
      </div>
    </div>
  );
}
