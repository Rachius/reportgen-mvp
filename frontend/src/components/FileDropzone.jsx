import { useRef, useState } from 'react'
import { validateFile } from '../lib/fileValidator'

export default function FileDropzone({ file, onFile, onClear }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [validationError, setValidationError] = useState(null)

  const handleFile = (f) => {
    const { ok, error } = validateFile(f)
    if (!ok) { setValidationError(error); return }
    setValidationError(null)
    onFile(f)
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0])
  }

  return (
    <div>
      <div
        onClick={() => !file && inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-xl p-10 text-center transition cursor-pointer
          ${dragging ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-gray-300'}
          ${file ? 'cursor-default' : ''}`}
      >
        {!file ? (
          <>
            <p className="text-sm font-medium text-gray-700">Arrastrá tu archivo aquí</p>
            <p className="text-xs text-gray-400 mt-1">CSV o Excel hasta 10 MB</p>
          </>
        ) : (
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm text-gray-600">{file.name}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onFile(null); onClear() }}
              className="text-xs text-gray-400 hover:text-red-500 transition"
            >
              quitar
            </button>
          </div>
        )}
      </div>
      {validationError && (
        <p className="text-xs text-red-500 mt-1">{validationError}</p>
      )}
      <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
    </div>
  )
}