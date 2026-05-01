import React from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Loader2, Search } from "lucide-react"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

// Re-using the interfaces from the main file
interface LogEntry {
    _id: string
    method: string
    endpoint?: string
    path?: string
    statusCode: number
    error?: string
    message?: string
    timestamp: string
    filters: unknown[]
    recordId: string
    updatedRecord: string
    deletedRecord: string
    success: boolean
}

interface PaginationData {
    page: number
    limit: number
    total: number
    totalPages: number
}

interface LogsTableProps {
    logs: LogEntry[]
    loading: boolean
    pagination: PaginationData
    handlePageChange: (newPage: number) => void
}

// --- Helper to render the Response Data Column (kept here for encapsulation) ---
const renderResponseData = (log: LogEntry) => {
    let content = "-";
    if (log.method === "GET") {
        content = log.filters ? JSON.stringify(log.filters) : "[]";
    } else {
        content = log.recordId || log.updatedRecord || log.deletedRecord || "-";
    }

    const MAX_LENGTH = 30;
    if (content.length <= MAX_LENGTH) {
        return <span className="font-mono text-xs text-muted-foreground">{content}</span>
    }

    return (
        <TooltipProvider>
            <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                    <span className="font-mono text-xs text-muted-foreground cursor-help decoration-dotted underline underline-offset-4 hover:text-foreground transition-colors">
                        {content.slice(0, MAX_LENGTH)}...
                    </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-[400px] break-all bg-popover text-popover-foreground border-border shadow-lg">
                    <p className="font-mono text-xs">{content}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
// -----------------------------------------------------------------------------------

export default function LogsTable({ logs, loading, pagination, handlePageChange }: LogsTableProps) {
    return (
        <div className="bg-card border border-border rounded-lg overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border bg-muted/30">
                            <th className="px-6 py-3 text-left font-semibold">Method</th>
                            <th className="px-6 py-3 text-left font-semibold">Endpoint</th>
                            <th className="px-6 py-3 text-left font-semibold">Status</th>
                            <th className="px-6 py-3 text-left font-semibold">Error message</th>
                            <th className="px-6 py-3 text-left font-semibold">Success</th>
                            <th className="px-6 py-3 text-left font-semibold">Response Data</th>
                            <th className="px-6 py-3 text-left font-semibold">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody className="min-h-[200px]">
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                                        <span className="text-muted-foreground">Fetching logs...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : logs.length > 0 ? (
                            logs.map((log) => (
                                <tr key={log._id} data-log-row className="border-b border-border hover:bg-muted/50 transition-colors">
                                    <td className="px-6 py-3">
                                        <span
                                            className="inline-block px-2 py-1 rounded text-xs font-semibold"
                                            style={{
                                                backgroundColor: {
                                                    GET: "#06B6D420", POST: "#10B98120", PUT: "#F59E0B20",
                                                    PATCH: "#EC489920", DELETE: "#EF444420",
                                                }[log.method] || "#06B6D420",
                                                color: {
                                                    GET: "#06B6D4", POST: "#10B981", PUT: "#F59E0B",
                                                    PATCH: "#EC4899", DELETE: "#EF4444",
                                                }[log.method] || "#06B6D4",
                                            }}
                                        >
                                            {log.method}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-muted-foreground">{log.endpoint || log.path || "-"}</td>
                                    <td className="px-6 py-3 font-mono text-sm">{log.statusCode}</td>
                                    <td className="px-6 py-3 text-red-400 max-w-[200px] truncate" title={log.error || log.message}>
                                        {log.error || log.message || '-'}
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className={log.success ? "text-green-400" : "text-red-400"}>
                                            {log.success ? "✓" : "✗"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3">
                                        {renderResponseData(log)}
                                    </td>
                                    <td className="px-6 py-3 text-muted-foreground whitespace-nowrap">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="h-64">
                                    <div className="flex flex-col items-center justify-center h-full">
                                        <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                        <p className="text-muted-foreground">No logs found</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="border-t border-border bg-muted/10 p-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page <= 1 || loading}
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                    </Button>

                    <div className="flex items-center gap-1 hidden md:flex">
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                            let pageNum = i + 1;
                            if (pagination.totalPages > 5 && pagination.page > 3) {
                                pageNum = pagination.page - 3 + i;
                            }
                            if (pageNum > pagination.totalPages) return null;
                            if (pageNum < 1) return null;

                            return (
                                <Button
                                    key={pageNum}
                                    variant={pagination.page === pageNum ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => handlePageChange(pageNum)}
                                    disabled={loading}
                                    className="w-8 h-8 p-0"
                                >
                                    {pageNum}
                                </Button>
                            )
                        })}
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages || loading}
                    >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
