"use client"

import { useState } from "react"
import RequestBuilder from "./requestBuilder"
import TerminalBuilder from "./terminalBuilder"
import { Braces, TerminalIcon } from "lucide-react"
export type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

interface APITestModalProps {
  url: string
  method: Method
  resource: IResource
  onClose: () => void
}

export default function APITestModal({
  url,
  method,
  resource,
  onClose
}: APITestModalProps) {
  const [activeTab, setActiveTab] = useState<"requestBuilder" | "terminalBuilder">("requestBuilder")

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-lg p-8 w-full max-w-3xl shadow-xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">API Tester</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <div className="mb-6 flex gap-2 border-b border-border">
          <button
            type="button"
            onClick={() => setActiveTab("requestBuilder")}
            className={`pb-2 px-4 font-medium transition-colors flex items-center gap-2 ${activeTab === "requestBuilder"
                ? "border-cyan-500 text-cyan-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            <Braces className="w-4 h-4" />
            Request Builder
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("terminalBuilder")}
            className={`pb-2 px-4 font-medium transition-colors flex items-center gap-2 ${activeTab === "terminalBuilder"
                ? "border-cyan-500 text-cyan-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            <TerminalIcon className="w-4 h-4" />
            cURL
          </button>
        </div>

        {activeTab === "requestBuilder" ? (
          <RequestBuilder url={url} method={method} resource={resource} />
        ) : (
          <TerminalBuilder url={url} method={method}/>
        )}
      </div>
    </div>
  )
}
