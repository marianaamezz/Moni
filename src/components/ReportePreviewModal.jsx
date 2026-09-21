import React, { useState, useMemo, useEffect } from 'react';
import { X, Printer, FileSpreadsheet, Calendar } from 'lucide-react';
import { exportCategoryToExcel, exportMultiCategoriesToExcel, buildLedgerRows } from '../lib/exportExcel';
import { getAvailableMonths, formatPeriodoLabel } from '../lib/dateUtils';

export function ReportePreviewModal({
  isOpen,
  onClose,
  categoriaN1,
  selectedCategoriasN1 = [],
  transacciones = [],
  categoriasN2 = [],
  cuentas = [],
  selectedCurrency = 'PEN',
  initialMonth = 'all',
}) {
  const [selectedMonth, setSelectedMonth] = useState(initialMonth || 'all');

  useEffect(() => {
    if (initialMonth) {
      setSelectedMonth(initialMonth);
    }
  }, [initialMonth]);

  const availableMonths = useMemo(
    () => getAvailableMonths(transacciones),
    [transacciones]
  );

  const targetCategorias = selectedCategoriasN1.length > 0
    ? selectedCategoriasN1
    : (categoriaN1 ? [categoriaN1] : []);

  // Construir las filas del libro contable con formato FCHA | DETALLE | INGRESO | GASTO (Cuentas) | SALDO
  const ledger = useMemo(() => {
    if (!isOpen || targetCategorias.length === 0) return null;
    return buildLedgerRows({
      targetCategorias,
      transacciones,
      categoriasN2,
      cuentas,
      selectedMonth,
      selectedCurrency,
    });
  }, [isOpen, targetCategorias, transacciones, categoriasN2, cuentas, selectedMonth, selectedCurrency]);

  if (!isOpen || targetCategorias.length === 0 || !ledger) return null;

  const currSymbol = selectedCurrency === 'USD' ? '$' : 'S/';

  const fechaDescarga = new Date().toLocaleDateString('es-PE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const isMulti = targetCategorias.length > 1;
  const nombresCuentasStr = isMulti
    ? targetCategorias.map((c) => c.nombre).join(', ')
    : targetCategorias[0]?.nombre || 'Cuenta';

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    if (isMulti) {
      exportMultiCategoriesToExcel({
        selectedCategoriasN1: targetCategorias,
        transacciones,
        categoriasN2,
        cuentas,
        selectedMonth,
        selectedCurrency,
      });
    } else {
      exportCategoryToExcel({
        categoriaN1: targetCategorias[0],
        transacciones,
        categoriasN2,
        cuentas,
        selectedMonth,
        selectedCurrency,
      });
    }
  };

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
          maxWidth: '920px',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid var(--c-border)',
          boxShadow: 'var(--shadow-card)',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* BARRA SUPERIOR DE CONTROL: Selector de Mes, Imprimir PDF y Exportar Excel */}
        <div
          className="no-print"
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid #E5E7EB',
            backgroundColor: '#F9FAFB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {/* Selector de Mes */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                backgroundColor: 'rgba(91, 55, 101, 0.08)',
                color: 'var(--c-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Calendar size={15} />
            </div>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>
              Mes:
            </span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #D1D5DB',
                backgroundColor: '#FFFFFF',
                color: '#111827',
                fontSize: '12px',
                fontWeight: '600',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="all">Todos los meses (Histórico)</option>
              {availableMonths.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Botones de acción */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handlePrint}
              className="tap-active"
              title="Guardar como PDF o imprimir"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '9999px',
                backgroundColor: 'var(--c-accent)',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Printer size={14} />
              <span>Guardar PDF</span>
            </button>
            <button
              type="button"
              onClick={handleExportExcel}
              className="tap-active"
              title="Descargar archivo Excel / CSV"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: '#059669',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              <FileSpreadsheet size={14} />
              <span>Descargar Excel</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="tap-active"
              style={{
                color: 'var(--c-muted)',
                padding: '4px',
                borderRadius: '8px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* CONTENIDO DEL REPORTE IMPRIMIBLE / PREVIEW */}
        <div
          style={{
            padding: '24px 28px',
            overflowY: 'auto',
            flex: 1,
            backgroundColor: '#FFFFFF',
            color: '#1F1F1F',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {/* Bloque 1: Metadatos del Reporte */}
          <div
            style={{
              border: '1px solid #D1D5DB',
              borderRadius: '10px',
              padding: '14px 18px',
              marginBottom: '20px',
              backgroundColor: '#F9FAFB',
            }}
          >
            <h1
              style={{
                fontSize: '16px',
                fontWeight: '700',
                color: '#111827',
                letterSpacing: '0.02em',
                marginBottom: '10px',
                textTransform: 'uppercase',
              }}
            >
              REPORTE FINANCIERO — MONI
            </h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', fontSize: '13px' }}>
              <div>
                <span style={{ color: '#6B7280', fontWeight: '500' }}>
                  {isMulti ? 'Cuentas incluidas: ' : 'Cuenta: '}
                </span>
                <strong style={{ color: '#111827' }}>{nombresCuentasStr}</strong>
              </div>
              <div>
                <span style={{ color: '#6B7280', fontWeight: '500' }}>Período: </span>
                <strong style={{ color: '#111827' }}>{formatPeriodoLabel(selectedMonth)}</strong>
              </div>
              <div>
                <span style={{ color: '#6B7280', fontWeight: '500' }}>Moneda: </span>
                <strong style={{ color: '#111827' }}>{selectedCurrency === 'USD' ? 'Dólares (USD)' : 'Soles (PEN)'}</strong>
              </div>
              <div>
                <span style={{ color: '#6B7280', fontWeight: '500' }}>Fecha de emisión: </span>
                <strong style={{ color: '#111827' }}>{fechaDescarga}</strong>
              </div>
            </div>
          </div>

          {/* Bloque 2: RESUMEN DE BALANCE */}
          <div style={{ marginBottom: '20px' }}>
            <div
              style={{
                fontSize: '12px',
                fontWeight: '700',
                color: '#374151',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '8px',
              }}
            >
              RESUMEN DEL PERÍODO
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
              <div style={{ border: '1px solid #D1D5DB', borderRadius: '10px', padding: '10px 14px', backgroundColor: '#F9FAFB' }}>
                <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: '500' }}>{ledger.nombreMesAnterior}</div>
                <div className="font-tabular" style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginTop: '2px' }}>
                  {currSymbol} {ledger.saldoAnterior.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div style={{ border: '1px solid #D1D5DB', borderRadius: '10px', padding: '10px 14px', backgroundColor: '#F9FAFB' }}>
                <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: '500' }}>Total Ingresos (+)</div>
                <div className="font-tabular" style={{ fontSize: '16px', fontWeight: '700', color: '#059669', marginTop: '2px' }}>
                  +{currSymbol} {ledger.totalIngresos.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div style={{ border: '1px solid #D1D5DB', borderRadius: '10px', padding: '10px 14px', backgroundColor: '#F9FAFB' }}>
                <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: '500' }}>Total Gastos (-)</div>
                <div className="font-tabular" style={{ fontSize: '16px', fontWeight: '700', color: '#DC2626', marginTop: '2px' }}>
                  -{currSymbol} {ledger.totalGeneralGastos.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div style={{ border: '1px solid #D1D5DB', borderRadius: '10px', padding: '10px 14px', backgroundColor: '#F9FAFB' }}>
                <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: '500' }}>Saldo Final</div>
                <div
                  className="font-tabular"
                  style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: ledger.runningBalance < 0 ? '#DC2626' : '#111827',
                    marginTop: '2px',
                  }}
                >
                  {ledger.runningBalance < 0 ? '-' : ''}{currSymbol}{' '}
                  {Math.abs(ledger.runningBalance).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>

          {/* Bloque 3: TABLA EN ORDEN: FCHA | DETALLE | INGRESO | GASTO (Cuentas) | SALDO */}
          <div>
            <div
              style={{
                fontSize: '12px',
                fontWeight: '700',
                color: '#374151',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '8px',
              }}
            >
              LIBRO CONTABLE ({ledger.rows.length} movimientos)
            </div>

            <div style={{ border: '1px solid #D1D5DB', borderRadius: '10px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '650px' }}>
                <thead>
                  {/* Fila 1 de Cabecera: FCHA, DETALLE, INGRESO, GASTO (colSpan), SALDO */}
                  <tr style={{ backgroundColor: '#F3F4F6', borderBottom: '1px solid #D1D5DB' }}>
                    <th
                      rowSpan={2}
                      style={{
                        padding: '8px 10px',
                        textAlign: 'left',
                        fontWeight: '700',
                        color: '#374151',
                        borderRight: '1px solid #D1D5DB',
                        width: '90px',
                      }}
                    >
                      FCHA
                    </th>
                    <th
                      rowSpan={2}
                      style={{
                        padding: '8px 10px',
                        textAlign: 'left',
                        fontWeight: '700',
                        color: '#374151',
                        borderRight: '1px solid #D1D5DB',
                      }}
                    >
                      DETALLE
                    </th>
                    <th
                      rowSpan={2}
                      style={{
                        padding: '8px 10px',
                        textAlign: 'right',
                        fontWeight: '700',
                        color: '#059669',
                        borderRight: '1px solid #D1D5DB',
                        width: '100px',
                      }}
                    >
                      INGRESO
                    </th>
                    <th
                      colSpan={targetCategorias.length}
                      style={{
                        padding: '6px 10px',
                        textAlign: 'center',
                        fontWeight: '700',
                        color: '#374151',
                        borderRight: '1px solid #D1D5DB',
                        backgroundColor: '#E5E7EB',
                        letterSpacing: '0.05em',
                      }}
                    >
                      GASTO
                    </th>
                    <th
                      rowSpan={2}
                      style={{
                        padding: '8px 10px',
                        textAlign: 'right',
                        fontWeight: '700',
                        color: '#111827',
                        width: '110px',
                      }}
                    >
                      SALDO
                    </th>
                  </tr>

                  {/* Fila 2 de Cabecera: Subencabezados con los nombres de las Cuentas bajo GASTO */}
                  <tr style={{ backgroundColor: '#F3F4F6', borderBottom: '1px solid #D1D5DB' }}>
                    {targetCategorias.map((cat) => (
                      <th
                        key={cat.id}
                        style={{
                          padding: '6px 8px',
                          textAlign: 'right',
                          fontWeight: '600',
                          color: '#4B5563',
                          fontSize: '11px',
                          borderRight: '1px solid #E5E7EB',
                          textTransform: 'uppercase',
                        }}
                      >
                        {cat.nombre}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {/* Fila 1 de Datos: Saldo del mes anterior */}
                  <tr style={{ backgroundColor: '#FAF5FF', borderBottom: '1px solid #E5E7EB', fontWeight: '600' }}>
                    <td style={{ padding: '8px 10px', borderRight: '1px solid #E5E7EB' }}></td>
                    <td style={{ padding: '8px 10px', color: 'var(--c-accent)', borderRight: '1px solid #E5E7EB' }}>
                      {ledger.nombreMesAnterior}
                    </td>
                    <td style={{ padding: '8px 10px', borderRight: '1px solid #E5E7EB' }}></td>
                    {targetCategorias.map((cat) => (
                      <td key={cat.id} style={{ padding: '8px 10px', borderRight: '1px solid #E5E7EB' }}></td>
                    ))}
                    <td
                      className="font-tabular"
                      style={{
                        padding: '8px 10px',
                        textAlign: 'right',
                        fontWeight: '700',
                        color: ledger.saldoAnterior < 0 ? '#DC2626' : '#111827',
                      }}
                    >
                      {ledger.saldoAnterior < 0 ? '-' : ''}
                      {Math.abs(ledger.saldoAnterior).toLocaleString('es-PE', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>

                  {/* Filas de Movimientos */}
                  {ledger.rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4 + targetCategorias.length}
                        style={{
                          textAlign: 'center',
                          padding: '24px',
                          color: '#6B7280',
                        }}
                      >
                        No hay movimientos registrados en este período.
                      </td>
                    </tr>
                  ) : (
                    ledger.rows.map((r, idx) => (
                      <tr
                        key={r.id || idx}
                        style={{
                          borderBottom: '1px solid #E5E7EB',
                          backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
                        }}
                      >
                        <td
                          style={{
                            padding: '8px 10px',
                            whiteSpace: 'nowrap',
                            color: '#6B7280',
                            borderRight: '1px solid #E5E7EB',
                          }}
                        >
                          {r.fechaStr}
                        </td>
                        <td
                          style={{
                            padding: '8px 10px',
                            color: '#111827',
                            fontWeight: '500',
                            borderRight: '1px solid #E5E7EB',
                          }}
                        >
                          {r.detalle}
                        </td>
                        <td
                          className="font-tabular"
                          style={{
                            padding: '8px 10px',
                            textAlign: 'right',
                            color: '#059669',
                            fontWeight: '600',
                            borderRight: '1px solid #E5E7EB',
                          }}
                        >
                          {r.ingresoMonto !== null
                            ? r.ingresoMonto.toLocaleString('es-PE', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                            : ''}
                        </td>
                        {targetCategorias.map((cat) => {
                          const val = r.gastosPorCuenta[cat.id];
                          return (
                            <td
                              key={cat.id}
                              className="font-tabular"
                              style={{
                                padding: '8px 10px',
                                textAlign: 'right',
                                color: val !== null ? '#DC2626' : '#9CA3AF',
                                fontWeight: val !== null ? '600' : '400',
                                borderRight: '1px solid #E5E7EB',
                              }}
                            >
                              {val !== null
                                ? val.toLocaleString('es-PE', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })
                                : ''}
                            </td>
                          );
                        })}
                        <td
                          className="font-tabular"
                          style={{
                            padding: '8px 10px',
                            textAlign: 'right',
                            fontWeight: '600',
                            color: r.saldoActual < 0 ? '#DC2626' : '#111827',
                          }}
                        >
                          {r.saldoActual < 0 ? '-' : ''}
                          {Math.abs(r.saldoActual).toLocaleString('es-PE', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>

                {/* Fila de Totales */}
                <tfoot>
                  <tr style={{ backgroundColor: '#F3F4F6', borderTop: '2px solid #D1D5DB', fontWeight: '700' }}>
                    <td style={{ padding: '10px', borderRight: '1px solid #D1D5DB' }}>TOTALES</td>
                    <td style={{ padding: '10px', borderRight: '1px solid #D1D5DB' }}></td>
                    <td
                      className="font-tabular"
                      style={{
                        padding: '10px',
                        textAlign: 'right',
                        color: '#059669',
                        borderRight: '1px solid #D1D5DB',
                      }}
                    >
                      {ledger.totalIngresos.toLocaleString('es-PE', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    {targetCategorias.map((cat) => (
                      <td
                        key={cat.id}
                        className="font-tabular"
                        style={{
                          padding: '10px',
                          textAlign: 'right',
                          color: '#DC2626',
                          borderRight: '1px solid #E5E7EB',
                        }}
                      >
                        {(ledger.totalesGastos[cat.id] || 0).toLocaleString('es-PE', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    ))}
                    <td
                      className="font-tabular"
                      style={{
                        padding: '10px',
                        textAlign: 'right',
                        color: ledger.runningBalance < 0 ? '#DC2626' : '#111827',
                      }}
                    >
                      {ledger.runningBalance < 0 ? '-' : ''}
                      {Math.abs(ledger.runningBalance).toLocaleString('es-PE', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
