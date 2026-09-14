import React, { useState, useMemo } from 'react';
import { X, Check, Printer, FileSpreadsheet, CheckSquare, Square, ArrowUpRight, ArrowDownLeft, Landmark } from 'lucide-react';
import { getCategoryIcon } from '../lib/icons';
import { exportMultiCategoriesToExcel } from '../lib/exportExcel';
import { ReportePreviewModal } from './ReportePreviewModal';

export function BalanceReporteModal({
  isOpen,
  onClose,
  balance,
  transacciones = [],
  categoriasN1 = [],
  categoriasN2 = [],
  cuentas = [],
  selectedCurrency = 'PEN',
  onToggleCurrency,
}) {
  // Estado para qué cuentas están seleccionadas (por defecto todas seleccionadas)
  const [selectedAccountIds, setSelectedAccountIds] = useState(() =>
    categoriasN1.map((c) => c.id)
  );

  // Modal secundario de preview PDF
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Mantener sincronizado si cambian las categorías
  React.useEffect(() => {
    if (categoriasN1.length > 0 && selectedAccountIds.length === 0) {
      setSelectedAccountIds(categoriasN1.map((c) => c.id));
    }
  }, [categoriasN1]);

  if (!isOpen) return null;

  const currentBalance = selectedCurrency === 'USD' ? balance?.usd || 0 : balance?.pen || 0;
  const isNegative = currentBalance < 0;
  const currSymbol = selectedCurrency === 'USD' ? '$' : 'S/';

  // Calcular ingresos y egresos globales para la moneda activa
  let globalIngresos = 0;
  let globalGastos = 0;
  transacciones.forEach((t) => {
    if ((t.moneda || 'PEN') !== selectedCurrency) return;
    const monto = Number(t.monto) || 0;
    if (t.tipo === 'ingreso') {
      globalIngresos += monto;
    } else if (t.tipo === 'gasto' || t.tipo === 'transferencia') {
      globalGastos += monto;
    }
  });

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

  // Total de movimientos de las cuentas seleccionadas
  const totalMovimientosSeleccionados = transacciones.filter((t) =>
    selectedAccountIds.includes(t.categoria_n1_id)
  ).length;

  // Descarga directa a Excel
  const handleExportExcel = () => {
    if (selectedCategorias.length === 0) return;
    exportMultiCategoriesToExcel({
      selectedCategoriasN1: selectedCategorias,
      transacciones,
      categoriasN2,
      cuentas,
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
            maxHeight: '88vh',
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
            <div>
              <h2
                style={{
                  fontFamily: 'Fraunces, serif',
                  fontSize: '20px',
                  fontWeight: '600',
                  color: 'var(--c-text)',
                  lineHeight: 1.1,
                }}
              >
                Balance y Reportes
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--c-muted)', marginTop: '2px' }}>
                Selecciona las cuentas a incluir en un solo PDF o Excel
              </p>
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

          <div style={{ padding: '18px 22px', overflowY: 'auto', flex: 1 }}>
            {/* Tarjeta 1: Desglose del Balance General */}
            <div
              style={{
                padding: '16px 18px',
                borderRadius: '18px',
                backgroundColor: 'var(--c-bg)',
                border: '1px solid var(--c-border)',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
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
                  Balance General Total
                </span>

                {/* Switch de moneda interactivo */}
                <button
                  type="button"
                  onClick={onToggleCurrency}
                  className="tap-active"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    backgroundColor: 'var(--c-surface)',
                    border: '1px solid var(--c-border)',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: 'var(--c-accent)',
                  }}
                >
                  <span>Moneda: {selectedCurrency}</span>
                  <span style={{ fontSize: '10px', color: 'var(--c-muted)' }}>⇄</span>
                </button>
              </div>

              <div
                className="font-tabular"
                style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: isNegative ? 'var(--c-accent)' : '#059669',
                  lineHeight: 1.1,
                  marginBottom: '10px',
                }}
              >
                {isNegative ? '-' : ''}{currSymbol}{' '}
                {Math.abs(currentBalance).toLocaleString('es-PE', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>

              <div
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
                  Ingresos: <strong style={{ color: '#059669' }}>+{currSymbol} {globalIngresos.toFixed(2)}</strong>
                </span>
                <span>
                  Gastos: <strong style={{ color: 'var(--c-text)' }}>-{currSymbol} {globalGastos.toFixed(2)}</strong>
                </span>
              </div>
            </div>

            {/* Tarjeta 2: Selector de Cuentas para el Reporte Consolidado */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: '11px',
                      color: 'var(--c-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      fontWeight: '600',
                    }}
                  >
                    Cuentas a incluir en el reporte
                  </span>
                </div>

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

              {/* Lista de Cuentas con Checkboxes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {categoriasN1.map((cat) => {
                  const isChecked = selectedAccountIds.includes(cat.id);
                  const catTx = transacciones.filter(
                    (t) => t.categoria_n1_id === cat.id
                  );

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
                          {getCategoryIcon(cat.nombre, 15)}
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

                      {/* Estado seleccionado / no seleccionado */}
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: '600',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          backgroundColor: isChecked ? 'rgba(91, 55, 101, 0.08)' : 'var(--c-surface-2)',
                          color: isChecked ? 'var(--c-accent)' : 'var(--c-muted)',
                        }}
                      >
                        {isChecked ? 'Incluida' : 'Omitida'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Barra de Acciones Inferior */}
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
            <div
              style={{
                fontSize: '12px',
                color: 'var(--c-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>
                <strong>{selectedCategorias.length}</strong> de {categoriasN1.length} cuentas seleccionadas
              </span>
              <span>
                {totalMovimientosSeleccionados} movimientos a exportar
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {/* Botón 1: Vista Previa PDF */}
              <button
                type="button"
                onClick={handleOpenPdfPreview}
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
                  backgroundColor: selectedCategorias.length === 0 ? 'var(--c-border)' : 'var(--c-surface-2)',
                  color: selectedCategorias.length === 0 ? 'var(--c-muted)' : 'var(--c-accent)',
                  border: '1px solid var(--c-border)',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: selectedCategorias.length === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                <Printer size={16} />
                <span>Vista Previa PDF</span>
              </button>

              {/* Botón 2: Descargar Excel */}
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
                  backgroundColor: selectedCategorias.length === 0 ? 'var(--c-border)' : '#059669',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: selectedCategorias.length === 0 ? 'not-allowed' : 'pointer',
                  border: 'none',
                }}
              >
                <FileSpreadsheet size={16} />
                <span>Descargar Excel</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Vista Previa PDF Consolidado */}
      <ReportePreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        selectedCategoriasN1={selectedCategorias}
        transacciones={transacciones}
        categoriasN2={categoriasN2}
        cuentas={cuentas}
        selectedCurrency={selectedCurrency}
      />
    </>
  );
}
