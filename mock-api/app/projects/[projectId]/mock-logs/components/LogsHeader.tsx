"use client"

import React from "react"
import Link from "next/link"
import { Button, } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronRight, RefreshCcw, Download, BrushCleaning } from "lucide-react"
import { toast } from "sonner"
import { clearMockLogs, type ClearMockLogsPeriod } from "@/utilities/api/api"
import { useUser } from "@/hooks/useUser"

interface PaginationData {
    page: number
    limit: number
    total: number
    totalPages: number
}

interface LogsHeaderProps {
    projectId: string
    pagination: PaginationData
    loading: boolean
    fetchLogs: () => void
    exportLogsAsCSV: () => void
}

export default function LogsHeader({ projectId, pagination, loading, fetchLogs, exportLogsAsCSV }: LogsHeaderProps) {
    const { user, fetchUser } = useUser()
    const [clearingPeriod, setClearingPeriod] = React.useState<ClearMockLogsPeriod | null>(null)

    const handleClearLogs = async (period: ClearMockLogsPeriod) => {
        const periodLabel = period === "all" ? "all time" : `${period} days`
        const confirmed = window.confirm(`Clear mock logs for ${periodLabel}?`)

        if (!confirmed) {
            return
        }

        setClearingPeriod(period)

        try {
            if (!user) {
                await fetchUser()
            }

            const currentUser = useUser.getState().user

            if (!currentUser?.id) {
                toast.error("You must log in first")
                return
            }

            const result = await clearMockLogs(currentUser.id, projectId, period)
            toast.success(`Mock logs cleared. Deleted ${result.deletedCount || 0} logs.`)
            fetchLogs()
        } catch (error) {
            console.error(error)
            toast.error("Failed to clear mock logs")
        } finally {
            setClearingPeriod(null)
        }
    }

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
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button className="bg-cyan-600 hover:bg-cyan-700 text-white gap-2 mr-5" variant="outline">
                            <BrushCleaning />Clear logs
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuGroup>
                            <DropdownMenuLabel>Options</DropdownMenuLabel>
                            <DropdownMenuItem
                                disabled={loading || clearingPeriod !== null}
                                onSelect={() => void handleClearLogs(7)}
                            >
                                Older than 7 days
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                disabled={loading || clearingPeriod !== null}
                                onSelect={() => void handleClearLogs(30)}
                            >
                                Older than 30 days
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                disabled={loading || clearingPeriod !== null}
                                onSelect={() => void handleClearLogs(90)}
                            >
                                Older than 90 days
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                disabled={loading || clearingPeriod !== null}
                                onSelect={() => void handleClearLogs("all")}
                            >
                                All time
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

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
