"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import axios from "axios"
export type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
interface APITestModalProps {
  url: string
  apiKey: string
  method: Method
  resource: IResource
  onClose: () => void
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

export default function APITestModal({
  url,
  apiKey,
  method,
  resource,
  onClose
}: APITestModalProps) {

  const [state, setState] = useState<IApiTestState>({
    resourceId: resource._id,
    method,
    url,
    body: "",
    isLoading: false,
    response: null
  });

  const sendRequest = async () => {
    const start = performance.now();
    setState(s => ({ ...s, isLoading: true, response: null }));

    try {
      let res;

      if (method === "GET") {
        res = await axios.get(state.url, { headers: { "x-api-key": apiKey } });
      } 
      else if (method === "DELETE") {
        res = await axios.delete(state.url, { headers: { "x-api-key": apiKey } });
      } 
      else {
        const body = state.body ? JSON.parse(state.body) : {};
        res = await axios({
          method,
          url: state.url,
          headers: { "x-api-key": apiKey },
          data: body
        });
      }

      const ms = performance.now() - start;

      setState(s => ({
        ...s,
        isLoading: false,
        response: {
          status: res.status,
          time: ms,
          body: res.data
        }
      }));
    } 
    catch (err: any) {
      const ms = performance.now() - start;

      setState(s => ({
        ...s,
        isLoading: false,
        response: {
          status: err.response?.status ?? 500,
          time: ms,
          body: err.response?.data ?? { error: "Unknown error" }
        }
      }));
    }
  };

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

        {/* Method */}
        <span className="inline-block px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded font-mono text-sm">
          {method}
        </span>

        {/* URL */}
        <div className="mt-4 space-y-2">
          <Label>URL</Label>
          <Input
            value={state.url}
            onChange={(e) => setState(s => ({ ...s, url: e.target.value }))}
            className="font-mono text-sm"
          />
        </div>

        {/* Body */}
        {["POST", "PUT", "PATCH"].includes(method) && (
          <div className="mt-4 space-y-2">
            <Label>Request Body (JSON)</Label>
            <textarea
              value={state.body}
              onChange={(e) => setState(s => ({ ...s, body: e.target.value }))}
              className="w-full bg-background border border-border rounded p-2 font-mono text-sm h-36"
            />
          </div>
        )}

        {/* Send Button */}
        <Button
          onClick={sendRequest}
          disabled={state.isLoading}
          className="mt-6 w-full bg-cyan-600 text-white"
        >
          {state.isLoading ? "Sending..." : "Send Request"}
        </Button>

        {/* Response */}
        {state.response && (
          <div className="mt-8 border-t border-border pt-4">
            <div className="flex gap-6 text-sm">
              <div>
                <span className="text-muted-foreground">Status:</span>
                <span className="text-green-400 ml-2">{state.response.status}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Time:</span>
                <span className="text-blue-400 ml-2">
                  {state.response.time.toFixed(0)}ms
                </span>
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

      </div>
    </div>
  );
}