"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { RefreshCw, ChevronRight } from "lucide-react"
import gsap from "gsap"
import { useEffect } from "react"
import Link from "next/link"
import { ChartBarInteractive } from "./chart-bar-interactive"
import Header from "@/components/header"
import { getGeneralMetrics, getMethodMetrics, getMonthlyMetrics } from "@/utilities/api/api"
import { Spinner } from "@/components/ui/shadcn-io/spinner"

const methodColors: Record<HttpMethod, string> = {
  GET: "#06B6D4",
  POST: "#10B981",
  PUT: "#F59E0B",
  PATCH: "#EC4899",
  DELETE: "#EF4444",
};

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type MethodMetric = {
  method: HttpMethod;
  totalRequest: number;
  successRate: number;
  totalFailedRequest: number;
};

type MetricsState = {
  current: {
    totalRequest: number
    totalErrors: number
    successRate: number
  },
  growth: {
    totalRequest: number | 0
    totalErrors: number | 0
    successRate: number | 0
  }
}

export default function MetricsPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const [refreshing, setRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(false);
  const [methodMetrics, setMethodMetrics] = useState<MethodMetric[]>([]);
  const httpMethods: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    const loadMonthly = async () => {
      try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        const res = await getMonthlyMetrics(projectId, month, year);
        setMonthlyData(res);
      } catch (err) {
        console.log(err);
      }
    };

    loadMonthly();
  }, [projectId]);


  const [metrics, setMetrics] = useState<MetricsState>({
    current: {
      totalRequest: 0,
      totalErrors: 0,
      successRate: 0,
    },
    growth: {
      totalRequest: 0,
      totalErrors: 0,
      successRate: 0,
    }
  })

  useEffect(() => {
    const loadMethodMetrics = async () => {
      try {
        const all = await Promise.all(
          httpMethods.map(async (m) => {
            const res = await getMethodMetrics(projectId, m);
            return {
              method: m,
              totalRequest: res.totalRequest,
              successRate: Number(res.successRate.toFixed(1)),
              totalFailedRequest: res.totalFailedRequest,
            };
          })
        );
        setMethodMetrics(all);
      } catch (err) {
        console.error("Failed loading method metrics:", err);
      }
    };

    loadMethodMetrics();
  }, [projectId]);


  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setIsLoading(true)
        const res = await getGeneralMetrics(projectId);
        setMetrics({
          current: {
            totalRequest: res.current.totalRequest,
            totalErrors: res.current.totalErrors,
            successRate: Number(res.current.successRate.toFixed(1)),
          },
          growth: {
            totalRequest: res.growth.totalRequest,
            totalErrors: res.growth.totalErrors,
            successRate: res.growth.successRate,
          }
        });
      } catch (err) {
        console.log(err);
      } finally {
        setIsLoading(false)
      }
    };

    loadMetrics();
  }, [projectId]);

  const handleRefresh = () => {
    setRefreshing(true)
    gsap.to("[data-metric-card], [data-chart]", {
      opacity: 0.5,
      duration: 0.3,
    })

    setTimeout(() => {
      gsap.to("[data-metric-card], [data-chart]", {
        opacity: 1,
        duration: 0.3,
      })
      setRefreshing(false)
    }, 1000)
  }

  return (
    <>
      <main className="min-h-screen bg-background text-foreground pt-24 px-4 md:px-8 pb-12">
        {/* Breadcrumb and Header */}
        <Header />
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
                <span className="text-foreground font-medium">{projectId}</span>
              </div>

              {/* Title */}
              <div className="mt-5">
                <h1 className="text-3xl font-bold leading-none">API Metrics</h1>
                <p className="text-sm text-muted-foreground">Track your API performance and usage</p>
              </div>
            </div>
          </div>

          {/* Right side button */}
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500 mt-5"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>


        {/* Key Metrics Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {/* Total Requests */}
          <div data-metric-card className="bg-card border border-border rounded-lg p-6 hover:border-cyan-500/50 transition-all">
            <p className="text-sm text-muted-foreground mb-2">Total Requests</p>
            {isLoading ? <Spinner /> : (<>
              <p className="text-3xl font-bold text-cyan-400">
                {metrics.current?.totalRequest?.toLocaleString()}
              </p>
              <p className={`text-xs mt-2 ${metrics.growth.totalRequest > 0 ? "text-green-400" : "text-red-400"}`}>
                {metrics.growth.totalRequest !== null
                  ? `↑ ${metrics.growth.totalRequest.toFixed(1)}% from last month`
                  : "No previous data"}
              </p></>)}
          </div>

          {/* Success Rate */}
          <div data-metric-card className="bg-card border border-border rounded-lg p-6 hover:border-green-500/50 transition-all">
            <p className="text-sm text-muted-foreground mb-2">Success Rate</p>
            {isLoading ? <Spinner /> : (<>          <p className="text-3xl font-bold text-green-400">
              {metrics.current.successRate}%
            </p>
              <p className={`text-xs mt-2 ${metrics.growth.successRate > 0 ? "text-green-400" : "text-red-400"}`}>
                {metrics.growth.successRate !== null
                  ? `↑ ${metrics.growth.successRate.toFixed(1)}% from last month`
                  : "No previous data"}
              </p></>)}
          </div>

          {/* Errors */}
          <div data-metric-card className="bg-card border border-border rounded-lg p-6 hover:border-red-500/50 transition-all">
            <p className="text-sm text-muted-foreground mb-2">Total Errors</p>
            {isLoading ? <Spinner /> : (
              <>
                <p className="text-3xl font-bold text-red-400">
                  {metrics.current.totalErrors}
                </p>
                <p
                  className={`text-xs mt-2 ${metrics.growth.totalErrors > 0 ? "text-green-400" : "text-red-400"
                    }`}
                >
                  {metrics.growth.totalErrors !== null
                    ? `${metrics.growth.totalErrors > 0 ? "↑" : "↓"} ${Math.abs(
                      metrics.growth.totalErrors
                    ).toFixed(1)}% from last month`
                    : "No previous data"}
                </p>
              </>)}
          </div>
        </div>

        {/* Charts Section */}
        <ChartBarInteractive monthlyData={monthlyData} />

        {/* Method Performance Cards */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Performance by HTTP Method</h2>

          {isLoading ? (
            <Spinner />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {methodMetrics.map((item, index) => (
                <div
                  key={item.method}
                  data-chart
                  style={{ animationDelay: `${index * 100}ms` }}
                  className="bg-card border border-border rounded-lg p-4 hover:border-cyan-500/50 transition-all"
                >
                  {/* HTTP Method Badge */}
                  <div
                    className="inline-block px-3 py-1 rounded-full text-sm font-semibold mb-3"
                    style={{
                      backgroundColor: `${methodColors[item.method]}20`,
                      color: methodColors[item.method],
                    }}
                  >
                    {item.method}
                  </div>

                  {/* Metrics */}
                  <div className="space-y-2">
                    {/* Requests */}
                    <div>
                      <p className="text-xs text-muted-foreground">Requests</p>
                      <p
                        className="text-lg font-bold"
                        style={{ color: methodColors[item.method] }}
                      >
                        {item.totalRequest}
                      </p>
                    </div>

                    {/* Success Rate */}
                    <div>
                      <p className="text-xs text-muted-foreground">Success Rate</p>
                      <p className="text-sm font-semibold text-green-400">
                        {(item.successRate * 100).toFixed(1)}%
                      </p>
                    </div>

                    {/* Failed */}
                    <div>
                      <p className="text-xs text-muted-foreground">Failed Requests</p>
                      <p className="text-sm font-semibold text-red-400">
                        {item.totalFailedRequest}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
