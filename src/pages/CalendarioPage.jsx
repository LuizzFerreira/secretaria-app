import { CalendarDays, Download } from 'lucide-react'
import pdfUrl from '../Calendário de Compensação - 2026.pdf?url'

export default function CalendarioPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Calendário de Compensação</h2>
          <p className="text-sm text-gray-400 mt-1">Calendário oficial da empresa — 2026</p>
        </div>
        <a
          href={pdfUrl}
          download
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors cursor-pointer"
        >
          <Download size={16} />
          Baixar PDF
        </a>
      </div>

      <div className="bg-white/60 backdrop-blur rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-white/80">
          <CalendarDays size={16} className="text-blue-600" />
          <span className="text-sm font-medium text-gray-600">Calendário de Compensação - 2026.pdf</span>
        </div>
        <div className="w-full" style={{ height: 'calc(100vh - 220px)' }}>
          <iframe
            src={pdfUrl}
            title="Calendário de Compensação"
            className="w-full h-full border-0"
          />
        </div>
      </div>
    </div>
  )
}
