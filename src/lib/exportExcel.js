import { formatPeriodoLabel, getNombreMesAnterior } from './dateUtils';

/**
 * Genera y calcula las filas del libro contable con formato:
 * FCHA | DETALLE | INGRESO | GASTO (Cuentas N1) | SALDO
 */
export function buildLedgerRows({
  targetCategorias = [],
  transacciones = [],
  categoriasN2 = [],
  cuentas = [],
  selectedMonth = 'all',
  selectedCurrency = 'PEN',
}) {
  const targetIds = targetCategorias.map((c) => c.id);

  // 1. Calcular saldo anterior (movimientos anteriores al mes seleccionado)
  let saldoAnterior = 0;
  if (selectedMonth && selectedMonth !== 'all') {
    transacciones.forEach((t) => {
      if (!targetIds.includes(t.categoria_n1_id)) return;
      if ((t.moneda || 'PEN') !== selectedCurrency) return;
      if (t.fecha && String(t.fecha).slice(0, 7) < selectedMonth) {
        const m = Number(t.monto) || 0;
        if (t.tipo === 'ingreso') {
          saldoAnterior += m;
        } else if (t.tipo === 'gasto' || t.tipo === 'transferencia') {
          saldoAnterior -= m;
        }
      }
    });
  }

  // 2. Filtrar movimientos del período
  const movimientosMes = transacciones.filter((t) => {
    if (!targetIds.includes(t.categoria_n1_id)) return false;
    if ((t.moneda || 'PEN') !== selectedCurrency) return false;
    if (selectedMonth && selectedMonth !== 'all') {
      return t.fecha && String(t.fecha).startsWith(selectedMonth);
    }
    return true;
  });

  // 3. Ordenar cronológicamente (antiguo a reciente)
  const movimientosOrdenados = [...movimientosMes].sort((a, b) => {
    const da = new Date(a.fecha || 0).getTime();
    const db = new Date(b.fecha || 0).getTime();
    if (da !== db) return da - db;
    return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
  });

  // 4. Calcular filas con Saldo Acumulado
  let runningBalance = saldoAnterior;
  const rows = movimientosOrdenados.map((t) => {
    const montoNum = Number(t.monto) || 0;
    const isIngreso = t.tipo === 'ingreso';

    if (isIngreso) {
      runningBalance += montoNum;
    } else {
      runningBalance -= montoNum;
    }

    // Detalle: Concepto N2 y nota
    const catN2 = categoriasN2.find((c) => c.id === t.categoria_n2_id);
    let detalle = '';
    if (t.tipo === 'transferencia') {
      detalle = t.nota || 'Transferencia';
    } else if (catN2?.nombre && t.nota) {
      detalle = `${catN2.nombre} - ${t.nota}`;
    } else if (catN2?.nombre) {
      detalle = catN2.nombre;
    } else if (t.nota) {
      detalle = t.nota;
    } else {
      detalle = isIngreso ? 'Ingreso' : 'Gasto';
    }

    const fechaStr = t.fecha
      ? new Date(t.fecha).toLocaleDateString('es-PE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      : '';

    // Gastos por cuenta
    const gastosPorCuenta = {};
    targetCategorias.forEach((cat) => {
      if (!isIngreso && t.categoria_n1_id === cat.id) {
        gastosPorCuenta[cat.id] = montoNum;
      } else {
        gastosPorCuenta[cat.id] = null;
      }
    });

    return {
      id: t.id,
      fechaStr,
      detalle,
      isIngreso,
      ingresoMonto: isIngreso ? montoNum : null,
      gastosPorCuenta,
      saldoActual: runningBalance,
    };
  });

  const nombreMesAnterior = getNombreMesAnterior(selectedMonth);

  // Totales
  const totalIngresos = rows.reduce((acc, r) => acc + (r.ingresoMonto || 0), 0);
  const totalesGastos = {};
  let totalGeneralGastos = 0;
  targetCategorias.forEach((cat) => {
    const sum = rows.reduce((acc, r) => acc + (r.gastosPorCuenta[cat.id] || 0), 0);
    totalesGastos[cat.id] = sum;
    totalGeneralGastos += sum;
  });

  return {
    saldoAnterior,
    nombreMesAnterior,
    rows,
    runningBalance,
    totalIngresos,
    totalesGastos,
    totalGeneralGastos,
  };
}

/**
 * Genera el archivo CSV con la estructura exacta:
 * FCHA | DETALLE | INGRESO | GASTO (Cuentas) | SALDO
 */
export function generateLedgerCsv({
  targetCategorias = [],
  transacciones = [],
  categoriasN2 = [],
  cuentas = [],
  selectedMonth = 'all',
  selectedCurrency = 'PEN',
}) {
  const {
    saldoAnterior,
    nombreMesAnterior,
    rows,
    runningBalance,
    totalIngresos,
    totalesGastos,
  } = buildLedgerRows({
    targetCategorias,
    transacciones,
    categoriasN2,
    cuentas,
    selectedMonth,
    selectedCurrency,
  });

  const emptyAccountSlots = Array(Math.max(0, targetCategorias.length - 1)).fill('""');

  // Fila 1 Cabecera: FCHA, DETALLE, INGRESO, GASTO (abarcando las cuentas), SALDO
  const rowHeader1 = [
    '"FCHA"',
    '"DETALLE"',
    '"INGRESO"',
    '"GASTO"',
    ...emptyAccountSlots,
    '"SALDO"',
  ];

  // Fila 2 Cabecera: Subencabezados con los nombres de las cuentas bajo GASTO
  const rowHeader2 = [
    '""',
    '""',
    '""',
    ...targetCategorias.map((cat) => `"${(cat.nombre || '').replace(/"/g, '""')}"`),
    '""',
  ];

  // Fila 3: Saldo anterior / Saldo del mes anterior
  const rowSaldoAnterior = [
    '""',
    `"${nombreMesAnterior.replace(/"/g, '""')}"`,
    '""',
    ...targetCategorias.map(() => '""'),
    saldoAnterior.toFixed(2),
  ];

  // Filas de movimientos
  const dataRows = rows.map((r) => [
    `"${r.fechaStr}"`,
    `"${r.detalle.replace(/"/g, '""')}"`,
    r.ingresoMonto !== null ? r.ingresoMonto.toFixed(2) : '""',
    ...targetCategorias.map((cat) => {
      const val = r.gastosPorCuenta[cat.id];
      return val !== null ? val.toFixed(2) : '""';
    }),
    r.saldoActual.toFixed(2),
  ]);

  // Fila de Totales
  const totalsRow = [
    '"TOTALES"',
    '""',
    totalIngresos.toFixed(2),
    ...targetCategorias.map((cat) => (totalesGastos[cat.id] || 0).toFixed(2)),
    runningBalance.toFixed(2),
  ];

  const csvLines = [
    rowHeader1.join(','),
    rowHeader2.join(','),
    rowSaldoAnterior.join(','),
    ...dataRows.map((dr) => dr.join(',')),
    totalsRow.join(','),
  ];

  return '\uFEFF' + csvLines.join('\r\n');
}

/**
 * Descarga Excel para una sola cuenta
 */
export function exportCategoryToExcel({
  categoriaN1,
  transacciones = [],
  categoriasN2 = [],
  cuentas = [],
  selectedMonth = 'all',
  selectedCurrency = 'PEN',
}) {
  if (!categoriaN1) return;

  const targetCategorias = [categoriaN1];
  const csvContent = generateLedgerCsv({
    targetCategorias,
    transacciones,
    categoriasN2,
    cuentas,
    selectedMonth,
    selectedCurrency,
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const cleanCatName = (categoriaN1.nombre || 'Cuenta').replace(/[^a-zA-Z0-9_-]/g, '_');
  const todayStr = new Date().toISOString().split('T')[0];
  const periodSlug = selectedMonth && selectedMonth !== 'all' ? selectedMonth : 'Historico';

  link.setAttribute('href', url);
  link.setAttribute('download', `Moni_${cleanCatName}_${periodSlug}_${todayStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Descarga Excel consolidado para múltiples cuentas
 */
export function exportMultiCategoriesToExcel({
  selectedCategoriasN1 = [],
  transacciones = [],
  categoriasN2 = [],
  cuentas = [],
  selectedMonth = 'all',
  selectedCurrency = 'PEN',
}) {
  if (!selectedCategoriasN1 || selectedCategoriasN1.length === 0) return;

  const csvContent = generateLedgerCsv({
    targetCategorias: selectedCategoriasN1,
    transacciones,
    categoriasN2,
    cuentas,
    selectedMonth,
    selectedCurrency,
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const todayStr = new Date().toISOString().split('T')[0];
  const periodSlug = selectedMonth && selectedMonth !== 'all' ? selectedMonth : 'Historico';

  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `Moni_Reporte_${selectedCategoriasN1.length}_Cuentas_${periodSlug}_${todayStr}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
