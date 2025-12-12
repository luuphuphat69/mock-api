import React from "react"
import { Button } from "@/components/ui/button"

interface LogsFilterProps {
    methods: string[]
    methodFilter: string
    setMethodFilter: React.Dispatch<React.SetStateAction<string>>
    successFilter: string
    setSuccessFilter: React.Dispatch<React.SetStateAction<string>>
    fromDate: string
    toDate: string
    handleDateChange: (type: 'from' | 'to', value: string) => void
    sortBy: "asc" | "desc"
    setSortBy: React.Dispatch<React.SetStateAction<"asc" | "desc">>
    clearFilters: () => void
}

export default function LogsFilter({
    methods,
    methodFilter,
    setMethodFilter,
    successFilter,
    setSuccessFilter,
    fromDate,
    toDate,
    handleDateChange,
    sortBy,
    setSortBy,
    clearFilters
}: LogsFilterProps) {
    return (
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {/* From Date */}
                <div>
                    <label className="block text-sm font-medium mb-2">From Date</label>
                    <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => handleDateChange('from', e.target.value)}
                        className="w-full px-3 py-2 rounded border border-border bg-background text-foreground text-sm focus:outline-none focus:border-cyan-500"
                    />
                </div>
                {/* To Date */}
                <div>
                    <label className="block text-sm font-medium mb-2">To Date</label>
                    <input
                        type="date"
                        value={toDate}
                        onChange={(e) => handleDateChange('to', e.target.value)}
                        className="w-full px-3 py-2 rounded border border-border bg-background text-foreground text-sm focus:outline-none focus:border-cyan-500"
                    />
                </div>
                {/* Method Filter */}
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
                {/* Success Filter */}
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
                {/* Sort By */}
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
                {/* Reset Button */}
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
    )
}