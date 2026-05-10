"use client"

import { useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Send, Clock, Database, Shield, Globe, Code } from "lucide-react"

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface RequestBuilderProps {
  url: string
  method: Method
  resource: any // Using any to avoid IResource missing import
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
    body: unknown
  } | null
}

export default function RequestBuilder({
  url,
  method,
  resource
}: RequestBuilderProps) {
  const [state, setState] = useState<IApiTestState>({
    resourceId: resource?._id || "",
    method,
    url,
    body: "",
    isLoading: false,
    response: null
  })

  const [inputApiKey, setInputApiKey] = useState("")
  
  const getMethodStyles = (m: string) => {
    switch (m) {
      case 'GET': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'POST': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'PUT': return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'PATCH': return 'bg-orange-50 text-orange-700 border-orange-200'
      case 'DELETE': return 'bg-rose-50 text-rose-700 border-rose-200'
      default: return 'bg-slate-50 text-slate-700 border-slate-200'
    }
  }

  const sendRequest = async (apiKey: string) => {
    const start = performance.now()
    const requestHeaders = {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-api-key": apiKey
    }

    setState((current) => ({ ...current, isLoading: true, response: null }))

    try {
      let res

      if (method === "GET") {
        res = await axios.get(state.url, { headers: requestHeaders })
      } else if (method === "DELETE") {
        res = await axios.delete(state.url, { headers: requestHeaders })
      } else {
        const body = state.body ? JSON.parse(state.body) : {}
        res = await axios({
          method,
          url: state.url,
          headers: requestHeaders,
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
    } catch (err: unknown) {
      const ms = performance.now() - start
      const status = axios.isAxiosError(err) ? err.response?.status ?? 500 : 500
      const body = axios.isAxiosError(err)
        ? err.response?.data ?? { error: err.message }
        : { error: "Unknown error" }

      setState((current) => ({
        ...current,
        isLoading: false,
        response: {
          status,
          time: ms,
          body
        }
      }))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className={`px-2.5 py-0.5 rounded border font-mono text-xs font-semibold tracking-wider ${getMethodStyles(method)}`}>
          {method}
        </span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="grid gap-6">
        <div className="space-y-2">
          <Label className="text-xs font-medium uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Globe className="w-3.5 h-3.5" />
            API URL
          </Label>
          <div className="relative">
            <Input
              value={state.url}
              onChange={(e) => setState((current) => ({ ...current, url: e.target.value }))}
              className="font-mono text-sm bg-slate-50 border-slate-200 focus:bg-white transition-colors pl-3"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" />
            Authentication
          </Label>
          <Input
            type="password"
            value={inputApiKey}
            onChange={(e) => setInputApiKey(e.target.value)}
            placeholder="Enter your X-API-KEY"
            className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
          />
        </div>

        {["POST", "PUT", "PATCH"].includes(method) && (
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Code className="w-3.5 h-3.5" />
              Request Body
            </Label>
            <textarea
              value={state.body}
              placeholder='{ "key": "value" }'
              onChange={(e) => setState((current) => ({ ...current, body: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-md p-3 font-mono text-sm h-40 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 transition-all resize-none"
            />
          </div>
        )}
      </div>

      <Button
        onClick={() => sendRequest(inputApiKey)}
        disabled={state.isLoading}
        className="w-full bg-black font-medium shadow-sm transition-all py-6 h-auto"
      >
        {state.isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Sending...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            Execute Request
          </div>
        )}
      </Button>

      {state.response && (
        <div className="mt-8 border-t border-slate-200 pt-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium uppercase tracking-wider text-slate-500">Response Overview</Label>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 border border-slate-200">
                <Database className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[11px] font-mono font-medium text-slate-600">STATUS:</span>
                <span className={`text-[11px] font-mono font-bold ${state.response.status < 300 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {state.response.status}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 border border-slate-200">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[11px] font-mono font-medium text-slate-600">TIME:</span>
                <span className="text-[11px] font-mono font-bold text-slate-600 tabular-nums">
                  {state.response.time.toFixed(0)}ms
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-900 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">JSON Output</span>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-rose-500/20" />
                <div className="w-2 h-2 rounded-full bg-amber-500/20" />
                <div className="w-2 h-2 rounded-full bg-emerald-500/20" />
              </div>
            </div>
            <pre className="p-4 text-[13px] font-mono text-slate-300 max-h-[400px] overflow-auto scrollbar-thin scrollbar-thumb-slate-700">
              {JSON.stringify(state.response.body, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
