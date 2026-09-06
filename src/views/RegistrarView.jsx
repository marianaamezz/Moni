import React, { useState, useEffect } from 'react';
import { Keypad } from '../components/Keypad';
import { getCategoryIcon } from '../lib/icons';
import { ChevronDown, ChevronUp, Check, Calendar, FileText, ArrowRight, Repeat } from 'lucide-react';

export function RegistrarView({
  categoriasN1,
  categoriasN2,
  cuentas,
  onSaveTransaccion,
  onSaveTransferencia,
  selectedCurrency,
  onToggleCurrency,
}) {
  const [tipo, setTipo] = useState('gasto'); // 'gasto' | 'ingreso' | 'transferencia'
  const [montoStr, setMontoStr] = useState('0');
  const [selectedN1, setSelectedN1] = useState(categoriasN1[0]?.id || null);
  const [selectedDestinoN1, setSelectedDestinoN1] = useState(null);
  const [selectedN2, setSelectedN2] = useState(null);
  const [selectedCuenta, setSelectedCuenta] = useState(null);
  const [nota, setNota] = useState('');
  const [fecha, setFecha] = useState(() => new Date().toISOString().split('T')[0]);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  // Asegurar selección inicial de N1 si aún no está lista
  useEffect(() => {
    if (!selectedN1 && categoriasN1.length > 0) {
      setSelectedN1(categoriasN1[0].id);
    }
  }, [categoriasN1, selectedN1]);

  // Si cambia el origen en transferencia y coincide con el destino, ajustar destino
  useEffect(() => {
    if (tipo === 'transferencia') {
      const posiblesDestinos = categoriasN1.filter((c) => c.id !== selectedN1);
      if (posiblesDestinos.length > 0 && (!selectedDestinoN1 || selectedDestinoN1 === selectedN1)) {
        setSelectedDestinoN1(posiblesDestinos[0].id);
      }
    }
  }, [tipo, selectedN1, categoriasN1, selectedDestinoN1]);

  const montoNum = parseFloat(montoStr) || 0;

  // Validación del formulario según el tipo
  const isTransferencia = tipo === 'transferencia';
  const isFormValid = isTransferencia
    ? montoNum > 0 && Boolean(selectedN1) && Boolean(selectedDestinoN1) && selectedN1 !== selectedDestinoN1
    : montoNum > 0 && Boolean(selectedN1);

  // Contador de opciones secundarias seleccionadas en el panel colapsable
  const secondaryCount = [
    Boolean(selectedN2),
    Boolean(selectedCuenta),
    fecha !== new Date().toISOString().split('T')[0],
  ].filter(Boolean).length;

  const handleSave = async () => {
    if (!isFormValid) return;

    try {
      if (isTransferencia) {
        const origenCat = categoriasN1.find((c) => c.id === selectedN1);
        const destinoCat = categoriasN1.find((c) => c.id === selectedDestinoN1);

        await onSaveTransferencia({
          monto: montoNum,
          moneda: selectedCurrency,
          origenId: selectedN1,
          destinoId: selectedDestinoN1,
          origenNombre: origenCat?.nombre || 'Origen',
          destinoNombre: destinoCat?.nombre || 'Destino',
          nota: nota.trim(),
          fecha: new Date(fecha).toISOString(),
        });
      } else {
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
      }

      // Resetear estado
      setMontoStr('0');
      setSelectedN2(null);
      setSelectedCuenta(null);
      setNota('');
      setShowMoreOptions(false);

      // Feedback visual suave
      setSavedFeedback(true);
      setTimeout(() => setSavedFeedback(false), 2200);
    } catch (err) {
      console.error('Error al guardar:', err);
    }
  };

  const origenCat = categoriasN1.find((c) => c.id === selectedN1);
  const destinoCat = categoriasN1.find((c) => c.id === selectedDestinoN1);

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
          maxWidth: '360px',
          marginBottom: '18px',
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
              onClick={() => {
                setTipo(t.id);
                setShowMoreOptions(false);
              }}
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
          margin: '8px 0 20px',
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

      {/* FLUJO DE TRANSFERENCIA: De origen hacia destino */}
      {isTransferencia ? (
        <div style={{ width: '100%', marginBottom: '16px' }}>
          {/* Desde dónde (Origen) */}
          <div style={{ marginBottom: '12px' }}>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--c-muted)',
                marginBottom: '6px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                textAlign: 'center',
              }}
            >
              ¿Desde dónde se envía? (Origen)
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
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
                      padding: '7px 14px',
                      borderRadius: '9999px',
                      backgroundColor: isSelected ? 'var(--c-accent)' : 'var(--c-surface)',
                      color: isSelected ? '#FFFFFF' : 'var(--c-text)',
                      border: `1px solid ${isSelected ? 'var(--c-accent)' : 'var(--c-border)'}`,
                      boxShadow: 'var(--shadow-subtle)',
                      fontSize: '13px',
                      fontWeight: isSelected ? '600' : '400',
                      transition: 'all 0.12s ease',
                    }}
                  >
                    {getCategoryIcon(c.nombre, 14, isSelected ? 'text-white' : '')}
                    <span>{c.nombre}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Flecha indicadora de flujo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              margin: '6px 0',
              color: 'var(--c-accent2)',
              fontSize: '12px',
              fontWeight: '500',
            }}
          >
            <span>{origenCat?.nombre || 'Origen'}</span>
            <ArrowRight size={14} />
            <span>{destinoCat?.nombre || 'Destino'}</span>
          </div>

          {/* Hacia dónde (Destino) */}
          <div>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--c-muted)',
                marginBottom: '6px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                textAlign: 'center',
              }}
            >
              ¿Hacia dónde se transfiere? (Destino)
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
              {categoriasN1
                .filter((c) => c.id !== selectedN1)
                .map((c) => {
                  const isSelected = selectedDestinoN1 === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedDestinoN1(c.id)}
                      className="tap-active"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '7px 14px',
                        borderRadius: '9999px',
                        backgroundColor: isSelected ? 'var(--c-accent2)' : 'var(--c-surface)',
                        color: isSelected ? '#FFFFFF' : 'var(--c-text)',
                        border: `1px solid ${isSelected ? 'var(--c-accent2)' : 'var(--c-border)'}`,
                        boxShadow: 'var(--shadow-subtle)',
                        fontSize: '13px',
                        fontWeight: isSelected ? '600' : '400',
                        transition: 'all 0.12s ease',
                      }}
                    >
                      {getCategoryIcon(c.nombre, 14, isSelected ? 'text-white' : '')}
                      <span>{c.nombre}</span>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      ) : (
        /* FLUJO NORMAL: Gasto o Ingreso (Chips de Para quién / N1) */
        <div style={{ width: '100%', marginBottom: '16px' }}>
          <div
            style={{
              fontSize: '11px',
              color: 'var(--c-muted)',
              marginBottom: '8px',
              fontWeight: '600',
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
      )}

      {/* CAMPO DE DESCRIPCIÓN CORTA (Directo y visible) */}
      <div style={{ width: '100%', maxWidth: '380px', marginBottom: '16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            borderRadius: '16px',
            backgroundColor: 'var(--c-surface)',
            border: '1px solid var(--c-border)',
            boxShadow: 'var(--shadow-subtle)',
          }}
        >
          <FileText size={16} color="var(--c-muted)" style={{ flexShrink: 0 }} />
          <input
            type="text"
            maxLength={90}
            placeholder={
              isTransferencia
                ? 'Motivo de la transferencia (opcional)'
                : 'Descripción corta (ej. Almuerzo, taxi, farmacia...)'
            }
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: '13px',
              outline: 'none',
              width: '100%',
              color: 'var(--c-text)',
            }}
          />
        </div>
      </div>

      {/* Botón "Más opciones" (colapsado por defecto) */}
      <div style={{ width: '100%', marginBottom: '18px' }}>
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
            padding: '6px',
            fontSize: '12px',
            fontWeight: '500',
            color: 'var(--c-accent2)',
          }}
        >
          <span>{showMoreOptions ? 'Menos opciones' : 'Más opciones (categoría, cuenta, fecha)'}</span>
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
          {showMoreOptions ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {/* Panel Expandible de Más Opciones */}
        {showMoreOptions && (
          <div
            className="animate-fade-in"
            style={{
              marginTop: '10px',
              padding: '16px',
              backgroundColor: 'var(--c-surface)',
              borderRadius: '20px',
              border: '1px solid var(--c-border)',
              boxShadow: 'var(--shadow-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            {/* Solo en Gasto e Ingreso mostramos N2 y Cuenta */}
            {!isTransferencia && (
              <>
                {/* Categoría Nivel 2: "¿En qué?" */}
                <div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: 'var(--c-muted)',
                      marginBottom: '8px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    ¿En qué concepto? (Nivel 2 opcional)
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
                        fontSize: '11px',
                        color: 'var(--c-muted)',
                        marginBottom: '8px',
                        fontWeight: '600',
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
              </>
            )}

            {/* Fecha */}
            <div>
              <label style={{ fontSize: '11px', color: 'var(--c-muted)', display: 'block', marginBottom: '4px' }}>
                Fecha del movimiento
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
                  maxWidth: '220px',
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
          </div>
        )}
      </div>

      {/* Teclado Numérico */}
      <div style={{ width: '100%', marginBottom: '18px' }}>
        <Keypad value={montoStr} onChange={setMontoStr} />
      </div>

      {/* Botón Guardar / Transferir */}
      <button
        type="button"
        disabled={!isFormValid}
        onClick={handleSave}
        className="tap-active"
        style={{
          width: '100%',
          maxWidth: '380px',
          height: '52px',
          borderRadius: '18px',
          backgroundColor: isFormValid ? 'var(--c-accent)' : 'var(--c-surface-2)',
          color: isFormValid ? '#FFFFFF' : 'var(--c-muted)',
          fontSize: '15px',
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
        {isTransferencia ? (
          <>
            <Repeat size={16} />
            <span>Transferir</span>
          </>
        ) : (
          <span>Guardar</span>
        )}
      </button>

      {/* Toast de confirmación sutil */}
      {savedFeedback && (
        <div
          className="animate-fade-in"
          style={{
            marginTop: '12px',
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
          <span>{isTransferencia ? 'Transferencia realizada con éxito' : 'Registrado con éxito'}</span>
        </div>
      )}
    </div>
  );
}
