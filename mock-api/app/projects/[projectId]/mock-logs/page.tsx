"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { toast } from 'sonner'
import gsap from "gsap"

import Header from "@/components/header"
import { getMockLogs } from "@/utilities/api/api"

// Refactored Child Components (to be created below)
import LogsHeader from "./components/LogsHeader"
import LogsFilter from "./components/LogsFilter"
import LogsTable from "./components/LogsTable"

// --- Interfaces (Ideally in a separate types/ directory) ---
interface LogEntry {
    _id: string
    method: string
    endpoint: string
    statusCode: number
    error: string
    timestamp: string
    filters: any[]
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
            const queryParams = new URLSearchParams({
                _page: pagination.page.toString(),
                _limit: pagination.limit.toString(),
                _sort: "timestamp", // Assuming we always sort by timestamp for API fetch
                _order: sortBy,
            })

            if (fromDate && toDate) {
                queryParams.append("_from", fromDate)
                queryParams.append("_to", toDate)
            }
            if (methodFilter) {
                queryParams.append("method", methodFilter)
            }
            if (successFilter) {
                queryParams.append("success", successFilter === "yes" ? "true" : "false")
            }

            // Note: Your API fetch should ideally handle filters on the server.
            // If getMockLogs handles all filtering/sorting locally, the next section is fine.
            const result = await getMockLogs(projectId, queryParams.toString())

            setLogs(result.data || [])
            setPagination(prev => ({
                ...prev,
                total: result.total,
                totalPages: result.totalPages,
                page: result.page
            }))

        } catch (error: any) {
            const msg = error?.response?.data?.message || "Failed to fetch logs";
            toast.error(msg);
            console.error("Error fetching logs:", error)
        } finally {
            setLoading(false)
        }
    }, [projectId, pagination.page, pagination.limit, fromDate, toDate, methodFilter, successFilter, sortBy]) // Added filters to dependencies

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

    // --- Local Filtering/Sorting Logic (kept here for simplicity, but only needed if fetchLogs does NOT apply them) ---
    const getDisplayLogs = () => {
        // Since fetchLogs now incorporates the filters into the queryParams,
        // we can assume the 'logs' state is already the final result.
        // We only need to sort by timestamp if the API doesn't guarantee the order.

        let sorted = [...logs]

        sorted.sort((a, b) => {
            const timeA = new Date(a.timestamp).getTime()
            const timeB = new Date(b.timestamp).getTime()
            return sortBy === "asc" ? timeA - timeB : timeB - timeA
        })

        return sorted
    }
    const displayLogs = getDisplayLogs()
    // ------------------------------------------------------------------------------------------------------------------

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
                sanitize(log.endpoint),
                sanitize(log.statusCode),
                sanitize(log.error),
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
                    pagination={pagination}
                    loading={loading}
                    fetchLogs={fetchLogs}
                    exportLogsAsCSV={exportLogsAsCSV}
                />

                <LogsFilter
                    methods={["GET", "POST", "PUT", "PATCH", "DELETE"]}
                    methodFilter={methodFilter}
                    setMethodFilter={setMethodFilter}
                    successFilter={successFilter}
                    setSuccessFilter={setSuccessFilter}
                    fromDate={fromDate}
                    toDate={toDate}
                    handleDateChange={(type, value) => {
                        if (type === 'from') setFromDate(value)
                        else setToDate(value)
                        setPagination(prev => ({ ...prev, page: 1 }))
                    }}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
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