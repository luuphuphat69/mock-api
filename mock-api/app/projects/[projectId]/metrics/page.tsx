"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { RefreshCw, ChevronRight } from "lucide-react"
import gsap from "gsap"
import { useEffect } from "react"
import Link from "next/link"
import { ChartBarInteractive } from "./chart-bar-interactive"
import Header from "@/components/header"
import { getGeneralMetrics, getMethodMetrics, getMonthlyMetrics } from "@/utilities/api/api"
import { Spinner } from "@/components/ui/shadcn-io/spinner"
import { LoadingScreen } from "@/components/loading-screen"

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const methodColors: Record<HttpMethod, string> = {
  GET: "oklch(60% 0.16 250)",    // Cobalt/Blue
  POST: "oklch(60% 0.16 150)",   // Green
  PUT: "oklch(65% 0.16 80)",     // Amber/Yellow
  PATCH: "oklch(60% 0.16 330)",  // Pink/Purple
  DELETE: "oklch(60% 0.16 25)",  // Red
};

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
  const router = useRouter();

  useEffect(() => {
    const loadMonthly = async () => {
      try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        const res = await getMonthlyMetrics(projectId, month, year);
        setMonthlyData(res);
      } catch (err) {
        console.error(err);
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
        console.error(err);
      } finally {
        setIsLoading(false)
      }
    };

    loadMetrics();
  }, [projectId]);

  const handleRefresh = () => {
    setRefreshing(true)
    gsap.to("[data-metric-card], [data-chart]", {
      opacity: 0.6,
      scale: 0.99,
      duration: 0.2,
    })

    setTimeout(() => {
      gsap.to("[data-metric-card], [data-chart]", {
        opacity: 1,
        scale: 1,
        duration: 0.3,
        ease: "back.out(1.7)"
      })
      setRefreshing(false)
    }, 800)
  }

  return (
    <>
      <LoadingScreen isVisible={isLoading}/>
      <main className="min-h-screen bg-[#FAFAFA] text-[#111111] pt-24 px-4 md:px-8 pb-12">
        <Header />
        
        {/* Breadcrumb and Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="flex flex-col gap-4">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm font-medium text-[#6B6B6B]">
              <Link href="/projects" className="hover:text-[#2F6FEB] transition-colors">
                Projects
              </Link>
              <ChevronRight className="w-4 h-4 text-[#E5E5E5]" />
              <span className="text-[#111111]">Metrics</span>
            </nav>

            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-[#111111] mb-2">API Metrics</h1>
              <p className="text-[#6B6B6B]">Monitor real-time performance and usage statistics.</p>
            </div>
          </div>

          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-[#2F6FEB] text-white hover:bg-[#2F6FEB]/90 shadow-sm transition-all h-10 px-6 rounded-lg font-medium"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh Data
          </Button>
        </div>


        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Total Requests */}
          <div 
            data-metric-card 
            className="bg-white border border-[#E5E5E5] rounded-xl p-6 hover:border-[#2F6FEB]/30 transition-all cursor-pointer group shadow-sm"
            onClick={() => router.push(`/projects/${projectId}/mock-logs`)}
          >
            <p className="text-xs font-bold uppercase tracking-[0.06em] text-[#6B6B6B] mb-4">Total Requests</p>
            {isLoading ? <Spinner /> : (
              <div>
                <p className="text-4xl font-bold tracking-tight text-[#111111] tabular-nums group-hover:text-[#2F6FEB] transition-colors">
                  {metrics.current?.totalRequest?.toLocaleString()}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${metrics.growth.totalRequest > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {metrics.growth.totalRequest !== null
                      ? `${metrics.growth.totalRequest > 0 ? "↑" : "↓"} ${Math.abs(metrics.growth.totalRequest).toFixed(1)}%`
                      : "—"}
                  </span>
                  <span className="text-xs text-[#6B6B6B]">vs last month</span>
                </div>
              </div>
            )}
          </div>

          {/* Success Rate */}
          <div 
            data-metric-card 
            className="bg-white border border-[#E5E5E5] rounded-xl p-6 hover:border-green-500/30 transition-all cursor-pointer group shadow-sm"
            onClick={() => router.push(`/projects/${projectId}/mock-logs`)}
          >
            <p className="text-xs font-bold uppercase tracking-[0.06em] text-[#6B6B6B] mb-4">Success Rate</p>
            {isLoading ? <Spinner /> : (
              <div>
                <p className="text-4xl font-bold tracking-tight text-green-600 tabular-nums">
                  {metrics.current.successRate}%
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${metrics.growth.successRate >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {metrics.growth.successRate !== null
                      ? `${metrics.growth.successRate > 0 ? "↑" : "↓"} ${Math.abs(metrics.growth.successRate).toFixed(1)}%`
                      : "—"}
                  </span>
                  <span className="text-xs text-[#6B6B6B]">vs last month</span>
                </div>
              </div>
            )}
          </div>

          {/* Errors */}
          <div 
            data-metric-card 
            className="bg-white border border-[#E5E5E5] rounded-xl p-6 hover:border-red-500/30 transition-all cursor-pointer group shadow-sm"
            onClick={() => router.push(`/projects/${projectId}/mock-logs`)}
          >
            <p className="text-xs font-bold uppercase tracking-[0.06em] text-[#6B6B6B] mb-4">Total Errors</p>
            {isLoading ? <Spinner /> : (
              <div>
                <p className="text-4xl font-bold tracking-tight text-red-600 tabular-nums">
                  {metrics.current.totalErrors.toLocaleString()}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${metrics.growth.totalErrors <= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {metrics.growth.totalErrors !== null
                      ? `${metrics.growth.totalErrors > 0 ? "↑" : "↓"} ${Math.abs(metrics.growth.totalErrors).toFixed(1)}%`
                      : "—"}
                  </span>
                  <span className="text-xs text-[#6B6B6B]">vs last month</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Charts Section */}
        <ChartBarInteractive monthlyData={monthlyData} />

        {/* Method Performance Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold tracking-tight text-[#111111]">Performance by HTTP Method</h2>
            <div className="h-px flex-1 bg-[#E5E5E5] mx-6 hidden md:block" />
          </div>

          {isLoading ? (
            <div className="flex justify-center p-12">
              <Spinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {methodMetrics.map((item, index) => (
                <div
                  key={item.method}
                  data-chart
                  onClick={() => router.push(`/projects/${projectId}/mock-logs`)}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className="bg-white border border-[#E5E5E5] rounded-xl p-5 hover:border-[#2F6FEB]/30 hover:shadow-md transition-all cursor-pointer group"
                >
                  {/* HTTP Method Badge */}
                  <div
                    className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider mb-4"
                    style={{
                      backgroundColor: `${methodColors[item.method]}15`,
                      color: methodColors[item.method],
                      border: `1px solid ${methodColors[item.method]}30`
                    }}
                  >
                    {item.method}
                  </div>

                  {/* Metrics Grid */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B] mb-1">Requests</p>
                      <p className="text-2xl font-bold tracking-tight tabular-nums text-[#111111]">
                        {item.totalRequest.toLocaleString()}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B] mb-1">Success</p>
                        <p className="text-sm font-bold text-green-600 tabular-nums">
                          {(item.successRate * 100).toFixed(0)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B] mb-1">Failed</p>
                        <p className="text-sm font-bold text-red-600 tabular-nums">
                          {item.totalFailedRequest}
                        </p>
                      </div>
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

