"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { toast } from 'sonner'
import gsap from "gsap"

import Header from "@/components/header"
import { getMockLogs, type MockLogsQueryParams } from "@/utilities/api/api"

// Refactored Child Components (to be created below)
import LogsHeader from "./components/LogsHeader"
import LogsFilter from "./components/LogsFilter"
import LogsTable from "./components/LogsTable"

// --- Interfaces (Ideally in a separate types/ directory) ---
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

interface ApiError {
    response?: {
        data?: {
            message?: string
        }
    }
}
// -----------------------------------------------------------

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

    // --- Data Fetching Logic (remains in the container) ---
    const fetchLogs = useCallback(async () => {
        if (!projectId) return

        setLoading(true)
        try {
            const queryParams: MockLogsQueryParams = {
                _page: pagination.page,
                _limit: pagination.limit,
                _order: sortBy,
            }

            if (methodFilter) {
                queryParams.method = methodFilter
            }

            if (successFilter) {
                queryParams.success = successFilter === "yes"
            }

            if (fromDate) {
                queryParams._from = fromDate
            }

            if (toDate) {
                queryParams._to = toDate
            }

            const result = await getMockLogs(projectId, queryParams)

            setLogs(result.data || [])
            setPagination(prev => ({
                ...prev,
                total: result.total,
                totalPages: result.totalPages,
                page: result.page
            }))

        } catch (error) {
            const msg = (error as ApiError)?.response?.data?.message || "Failed to fetch logs"
            toast.error(msg)
            console.error("Error fetching logs:", error)
        } finally {
            setLoading(false)
        }
    }, [projectId, pagination.page, pagination.limit, fromDate, toDate, methodFilter, successFilter, sortBy])

    useEffect(() => {
        fetchLogs()
    }, [fetchLogs])

    // Animation Effect (remains here as it depends on logs/loading state)
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

    const displayLogs = logs

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }))
        }
    }

    const clearFilters = () => {
        setMethodFilter("")
        setSuccessFilter("")
        setFromDate("")
        setToDate("")
        setSortBy("desc")
        setPagination(prev => ({ ...prev, page: 1 }))
    }

    // --- Export Logic (moved out as a function to be passed down) ---
    const exportLogsAsCSV = () => {
        const logsToExport = displayLogs;

        const headers = ["Method", "Endpoint", "Status Code", "Error Message", "Success", "Timestamp", "Response Data (Partial)"];
        const csvRows = [headers.join(",")];

        const sanitize = (value: string | number | boolean | null | undefined): string => {
            if (value === null || value === undefined) return "";
            let str = String(value);
            str = str.replace(/"/g, "'");
            if (str.includes(',')) {
                return `"${str}"`;
            }
            return str;
        };

        logsToExport.forEach((log) => {
            let responseData = "";
            if (log.method === "GET") {
                responseData = log.filters ? JSON.stringify(log.filters) : "[]";
            } else {
                responseData = log.recordId || log.updatedRecord || log.deletedRecord || "-";
            }

            const row = [
                sanitize(log.method),
                sanitize(log.endpoint || log.path),
                sanitize(log.statusCode),
                sanitize(log.error || log.message),
                sanitize(log.success ? "Yes" : "No"),
                sanitize(new Date(log.timestamp).toISOString()),
                sanitize(responseData),
            ];

            csvRows.push(row.join(","));
        });

        const csvContent = csvRows.join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `api-logs-${new Date().toISOString().split("T")[0]}.csv`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success("Logs exported successfully!");
    };
    // -----------------------------------------------------------------


    return (
        <>
            <Header />
            <main className="min-h-screen bg-background text-foreground pt-24 px-4 md:px-8 pb-12">
                
                <LogsHeader
                    projectId={projectId}
                    pagination={pagination}
                    loading={loading}
                    fetchLogs={fetchLogs}
                    exportLogsAsCSV={exportLogsAsCSV}
                />

                <LogsFilter
                    methods={["GET", "POST", "PUT", "PATCH", "DELETE"]}
                    methodFilter={methodFilter}
                    setMethodFilter={(value) => {
                        setMethodFilter(value)
                        setPagination(prev => ({ ...prev, page: 1 }))
                    }}
                    successFilter={successFilter}
                    setSuccessFilter={(value) => {
                        setSuccessFilter(value)
                        setPagination(prev => ({ ...prev, page: 1 }))
                    }}
                    fromDate={fromDate}
                    toDate={toDate}
                    handleDateChange={(type, value) => {
                        if (type === 'from') setFromDate(value)
                        else setToDate(value)
                        setPagination(prev => ({ ...prev, page: 1 }))
                    }}
                    sortBy={sortBy}
                    setSortBy={(value) => {
                        setSortBy(value)
                        setPagination(prev => ({ ...prev, page: 1 }))
                    }}
                    clearFilters={clearFilters}
                />

                <LogsTable
                    logs={displayLogs}
                    loading={loading}
                    pagination={pagination}
                    handlePageChange={handlePageChange}
                />

            </main>
        </>
    )
}