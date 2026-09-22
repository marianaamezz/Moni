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
 * Retorna la fecha de hoy en formato local 'YYYY-MM-DD'
 */
export function getTodayLocalDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Retorna el key del mes actual en formato local 'YYYY-MM'
 */
export function getCurrentMonthKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Parsea una fecha de forma segura fijando las 12:00:00 (mediodía) local.
 * Esto evita desfases por diferencia horaria (ej: UTC medianoche en Perú UTC-5
 * que retrocedería al día anterior a las 19:00).
 */
export function parseDateSafe(fechaStr) {
  if (!fechaStr) return null;
  if (fechaStr instanceof Date) {
    if (isNaN(fechaStr.getTime())) return null;
    return new Date(fechaStr.getFullYear(), fechaStr.getMonth(), fechaStr.getDate(), 12, 0, 0);
  }
  const match = String(fechaStr).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, y, m, d] = match;
    return new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10), 12, 0, 0);
  }
  const d = new Date(fechaStr);
  if (isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0);
}

/**
 * Convierte un valor de fecha a string ISO seguro fijando mediodía local
 * para persistir en PostgreSQL timestamptz sin alterar el día en ninguna zona horaria.
 */
export function dateStringToIso(dateVal) {
  if (!dateVal) {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0).toISOString();
  }
  const d = parseDateSafe(dateVal);
  if (!d) return new Date().toISOString();
  return d.toISOString();
}

/**
 * Retorna 'YYYY-MM-DD' para inicializar inputs de tipo date
 */
export function dateToInputString(fecha) {
  if (!fecha) return getTodayLocalDateString();
  const match = String(fecha).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  const d = parseDateSafe(fecha);
  if (!d) return getTodayLocalDateString();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formatea una fecha de forma corta: '11 jul. 2026'
 */
export function formatFechaCorta(fecha) {
  const d = parseDateSafe(fecha);
  if (!d) return 'Sin fecha';
  return d.toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Formatea una fecha completa: 'sábado, 11 de julio de 2026'
 */
export function formatFechaCompleta(fecha) {
  const d = parseDateSafe(fecha);
  if (!d) return 'Sin fecha';
  return d.toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Formatea una fecha numérica: '11/07/2026' (para Excel/tablas)
 */
export function formatFechaNumerica(fecha) {
  const d = parseDateSafe(fecha);
  if (!d) return '';
  return d.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Obtiene la lista de meses disponibles a partir de las transacciones registradas,
 * ordenados de más reciente a más antiguo, asegurando incluir siempre el mes actual.
 */
export function getAvailableMonths(transacciones = []) {
  const monthsSet = new Set();

  // Incluir siempre el mes actual en hora local
  const currentMonthKey = getCurrentMonthKey();
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

/**
 * Retorna la etiqueta 'Saldo de [Mes anterior]' a partir de un monthKey 'YYYY-MM' o 'all'
 * Ej: '2026-07' -> 'Saldo de Junio'
 */
export function getNombreMesAnterior(monthKey) {
  if (!monthKey || monthKey === 'all') return 'Saldo anterior';
  const parts = monthKey.split('-');
  if (parts.length !== 2) return 'Saldo anterior';
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);

  let prevMonth = month - 1;
  let prevYear = year;
  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear -= 1;
  }
  const monthName = MESES_ES[prevMonth - 1] || String(prevMonth);
  return `Saldo de ${monthName}`;
}

