"use client"

import type React from "react"
import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    ChevronLeft,
    ChevronRight,
    Loader2,
    Search,
    RefreshCcw,
    Info
} from "lucide-react"

import gsap from "gsap"
import Header from "@/components/header"
import { getMockLogs } from "@/utilities/api/api"
import { toast } from 'sonner'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface LogEntry {
    _id: string
    method: string
    endpoint: string
    statusCode: number
    error: string
    timestamp: string
    filters: any[] // Changed to any[] to handle mixed data types in array
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

export default function LogsPage() {
    const params = useParams()
    const projectId = params.projectId as string

    // Data State
    const [logs, setLogs] = useState<LogEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState<PaginationData>({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    })

    // Filters State
    const [methodFilter, setMethodFilter] = useState<string>("")
    const [successFilter, setSuccessFilter] = useState<string>("")
    const [fromDate, setFromDate] = useState<string>("")
    const [toDate, setToDate] = useState<string>("")

    const [sortBy, setSortBy] = useState<"asc" | "desc">("desc")

    const methods = ["GET", "POST", "PUT", "PATCH", "DELETE"]

    const fetchLogs = useCallback(async () => {
        if (!projectId) return

        setLoading(true)
        try {
            const queryParams = new URLSearchParams({
                _page: pagination.page.toString(),
                _limit: pagination.limit.toString(),
            })

            if (fromDate && toDate) {
                queryParams.append("_from", fromDate)
                queryParams.append("_to", toDate)
            }

            const result = await getMockLogs(projectId, queryParams.toString())

            setLogs(result.data || [])
            setPagination(prev => ({
                ...prev,
                total: result.total,
                totalPages: result.totalPages,
                page: result.page
            }))

        } catch (error: any) {
            // Safe check for error message existence
            const msg = error?.response?.data?.message || "Failed to fetch logs";
            toast.error(msg);
            console.error("Error fetching logs:", error)
        } finally {
            setLoading(false)
        }
    }, [projectId, pagination.page, pagination.limit, fromDate, toDate])

    useEffect(() => {
        fetchLogs()
    }, [fetchLogs])

    useEffect(() => {
        if (!loading && logs.length > 0) {
            gsap.fromTo(
                "[data-log-row]",
                { opacity: 0, y: 10 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.4,
                    stagger: 0.05,
                    ease: "power2.out",
                    clearProps: "all"
                }
            )
        }
    }, [logs, loading])

    const getDisplayLogs = () => {
        let filtered = [...logs]

        if (methodFilter) {
            filtered = filtered.filter((log) => log.method === methodFilter)
        }

        if (successFilter) {
            const isSuccess = successFilter === "yes"
            filtered = filtered.filter((log) => log.success === isSuccess)
        }

        filtered.sort((a, b) => {
            const timeA = new Date(a.timestamp).getTime()
            const timeB = new Date(b.timestamp).getTime()
            return sortBy === "asc" ? timeA - timeB : timeB - timeA
        })

        return filtered
    }

    const displayLogs = getDisplayLogs()

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }))
        }
    }

    const handleDateChange = (type: 'from' | 'to', value: string) => {
        if (type === 'from') setFromDate(value)
        else setToDate(value)
        setPagination(prev => ({ ...prev, page: 1 }))
    }

    const clearFilters = () => {
        setMethodFilter("")
        setSuccessFilter("")
        setFromDate("")
        setToDate("")
        setSortBy("desc")
        setPagination(prev => ({ ...prev, page: 1 }))
    }

    // --- Helper to render the Response Data Column ---
    const renderResponseData = (log: LogEntry) => {
        let content = "-";

        // 1. Determine the content string based on method
        if (log.method === "GET") {
            // Convert array/object to string, or use empty array bracket
            content = log.filters ? JSON.stringify(log.filters) : "[]";
        } else {
            // Fallback for other methods
            content = log.recordId || log.updatedRecord || log.deletedRecord || "-";
        }

        // 2. Truncation Logic
        const MAX_LENGTH = 30; // Characters before truncation
        if (content.length <= MAX_LENGTH) {
            return <span className="font-mono text-xs text-muted-foreground">{content}</span>
        }

        // 3. Tooltip Logic for long content
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

    return (
        <>
            <Header />
            <main className="min-h-screen bg-background text-foreground pt-24 px-4 md:px-8 pb-12">
                <div className="flex items-center justify-between mb-8">
                    {/* Left section */}
                    <div className="flex items-center gap-4">
                        {/* Breadcrumb + Title should be stacked vertically */}
                        <div className="flex flex-col gap-1">
                            {/* Breadcrumb */}
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Link href="/projects" className="hover:text-cyan-400 transition-colors font-medium">
                                    Projects
                                </Link>
                                <ChevronRight className="w-4 h-4" />
                                <span className="text-foreground font-medium">Mock APIs Logs</span>
                            </div>

                            {/* Title */}
                            <div className="mt-5">
                                <h1 className="text-3xl font-bold leading-none">API Logs</h1>
                                <p className="text-sm text-muted-foreground">
                                    Viewing {pagination.total} total logs (Page {pagination.page} of {pagination.totalPages || 1})
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right side button */}
                    <Button variant="outline" size="icon" onClick={fetchLogs} disabled={loading}>
                        <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>


                {/* Filters */}
                <div className="bg-card border border-border rounded-lg p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {/* ... (Date and Dropdown filters kept same as previous) ... */}
                        <div>
                            <label className="block text-sm font-medium mb-2">From Date</label>
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => handleDateChange('from', e.target.value)}
                                className="w-full px-3 py-2 rounded border border-border bg-background text-foreground text-sm focus:outline-none focus:border-cyan-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">To Date</label>
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => handleDateChange('to', e.target.value)}
                                className="w-full px-3 py-2 rounded border border-border bg-background text-foreground text-sm focus:outline-none focus:border-cyan-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Method</label>
                            <select
                                value={methodFilter}
                                onChange={(e) => setMethodFilter(e.target.value)}
                                className="w-full px-3 py-2 rounded border border-border bg-background text-foreground text-sm focus:outline-none focus:border-cyan-500"
                            >
                                <option value="">All Methods</option>
                                {methods.map((method) => (
                                    <option key={method} value={method}>{method}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Success</label>
                            <select
                                value={successFilter}
                                onChange={(e) => setSuccessFilter(e.target.value)}
                                className="w-full px-3 py-2 rounded border border-border bg-background text-foreground text-sm focus:outline-none focus:border-cyan-500"
                            >
                                <option value="">All</option>
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Sort</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as "asc" | "desc")}
                                className="w-full px-3 py-2 rounded border border-border bg-background text-foreground text-sm focus:outline-none focus:border-cyan-500"
                            >
                                <option value="desc">Newest First</option>
                                <option value="asc">Oldest First</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <Button
                                onClick={clearFilters}
                                variant="outline"
                                className="w-full border-border hover:bg-cyan-500 hover:text-white"
                            >
                                Reset Filters
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Logs Table */}
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
                                ) : displayLogs.length > 0 ? (
                                    displayLogs.map((log) => (
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
                                            <td className="px-6 py-3 text-muted-foreground">{log.endpoint}</td>
                                            <td className="px-6 py-3 font-mono text-sm">{log.statusCode}</td>
                                            <td className="px-6 py-3 text-red-400 max-w-[200px] truncate" title={log.error}>
                                                {log.error || '-'}
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className={log.success ? "text-green-400" : "text-red-400"}>
                                                    {log.success ? "✓" : "✗"}
                                                </span>
                                            </td>
                                            {/* --- UPDATED RESPONSE DATA CELL --- */}
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
            </main>
        </>
    )
}