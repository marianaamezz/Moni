/**
 * Utilidades para manejo y formateo de meses y períodos en reportes
 */

export const MESES_ES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

/**
 * Retorna la etiqueta legible en español para un mes en formato 'YYYY-MM' o 'all'
 * Ej: '2026-09' -> 'Septiembre 2026'
 */
export function formatPeriodoLabel(monthKey) {
  if (!monthKey || monthKey === 'all') {
    return 'Todos los meses (Histórico completo)';
  }
  const parts = monthKey.split('-');
  if (parts.length !== 2) return monthKey;
  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const monthName = MESES_ES[monthIdx] || parts[1];
  return `${monthName} ${year}`;
}

/**
 * Obtiene la lista de meses disponibles a partir de las transacciones registradas,
 * ordenados de más reciente a más antiguo, asegurando incluir siempre el mes actual.
 */
export function getAvailableMonths(transacciones = []) {
  const monthsSet = new Set();

  // Incluir siempre el mes actual
  const currentMonthKey = new Date().toISOString().slice(0, 7);
  monthsSet.add(currentMonthKey);

  transacciones.forEach((t) => {
    if (t.fecha) {
      const key = String(t.fecha).slice(0, 7);
      if (key && key.length === 7 && key.includes('-')) {
        monthsSet.add(key);
      }
    }
  });

  const sortedKeys = Array.from(monthsSet).sort().reverse();

  return sortedKeys.map((key) => ({
    value: key,
    label: formatPeriodoLabel(key),
  }));
}
