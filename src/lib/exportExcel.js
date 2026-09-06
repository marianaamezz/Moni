/**
 * Utilidad para exportar movimientos de una categoría N1 a formato Excel / CSV
 * Incluye BOM UTF-8 (\uFEFF) para que Microsoft Excel, Apple Numbers y Google Sheets
 * abran el archivo con caracteres especiales y tildes correctamente.
 */

export function exportCategoryToExcel({
  categoriaN1,
  transacciones = [],
  categoriasN2 = [],
  cuentas = [],
}) {
  if (!categoriaN1) return;

  // Filtrar transacciones pertenecientes a esta categoría N1
  const movimientos = transacciones.filter(
    (t) => t.categoria_n1_id === categoriaN1.id
  );

  // Encabezados de columnas para Excel
  const headers = [
    'Fecha',
    'Destino (N1)',
    'Concepto (N2)',
    'Tipo',
    'Moneda',
    'Monto',
    'Cuenta',
    'Descripción / Nota',
  ];

  // Filas de datos
  const rows = movimientos.map((t) => {
    const catN2 = categoriasN2.find((c) => c.id === t.categoria_n2_id);
    const cta = cuentas.find((c) => c.id === t.cuenta_id);

    const fechaStr = t.fecha
      ? new Date(t.fecha).toLocaleDateString('es-PE', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        })
      : '';

    let tipoLabel = 'Gasto';
    if (t.tipo === 'ingreso') tipoLabel = 'Ingreso';
    else if (t.tipo === 'transferencia') tipoLabel = 'Transferencia Enviada';

    // Monto con signo
    let montoNum = Number(t.monto) || 0;
    if (t.tipo === 'gasto' || t.tipo === 'transferencia') {
      montoNum = -Math.abs(montoNum);
    } else if (t.tipo === 'ingreso') {
      montoNum = Math.abs(montoNum);
    }

    return [
      `"${fechaStr}"`,
      `"${(categoriaN1.nombre || '').replace(/"/g, '""')}"`,
      `"${(catN2?.nombre || 'General').replace(/"/g, '""')}"`,
      `"${tipoLabel}"`,
      `"${t.moneda || 'PEN'}"`,
      montoNum.toFixed(2),
      `"${(cta?.nombre || 'Sin cuenta').replace(/"/g, '""')}"`,
      `"${(t.nota || '').replace(/"/g, '""')}"`,
    ];
  });

  // Generar contenido CSV separado por comas con UTF-8 BOM
  const csvContent =
    '\uFEFF' +
    [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  // Crear Blob y enlace de descarga
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const cleanCatName = categoriaN1.nombre.replace(/[^a-zA-Z0-9_-]/g, '_');
  const todayStr = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `Moni_${cleanCatName}_Movimientos_${todayStr}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
