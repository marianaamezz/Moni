import React from 'react';
import { X, Printer, FileSpreadsheet } from 'lucide-react';
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

  // Filtrar todos los movimientos de esta cuenta
  const movimientos = transacciones.filter(
    (t) => t.categoria_n1_id === categoriaN1.id
  );

  // Totales en PEN y USD exactamente como en el Excel
  let totalIngresosPEN = 0;
  let totalEgresosPEN = 0;
  let totalIngresosUSD = 0;
  let totalEgresosUSD = 0;

  movimientos.forEach((t) => {
    const monto = Number(t.monto) || 0;
    const isUSD = t.moneda === 'USD';

    if (t.tipo === 'ingreso') {
      if (isUSD) totalIngresosUSD += monto;
      else totalIngresosPEN += monto;
    } else if (t.tipo === 'gasto' || t.tipo === 'transferencia') {
      if (isUSD) totalEgresosUSD += monto;
      else totalEgresosPEN += monto;
    }
  });

  const balanceNetoPEN = totalIngresosPEN - totalEgresosPEN;
  const balanceNetoUSD = totalIngresosUSD - totalEgresosUSD;

  const fechaDescarga = new Date().toLocaleDateString('es-PE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

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
          maxWidth: '780px',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid var(--c-border)',
          boxShadow: '0 12px 36px rgba(91, 55, 101, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
        }}
      >
        {/* Barra superior de control (no sale en la impresión) */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            backgroundColor: 'var(--c-bg)',
            borderBottom: '1px solid var(--c-border)',
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--c-accent)' }}>
            Vista previa del reporte (Formato idéntico al Excel)
          </div>
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
                marginLeft: '4px',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* CONTENIDO DEL REPORTE CON EL MISMO FORMATO EXACTO QUE EXCEL */}
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
                <span style={{ color: '#6B7280', fontWeight: '500' }}>Cuenta (N1): </span>
                <strong style={{ color: '#111827' }}>{categoriaN1.nombre}</strong>
              </div>
              <div>
                <span style={{ color: '#6B7280', fontWeight: '500' }}>Fecha de emisión: </span>
                <strong style={{ color: '#111827' }}>{fechaDescarga}</strong>
              </div>
              <div>
                <span style={{ color: '#6B7280', fontWeight: '500' }}>Total de movimientos: </span>
                <strong style={{ color: '#111827' }}>{movimientos.length}</strong>
              </div>
            </div>
          </div>

          {/* Bloque 2: RESUMEN DE BALANCE DE LA CUENTA (Idéntico a Excel) */}
          <div style={{ marginBottom: '24px' }}>
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
              RESUMEN DE BALANCE DE LA CUENTA
            </div>
            <div style={{ border: '1px solid #D1D5DB', borderRadius: '10px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F3F4F6', borderBottom: '1px solid #D1D5DB' }}>
                    <th style={{ padding: '8px 14px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                      Concepto
                    </th>
                    <th style={{ padding: '8px 14px', textAlign: 'right', fontWeight: '600', color: '#374151' }}>
                      Soles (PEN)
                    </th>
                    <th style={{ padding: '8px 14px', textAlign: 'right', fontWeight: '600', color: '#374151' }}>
                      Dólares (USD)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '8px 14px', color: '#059669', fontWeight: '500' }}>
                      Total Ingresos (+)
                    </td>
                    <td className="font-tabular" style={{ padding: '8px 14px', textAlign: 'right', color: '#059669', fontWeight: '600' }}>
                      S/ {totalIngresosPEN.toFixed(2)}
                    </td>
                    <td className="font-tabular" style={{ padding: '8px 14px', textAlign: 'right', color: '#059669', fontWeight: '600' }}>
                      $ {totalIngresosUSD.toFixed(2)}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '8px 14px', color: '#DC2626', fontWeight: '500' }}>
                      Total Egresos (-)
                    </td>
                    <td className="font-tabular" style={{ padding: '8px 14px', textAlign: 'right', color: '#DC2626', fontWeight: '600' }}>
                      S/ {totalEgresosPEN.toFixed(2)}
                    </td>
                    <td className="font-tabular" style={{ padding: '8px 14px', textAlign: 'right', color: '#DC2626', fontWeight: '600' }}>
                      $ {totalEgresosUSD.toFixed(2)}
                    </td>
                  </tr>
                  <tr style={{ backgroundColor: '#F9FAFB' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '700', color: '#111827' }}>
                      BALANCE NETO (Ingresos - Egresos)
                    </td>
                    <td
                      className="font-tabular"
                      style={{
                        padding: '10px 14px',
                        textAlign: 'right',
                        fontWeight: '700',
                        color: balanceNetoPEN < 0 ? '#DC2626' : '#059669',
                      }}
                    >
                      S/ {balanceNetoPEN.toFixed(2)}
                    </td>
                    <td
                      className="font-tabular"
                      style={{
                        padding: '10px 14px',
                        textAlign: 'right',
                        fontWeight: '700',
                        color: balanceNetoUSD < 0 ? '#DC2626' : '#059669',
                      }}
                    >
                      $ {balanceNetoUSD.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Bloque 3: DETALLE DE MOVIMIENTOS (Columnas idénticas al Excel) */}
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
              DETALLE DE MOVIMIENTOS ({movimientos.length})
            </div>

            {movimientos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#6B7280', fontSize: '13px', border: '1px dashed #D1D5DB', borderRadius: '10px' }}>
                No hay movimientos registrados para esta cuenta.
              </div>
            ) : (
              <div style={{ border: '1px solid #D1D5DB', borderRadius: '10px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '650px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F3F4F6', borderBottom: '1px solid #D1D5DB' }}>
                      <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Fecha</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Cuenta (N1)</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Concepto (N2)</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Tipo</th>
                      <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Moneda</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '600', color: '#374151' }}>Ingreso (+)</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '600', color: '#374151' }}>Egreso (-)</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '600', color: '#374151' }}>Monto Neto</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Método</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Descripción / Nota</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movimientos.map((t, idx) => {
                      const catN2 = categoriasN2.find((c) => c.id === t.categoria_n2_id);
                      const cta = cuentas.find((c) => c.id === t.cuenta_id);

                      const fechaStr = t.fecha
                        ? new Date(t.fecha).toLocaleDateString('es-PE', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                          })
                        : '-';

                      const montoNum = Number(t.monto) || 0;
                      const isIngreso = t.tipo === 'ingreso';
                      const isTransf = t.tipo === 'transferencia';

                      let tipoLabel = 'Gasto';
                      let ingresoCol = '-';
                      let egresoCol = '-';
                      let netoCol = -montoNum;

                      if (isIngreso) {
                        tipoLabel = 'Ingreso';
                        ingresoCol = montoNum.toFixed(2);
                        netoCol = montoNum;
                      } else if (isTransf) {
                        tipoLabel = 'Transferencia';
                        egresoCol = montoNum.toFixed(2);
                        netoCol = -montoNum;
                      } else {
                        tipoLabel = 'Gasto';
                        egresoCol = montoNum.toFixed(2);
                        netoCol = -montoNum;
                      }

                      return (
                        <tr
                          key={t.id || idx}
                          style={{
                            borderBottom: idx < movimientos.length - 1 ? '1px solid #E5E7EB' : 'none',
                            backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB',
                          }}
                        >
                          <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>{fechaStr}</td>
                          <td style={{ padding: '8px 10px', fontWeight: '500' }}>{categoriaN1.nombre}</td>
                          <td style={{ padding: '8px 10px' }}>{catN2?.nombre || 'General'}</td>
                          <td style={{ padding: '8px 10px' }}>
                            <span
                              style={{
                                fontSize: '11px',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                backgroundColor: isIngreso ? '#D1FAE5' : isTransf ? '#E0E7FF' : '#FEE2E2',
                                color: isIngreso ? '#065F46' : isTransf ? '#3730A3' : '#991B1B',
                                fontWeight: '500',
                              }}
                            >
                              {tipoLabel}
                            </span>
                          </td>
                          <td style={{ padding: '8px 10px', textAlign: 'center' }}>{t.moneda || 'PEN'}</td>
                          <td className="font-tabular" style={{ padding: '8px 10px', textAlign: 'right', color: isIngreso ? '#059669' : '#9CA3AF' }}>
                            {ingresoCol}
                          </td>
                          <td className="font-tabular" style={{ padding: '8px 10px', textAlign: 'right', color: !isIngreso ? '#DC2626' : '#9CA3AF' }}>
                            {egresoCol}
                          </td>
                          <td
                            className="font-tabular"
                            style={{
                              padding: '8px 10px',
                              textAlign: 'right',
                              fontWeight: '600',
                              color: netoCol >= 0 ? '#059669' : '#DC2626',
                            }}
                          >
                            {netoCol > 0 ? '+' : ''}{netoCol.toFixed(2)}
                          </td>
                          <td style={{ padding: '8px 10px', color: '#4B5563' }}>{cta?.nombre || 'Sin método'}</td>
                          <td style={{ padding: '8px 10px', color: '#4B5563', maxWidth: '200px' }}>{t.nota || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
