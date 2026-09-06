import React, { useState } from 'react';
import { Plus, Trash2, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { getCategoryIcon } from '../lib/icons';

export function PresupuestosView({
  presupuestos,
  categoriasN1,
  categoriasN2,
  onAddPresupuesto,
  onDeletePresupuesto,
  defaultCurrency = 'PEN',
}) {
  const [showModal, setShowModal] = useState(false);
  const [selectedN1, setSelectedN1] = useState('');
  const [selectedN2, setSelectedN2] = useState('');
  const [montoLimite, setMontoLimite] = useState('');
  const [moneda, setMoneda] = useState(defaultCurrency);
  const [periodo, setPeriodo] = useState('mensual');
  const [errorMsg, setErrorMsg] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedN1 && !selectedN2) {
      setErrorMsg('Selecciona al menos una categoría (destino o tipo)');
      return;
    }

    if (!montoLimite || Number(montoLimite) <= 0) {
      setErrorMsg('Ingresa un monto límite válido');
      return;
    }

    try {
      await onAddPresupuesto({
        categoria_n1_id: selectedN1 || null,
        categoria_n2_id: selectedN2 || null,
        monto_limite: Number(montoLimite),
        moneda,
        periodo,
      });

      // Reset y cerrar
      setSelectedN1('');
      setSelectedN2('');
      setMontoLimite('');
      setShowModal(false);
    } catch (err) {
      setErrorMsg(err.message || 'Error al crear presupuesto');
    }
  };

  return (
    <div
      style={{
        padding: '20px 20px 100px',
        maxWidth: '520px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      {/* Cabecera de la sección */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: 'Fraunces, serif',
              fontSize: '24px',
              fontWeight: '600',
              color: 'var(--c-text)',
              lineHeight: 1.2,
            }}
          >
            Presupuestos
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--c-muted)', marginTop: '2px' }}>
            Límites mensuales sin complicaciones
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="tap-active"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '9999px',
            backgroundColor: 'var(--c-surface)',
            border: '1px solid var(--c-border)',
            color: 'var(--c-accent)',
            fontSize: '13px',
            fontWeight: '600',
            boxShadow: 'var(--shadow-subtle)',
          }}
        >
          <Plus size={16} />
          <span>Nuevo</span>
        </button>
      </div>

      {/* Lista de Presupuestos */}
      {presupuestos.length === 0 ? (
        <div
          style={{
            padding: '40px 20px',
            textAlign: 'center',
            backgroundColor: 'var(--c-surface)',
            borderRadius: '24px',
            border: '1px solid var(--c-border)',
            marginTop: '10px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'var(--c-surface-2)',
              color: 'var(--c-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
            }}
          >
            <Target size={24} />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--c-text)', marginBottom: '4px' }}>
            Sin presupuestos aún
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--c-muted)', maxWidth: '280px', margin: '0 auto 18px' }}>
            Define metas suaves como "S/ 400 en Comida" o "S/ 300 en Casa" para mantener el control con tranquilidad.
          </p>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="tap-active"
            style={{
              padding: '10px 18px',
              borderRadius: '9999px',
              backgroundColor: 'var(--c-accent)',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: '600',
            }}
          >
            Crear mi primer presupuesto
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {presupuestos.map((p) => {
            const catN1 = categoriasN1.find((c) => c.id === p.categoria_n1_id);
            const catN2 = categoriasN2.find((c) => c.id === p.categoria_n2_id);

            const n1Name = catN1?.nombre;
            const n2Name = catN2?.nombre;
            const title = n1Name && n2Name ? `${n2Name} (${n1Name})` : n1Name || n2Name || 'Presupuesto';

            // Color de la barra de progreso fina según %
            let barColor = 'var(--c-accent2)'; // normal
            let statusText = `${p.porcentaje}%`;
            if (p.estado === 'warning') {
              barColor = 'var(--c-income)';
              statusText = `${p.porcentaje}% (cerca al límite)`;
            } else if (p.estado === 'danger') {
              barColor = 'var(--c-warning)';
              statusText = `${p.porcentaje}% (límite superado)`;
            }

            return (
              <div
                key={p.id}
                style={{
                  backgroundColor: 'var(--c-surface)',
                  borderRadius: '20px',
                  padding: '18px 20px',
                  border: '1px solid var(--c-border)',
                  boxShadow: 'var(--shadow-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
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
                      }}
                    >
                      {getCategoryIcon(n2Name || n1Name || '', 16)}
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--c-text)' }}>
                        {title}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--c-muted)', textTransform: 'capitalize' }}>
                        Periodo {p.periodo}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeletePresupuesto(p.id)}
                    className="tap-active"
                    title="Eliminar presupuesto"
                    style={{
                      padding: '6px',
                      color: 'var(--c-muted)',
                      borderRadius: '8px',
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Barra de progreso de línea fina */}
                <div
                  style={{
                    height: '5px',
                    backgroundColor: 'var(--c-surface-2)',
                    borderRadius: '9999px',
                    overflow: 'hidden',
                    margin: '12px 0 10px',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(p.porcentaje, 100)}%`,
                      backgroundColor: barColor,
                      borderRadius: '9999px',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>

                {/* Cifras de gasto y límite */}
                <div
                  className="font-tabular"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '13px',
                  }}
                >
                  <span style={{ color: 'var(--c-muted)' }}>
                    Gastado: <strong style={{ color: 'var(--c-text)', fontWeight: '600' }}>
                      {p.moneda === 'USD' ? '$' : 'S/'} {p.gasto_actual.toFixed(2)}
                    </strong>
                  </span>
                  <span style={{ color: p.estado === 'danger' ? 'var(--c-warning)' : 'var(--c-muted)', fontWeight: '500' }}>
                    de {p.moneda === 'USD' ? '$' : 'S/'} {Number(p.monto_limite).toFixed(2)} ({statusText})
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal / Formulario para crear presupuesto */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(58, 31, 53, 0.35)',
            backdropFilter: 'blur(3px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div
            className="animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '420px',
              backgroundColor: 'var(--c-surface)',
              borderRadius: '24px',
              border: '1px solid var(--c-border)',
              padding: '24px',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <h3
              style={{
                fontFamily: 'Fraunces, serif',
                fontSize: '20px',
                fontWeight: '600',
                color: 'var(--c-text)',
                marginBottom: '16px',
              }}
            >
              Nuevo Presupuesto
            </h3>

            {errorMsg && (
              <div
                style={{
                  padding: '10px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(91, 55, 101, 0.08)',
                  color: 'var(--c-accent)',
                  fontSize: '12px',
                  marginBottom: '14px',
                }}
              >
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Filtro N1 */}
              <div>
                <label style={{ fontSize: '12px', color: 'var(--c-muted)', display: 'block', marginBottom: '6px' }}>
                  ¿Para quién o de dónde? (Nivel 1)
                </label>
                <select
                  value={selectedN1}
                  onChange={(e) => setSelectedN1(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '14px',
                    border: '1px solid var(--c-border)',
                    backgroundColor: 'var(--c-bg)',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                >
                  <option value="">(Cualquiera / No filtrar)</option>
                  {categoriasN1.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro N2 */}
              <div>
                <label style={{ fontSize: '12px', color: 'var(--c-muted)', display: 'block', marginBottom: '6px' }}>
                  ¿En qué tipo de gasto? (Nivel 2)
                </label>
                <select
                  value={selectedN2}
                  onChange={(e) => setSelectedN2(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '14px',
                    border: '1px solid var(--c-border)',
                    backgroundColor: 'var(--c-bg)',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                >
                  <option value="">(Cualquiera / No filtrar)</option>
                  {categoriasN2.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Monto Límite y Moneda */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--c-muted)', display: 'block', marginBottom: '6px' }}>
                    Monto Límite
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="Ej. 300"
                    value={montoLimite}
                    onChange={(e) => setMontoLimite(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '14px',
                      border: '1px solid var(--c-border)',
                      backgroundColor: 'var(--c-bg)',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--c-muted)', display: 'block', marginBottom: '6px' }}>
                    Moneda
                  </label>
                  <select
                    value={moneda}
                    onChange={(e) => setMoneda(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '14px',
                      border: '1px solid var(--c-border)',
                      backgroundColor: 'var(--c-bg)',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  >
                    <option value="PEN">S/ (PEN)</option>
                    <option value="USD">$ (USD)</option>
                  </select>
                </div>
              </div>

              {/* Botones de acción */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="tap-active"
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '14px',
                    border: '1px solid var(--c-border)',
                    backgroundColor: 'var(--c-surface)',
                    color: 'var(--c-muted)',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="tap-active"
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '14px',
                    backgroundColor: 'var(--c-accent)',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
