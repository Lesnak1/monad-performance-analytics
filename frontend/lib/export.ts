export interface ExportData {
  timestamp: string
  [key: string]: any
}

export type ExportFormat = 'json' | 'csv' | 'xlsx' | 'pdf'

// JSON Export
export function exportAsJSON(data: ExportData[], filename: string) {
  const jsonString = JSON.stringify(data, null, 2)
  downloadFile(jsonString, `${filename}.json`, 'application/json')
}

// CSV Export
export function exportAsCSV(data: ExportData[], filename: string) {
  if (!data.length) return

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value || ''
      }).join(',')
    )
  ].join('\n')

  downloadFile(csvContent, `${filename}.csv`, 'text/csv')
}

// XLSX Export (requires additional library)
export async function exportAsXLSX(data: ExportData[], filename: string) {
  try {
    // Dynamic import to reduce bundle size
    const XLSX = await import('xlsx')
    
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data')
    
    // Generate buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    
    // Create blob and download
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}.xlsx`
    link.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('XLSX export failed:', error)
    // Fallback to CSV
    exportAsCSV(data, filename)
  }
}

// PDF Export with charts
export async function exportAsPDF(
  data: ExportData[], 
  chartElements: HTMLElement[], 
  filename: string,
  title: string = 'Monad Performance Report'
) {
  try {
    // Dynamic imports
    const [jsPDF, html2canvas] = await Promise.all([
      import('jspdf').then(m => m.jsPDF),
      import('html2canvas').then(m => m.default)
    ])

    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    
    // Add title
    pdf.setFontSize(20)
    pdf.setTextColor(40, 40, 40)
    pdf.text(title, 20, 20)
    
    // Add timestamp
    pdf.setFontSize(10)
    pdf.setTextColor(100, 100, 100)
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, 30)
    
    let yPosition = 40
    
    // Add charts
    for (const element of chartElements) {
      if (yPosition > pageHeight - 60) {
        pdf.addPage()
        yPosition = 20
      }
      
      try {
        const canvas = await html2canvas(element, {
          backgroundColor: null,
          scale: 2,
          logging: false,
          useCORS: true
        })
        
        const imgData = canvas.toDataURL('image/png')
        const imgWidth = pageWidth - 40
        const imgHeight = (canvas.height * imgWidth) / canvas.width
        
        pdf.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight)
        yPosition += imgHeight + 10
      } catch (error) {
        console.error('Chart capture failed:', error)
      }
    }
    
    // Add data table if space allows
    if (yPosition < pageHeight - 100 && data.length > 0) {
      if (yPosition > pageHeight - 150) {
        pdf.addPage()
        yPosition = 20
      }
      
      pdf.setFontSize(14)
      pdf.setTextColor(40, 40, 40)
      pdf.text('Data Summary', 20, yPosition)
      yPosition += 10
      
      // Create simple table
      const headers = Object.keys(data[0]).slice(0, 4) // Limit columns
      const tableData = data.slice(0, 10).map(row => // Limit rows
        headers.map(header => String(row[header] || ''))
      )
      
      pdf.setFontSize(8)
      const cellWidth = (pageWidth - 40) / headers.length
      
      // Headers
      headers.forEach((header, i) => {
        pdf.text(header, 20 + i * cellWidth, yPosition)
      })
      yPosition += 5
      
      // Data rows
      tableData.forEach(row => {
        row.forEach((cell, i) => {
          pdf.text(cell.substring(0, 15), 20 + i * cellWidth, yPosition)
        })
        yPosition += 4
      })
    }
    
    pdf.save(`${filename}.pdf`)
  } catch (error) {
    console.error('PDF export failed:', error)
    // Fallback to JSON
    exportAsJSON(data, filename)
  }
}

// Generic download function
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

// Multi-format export
export async function exportData(
  data: ExportData[],
  format: ExportFormat,
  filename: string,
  options?: {
    chartElements?: HTMLElement[]
    title?: string
  }
) {
  const timestamp = new Date().toISOString().split('T')[0]
  const fullFilename = `${filename}_${timestamp}`
  
  switch (format) {
    case 'json':
      exportAsJSON(data, fullFilename)
      break
    case 'csv':
      exportAsCSV(data, fullFilename)
      break
    case 'xlsx':
      await exportAsXLSX(data, fullFilename)
      break
    case 'pdf':
      await exportAsPDF(
        data, 
        options?.chartElements || [], 
        fullFilename,
        options?.title
      )
      break
    default:
      exportAsJSON(data, fullFilename)
  }
}

// Export button component data
export const exportFormats = [
  { value: 'json', label: 'JSON', icon: '📄', description: 'Raw data format' },
  { value: 'csv', label: 'CSV', icon: '📊', description: 'Spreadsheet compatible' },
  { value: 'xlsx', label: 'Excel', icon: '📗', description: 'Microsoft Excel format' },
  { value: 'pdf', label: 'PDF', icon: '📋', description: 'Report with charts' }
] as const 