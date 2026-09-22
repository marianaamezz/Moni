import React, { useState, useEffect } from 'react';
import { X, Check, Calendar, CreditCard, Landmark, Tag, FileText } from 'lucide-react';
import { getCategoryIcon } from '../lib/icons';
import { dateToInputString, dateStringToIso } from '../lib/dateUtils';

export function EditarTransaccionModal({
  isOpen,
  onClose,
  transaccion,
  categoriasN1 = [],
  categoriasN2 = [],
  cuentas = [],
  onUpdate,
}) {
  const [monto, setMonto] = useState('');
  const [moneda, setMoneda] = useState('PEN');
  const [tipo, setTipo] = useState('gasto');
  const [categoriaN1Id, setCategoriaN1Id] = useState('');
  const [categoriaN2Id, setCategoriaN2Id] = useState('');
  const [cuentaId, setCuentaId] = useState('');
  const [fecha, setFecha] = useState('');
  const [nota, setNota] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Inicializar campos cada vez que se abre con una transacción distinta
  useEffect(() => {
    if (transaccion) {
      setMonto(String(transaccion.monto || ''));
      setMoneda(transaccion.moneda || 'PEN');
      setTipo(transaccion.tipo || 'gasto');
      setCategoriaN1Id(transaccion.categoria_n1_id || '');
      setCategoriaN2Id(transaccion.categoria_n2_id || '');
      setCuentaId(transaccion.cuenta_id || '');
      setNota(transaccion.nota || '');

      // Formato seguro YYYY-MM-DD para <input type="date">
      setFecha(dateToInputString(transaccion.fecha));
      setError(null);
    }
  }, [transaccion, isOpen]);

  if (!isOpen || !transaccion) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const montoNum = parseFloat(monto);
    if (!montoNum || isNaN(montoNum) || montoNum <= 0) {
      setError('Por favor ingresa un monto válido mayor a 0');
      return;
    }

    if (!categoriaN1Id) {
      setError('Debes seleccionar una cuenta');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fechaIso = dateStringToIso(fecha);

      await onUpdate(transaccion.id, {
        monto: montoNum,
        moneda,
        tipo,
        categoria_n1_id: categoriaN1Id,
        categoria_n2_id: categoriaN2Id || null,
        cuenta_id: cuentaId || null,
        nota: nota.trim(),
        fecha: fechaIso,
      });

      setLoading(false);
      onClose();
    } catch (err) {
      console.error('Error al actualizar movimiento:', err);
      setError('Error al guardar los cambios');
      setLoading(false);
    }
  };

  const isTransferencia = transaccion.tipo === 'transferencia';

  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(58, 31, 53, 0.45)',
        backdropFilter: 'blur(4px)',
        zIndex: 110,
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
          maxWidth: '480px',
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
        {/* Cabecera */}
        <div
          style={{
            padding: '18px 22px 14px',
            borderBottom: '1px solid var(--c-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--c-bg)',
          }}
        >
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
              Editar movimiento
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--c-muted)', marginTop: '2px' }}>
              Modifica los datos sin necesidad de borrarlo
            </span>
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

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: '#DC2626',
                  fontSize: '12px',
                  fontWeight: '500',
                }}
              >
                {error}
              </div>
            )}

            {/* Tipo de Movimiento (Gasto / Ingreso) */}
            {!isTransferencia ? (
              <div
                style={{
                  display: 'flex',
                  backgroundColor: 'var(--c-surface-2)',
                  borderRadius: '14px',
                  padding: '4px',
                  border: '1px solid var(--c-border)',
                }}
              >
                {[
                  { id: 'gasto', label: 'Gasto (-)' },
                  { id: 'ingreso', label: 'Ingreso (+)' },
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
                        padding: '8px',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: isActive ? '600' : '500',
                        backgroundColor: isActive ? 'var(--c-surface)' : 'transparent',
                        color: isActive
                          ? t.id === 'ingreso'
                            ? '#059669'
                            : 'var(--c-accent)'
                          : 'var(--c-muted)',
                        boxShadow: isActive ? 'var(--shadow-subtle)' : 'none',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--c-surface-2)',
                  color: 'var(--c-accent2)',
                  fontSize: '12px',
                  fontWeight: '600',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  alignSelf: 'flex-start',
                }}
              >
                <span>Transferencia registrada</span>
              </div>
            )}

            {/* Monto y Moneda */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--c-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
                Monto y Moneda
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'var(--c-surface)',
                  borderRadius: '14px',
                  border: '1.5px solid var(--c-border)',
                  padding: '6px 12px',
                  gap: '8px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setMoneda((prev) => (prev === 'PEN' ? 'USD' : 'PEN'))}
                  className="tap-active"
                  title="Cambiar moneda"
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--c-surface-2)',
                    border: '1px solid var(--c-border)',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: 'var(--c-accent)',
                    cursor: 'pointer',
                  }}
                >
                  {moneda === 'USD' ? '$ USD' : 'S/ PEN'}
                </button>

                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  placeholder="0.00"
                  required
                  style={{
                    flex: 1,
                    border: 'none',
                    background: 'transparent',
                    fontSize: '20px',
                    fontWeight: '700',
                    color: 'var(--c-text)',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Fecha del movimiento */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--c-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
                Fecha del movimiento
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'var(--c-surface)',
                  borderRadius: '14px',
                  border: '1.5px solid var(--c-border)',
                  padding: '10px 12px',
                  gap: '10px',
                }}
              >
                <Calendar size={16} color="var(--c-accent)" />
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  required
                  style={{
                    flex: 1,
                    border: 'none',
                    background: 'transparent',
                    fontSize: '14px',
                    color: 'var(--c-text)',
                    outline: 'none',
                    fontWeight: '500',
                  }}
                />
              </div>
            </div>

            {/* Cuenta Principal (N1) */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--c-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
                Cuenta
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'var(--c-surface)',
                  borderRadius: '14px',
                  border: '1.5px solid var(--c-border)',
                  padding: '10px 12px',
                  gap: '10px',
                }}
              >
                <Landmark size={16} color="var(--c-accent)" />
                <select
                  value={categoriaN1Id}
                  onChange={(e) => setCategoriaN1Id(e.target.value)}
                  required
                  style={{
                    flex: 1,
                    border: 'none',
                    background: 'transparent',
                    fontSize: '14px',
                    color: 'var(--c-text)',
                    outline: 'none',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">Seleccionar cuenta...</option>
                  {categoriasN1.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Concepto de Gasto (N2) — si aplica */}
            {!isTransferencia && (
              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--c-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
                  Concepto / Categoría
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: 'var(--c-surface)',
                    borderRadius: '14px',
                    border: '1.5px solid var(--c-border)',
                    padding: '10px 12px',
                    gap: '10px',
                  }}
                >
                  <Tag size={16} color="var(--c-accent)" />
                  <select
                    value={categoriaN2Id}
                    onChange={(e) => setCategoriaN2Id(e.target.value)}
                    style={{
                      flex: 1,
                      border: 'none',
                      background: 'transparent',
                      fontSize: '14px',
                      color: 'var(--c-text)',
                      outline: 'none',
                      fontWeight: '500',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="">General / Sin concepto específico</option>
                    {categoriasN2.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Método de Pago */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--c-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
                Método de pago
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'var(--c-surface)',
                  borderRadius: '14px',
                  border: '1.5px solid var(--c-border)',
                  padding: '10px 12px',
                  gap: '10px',
                }}
              >
                <CreditCard size={16} color="var(--c-accent)" />
                <select
                  value={cuentaId}
                  onChange={(e) => setCuentaId(e.target.value)}
                  style={{
                    flex: 1,
                    border: 'none',
                    background: 'transparent',
                    fontSize: '14px',
                    color: 'var(--c-text)',
                    outline: 'none',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">Sin método especificado</option>
                  {cuentas.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} ({c.tipo})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Descripción / Nota corta */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--c-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
                Descripción o Nota
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'var(--c-surface)',
                  borderRadius: '14px',
                  border: '1.5px solid var(--c-border)',
                  padding: '10px 12px',
                  gap: '10px',
                }}
              >
                <FileText size={16} color="var(--c-accent)" />
                <input
                  type="text"
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                  placeholder="Ej. Almuerzo familiar, Farmacia, etc."
                  style={{
                    flex: 1,
                    border: 'none',
                    background: 'transparent',
                    fontSize: '14px',
                    color: 'var(--c-text)',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Botones de acción inferior */}
          <div
            style={{
              padding: '16px 22px',
              borderTop: '1px solid var(--c-border)',
              backgroundColor: 'var(--c-bg)',
              display: 'flex',
              gap: '10px',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              className="tap-active"
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '14px',
                backgroundColor: 'var(--c-surface)',
                border: '1px solid var(--c-border)',
                color: 'var(--c-muted)',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="tap-active"
              style={{
                flex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '12px 16px',
                borderRadius: '14px',
                backgroundColor: 'var(--c-accent)',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: '600',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              <Check size={16} />
              <span>{loading ? 'Guardando...' : 'Guardar cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
