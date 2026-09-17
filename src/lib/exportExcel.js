import { formatPeriodoLabel } from './dateUtils';

export function exportCategoryToExcel({
  categoriaN1,
  transacciones = [],
  categoriasN2 = [],
  cuentas = [],
  selectedMonth = 'all',
}) {
  if (!categoriaN1) return;

  // Filtrar movimientos de esta categoría N1 (y del mes seleccionado si aplica)
  const movimientos = transacciones.filter((t) => {
    if (t.categoria_n1_id !== categoriaN1.id) return false;
    if (selectedMonth && selectedMonth !== 'all') {
      return t.fecha && String(t.fecha).startsWith(selectedMonth);
    }
    return true;
  });

  // Calcular totales (separado por moneda o general)
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

  // Cabecera del Reporte con Balance y Período
  const summaryRows = [
    `"REPORTE FINANCIERO - MONI"`,
    `"Cuenta (N1):","${(categoriaN1.nombre || '').replace(/"/g, '""')}"`,
    `"Período:","${formatPeriodoLabel(selectedMonth).replace(/"/g, '""')}"`,
    `"Fecha de emisión:","${fechaDescarga}"`,
    `"Total de movimientos:",${movimientos.length}`,
    `""`,
    `"RESUMEN DE BALANCE DE LA CUENTA"`,
    `"Concepto","Soles (PEN)","Dólares (USD)"`,
    `"Total Ingresos (+)",${totalIngresosPEN.toFixed(2)},${totalIngresosUSD.toFixed(2)}`,
    `"Total Egresos (-)",${totalEgresosPEN.toFixed(2)},${totalEgresosUSD.toFixed(2)}`,
    `"BALANCE NETO (Ingresos - Egresos)",${balanceNetoPEN.toFixed(2)},${balanceNetoUSD.toFixed(2)}`,
    `""`,
    `"DETALLE DE MOVIMIENTOS"`,
  ];

  // Encabezados de la tabla de movimientos
  const tableHeaders = [
    'Fecha',
    'Categoría (N1)',
    'Concepto (N2)',
    'Tipo de Movimiento',
    'Moneda',
    'Ingreso (+)',
    'Egreso (-)',
    'Monto Neto',
    'Cuenta',
    'Descripción / Nota',
  ];

  // Filas individuales de movimientos
  const tableRows = movimientos.map((t) => {
    const catN2 = categoriasN2.find((c) => c.id === t.categoria_n2_id);
    const cta = cuentas.find((c) => c.id === t.cuenta_id);

    const fechaStr = t.fecha
      ? new Date(t.fecha).toLocaleDateString('es-PE', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        })
      : '';

    const montoNum = Number(t.monto) || 0;
    const isIngreso = t.tipo === 'ingreso';

    let tipoLabel = 'Gasto';
    let ingresoCol = '';
    let egresoCol = '';
    let netoCol = 0;

    if (isIngreso) {
      tipoLabel = 'Ingreso';
      ingresoCol = montoNum.toFixed(2);
      netoCol = montoNum;
    } else if (t.tipo === 'transferencia') {
      tipoLabel = 'Transferencia Enviada';
      egresoCol = montoNum.toFixed(2);
      netoCol = -montoNum;
    } else {
      tipoLabel = 'Gasto';
      egresoCol = montoNum.toFixed(2);
      netoCol = -montoNum;
    }

    return [
      `"${fechaStr}"`,
      `"${(categoriaN1.nombre || '').replace(/"/g, '""')}"`,
      `"${(catN2?.nombre || 'General').replace(/"/g, '""')}"`,
      `"${tipoLabel}"`,
      `"${t.moneda || 'PEN'}"`,
      ingresoCol ? ingresoCol : '0.00',
      egresoCol ? egresoCol : '0.00',
      netoCol.toFixed(2),
      `"${(cta?.nombre || 'Sin cuenta').replace(/"/g, '""')}"`,
      `"${(t.nota || '').replace(/"/g, '""')}"`,
    ];
  });

  // Unir todo con UTF-8 BOM
  const csvContent =
    '\uFEFF' +
    [
      ...summaryRows,
      tableHeaders.join(','),
      ...tableRows.map((r) => r.join(',')),
    ].join('\r\n');

  // Descarga del archivo
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const cleanCatName = (categoriaN1.nombre || 'Categoria').replace(
    /[^a-zA-Z0-9_-]/g,
    '_'
  );
  const todayStr = new Date().toISOString().split('T')[0];
  const periodSlug = selectedMonth && selectedMonth !== 'all' ? selectedMonth : 'Historico';
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `Moni_${cleanCatName}_${periodSlug}_${todayStr}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exportar múltiples cuentas seleccionadas en un solo archivo consolidado
 */
export function exportMultiCategoriesToExcel({
  selectedCategoriasN1 = [],
  transacciones = [],
  categoriasN2 = [],
  cuentas = [],
  selectedMonth = 'all',
}) {
  if (!selectedCategoriasN1 || selectedCategoriasN1.length === 0) return;

  const selectedIds = selectedCategoriasN1.map((c) => c.id);
  const catNamesMap = Object.fromEntries(selectedCategoriasN1.map((c) => [c.id, c.nombre]));

  // Filtrar movimientos de las cuentas seleccionadas (y del mes si aplica)
  const movimientos = transacciones.filter((t) => {
    if (!selectedIds.includes(t.categoria_n1_id)) return false;
    if (selectedMonth && selectedMonth !== 'all') {
      return t.fecha && String(t.fecha).startsWith(selectedMonth);
    }
    return true;
  });

  // Totales
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

  const nombresCuentas =
    selectedCategoriasN1.length === 1
      ? selectedCategoriasN1[0].nombre
      : `${selectedCategoriasN1.length} cuentas (${selectedCategoriasN1.map((c) => c.nombre).join(', ')})`;

  // Cabecera del Reporte Consolidado
  const summaryRows = [
    `"REPORTE FINANCIERO CONSOLIDADO - MONI"`,
    `"Cuentas incluidas:","${nombresCuentas.replace(/"/g, '""')}"`,
    `"Período:","${formatPeriodoLabel(selectedMonth).replace(/"/g, '""')}"`,
    `"Fecha de emisión:","${fechaDescarga}"`,
    `"Total de movimientos:",${movimientos.length}`,
    `""`,
    `"RESUMEN DE BALANCE CONSOLIDADO"`,
    `"Concepto","Soles (PEN)","Dólares (USD)"`,
    `"Total Ingresos (+)",${totalIngresosPEN.toFixed(2)},${totalIngresosUSD.toFixed(2)}`,
    `"Total Egresos (-)",${totalEgresosPEN.toFixed(2)},${totalEgresosUSD.toFixed(2)}`,
    `"BALANCE NETO (Ingresos - Egresos)",${balanceNetoPEN.toFixed(2)},${balanceNetoUSD.toFixed(2)}`,
    `""`,
    `"DETALLE DE MOVIMIENTOS"`,
  ];

  const tableHeaders = [
    'Fecha',
    'Cuenta (N1)',
    'Concepto (N2)',
    'Tipo de Movimiento',
    'Moneda',
    'Ingreso (+)',
    'Egreso (-)',
    'Monto Neto',
    'Método',
    'Descripción / Nota',
  ];

  const tableRows = movimientos.map((t) => {
    const catN1Nombre = catNamesMap[t.categoria_n1_id] || 'Cuenta';
    const catN2 = categoriasN2.find((c) => c.id === t.categoria_n2_id);
    const cta = cuentas.find((c) => c.id === t.cuenta_id);

    const fechaStr = t.fecha
      ? new Date(t.fecha).toLocaleDateString('es-PE', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        })
      : '';

    const montoNum = Number(t.monto) || 0;
    const isIngreso = t.tipo === 'ingreso';

    let tipoLabel = 'Gasto';
    let ingresoCol = '';
    let egresoCol = '';
    let netoCol = 0;

    if (isIngreso) {
      tipoLabel = 'Ingreso';
      ingresoCol = montoNum.toFixed(2);
      netoCol = montoNum;
    } else if (t.tipo === 'transferencia') {
      tipoLabel = 'Transferencia Enviada';
      egresoCol = montoNum.toFixed(2);
      netoCol = -montoNum;
    } else {
      tipoLabel = 'Gasto';
      egresoCol = montoNum.toFixed(2);
      netoCol = -montoNum;
    }

    return [
      `"${fechaStr}"`,
      `"${catN1Nombre.replace(/"/g, '""')}"`,
      `"${(catN2?.nombre || 'General').replace(/"/g, '""')}"`,
      `"${tipoLabel}"`,
      `"${t.moneda || 'PEN'}"`,
      ingresoCol ? ingresoCol : '0.00',
      egresoCol ? egresoCol : '0.00',
      netoCol.toFixed(2),
      `"${(cta?.nombre || 'Sin cuenta').replace(/"/g, '""')}"`,
      `"${(t.nota || '').replace(/"/g, '""')}"`,
    ];
  });

  const csvContent =
    '\uFEFF' +
    [
      ...summaryRows,
      tableHeaders.join(','),
      ...tableRows.map((r) => r.join(',')),
    ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const todayStr = new Date().toISOString().split('T')[0];
  const periodSlug = selectedMonth && selectedMonth !== 'all' ? selectedMonth : 'Historico';
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `Moni_Reporte_Consolidado_${selectedCategoriasN1.length}_Cuentas_${periodSlug}_${todayStr}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
