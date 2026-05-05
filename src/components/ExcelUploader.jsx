import { Upload, Cake, Plane } from 'lucide-react'
import { useRef, useState, useEffect } from 'react'

export default function ExcelUploader({ onAniversarios, onViagens }) {
  const inputRef = useRef()
  const menuRef = useRef()
  const [aberto, setAberto] = useState(false)
  const [tipo, setTipo] = useState(null)

  useEffect(() => {
    const fechar = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setAberto(false)
    }
    document.addEventListener('mousedown', fechar)
    return () => document.removeEventListener('mousedown', fechar)
  }, [])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file || !tipo) return
    if (tipo === 'aniversarios') onAniversarios(file)
    else onViagens(file)
    setAberto(false)
    setTipo(null)
    e.target.value = ''
  }

  const selecionar = (t) => {
    setTipo(t)
    inputRef.current.click()
  }

  return (
    <div className="relative" ref={menuRef}>
      <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileChange} />

      <button
        onClick={() => setAberto(!aberto)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer bg-blue-600 text-white hover:bg-blue-700 transition-colors"
      >
        <Upload size={12} />
        Importar
      </button>

      {aberto && (
        <div className="absolute right-0 top-full mt-1.5 bg-white rounded-xl border border-gray-200 shadow-lg py-1 z-50 w-52">
          <button
            onClick={() => selecionar('aniversarios')}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-amber-50 cursor-pointer"
          >
            <Cake size={16} className="text-amber-500" />
            <div>
              <p className="font-medium text-xs">Aniversários</p>
              <p className="text-[10px] text-gray-400">Planilha de aniversariantes</p>
            </div>
          </button>
          <div className="border-t border-gray-100 mx-3" />
          <button
            onClick={() => selecionar('viagens')}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-purple-50 cursor-pointer"
          >
            <Plane size={16} className="text-purple-500" />
            <div>
              <p className="font-medium text-xs">Viagens</p>
              <p className="text-[10px] text-gray-400">Planilha de viagens</p>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}
