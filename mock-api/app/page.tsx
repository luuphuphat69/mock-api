"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Link from "next/link";
import { Code2, Zap, Share2, Handshake, Mail, Gauge, ChevronRight, Play, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Header from "@/components/header";
import Image from "next/image";

// Register plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(SplitText, ScrollTrigger);
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ResponseBody {
  id?: number;
  name?: string;
  email?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  message?: string;
  deleted_id?: number;
}

interface MockResponse {
  status: number;
  time: string;
  body: ResponseBody;
}

export default function Home() {
  const featuresTitleRef = useRef<HTMLHeadingElement>(null);
  const ctaTitleRef = useRef<HTMLHeadingElement>(null);
  const heroTextRef = useRef<HTMLParagraphElement>(null);
  const featureTextRef = useRef<HTMLParagraphElement>(null);
  const ctaTextRef = useRef<HTMLParagraphElement>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedMethod, setSelectedMethod] = useState<Method>('GET');
  const [responseData, setResponseData] = useState<MockResponse | null>(null);

  useEffect(() => {
    // Animate “Powerful Features”
    if (featuresTitleRef.current) {
      gsap.fromTo(
        featuresTitleRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: featuresTitleRef.current,
            start: "top 85%",
          },
        }
      );
    }

    // Animate “Ready to test smarter?”
    if (ctaTitleRef.current) {
      gsap.fromTo(
        ctaTitleRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ctaTitleRef.current,
            start: "top 90%",
          },
        }
      );
    }
  }, []);

  useEffect(() => {
    if (!heroTextRef.current) return;

    // Split hero text immediately
    const heroSplit = new SplitText(heroTextRef.current, { type: "chars, words" });
    const heroChars = heroSplit.chars;

    gsap.from(heroChars, {
      y: 20,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.02,
      delay: 0.2,
    });

    const animateSplitOnScroll = (elementRef: React.RefObject<HTMLParagraphElement | null>) => {
      if (!elementRef.current) return;

      let splitInstance: any = null;

      ScrollTrigger.create({
        trigger: elementRef.current,
        start: "top 90%",
        onEnter: () => {
          if (!splitInstance && elementRef.current) {
            splitInstance = new SplitText(elementRef.current, { type: "chars, words" });
            gsap.from(splitInstance.chars, {
              y: 10,
              opacity: 0,
              duration: 0.4,
              ease: "power2.out",
              stagger: 0.01,
            });
          }
        },
      });
    };

    animateSplitOnScroll(featureTextRef);
    animateSplitOnScroll(ctaTextRef);

    return () => {
      heroSplit.revert();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  const mockResponses: Record<Method, MockResponse> = {
    GET: {
      status: 200,
      time: '145ms',
      body: {
        id: 123,
        name: "John Doe",
        email: "john@example.com",
        status: "active"
      }
    },
    POST: {
      status: 201,
      time: '238ms',
      body: {
        id: 124,
        name: "Jane Smith",
        email: "jane@example.com",
        status: "active",
        created_at: "2025-01-15T10:30:00Z"
      }
    },
    PUT: {
      status: 200,
      time: '192ms',
      body: {
        id: 123,
        name: "John Updated",
        email: "john.updated@example.com",
        status: "active",
        updated_at: "2025-01-15T10:35:00Z"
      }
    },
    PATCH: {
      status: 200,
      time: '156ms',
      body: {
        id: 123,
        name: "John Doe",
        email: "john@example.com",
        status: "inactive"
      }
    },
    DELETE: {
      status: 204,
      time: '89ms',
      body: {
        message: "Resource deleted successfully",
        deleted_id: 123
      }
    }
  };

  const handleSendRequest = () => {
    setIsLoading(true);
    setTimeout(() => {
      setResponseData(mockResponses[selectedMethod]);
      setIsLoading(false);
    }, 1200);
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-emerald-600 bg-emerald-50';
    if (status >= 400) return 'text-rose-600 bg-rose-50';
    return 'text-amber-600 bg-amber-50';
  };

  const getMethodStyles = (method: Method, active: boolean) => {
    const base = "px-3 py-1.5 rounded-md text-xs font-semibold transition-all border";
    if (!active) return `${base} bg-white text-muted-foreground border-border hover:border-muted/30`;
    
    const colors: Record<Method, string> = {
      GET: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      POST: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      PUT: 'bg-blue-50 text-blue-600 border-blue-200',
      PATCH: 'bg-orange-50 text-orange-600 border-orange-200',
      DELETE: 'bg-rose-50 text-rose-600 border-rose-200'
    };
    return `${base} ${colors[method]}`;
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111] font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-16 items-center">
              <div className="lg:col-span-7 space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-medium tracking-wide uppercase">
                  <Zap className="w-3 h-3 fill-current" />
                  <span>Instant API Prototyping</span>
                </div>
                <h1 className="text-5xl sm:text-7xl font-bold leading-[1.1] tracking-[-0.03em] text-balance">
                  Create and Explore Mock Endpoints <span className="text-indigo-600">Instantly</span>
                </h1>
                <p
                  ref={heroTextRef}
                  className="text-xl text-[#6B6B6B] leading-relaxed max-w-xl text-balance"
                >
                  Build mock routes, preview responses, and develop your frontend smoothly—no backend setup required. A faster, simpler way to validate your integration flows.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <Button asChild size="lg" className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm">
                    <Link href="/projects">Start Building Free</Link>
                  </Button>
                  <Button asChild variant="ghost" size="lg" className="h-12 px-6 group">
                    <Link href="#features">
                      Explore Features
                      <ChevronRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="lg:col-span-5 relative">
                <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-50 to-white opacity-40 blur-3xl -z-10" />
                <div className="bg-white rounded-2xl border border-[#E5E5E5] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                  <div className="border-b border-[#E5E5E5] px-6 py-4 flex items-center justify-between bg-[#FAFAFA]">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-[10px] font-mono font-medium text-[#6B6B6B] uppercase tracking-widest">Live Console</span>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    {/* Method Selector */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider">Method</span>
                      <div className="flex flex-wrap gap-2">
                        {(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as Method[]).map((m) => (
                          <button
                            key={m}
                            onClick={() => setSelectedMethod(m)}
                            className={getMethodStyles(m, m === selectedMethod)}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <span className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider">Endpoint</span>
                      <div className="bg-[#FAFAFA] border border-[#E5E5E5] px-4 py-2.5 rounded-lg font-mono text-sm text-[#111111]">
                        /api/users/123
                      </div>
                    </div>

                    <Button
                      onClick={handleSendRequest}
                      disabled={isLoading}
                      className="w-full h-11 bg-[#111111] hover:bg-[#222222] text-white rounded-lg transition-all group"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          <span>Requesting...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Play className="w-3 h-3 fill-current" />
                          <span>Execute Request</span>
                        </div>
                      )}
                    </Button>

                    {/* Result Area */}
                    {(responseData || isLoading) && (
                      <div className="pt-4 border-t border-[#E5E5E5] space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider">Status</span>
                            <div className={`px-2.5 py-1 rounded text-xs font-bold ${isLoading ? 'bg-indigo-50 text-indigo-600' : getStatusColor(responseData!.status)}`}>
                              {isLoading ? 'PENDING' : `${responseData!.status} ${responseData!.status === 204 ? 'NO CONTENT' : 'OK'}`}
                            </div>
                          </div>
                          <div className="space-y-1 text-right">
                            <span className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider">Latency</span>
                            <div className="text-xs font-mono text-[#111111]">
                              {isLoading ? '--ms' : responseData!.time}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider">Response Body</span>
                          <div className="bg-[#111111] p-4 rounded-lg font-mono text-[11px] text-[#FAFAFA] max-h-40 overflow-auto border border-white/10 shadow-inner">
                            <pre className="opacity-90">
                              {isLoading ? '// Waiting...' : JSON.stringify(responseData?.body, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 bg-white border-y border-[#E5E5E5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-20 space-y-4">
              <h2
                ref={featuresTitleRef}
                className="text-4xl font-bold tracking-tight text-[#111111] opacity-0"
              >
                Tools that accelerate your workflow
              </h2>
              <p ref={featureTextRef} className="text-lg text-[#6B6B6B] leading-relaxed">
                A complete toolkit designed for teams to build, share, and validate services without the friction of backend bottlenecks.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  title: "Design Mock Endpoints",
                  desc: "Create flexible routes with customizable JSON responses in seconds.",
                  icon: Zap,
                  color: "indigo"
                },
                {
                  title: "Full HTTP Support",
                  desc: "Simulate GET, POST, PUT, PATCH, DELETE with accurate response handling.",
                  icon: Code2,
                  color: "emerald"
                },
                {
                  title: "Team Collaboration",
                  desc: "Share collections and work together on mock services during testing.",
                  icon: Handshake,
                  color: "blue"
                },
                {
                  title: "Live API Metrics",
                  desc: "Gain real-time insights into success rates, latency, and error clusters.",
                  icon: Gauge,
                  color: "amber"
                }
              ].map((f, i) => (
                <div key={i} className="group p-8 rounded-2xl border border-[#E5E5E5] bg-[#FAFAFA] hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300">
                  <div className={`w-10 h-10 rounded-xl bg-white border border-[#E5E5E5] flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform`}>
                    <f.icon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-bold text-[#111111] mb-3">{f.title}</h3>
                  <p className="text-sm text-[#6B6B6B] leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-4 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl aspect-square bg-indigo-50/50 rounded-full blur-3xl -z-10" />
          <div className="max-w-3xl mx-auto text-center space-y-10">
            <div className="space-y-4">
              <h2
                ref={ctaTitleRef}
                className="text-4xl sm:text-5xl font-bold tracking-tight text-[#111111] opacity-0"
              >
                Build Faster. Ship Confidently.
              </h2>
              <p ref={ctaTextRef} className="text-lg text-[#6B6B6B] leading-relaxed max-w-xl mx-auto">
                Develop without waiting on backend services. Join thousands of builders creating better integration workflows today.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="h-14 px-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200">
                <Link href="/login">Get Started for Free</Link>
              </Button>
              <div className="flex items-center gap-2 text-sm text-[#6B6B6B]">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>No credit card required</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white border-t border-[#E5E5E5] py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded flex items-center justify-center">
                    <Image title="logo" src='/icon.png' width={32} height={32} alt="logo" />
                  </div>
                  <span className="font-bold text-xl tracking-tight text-[#111111]">MockAPI</span>
                </div>
                <p className="text-sm text-[#6B6B6B] max-w-xs">
                  The instant prototyping platform for modern engineering teams.
                </p>
              </div>  
              <div className="flex flex-wrap gap-10">
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-widest">Product</span>
                  <ul className="space-y-2 text-sm">
                    <li><Link href="/projects" className="text-[#6B6B6B] hover:text-[#111111] transition-colors">Projects</Link></li>
                    <li><Link href="/login" className="text-[#6B6B6B] hover:text-[#111111] transition-colors">Pricing</Link></li>
                    <li><Link href="/docs" className="text-[#6B6B6B] hover:text-[#111111] transition-colors">Documentation</Link></li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-widest">Connect</span>
                  <ul className="space-y-2 text-sm">
                    <li><a href="mailto:luuphuphat69@gmail.com" className="text-[#6B6B6B] hover:text-[#111111] transition-colors inline-flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5" /> Support
                    </a></li>
                    <li><Link href="#" className="text-[#6B6B6B] hover:text-[#111111] transition-colors">Twitter</Link></li>
                    <li><Link href="#" className="text-[#6B6B6B] hover:text-[#111111] transition-colors">GitHub</Link></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="pt-8 border-t border-[#E5E5E5] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#6B6B6B]">
              <p>© 2025 MockAPI. A product for builders.</p>
              <div className="flex gap-6">
                <Link href="#" className="hover:text-[#111111] transition-colors">Privacy Policy</Link>
                <Link href="#" className="hover:text-[#111111] transition-colors">Terms of Service</Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}