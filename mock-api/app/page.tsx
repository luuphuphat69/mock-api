"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Link from "next/link";
import { Code2, Zap, Share2, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Header from "@/components/header";
import Image from "next/image";
gsap.registerPlugin(SplitText);
gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const featuresTitleRef = useRef(null);
  const ctaTitleRef = useRef(null);
  const heroTextRef = useRef<HTMLParagraphElement>(null);
  const featureTextRef = useRef<HTMLParagraphElement>(null);
  const ctaTextRef = useRef<HTMLParagraphElement>(null);

  const [isLoading, setIsLoading] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState('GET')
  const [responseData, setResponseData] = useState(null)

  useEffect(() => {
    // Animate “Powerful Features”
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
          start: "top 80%", // when the section enters the viewport
        },
      }
    );

    // Animate “Ready to test smarter?”
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
  }, []);

  useEffect(() => {
    // Split hero text immediately (load-time animation)
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

    // SplitText scroll animation handler
    const animateSplitOnScroll = (elementRef: React.RefObject<HTMLParagraphElement | null>) => {
      if (!elementRef.current) return; // guard clause

      let splitInstance: SplitText | null = null;

      ScrollTrigger.create({
        trigger: elementRef.current,
        start: "top 85%",
        onEnter: () => {
          if (!splitInstance && elementRef.current) {
            splitInstance = new SplitText(elementRef.current, { type: "chars, words" });
            gsap.from(splitInstance.chars, {
              y: 20,
              opacity: 0,
              duration: 0.5,
              ease: "power4.out",
              stagger: 0.05,
            });
          }
        },

      });
    };

    // Apply to feature and CTA texts
    animateSplitOnScroll(featureTextRef);
    animateSplitOnScroll(ctaTextRef);

    return () => {
      heroSplit.revert();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  const mockResponses = {
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
  }

  const handleSendRequest = () => {
    setIsLoading(true)
    setTimeout(() => {
      setResponseData(mockResponses[selectedMethod])
      setIsLoading(false)
    }, 1500)
  }

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return 'bg-green-500/30 text-green-400'
    if (status >= 300 && status < 400) return 'bg-blue-500/30 text-blue-400'
    if (status >= 400 && status < 500) return 'bg-yellow-500/30 text-yellow-400'
    return 'bg-red-500/30 text-red-400'
  }

  const getMethodColor = (method) => {
    const colors = {
      GET: 'bg-cyan-500/30 text-cyan-400 border-cyan-500/50',
      POST: 'bg-green-500/30 text-green-400 border-green-500/50',
      PUT: 'bg-blue-500/30 text-blue-400 border-blue-500/50',
      PATCH: 'bg-orange-500/30 text-orange-400 border-orange-500/50',
      DELETE: 'bg-red-500/30 text-red-400 border-red-500/50'
    }
    return colors[method] || 'bg-muted text-muted-foreground'
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation Header */}
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        <div className="space-y-6 mb-12">
          <h1 className="text-5xl sm:text-6xl font-bold text-foreground leading-tight text-balance">
            Test APIs Like a Pro
          </h1>
          <p
            ref={heroTextRef}
            className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance text"
          >
            Send requests, mock endpoints, and test your frontend code without
            waiting for backend development. It&apos;s Postman for the impatient
            developer.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/projects">Start Testing Now</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="#features">Explore Features</Link>
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
                    {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((method) => (
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
                      <span className="text-cyan-400">Content-Type:</span>
                      <span className="text-foreground">application/json</span>
                    </div>
                    <div className="flex gap-2 text-xs text-left">
                      <span className="text-cyan-400">Authorization:</span>
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
              Powerful Features
            </h2>
            <p ref={featureTextRef} className="text-lg text-muted-foreground">Everything you need to test APIs efficiently</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-lg border border-border bg-background hover:border-primary/50 transition-colors group">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-cyan-500/30 transition-colors">
                <Zap className="w-6 h-6 text-cyan-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Create Mock Endpoints</h3>
              <p className="text-muted-foreground">
                Instantly create mock endpoints with custom response JSON. No backend needed.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-lg border border-border bg-background hover:border-primary/50 transition-colors group">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-colors">
                <Code2 className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">HTTP Methods</h3>
              <p className="text-muted-foreground">
                Support for GET, POST, PUT, DELETE, PATCH and more. Test any request type.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-lg border border-border bg-background hover:border-primary/50 transition-colors group">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition-colors">
                <Gauge className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Response Control</h3>
              <p className="text-muted-foreground">
                Simulate latency, error codes, and custom headers to test edge cases.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-lg border border-border bg-background hover:border-primary/50 transition-colors group">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-500/30 transition-colors">
                <Share2 className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Shareable URLs</h3>
              <p className="text-muted-foreground">
                Generate shareable mock URLs to collaborate with your team seamlessly.
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
            Ready to test smarter?
          </h2>
          <p ref={ctaTextRef} className="text-lg text-muted-foreground">
            Join developers who are shipping faster without waiting for backend APIs.
          </p>
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/app">Start Free</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border bg-card/30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src='/icon.png'
              width={50}
              height={50}
              alt="logo"
            />
            <span className="font-bold text-foreground">MockAPI</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2025 MockAPI. Test APIs like a pro.</p>
        </div>
      </footer>
    </main>
  )
}