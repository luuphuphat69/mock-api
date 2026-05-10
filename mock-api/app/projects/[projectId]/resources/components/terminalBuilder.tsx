"use client"

import { useState } from "react"
import { Copy, Check, Terminal, Command } from "lucide-react"

interface ITerminalProps {
  method: string
  url: string
}

function generateCurlCommand(method: string, url: string, body?: string) {
  const upperMethod = method.toUpperCase()

  switch (upperMethod) {
    case "GET":
      return `curl -X GET "${url}" \\
  -H "x-api-key: your-api-key"`

    case "POST":
    case "PUT":
    case "PATCH":
      return `curl -X ${upperMethod} "${url}" \\
  -H "x-api-key: your-api-key" \\
  -H "Content-Type: application/json" \\
  -d '${body || "{}"}'`

    case "DELETE":
      return `curl -X DELETE "${url}" \\
  -H "x-api-key: your-api-key"`

    default:
      return `curl "${url}"`
  }
}

export default function TerminalBuilder({ method, url }: ITerminalProps) {
  const [body, setBody] = useState(`{\n  "key": "value"\n}`)
  const [copied, setCopied] = useState(false)

  const showBodyInput = ["POST", "PUT", "PATCH"].includes(method.toUpperCase())
  const curlCommand = generateCurlCommand(method, url, body)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(curlCommand)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Copy failed:", err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col rounded-lg border border-slate-200 bg-slate-900 shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-semibold">cURL Request</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-700 transition-colors group"
            title="Copy to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] font-mono text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-400 group-hover:text-white transition-colors" />
                <span className="text-[10px] font-mono text-slate-400 group-hover:text-white transition-colors">Copy</span>
              </>
            )}
          </button>
        </div>

        <div className="relative group p-4 min-h-[220px]">
          <pre className="text-[13px] font-mono leading-relaxed text-slate-300 whitespace-pre-wrap break-words">
            <span className="text-indigo-400 font-bold">$</span> {curlCommand}
          </pre>
          
          <div className="absolute bottom-3 right-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-800/80 backdrop-blur rounded border border-slate-700 shadow-xl">
              <Command className="w-2.5 h-2.5 text-slate-500" />
              <span className="text-[9px] text-slate-400 uppercase tracking-tighter">Click to copy</span>
            </div>
          </div>
        </div>
      </div>

      {showBodyInput && (
        <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150">
          <div className="flex items-center justify-between px-1">
            <label className="text-xs font-medium uppercase tracking-wider text-slate-500">Request Body Editor</label>
            <span className="text-[10px] text-slate-400 font-mono">JSON</span>
          </div>
          <div className="relative">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full min-h-[140px] p-4 font-mono text-[13px] border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-slate-300 focus:outline-none transition-all resize-none shadow-sm"
              placeholder='{ "key": "value" }'
            />
            <div className="absolute bottom-3 right-3 flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}