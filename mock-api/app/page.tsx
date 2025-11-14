"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Link from "next/link";
import { Code2, Zap, Share2, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Header from "@/components/header";
gsap.registerPlugin(SplitText);
gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const featuresTitleRef = useRef(null);
  const ctaTitleRef = useRef(null);
  const heroTextRef = useRef<HTMLParagraphElement>(null);
  const featureTextRef = useRef<HTMLParagraphElement>(null);
  const ctaTextRef = useRef<HTMLParagraphElement>(null);
  
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



  return (
    <main className="min-h-screen bg-background">
      {/* Navigation Header */}
      <Header/>

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

        {/* Hero Image Placeholder */}
        <div className="w-full h-96 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-xl border border-border flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Code2 className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>Interactive API Testing Interface</p>
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
            <Code2 className="w-5 h-5 text-cyan-500" />
            <span className="font-bold text-foreground">MockAPI</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2025 MockAPI. Test APIs like a pro.</p>
        </div>
      </footer>
    </main>
  )
}