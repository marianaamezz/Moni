import React, { useState } from 'react';
import { Keypad } from '../components/Keypad';
import { getCategoryIcon } from '../lib/icons';
import { ChevronDown, ChevronUp, Check, Calendar, FileText } from 'lucide-react';

export function RegistrarView({
  categoriasN1,
  categoriasN2,
  cuentas,
  onSaveTransaccion,
  selectedCurrency,
  onToggleCurrency,
}) {
  const [tipo, setTipo] = useState('gasto'); // 'gasto' | 'ingreso' | 'transferencia'
  const [montoStr, setMontoStr] = useState('0');
  const [selectedN1, setSelectedN1] = useState(categoriasN1[0]?.id || null);
  const [selectedN2, setSelectedN2] = useState(null);
  const [selectedCuenta, setSelectedCuenta] = useState(null);
  const [nota, setNota] = useState('');
  const [fecha, setFecha] = useState(() => new Date().toISOString().split('T')[0]);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  // Asegurar selección inicial de N1 si aún no está lista
  React.useEffect(() => {
    if (!selectedN1 && categoriasN1.length > 0) {
      setSelectedN1(categoriasN1[0].id);
    }
  }, [categoriasN1, selectedN1]);

  const montoNum = parseFloat(montoStr) || 0;
  const isFormValid = montoNum > 0 && Boolean(selectedN1);

  // Contador de opciones secundarias seleccionadas
  const secondaryCount = [
    Boolean(selectedN2),
    Boolean(selectedCuenta),
    Boolean(nota.trim()),
    fecha !== new Date().toISOString().split('T')[0],
  ].filter(Boolean).length;

  const handleSave = async () => {
    if (!isFormValid) return;

    try {
      await onSaveTransaccion({
        monto: montoNum,
        moneda: selectedCurrency,
        tipo,
        categoria_n1_id: selectedN1,
        categoria_n2_id: selectedN2,
        cuenta_id: selectedCuenta,
        nota: nota.trim(),
        fecha: new Date(fecha).toISOString(),
      });

      // Resetear estado
      setMontoStr('0');
      setSelectedN2(null);
      setSelectedCuenta(null);
      setNota('');
      setShowMoreOptions(false);

      // Feedback suave
      setSavedFeedback(true);
      setTimeout(() => setSavedFeedback(false), 2200);
    } catch (err) {
      console.error('Error guardando transacción:', err);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px 20px 100px',
        maxWidth: '460px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      {/* Selector de Tipo (Segmented Control suave) */}
      <div
        style={{
          display: 'flex',
          backgroundColor: 'var(--c-surface-2)',
          borderRadius: '9999px',
          padding: '4px',
          width: '100%',
          maxWidth: '340px',
          marginBottom: '20px',
          border: '1px solid var(--c-border)',
        }}
      >
        {[
          { id: 'gasto', label: 'Gasto' },
          { id: 'ingreso', label: 'Ingreso' },
          { id: 'transferencia', label: 'Transferencia' },
        ].map((t) => {
          const isActive = tipo === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTipo(t.id)}
              className="tap-active"
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: '9999px',
                fontSize: '13px',
                fontWeight: isActive ? '600' : '500',
                backgroundColor: isActive ? 'var(--c-surface)' : 'transparent',
                color: isActive ? 'var(--c-accent)' : 'var(--c-muted)',
                boxShadow: isActive ? '0 2px 8px rgba(91, 55, 101, 0.06)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Visor de Monto Grande y Centrado con Toggle de Moneda */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'center',
          gap: '8px',
          margin: '12px 0 24px',
          cursor: 'pointer',
        }}
        onClick={onToggleCurrency}
        title="Toca para cambiar de moneda"
      >
        <span
          style={{
            fontFamily: 'Fraunces, serif',
            fontSize: '28px',
            color: 'var(--c-accent2)',
            fontWeight: '500',
            userSelect: 'none',
          }}
        >
          {selectedCurrency === 'USD' ? '$' : 'S/'}
        </span>
        <span
          className="font-serif font-tabular"
          style={{
            fontSize: '52px',
            lineHeight: 1,
            color: montoNum > 0 ? 'var(--c-accent)' : 'var(--c-muted)',
            fontWeight: '600',
            letterSpacing: '-0.03em',
            userSelect: 'none',
          }}
        >
          {montoStr}
        </span>
      </div>

      {/* Chips de "Para quién" / N1 (Obligatorio, visibles por defecto) */}
      <div style={{ width: '100%', marginBottom: '20px' }}>
        <div
          style={{
            fontSize: '12px',
            color: 'var(--c-muted)',
            marginBottom: '8px',
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            textAlign: 'center',
          }}
        >
          ¿Para quién / de dónde?
        </div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          {categoriasN1.map((c) => {
            const isSelected = selectedN1 === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedN1(c.id)}
                className="tap-active"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '9999px',
                  backgroundColor: isSelected ? 'var(--c-accent)' : 'var(--c-surface)',
                  color: isSelected ? '#FFFFFF' : 'var(--c-text)',
                  border: `1px solid ${isSelected ? 'var(--c-accent)' : 'var(--c-border)'}`,
                  boxShadow: 'var(--shadow-subtle)',
                  fontSize: '14px',
                  fontWeight: isSelected ? '600' : '400',
                  transition: 'all 0.12s ease',
                }}
              >
                {getCategoryIcon(c.nombre, 15, isSelected ? 'text-white' : '')}
                <span>{c.nombre}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Botón "Más opciones" (colapsado por defecto) */}
      <div style={{ width: '100%', marginBottom: '20px' }}>
        <button
          type="button"
          onClick={() => setShowMoreOptions(!showMoreOptions)}
          className="tap-active"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            width: '100%',
            padding: '8px',
            fontSize: '13px',
            fontWeight: '500',
            color: 'var(--c-accent2)',
          }}
        >
          <span>{showMoreOptions ? 'Menos opciones' : 'Más opciones'}</span>
          {secondaryCount > 0 && !showMoreOptions && (
            <span
              style={{
                backgroundColor: 'var(--c-surface-2)',
                color: 'var(--c-accent)',
                fontSize: '11px',
                fontWeight: '600',
                padding: '1px 6px',
                borderRadius: '9999px',
                border: '1px solid var(--c-border)',
              }}
            >
              {secondaryCount}
            </span>
          )}
          {showMoreOptions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {/* Panel Expandible de Más Opciones */}
        {showMoreOptions && (
          <div
            className="animate-fade-in"
            style={{
              marginTop: '12px',
              padding: '16px',
              backgroundColor: 'var(--c-surface)',
              borderRadius: '20px',
              border: '1px solid var(--c-border)',
              boxShadow: 'var(--shadow-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {/* Categoría Nivel 2: "¿En qué?" */}
            <div>
              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--c-muted)',
                  marginBottom: '8px',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                ¿En qué? (Opcional)
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedN2(null)}
                  className="tap-active"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '6px 12px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    backgroundColor: selectedN2 === null ? 'var(--c-surface-2)' : 'transparent',
                    color: selectedN2 === null ? 'var(--c-accent)' : 'var(--c-muted)',
                    border: '1px solid var(--c-border)',
                  }}
                >
                  Sin definir
                </button>
                {categoriasN2.map((c) => {
                  const isSelected = selectedN2 === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedN2(isSelected ? null : c.id)}
                      className="tap-active"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '6px 12px',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        backgroundColor: isSelected ? 'var(--c-surface-2)' : 'transparent',
                        color: isSelected ? 'var(--c-accent)' : 'var(--c-text)',
                        border: `1px solid ${isSelected ? 'var(--c-accent2)' : 'var(--c-border)'}`,
                        fontWeight: isSelected ? '600' : '400',
                      }}
                    >
                      {getCategoryIcon(c.nombre, 13)}
                      <span>{c.nombre}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cuentas */}
            {cuentas.length > 0 && (
              <div>
                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--c-muted)',
                    marginBottom: '8px',
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Cuenta (Opcional)
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedCuenta(null)}
                    className="tap-active"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '6px 12px',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      backgroundColor: selectedCuenta === null ? 'var(--c-surface-2)' : 'transparent',
                      color: selectedCuenta === null ? 'var(--c-accent)' : 'var(--c-muted)',
                      border: '1px solid var(--c-border)',
                    }}
                  >
                    Sin definir
                  </button>
                  {cuentas.map((c) => {
                    const isSelected = selectedCuenta === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedCuenta(isSelected ? null : c.id)}
                        className="tap-active"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '6px 12px',
                          borderRadius: '9999px',
                          fontSize: '12px',
                          backgroundColor: isSelected ? 'var(--c-surface-2)' : 'transparent',
                          color: isSelected ? 'var(--c-accent)' : 'var(--c-text)',
                          border: `1px solid ${isSelected ? 'var(--c-accent2)' : 'var(--c-border)'}`,
                          fontWeight: isSelected ? '600' : '400',
                        }}
                      >
                        {getCategoryIcon(c.tipo || c.nombre, 13)}
                        <span>{c.nombre}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Fecha y Nota */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--c-muted)', display: 'block', marginBottom: '4px' }}>
                  Fecha
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 10px',
                    borderRadius: '12px',
                    border: '1px solid var(--c-border)',
                    backgroundColor: 'var(--c-bg)',
                  }}
                >
                  <Calendar size={14} color="var(--c-muted)" />
                  <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      fontSize: '12px',
                      outline: 'none',
                      width: '100%',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--c-muted)', display: 'block', marginBottom: '4px' }}>
                  Nota
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 10px',
                    borderRadius: '12px',
                    border: '1px solid var(--c-border)',
                    backgroundColor: 'var(--c-bg)',
                  }}
                >
                  <FileText size={14} color="var(--c-muted)" />
                  <input
                    type="text"
                    placeholder="Ej. supermercado"
                    value={nota}
                    onChange={(e) => setNota(e.target.value)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      fontSize: '12px',
                      outline: 'none',
                      width: '100%',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Teclado Numérico */}
      <div style={{ width: '100%', marginBottom: '20px' }}>
        <Keypad value={montoStr} onChange={setMontoStr} />
      </div>

      {/* Botón Guardar */}
      <button
        type="button"
        disabled={!isFormValid}
        onClick={handleSave}
        className="tap-active"
        style={{
          width: '100%',
          maxWidth: '380px',
          height: '54px',
          borderRadius: '18px',
          backgroundColor: isFormValid ? 'var(--c-accent)' : 'var(--c-surface-2)',
          color: isFormValid ? '#FFFFFF' : 'var(--c-muted)',
          fontSize: '16px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: isFormValid ? '0 4px 14px rgba(91, 55, 101, 0.2)' : 'none',
          transition: 'all 0.15s ease',
          cursor: isFormValid ? 'pointer' : 'not-allowed',
        }}
      >
        <span>Guardar</span>
      </button>

      {/* Toast de confirmación sutil */}
      {savedFeedback && (
        <div
          className="animate-fade-in"
          style={{
            marginTop: '14px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '9999px',
            backgroundColor: 'var(--c-surface)',
            border: '1px solid var(--c-border)',
            boxShadow: 'var(--shadow-subtle)',
            fontSize: '13px',
            color: 'var(--c-accent)',
            fontWeight: '500',
          }}
        >
          <Check size={16} strokeWidth={2.5} />
          <span>Registrado con éxito</span>
        </div>
      )}
    </div>
  );
}
