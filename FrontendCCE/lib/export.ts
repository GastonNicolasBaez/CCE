import { Member } from './store'
import { ApiCuota } from './api'

/**
 * Convert data to CSV format
 */
function convertToCSV(headers: string[], rows: string[][]): string {
  const csvHeaders = headers.join(',')
  const csvRows = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
  return `${csvHeaders}\n${csvRows}`
}

/**
 * Download CSV file
 */
function downloadCSV(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

/**
 * Export members to CSV
 */
export function exportMembersToCSV(members: Member[]) {
  const headers = [
    'ID',
    'Nombre',
    'Email',
    'Teléfono',
    'Actividad',
    'Estado',
    'Estado de Pago',
    'Tipo de Membresía',
    'Fecha de Registro',
    'Última Fecha de Pago',
    'Próxima Fecha de Pago'
  ]

  const rows = members.map(member => [
    member.id,
    member.name,
    member.email,
    member.phone,
    member.activity || 'N/A',
    member.status === 'active' ? 'Activo' : member.status === 'inactive' ? 'Inactivo' : 'Suspendido',
    member.paymentStatus === 'paid' ? 'Pagado' :
      member.paymentStatus === 'pending' ? 'Pendiente' :
      member.paymentStatus === 'overdue' ? 'Vencido' : 'Cancelado',
    member.membershipType === 'jugador' ? 'Jugador' : 'Socio',
    member.registrationDate || 'N/A',
    member.lastPaymentDate || 'N/A',
    member.nextPaymentDate || 'N/A'
  ])

  const csvContent = convertToCSV(headers, rows)
  const filename = `socios_${new Date().toISOString().split('T')[0]}.csv`
  downloadCSV(filename, csvContent)
}

/**
 * Export payments to CSV
 */
export function exportPaymentsToCSV(cuotas: ApiCuota[]) {
  const headers = [
    'ID',
    'Socio ID',
    'Nombre Socio',
    'Email',
    'Periodo',
    'Monto',
    'Fecha Vencimiento',
    'Fecha Pago',
    'Estado',
    'Método de Pago',
    'Número de Recibo',
    'Días Vencimiento',
    'Link de Pago',
    'Recordatorios Enviados'
  ]

  const rows = cuotas.map(cuota => [
    cuota.id.toString(),
    cuota.socioId.toString(),
    cuota.socio?.nombreCompleto || `${cuota.socio?.nombre || ''} ${cuota.socio?.apellido || ''}`.trim() || 'N/A',
    cuota.socio?.email || 'N/A',
    cuota.periodo,
    cuota.monto.toString(),
    cuota.fechaVencimiento,
    cuota.fechaPago || 'N/A',
    cuota.estado,
    cuota.metodoPago || 'N/A',
    cuota.numeroRecibo || 'N/A',
    cuota.diasVencimiento?.toString() || '0',
    cuota.linkPago ? 'Sí' : 'No',
    cuota.cantidadRecordatorios.toString()
  ])

  const csvContent = convertToCSV(headers, rows)
  const filename = `pagos_${new Date().toISOString().split('T')[0]}.csv`
  downloadCSV(filename, csvContent)
}

/**
 * Export filtered members to CSV
 */
export function exportFilteredMembersToCSV(
  members: Member[],
  filters: {
    activity?: string
    status?: string
    paymentStatus?: string
  }
) {
  let filteredMembers = members

  if (filters.activity) {
    filteredMembers = filteredMembers.filter(m => m.activity === filters.activity)
  }

  if (filters.status) {
    filteredMembers = filteredMembers.filter(m => m.status === filters.status)
  }

  if (filters.paymentStatus) {
    filteredMembers = filteredMembers.filter(m => m.paymentStatus === filters.paymentStatus)
  }

  exportMembersToCSV(filteredMembers)
}

/**
 * Export payment statistics to CSV
 */
export function exportPaymentStatsToCSV(stats: any) {
  const headers = ['Periodo', 'Total Cuotas', 'Cuotas Pagadas', 'Tasa Cobranza (%)', 'Ingreso Real', 'Ingreso Esperado']

  const rows = stats.tendenciaMensual.map((month: any) => [
    month.periodo,
    month.totalCuotas.toString(),
    month.cuotasPagadas.toString(),
    month.tasaCobranza,
    month.ingresoReal.toString(),
    month.ingresoEsperado.toString()
  ])

  const csvContent = convertToCSV(headers, rows)
  const filename = `estadisticas_pagos_${new Date().toISOString().split('T')[0]}.csv`
  downloadCSV(filename, csvContent)
}
