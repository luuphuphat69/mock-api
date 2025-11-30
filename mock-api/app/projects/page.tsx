"use client";
import { useState } from "react";
import Header from "@/components/header";
import { Code2, Users } from "lucide-react"
import ProjectsTab from "./ProjectTab";
import CollaborationTab from "./CollabTab";

export default function ProjectsPage() {
  const [activeTab, setActiveTab] = useState<"my" | "collaboration">("my");

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Projects</h1>
          <p className="text-muted-foreground">Manage and test your mock API endpoints</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab("my")}
            className={`px-4 py-2 font-medium transition-colors ${activeTab === "my"
                ? "text-cyan-500 border-b-2 border-cyan-500"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <Code2 className="w-4 h-4 inline mr-2" />
            My Projects
          </button>
          <button
            onClick={() => setActiveTab("collaboration")}
            className={`px-4 py-2 font-medium transition-colors ${activeTab === "collaboration"
                ? "text-cyan-500 border-b-2 border-cyan-500"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Collaboration
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "my" && <ProjectsTab />}
        {activeTab === "collaboration" && <CollaborationTab />}
      </main>
    </div>
  );
}
