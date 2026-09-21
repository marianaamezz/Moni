import React, { useState, useMemo, useEffect } from 'react';
import { X, Check, Printer, FileSpreadsheet, CheckSquare, Square, FileText, Calendar } from 'lucide-react';
import { getCategoryIcon } from '../lib/icons';
import { exportMultiCategoriesToExcel } from '../lib/exportExcel';
import { getAvailableMonths, formatPeriodoLabel } from '../lib/dateUtils';
import { ReportePreviewModal } from './ReportePreviewModal';

export function CuentasMultiPdfModal({
  isOpen,
  onClose,
  categoriasN1 = [],
  transacciones = [],
  categoriasN2 = [],
  cuentas = [],
  selectedCurrency = 'PEN',
}) {
  // Estado para qué cuentas están seleccionadas (por defecto todas seleccionadas)
  const [selectedAccountIds, setSelectedAccountIds] = useState(() =>
    categoriasN1.map((c) => c.id)
  );

  // Estado para el mes a descargar ('all' o 'YYYY-MM')
  const [selectedMonth, setSelectedMonth] = useState('all');

  // Modal de preview PDF
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Meses disponibles a partir de las transacciones
  const availableMonths = useMemo(
    () => getAvailableMonths(transacciones),
    [transacciones]
  );

  // Mantener sincronizado si cambian las categorías
  useEffect(() => {
    if (categoriasN1.length > 0 && selectedAccountIds.length === 0) {
      setSelectedAccountIds(categoriasN1.map((c) => c.id));
    }
  }, [categoriasN1]);

  if (!isOpen) return null;

  const currSymbol = selectedCurrency === 'USD' ? '$' : 'S/';

  // Toggle de una cuenta individual
  const toggleAccount = (id) => {
    setSelectedAccountIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Seleccionar todas o deseleccionar todas
  const isAllSelected =
    categoriasN1.length > 0 && selectedAccountIds.length === categoriasN1.length;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedAccountIds([]);
    } else {
      setSelectedAccountIds(categoriasN1.map((c) => c.id));
    }
  };

  // Cuentas seleccionadas como objetos completos
  const selectedCategorias = categoriasN1.filter((c) =>
    selectedAccountIds.includes(c.id)
  );

  // Total de movimientos de las cuentas seleccionadas (filtrados por mes si aplica)
  const totalMovimientosSeleccionados = transacciones.filter((t) => {
    if (!selectedAccountIds.includes(t.categoria_n1_id)) return false;
    if (selectedMonth && selectedMonth !== 'all') {
      return t.fecha && String(t.fecha).startsWith(selectedMonth);
    }
    return true;
  }).length;

  // Descarga directa a Excel
  const handleExportExcel = () => {
    if (selectedCategorias.length === 0) return;
    exportMultiCategoriesToExcel({
      selectedCategoriasN1: selectedCategorias,
      transacciones,
      categoriasN2,
      cuentas,
      selectedMonth,
    });
  };

  // Abrir vista previa PDF
  const handleOpenPdfPreview = () => {
    if (selectedCategorias.length === 0) return;
    setShowPreviewModal(true);
  };

  return (
    <>
      <div
        className="modal-backdrop"
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(58, 31, 53, 0.45)',
          backdropFilter: 'blur(4px)',
          zIndex: 85,
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
            maxWidth: '520px',
            backgroundColor: 'var(--c-surface)',
            borderRadius: '24px',
            border: '1px solid var(--c-border)',
            boxShadow: 'var(--shadow-card)',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Cabecera del Modal */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(91, 55, 101, 0.08)',
                  color: 'var(--c-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FileText size={20} />
              </div>
              <div>
                <h2
                  style={{
                    fontFamily: 'Fraunces, serif',
                    fontSize: '19px',
                    fontWeight: '600',
                    color: 'var(--c-text)',
                    lineHeight: 1.2,
                  }}
                >
                  Reporte PDF Multi-cuenta
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--c-muted)', marginTop: '2px' }}>
                  Selecciona qué cuentas unir en un solo documento
                </p>
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
              <X size={18} />
            </button>
          </div>

          {/* Cuerpo con Scroll */}
          <div
            style={{
              padding: '20px 22px',
              overflowY: 'auto',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {/* Selector de Mes */}
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '16px',
                backgroundColor: 'var(--c-bg)',
                border: '1px solid var(--c-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--c-surface-2)',
                    color: 'var(--c-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Calendar size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--c-text)' }}>
                    Mes del reporte
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--c-muted)' }}>
                    {formatPeriodoLabel(selectedMonth)}
                  </div>
                </div>
              </div>

              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                style={{
                  padding: '7px 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--c-border)',
                  backgroundColor: 'var(--c-surface)',
                  color: 'var(--c-accent)',
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

            {/* Checklist de Cuentas */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                }}
              >
                <span
                  style={{
                    fontSize: '11px',
                    color: 'var(--c-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    fontWeight: '600',
                  }}
                >
                  Cuentas a incluir ({selectedAccountIds.length} de {categoriasN1.length})
                </span>

                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="tap-active"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '12px',
                    color: 'var(--c-accent)',
                    fontWeight: '600',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '2px 6px',
                  }}
                >
                  {isAllSelected ? <CheckSquare size={15} /> : <Square size={15} />}
                  <span>{isAllSelected ? 'Deseleccionar todas' : 'Seleccionar todas'}</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {categoriasN1.map((cat) => {
                  const isChecked = selectedAccountIds.includes(cat.id);
                  const catTx = transacciones.filter((t) => {
                    if (t.categoria_n1_id !== cat.id) return false;
                    if (selectedMonth && selectedMonth !== 'all') {
                      return t.fecha && String(t.fecha).startsWith(selectedMonth);
                    }
                    return true;
                  });

                  // Balance de la cuenta para la moneda seleccionada
                  let catIngresos = 0;
                  let catGastos = 0;
                  catTx.forEach((t) => {
                    if ((t.moneda || 'PEN') !== selectedCurrency) return;
                    const monto = Number(t.monto) || 0;
                    if (t.tipo === 'ingreso') catIngresos += monto;
                    else catGastos += monto;
                  });
                  const catBalance = catIngresos - catGastos;
                  const isNegative = catBalance < 0;

                  return (
                    <div
                      key={cat.id}
                      onClick={() => toggleAccount(cat.id)}
                      className="tap-active"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        borderRadius: '14px',
                        backgroundColor: isChecked ? 'var(--c-surface)' : 'var(--c-bg)',
                        border: `1.5px solid ${isChecked ? 'var(--c-accent)' : 'var(--c-border)'}`,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {/* Checkbox visual */}
                        <div
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '6px',
                            backgroundColor: isChecked ? 'var(--c-accent)' : 'var(--c-surface-2)',
                            border: `1.5px solid ${isChecked ? 'var(--c-accent)' : 'var(--c-border)'}`,
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {isChecked && <Check size={14} strokeWidth={3} />}
                        </div>

                        {/* Ícono de cuenta */}
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '10px',
                            backgroundColor: 'var(--c-surface-2)',
                            color: 'var(--c-accent)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {getCategoryIcon(cat.nombre, 16)}
                        </div>

                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--c-text)' }}>
                            {cat.nombre}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--c-muted)' }}>
                            {catTx.length} {catTx.length === 1 ? 'movimiento' : 'movimientos'}
                          </div>
                        </div>
                      </div>

                      {/* Saldo de la cuenta */}
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
                        {Math.abs(catBalance).toLocaleString('es-PE', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Pie con Acciones */}
          <div
            style={{
              padding: '16px 22px',
              borderTop: '1px solid var(--c-border)',
              backgroundColor: 'var(--c-bg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--c-muted)' }}>
              <span>
                Seleccionadas: <strong style={{ color: 'var(--c-text)' }}>{selectedCategorias.length} cuentas</strong>
              </span>
              <span>
                Total: <strong style={{ color: 'var(--c-text)' }}>{totalMovimientosSeleccionados} movimientos</strong>
              </span>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={handleOpenPdfPreview}
                disabled={selectedCategorias.length === 0}
                className="tap-active"
                style={{
                  flex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 18px',
                  borderRadius: '14px',
                  backgroundColor: selectedCategorias.length === 0 ? 'var(--c-muted)' : 'var(--c-accent)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: selectedCategorias.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: selectedCategorias.length === 0 ? 0.6 : 1,
                  boxShadow: '0 2px 8px rgba(91, 55, 101, 0.2)',
                }}
              >
                <Printer size={16} />
                <span>Ver y Guardar PDF</span>
              </button>

              <button
                type="button"
                onClick={handleExportExcel}
                disabled={selectedCategorias.length === 0}
                className="tap-active"
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  color: '#059669',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: selectedCategorias.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: selectedCategorias.length === 0 ? 0.6 : 1,
                }}
              >
                <FileSpreadsheet size={16} />
                <span>Excel</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Vista Previa PDF con formato real */}
      <ReportePreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        selectedCategoriasN1={selectedCategorias}
        transacciones={transacciones}
        categoriasN2={categoriasN2}
        cuentas={cuentas}
        selectedCurrency={selectedCurrency}
        initialMonth={selectedMonth}
      />
    </>
  );
}
