"use client"

import { useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Method } from "./APITestModal"

interface RequestBuilderProps {
  url: string
  method: Method
  resource: IResource
}

interface IApiTestState {
  resourceId: string
  method: Method
  url: string
  body: string
  isLoading: boolean
  response: {
    status: number
    time: number
    body: any
  } | null
}

export default function RequestBuilder({
  url,
  method,
  resource
}: RequestBuilderProps) {
  const [state, setState] = useState<IApiTestState>({
    resourceId: resource._id,
    method,
    url,
    body: "",
    isLoading: false,
    response: null
  })

  const [inputApiKey, setInputApiKey] = useState("")
  const methodColor = method === 'GET' ? 'bg-green-500/20 text-green-400' 
                    : method === 'POST' ? 'bg-blue-500/20 text-blue-400' 
                    : method === 'PUT' ? 'bg-yellow-500/20 text-yellow-400'
                    : method === 'PATCH' ? 'bg-orange-500/20 text-orange-400'
                    : method === 'DELETE' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
  const sendRequest = async (apiKey: string) => {
    const start = performance.now()
    setState((current) => ({ ...current, isLoading: true, response: null }))

    try {
      let res

      if (method === "GET") {
        res = await axios.get(state.url, { headers: { "x-api-key": apiKey } })
      } else if (method === "DELETE") {
        res = await axios.delete(state.url, { headers: { "x-api-key": apiKey } })
      } else {
        const body = state.body ? JSON.parse(state.body) : {}
        res = await axios({
          method,
          url: state.url,
          headers: { "x-api-key": apiKey },
          data: body
        })
      }

      const ms = performance.now() - start
      setState((current) => ({
        ...current,
        isLoading: false,
        response: {
          status: res.status,
          time: ms,
          body: res.data
        }
      }))
    } catch (err: any) {
      const ms = performance.now() - start
      setState((current) => ({
        ...current,
        isLoading: false,
        response: {
          status: err.response?.status ?? 500,
          time: ms,
          body: err.response?.data ?? { error: "Unknown error" }
        }
      }))
    }
  }

  return (
    <>
      <span className={`inline-block px-3 py-1 ${methodColor} rounded font-mono text-sm`}>
        {method}
      </span>

      <div className="mt-4 space-y-2">
        <Label>URL</Label>
        <Input
          value={state.url}
          onChange={(e) => setState((current) => ({ ...current, url: e.target.value }))}
          className="font-mono text-sm"
        />
      </div>

      <Label className="mt-4 mb-2">X-API-KEY</Label>
      <input
        type="text"
        value={inputApiKey}
        onChange={(e) => setInputApiKey(e.target.value)}
        placeholder="Enter your API key"
        className="w-full px-4 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      />

      {["POST", "PUT", "PATCH"].includes(method) && (
        <div className="mt-4 space-y-2">
          <Label>Request Body (JSON)</Label>
          <textarea
            value={state.body}
            placeholder='{"key": "value"}'
            onChange={(e) => setState((current) => ({ ...current, body: e.target.value }))}
            className="w-full bg-background border border-border rounded p-2 font-mono text-sm h-36"
          />
        </div>
      )}

      <Button
        onClick={() => sendRequest(inputApiKey)}
        disabled={state.isLoading}
        className="mt-6 w-full bg-cyan-600 text-white"
      >
        {state.isLoading ? "Sending..." : "Send Request"}
      </Button>

      {state.response && (
        <div className="mt-8 border-t border-border pt-4">
          <div className="flex gap-6 text-sm">
            <div>
              <span className="text-muted-foreground">Status:</span>
              <span className="text-green-400 ml-2">{state.response.status}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Time:</span>
              <span className="text-blue-400 ml-2">{state.response.time.toFixed(0)}ms</span>
            </div>
          </div>

          <div className="mt-4">
            <Label>Response</Label>
            <pre className="bg-background border border-border rounded p-3 text-xs font-mono max-h-64 overflow-auto">
              {JSON.stringify(state.response.body, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </>
  )
}
