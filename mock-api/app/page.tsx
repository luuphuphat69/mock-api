"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Link from "next/link";
import { Code2, Zap, Share2, Handshake, Mail, Gauge } from "lucide-react";
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
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.0,
          ease: "power3.out",
          scrollTrigger: {
            trigger: featuresTitleRef.current,
            start: "top 80%",
          },
        }
      );
    }

    // Animate “Ready to test smarter?”
    if (ctaTitleRef.current) {
      gsap.fromTo(
        ctaTitleRef.current,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.0,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ctaTitleRef.current,
            start: "top 85%",
          },
        }
      );
    }
  }, []);

  useEffect(() => {
    if (!heroTextRef.current) return;

    // Split hero text immediately
    // Note: SplitText type is often 'any' if standard definitions aren't installed
    const heroSplit = new SplitText(heroTextRef.current, { type: "chars, words" });
    const heroChars = heroSplit.chars;

    gsap.from(heroChars, {
      x: 50,
      opacity: 0,
      duration: 1.2,
      ease: "power4.out",
      stagger: 0.03,
      delay: 0.3,
    });

    const animateSplitOnScroll = (elementRef: React.RefObject<HTMLParagraphElement | null>) => {
      if (!elementRef.current) return;

      // Explicitly type splitInstance as any to avoid TS errors with GSAP plugins
      let splitInstance: any = null;

      ScrollTrigger.create({
        trigger: elementRef.current,
        start: "top 85%",
        onEnter: () => {
          if (!splitInstance && elementRef.current) {
            splitInstance = new SplitText(elementRef.current, { type: "chars, words" });
            gsap.from(splitInstance.chars, {
              y: 10,
              opacity: 0,
              duration: 0.2,
              ease: "power4.out",
              stagger: 0.05,
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

  // 4. Type the Dictionary Object
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
    }, 1500);
  };

  // 5. Type Function Arguments
  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'bg-green-500/30 text-green-400';
    if (status >= 300 && status < 400) return 'bg-blue-500/30 text-blue-400';
    if (status >= 400 && status < 500) return 'bg-yellow-500/30 text-yellow-400';
    return 'bg-red-500/30 text-red-400';
  };

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: 'bg-cyan-500/40 text-cyan-500 border-cyan-500/50',
      POST: 'bg-green-500/30 text-green-500 border-green-500/50',
      PUT: 'bg-blue-500/30 text-blue-500 border-blue-500/50',
      PATCH: 'bg-orange-500/30 text-orange-500 border-orange-500/50',
      DELETE: 'bg-red-500/30 text-red-500 border-red-500/50'
    };
    return colors[method] || 'bg-muted text-muted-foreground';
  };

  return (
    <>
      <main className="min-h-screen bg-background">
        {/* Navigation Header */}
        <Header />
        {/* Hero Section */}
        <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
          <div className="space-y-6 mb-12">
            <h1 className="text-5xl sm:text-6xl font-bold text-foreground leading-tight text-balance">
              Create and Explore Mock Endpoints Instantly
            </h1>
            <p
              ref={heroTextRef}
              className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance text"
            >
            Build mock routes, preview responses, and develop your frontend smoothly—no backend setup required. A faster, simpler way to validate your integration flows.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link title="start testing now" href="/projects">Start Building</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link title="explore feature" href="#" onClick={() => {
                document.getElementById('features')?.scrollIntoView({
                  behavior: 'smooth'
                })
              }}>View Features</Link>
            </Button> 
          </div>

          <div className="w-full rounded-xl border border-border bg-card overflow-hidden shadow-2xl">
            <div className="grid md:grid-cols-2 gap-px bg-border">
              {/* Request Panel */}
              <div className="bg-background p-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block text-center">Method</label>
                    <div className="flex gap-2 justify-center flex-wrap">
                      {(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as Method[]).map((method) => (
                        <button
                          key={method}
                          onClick={() => setSelectedMethod(method)}
                          className={`px-3 py-2 rounded text-xs font-bold cursor-pointer transition-colors border ${method === selectedMethod
                            ? `${getMethodColor(method)} border-current`
                            : 'bg-muted text-muted-foreground border-border hover:border-muted-foreground'
                            }`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block text-center">URL</label>
                    <div className="bg-muted p-3 rounded text-sm font-mono text-foreground text-left break-all">
                      /api/users/123
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block text-center">Headers</label>
                    <div className="space-y-2">
                      <div className="flex gap-2 text-xs text-left">
                        <span className="text-cyan-500">Content-Type:</span>
                        <span className="text-foreground">application/json</span>
                      </div>
                      <div className="flex gap-2 text-xs text-left">
                        <span className="text-cyan-500">Authorization:</span>
                        <span className="text-foreground">Bearer token...</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={handleSendRequest}
                    disabled={isLoading}
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-background font-bold"
                  >
                    {isLoading ? 'Sending...' : 'Send Request'}
                  </Button>
                </div>
              </div>

              {/* Response Panel */}
              <div className="bg-background p-6 border-l border-border">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block text-center">Status</label>
                    <div className={`px-4 py-2 rounded font-bold text-sm w-fit mx-auto ${isLoading
                      ? 'bg-yellow-500/30 text-yellow-400'
                      : responseData
                        ? getStatusColor(responseData.status)
                        : 'bg-muted text-muted-foreground'
                      }`}>
                      {isLoading ? 'Loading...' : responseData ? `${responseData.status} ${responseData.status === 204 ? 'No Content' : 'OK'}` : 'No Response'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block text-center">Response Time</label>
                    <div className="bg-muted p-3 rounded text-sm font-mono text-foreground text-left">
                      {isLoading ? '...' : responseData?.time || '-'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block text-center">Response Body</label>
                    <div className="bg-muted p-3 rounded text-xs font-mono text-foreground max-h-40 overflow-auto text-left">
                      <pre className="text-balance">{isLoading ? '...' : responseData ? JSON.stringify(responseData.body, null, 2) : '{}'}</pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-card/50 border-t border-border">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2
                ref={featuresTitleRef}
                className="text-4xl font-bold text-foreground mb-4 opacity-0"
              >
                Tools That Accelerate Your Workflow
              </h2>
              <p ref={featureTextRef} className="text-lg text-muted-foreground">A complete toolkit for building, sharing, and validating your services.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Feature 1 */}
              <div className="p-8 rounded-lg border border-border bg-background hover:border-primary/50 transition-colors group">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-cyan-500/30 transition-colors">
                  <Zap className="w-6 h-6 text-cyan-500" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Design Mock Endpoints</h3>
                <p className="text-muted-foreground">
                  Create flexible routes with customizable JSON responses. Perfect for prototyping and quick experiments.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-8 rounded-lg border border-border bg-background hover:border-primary/50 transition-colors group">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-colors">
                  <Code2 className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Works With Every HTTP Method</h3>
                <p className="text-muted-foreground">
                  Simulate GET, POST, PUT, PATCH, DELETE, and more with accurate response handling.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-8 rounded-lg border border-border bg-background hover:border-primary/50 transition-colors group">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition-colors">
                  <Handshake className="w-6 h-6 text-purple-500" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Team Collaboration Ready</h3>
                <p className="text-muted-foreground">
                  Share collections and work together on mock services during development and testing.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-8 rounded-lg border border-border bg-background hover:border-primary/50 transition-colors group">
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-500/30 transition-colors">
                  <Gauge className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Metric APIs</h3>
                <p className="text-muted-foreground">
                  Gain insights into your APIs with real-time metrics on total requests, success rates, and errors.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <h2
              ref={ctaTitleRef}
              className="text-3xl font-bold text-foreground opacity-0"
            >
              Build Faster. Ship Confidently.
            </h2>
            <p ref={ctaTextRef} className="text-lg text-muted-foreground">
              Develop without waiting on backend services. Join thousands of builders creating better workflows.
            </p>
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link title="start free" href="/login">Start for Free</Link>
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border bg-card/30">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src='/icon.png'
                title="logo"
                width={50}
                height={50}
                alt="logo"
              />
              <span className="font-bold text-foreground">MockAPI</span>
            </div>
            <div className="flex items-center gap-6">
              <p className="text-sm text-muted-foreground">© 2025 MockAPI. Build seamless integration workflows.</p>
              <a
                href="mailto:luuphuphat69@gmail.com"
                title="mailto"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                luuphuphat69@gmail.com
              </a>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}