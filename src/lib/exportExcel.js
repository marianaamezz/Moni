/**
 * Utilidad para exportar movimientos de una categoría N1 a formato Excel / CSV
 * Incluye cabecera con resumen del BALANCE NETO (Ingresos - Egresos) y detalle
 * de movimientos con BOM UTF-8 (\uFEFF) para abrir directamente en Excel, Numbers y Sheets.
 */

export function exportCategoryToExcel({
  categoriaN1,
  transacciones = [],
  categoriasN2 = [],
  cuentas = [],
}) {
  if (!categoriaN1) return;

  // Filtrar movimientos de esta categoría N1
  const movimientos = transacciones.filter(
    (t) => t.categoria_n1_id === categoriaN1.id
  );

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

  // Cabecera del Reporte con Balance
  const summaryRows = [
    `"REPORTE FINANCIERO - MONI"`,
    `"Categoría (N1):","${(categoriaN1.nombre || '').replace(/"/g, '""')}"`,
    `"Fecha de emisión:","${fechaDescarga}"`,
    `"Total de movimientos:",${movimientos.length}`,
    `""`,
    `"RESUMEN DE BALANCE DE LA CATEGORÍA"`,
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
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `Moni_${cleanCatName}_Balance_${todayStr}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
