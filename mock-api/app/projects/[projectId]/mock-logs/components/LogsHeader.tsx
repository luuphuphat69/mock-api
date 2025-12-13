import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight, RefreshCcw, Download } from "lucide-react"

interface PaginationData {
    page: number
    limit: number
    total: number
    totalPages: number
}

interface LogsHeaderProps {
    pagination: PaginationData
    loading: boolean
    fetchLogs: () => void
    exportLogsAsCSV: () => void
}

export default function LogsHeader({ pagination, loading, fetchLogs, exportLogsAsCSV }: LogsHeaderProps) {
    return (
        <div className="flex items-center justify-between mb-8">
            {/* Left section */}
            <div className="flex items-center gap-4">
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

            {/* Right section - Actions */}
            <div>
                <Button onClick={exportLogsAsCSV} className="bg-cyan-600 hover:bg-cyan-700 text-white gap-2 mr-5">
                    <Download className="w-4 h-4" />
                    Export CSV
                </Button>

                <Button variant="outline" size="icon" onClick={fetchLogs} disabled={loading}>
                    <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
            </div>
        </div>
    )
}