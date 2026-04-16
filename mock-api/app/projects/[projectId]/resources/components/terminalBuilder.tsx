"use client"

import { useState } from "react"

interface ITerminalProps {
  method: string
  url: string
}

function generateCurlCommand(method: string, url: string, body?: string) {
  const upperMethod = method.toUpperCase()

  switch (upperMethod) {
    case "GET":
      return `curl -X GET "${url}" \\
    -H "x-api-key: your-api-key" `

    case "POST":
    case "PUT":
    case "PATCH":
      return `curl -X ${upperMethod} "${url}" \\
  -H "x-api-key: your-api-key" \\
  -H "Content-Type: application/json" \\
  -d '${body || "{}"}'`

    case "DELETE":
      return `curl -X DELETE "${url}"`

    default:
      return `curl "${url}"`
  }
}

export default function TerminalBuilder({ method, url }: ITerminalProps) {
  const [body, setBody] = useState(`{\n  \n}`)
  const [copied, setCopied] = useState(false)

  const showBodyInput = ["POST", "PUT", "PATCH"].includes(method.toUpperCase())
  const curlCommand = generateCurlCommand(method, url, body)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(curlCommand)
      setCopied(true)

      setTimeout(() => setCopied(false), 1500)
    } catch (err) {
      console.error("Copy failed:", err)
    }
  }

  return (
    <div className="space-y-4">
      {/* Terminal */}
      <div
        onClick={handleCopy}
        className="cursor-pointer bg-background border border-border rounded-lg p-4 font-mono text-sm min-h-[300px] overflow-auto hover:border-primary transition-colors"
      >
        <div className="text-cyan-400 mb-4">$ curl</div>

        <pre className="text-foreground whitespace-pre-wrap break-words text-xs">
          {curlCommand}
        </pre>

        <div className="text-muted-foreground mt-4">
          {copied ? "Copied!" : "Left click to copy the command"}
        </div>
      </div>

      {/* Body Input */}
      {showBodyInput && (
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full min-h-[120px] p-3 font-mono text-xs border border-border rounded-md bg-background"
          placeholder="Enter JSON body..."
        />
      )}
    </div>
  )
}