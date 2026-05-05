import { Upload, FileSpreadsheet, ChevronDown, ChevronRight, Cake, Plane, FilePlus2, RefreshCw } from 'lucide-react'
import { useRef, useState, useEffect } from 'react'

export default function ExcelUploader({ onAniversarios, onViagens, hasData }) {
  const inputRef = useRef()
  const menuRef = useRef()
  const [aberto, setAberto] = useState(false)
  const [subMenu, setSubMenu] = useState(null) // 'aniversarios' | 'viagens'
  const [acao, setAcao] = useState(null) // { tipo, modo }

  useEffect(() => {
    const fechar = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setAberto(false)
        setSubMenu(null)
      }
    }
    document.addEventListener('mousedown', fechar)
    return () => document.removeEventListener('mousedown', fechar)
  }, [])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file || !acao) return

    if (acao.tipo === 'aniversarios') onAniversarios(file, acao.modo)
    else onViagens(file, acao.modo)

    setAberto(false)
    setSubMenu(null)
    setAcao(null)
    e.target.value = ''
  }

  const selecionar = (tipo, modo) => {
    setAcao({ tipo, modo })
    inputRef.current.click()
  }

  return (
    <div className="relative" ref={menuRef}>
      <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileChange} />

      <button onClick={() => { setAberto(!aberto); setSubMenu(null) }}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl cursor-pointer bg-white border border-gray-200 text-gray-700 hover:bg-gray-50">
        <FileSpreadsheet size={16} />
        Planilhas
        <ChevronDown size={14} className={`transition-transform ${aberto ? 'rotate-180' : ''}`} />
      </button>

      {aberto && (
        <div className="absolute right-0 top-full mt-1.5 bg-white rounded-xl border border-gray-200 shadow-lg py-1 z-50" style={{ width: subMenu ? '26rem' : '15rem' }}>
          <div className="flex">
            {/* Menu principal */}
            <div className={subMenu ? 'w-1/2 border-r border-gray-100' : 'w-full'}>
              <button
                onClick={() => setSubMenu(subMenu === 'aniversarios' ? null : 'aniversarios')}
                className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm cursor-pointer ${subMenu === 'aniversarios' ? 'bg-amber-50 text-amber-700' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <div className="flex items-center gap-2.5">
                  <Cake size={16} className="text-amber-500" />
                  <span className="font-medium">Aniversários</span>
                </div>
                <ChevronRight size={14} className="text-gray-300" />
              </button>
              <div className="border-t border-gray-100 mx-3" />
              <button
                onClick={() => setSubMenu(subMenu === 'viagens' ? null : 'viagens')}
                className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm cursor-pointer ${subMenu === 'viagens' ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <div className="flex items-center gap-2.5">
                  <Plane size={16} className="text-purple-500" />
                  <span className="font-medium">Viagens</span>
                </div>
                <ChevronRight size={14} className="text-gray-300" />
              </button>
            </div>

            {/* Sub-menu de ações */}
            {subMenu && (
              <div className="w-1/2">
                <button
                  onClick={() => selecionar(subMenu, 'ajustar')}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-left text-sm text-gray-700 hover:bg-blue-50 cursor-pointer"
                >
                  <FilePlus2 size={15} className="text-blue-500" />
                  <div>
                    <p className="font-medium">Ajustar</p>
                    <p className="text-[10px] text-gray-400">Adiciona novos sem apagar</p>
                  </div>
                </button>
                <div className="border-t border-gray-100 mx-3" />
                <button
                  onClick={() => selecionar(subMenu, 'substituir')}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-left text-sm text-gray-700 hover:bg-red-50 cursor-pointer"
                >
                  <RefreshCw size={15} className="text-red-500" />
                  <div>
                    <p className="font-medium">Substituir</p>
                    <p className="text-[10px] text-gray-400">Troca toda a planilha</p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
