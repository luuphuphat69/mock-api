"use client"
import { Code, Zap, BookOpen, Shield } from "lucide-react"
import Header from "@/components/header"
import { useState } from "react"

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("getting-started")

  const sections = [
    { id: "getting-started", title: "Getting Started", icon: Zap },
    { id: "create-project", title: "Create a Project", icon: BookOpen },
    { id: "create-resources", title: "Create Resources", icon: Code },
    { id: "test-api", title: "Test Your API", icon: Shield },
  ]

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">API Documentation</h1>
            <p className="text-lg text-muted-foreground">Learn how to use MockAPI to test your applications</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <aside className="lg:col-span-1">
              <nav className="space-y-2 sticky top-24">
                {sections.map((section) => {
                  const IconComponent = section.icon
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-2 ${
                        activeSection === section.id
                          ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="text-sm font-medium">{section.title}</span>
                    </button>
                  )
                })}
              </nav>
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Getting Started */}
              {activeSection === "getting-started" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-4">Getting Started</h2>
                    <p className="text-muted-foreground mb-6">
                      MockAPI is a powerful platform for testing APIs without needing a real backend. Follow this guide
                      to get started in minutes.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-6 rounded-lg border border-border bg-card">
                      <h3 className="text-xl font-bold text-foreground mb-3">1. Sign Up</h3>
                      <p className="text-muted-foreground mb-4">
                        Create a free account to get started. Just enter your username and password.
                      </p>
                      <div className="bg-muted p-4 rounded text-sm font-mono text-foreground text-left">
                        Username: your_username
                        <br />
                        Password: secure_password
                      </div>
                    </div>

                    <div className="p-6 rounded-lg border border-border bg-card">
                      <h3 className="text-xl font-bold text-foreground mb-3">2. Create Your First Project</h3>
                      <p className="text-muted-foreground mb-4">
                        After login, you'll see your projects dashboard. Click "Add New Project" to create your first
                        project.
                      </p>
                      <ul className="list-disc list-inside text-muted-foreground space-y-2 text-sm">
                        <li>Project Name: Give your project a meaningful name</li>
                        <li>API Prefix: Define the base path for your APIs (e.g., /api/v1)</li>
                      </ul>
                    </div>

                    <div className="p-6 rounded-lg border border-border bg-card">
                      <h3 className="text-xl font-bold text-foreground mb-3">3. Get Your API Key</h3>
                      <p className="text-muted-foreground mb-4">
                        Each project has a unique API key that you'll need for authentication. You can find it in the
                        Resources section.
                      </p>
                      <div className="bg-muted p-4 rounded text-sm font-mono text-foreground text-left break-all">
                        x-api-Key: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Create Project */}
              {activeSection === "create-project" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-4">Create a Project</h2>
                    <p className="text-muted-foreground mb-6">
                      Projects are containers for your mock resources. Each project is isolated and has its own API key.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-6 rounded-lg border border-border bg-card">
                      <h3 className="text-lg font-bold text-foreground mb-3">Project Structure</h3>
                      <p className="text-muted-foreground mb-4">
                        Each resource in your project follows a standard URL structure:
                      </p>
                      <div className="bg-muted p-4 rounded text-sm font-mono text-foreground text-left space-y-2">
                        <div>
                          <span className="text-cyan-400">General URL:</span>
                        </div>
                        <div className="ml-4  break-all">
                          https://mockapi.example.com/mock-api/{"{projectID}"}/{"{version}"}/{"{endpoint}"}
                        </div>
                        <div className="mt-4 text-cyan-400">Example:</div>
                        <div className="ml-4 break-all">
                          https://mockapi.example.com/mock-api/proj_12345/v1/users
                        </div>
                        <div className="ml-4 text-gray-400 text-xs mt-2">
                          GET - Retrieves all users from the project
                        </div>
                      </div>
                      <div className="mt-4 p-4 rounded bg-muted space-y-2 text-sm">
                        <div>
                          <span className="text-cyan-400 font-bold">projectID:</span>
                          <span className="text-muted-foreground"> Unique identifier for your project</span>
                        </div>
                        <div>
                          <span className="text-cyan-400 font-bold">version:</span>
                          <span className="text-muted-foreground"> API version (e.g., v1, v2)</span>
                        </div>
                        <div>
                          <span className="text-cyan-400 font-bold">endpoint:</span>
                          <span className="text-muted-foreground"> Resource name (e.g., users, products, orders)</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 rounded-lg border border-border bg-card">
                      <h3 className="text-lg font-bold text-foreground mb-3">Quick Setup</h3>
                      <div className="bg-muted p-4 rounded text-sm font-mono text-foreground text-left space-y-2">
                        <div>
                          <span className="text-cyan-400">Project Name:</span> My Store API
                        </div>
                        <div>
                          <span className="text-cyan-400">Project ID:</span> proj_12345
                        </div>
                        <div>
                          <span className="text-cyan-400">API Version:</span> v1
                        </div>
                        <div>
                          <span className="text-cyan-400">Full Base URL:</span>{" "}
                          https://mockapi.example.com/mock-api/proj_12345/v1
                        </div>
                      </div>
                    </div>

                    <div className="p-6 rounded-lg border border-border bg-card">
                      <h3 className="text-lg font-bold text-foreground mb-3">Best Practices</h3>
                      <ul className="list-disc list-inside text-muted-foreground space-y-2 text-sm">
                        <li>Use descriptive project names that reflect your application</li>
                        <li>Use consistent API versions (e.g., /v1, /v2) for better organization</li>
                        <li>Keep each project focused on one application or feature set</li>
                        <li>Use semantic versioning in your API version (v1, v2, etc.)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Create Resources */}
              {activeSection === "create-resources" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-4">Create Resources</h2>
                    <p className="text-muted-foreground mb-6">
                      Resources define the data structure for your mock APIs. Define fields using standard data types or
                      Faker.js for realistic mock data.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-6 rounded-lg border border-border bg-card">
                      <h3 className="text-lg font-bold text-foreground mb-3">Define Schema</h3>
                      <p className="text-muted-foreground mb-4">
                        Define your resource schema by adding fields with types:
                      </p>
                      <div className="bg-muted p-4 rounded text-sm font-mono text-foreground text-left space-y-1">
                        <div>
                          <span className="text-cyan-400">Field:</span> <span className="text-yellow-400">id</span> -{" "}
                          <span className="text-green-400">string</span>
                        </div>
                        <div>
                          <span className="text-cyan-400">Field:</span> <span className="text-yellow-400">name</span> -{" "}
                          <span className="text-green-400">Fake</span> (person.fullName)
                        </div>
                        <div>
                          <span className="text-cyan-400">Field:</span> <span className="text-yellow-400">email</span> -{" "}
                          <span className="text-green-400">Fake</span> (internet.email)
                        </div>
                        <div>
                          <span className="text-cyan-400">Field:</span>{" "}
                          <span className="text-yellow-400">created_at</span> -{" "}
                          <span className="text-green-400">Fake</span> (date.past)
                        </div>
                      </div>
                    </div>

                    <div className="p-6 rounded-lg border border-border bg-card">
                      <h3 className="text-lg font-bold text-foreground mb-3">Data Types</h3>
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="text-cyan-400 font-bold">string</span>
                          <p className="text-muted-foreground ml-4">Text data</p>
                        </div>
                        <div>
                          <span className="text-cyan-400 font-bold">number</span>
                          <p className="text-muted-foreground ml-4">Numeric data</p>
                        </div>
                        <div>
                          <span className="text-cyan-400 font-bold">boolean</span>
                          <p className="text-muted-foreground ml-4">True or false</p>
                        </div>
                        <div>
                          <span className="text-cyan-400 font-bold">Fake</span>
                          <p className="text-muted-foreground ml-4">Realistic mock data using Faker.js</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 rounded-lg border border-border bg-card">
                      <h3 className="text-lg font-bold text-foreground mb-3">Generate Mock Data</h3>
                      <p className="text-muted-foreground mb-4">
                        Automatically generate realistic mock data for testing:
                      </p>
                      <ul className="list-disc list-inside text-muted-foreground space-y-2 text-sm">
                        <li>Click "Generate Data" button in the resource editor</li>
                        <li>Specify the number of records (default: 50)</li>
                        <li>Data is generated based on your schema and Faker.js definitions</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Test API */}
              {activeSection === "test-api" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-4">Test Your API</h2>
                    <p className="text-muted-foreground mb-6">
                      Use the built-in API testing interface to test all HTTP methods against your mock endpoints.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-6 rounded-lg border border-border bg-card">
                      <h3 className="text-lg font-bold text-foreground mb-3">API Endpoints</h3>
                      <p className="text-muted-foreground mb-4">Each resource generates five endpoints:</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex gap-2 text-left">
                          <span className="bg-cyan-500/30 text-cyan-400 px-2 py-1 rounded font-bold w-16 flex-shrink-0">
                            GET
                          </span>
                          <span className="text-foreground font-mono">/api/v1/resource</span>
                        </div>
                        <div className="flex gap-2 text-left">
                          <span className="bg-green-500/30 text-green-400 px-2 py-1 rounded font-bold w-16 flex-shrink-0">
                            POST
                          </span>
                          <span className="text-foreground font-mono">/api/v1/resource</span>
                        </div>
                        <div className="flex gap-2 text-left">
                          <span className="bg-blue-500/30 text-blue-400 px-2 py-1 rounded font-bold w-16 flex-shrink-0">
                            PUT
                          </span>
                          <span className="text-foreground font-mono">/api/v1/resource/:id</span>
                        </div>
                        <div className="flex gap-2 text-left">
                          <span className="bg-orange-500/30 text-orange-400 px-2 py-1 rounded font-bold w-16 flex-shrink-0">
                            PATCH
                          </span>
                          <span className="text-foreground font-mono">/api/v1/resource/:id</span>
                        </div>
                        <div className="flex gap-2 text-left">
                          <span className="bg-red-500/30 text-red-400 px-2 py-1 rounded font-bold w-16 flex-shrink-0">
                            DELETE
                          </span>
                          <span className="text-foreground font-mono">/api/v1/resource/:id</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 rounded-lg border border-border bg-card">
                      <h3 className="text-lg font-bold text-foreground mb-3">GET API Query Parameters</h3>
                      <p className="text-muted-foreground mb-4">The GET endpoint supports advanced query parameters:</p>

                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="text-cyan-400 font-bold">Get by ID:</span>
                          <div className="bg-muted p-3 rounded text-foreground font-mono mt-1 text-left break-all">
                            GET /api/v1/users/:id
                          </div>
                          <div className="text-gray-400 text-xs mt-1">Retrieves a specific resource by its ID</div>
                        </div>

                        <div>
                          <span className="text-cyan-400 font-bold">Sorting:</span>
                          <div className="bg-muted p-3 rounded text-foreground font-mono mt-1 text-left break-all">
                            GET /api/v1/users?_sort={"{property}"}&_order=desc
                          </div>
                          <div className="text-gray-400 text-xs mt-1">
                            Sort results by a field. Use _order=asc for ascending or _order=desc for descending
                          </div>
                        </div>

                        <div>
                          <span className="text-cyan-400 font-bold">Pagination:</span>
                          <div className="bg-muted p-3 rounded text-foreground font-mono mt-1 text-left break-all">
                            GET /api/v1/{"{enpoint}"}?_page={"{number}"}&_limit={"{number}"}
                          </div>
                          <div className="text-gray-400 text-xs mt-1">
                            Paginate results using _page (starting from 1) and _limit (records per page)
                          </div>
                        </div>

                        <div>
                          <span className="text-cyan-400 font-bold">Combined Example:</span>
                          <div className="bg-muted p-3 rounded text-foreground font-mono mt-1 text-left break-all">
                            GET /api/v1/users?_sort=name&_order=asc&_page=2&_limit=10
                          </div>
                          <div className="text-gray-400 text-xs mt-1">
                            Combine multiple parameters to sort and paginate results
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 rounded-lg border border-border bg-card">
                      <h3 className="text-lg font-bold text-foreground mb-3">Using cURL</h3>
                      <p className="text-muted-foreground mb-4">Test your mock APIs from the command line:</p>
                      <div className="bg-muted p-4 rounded text-sm font-mono text-foreground text-left space-y-2 break-all">
                        <div className="text-cyan-400"># GET request</div>
                        <div>curl -X GET https://mockapi.example.com/api/v1/users \</div>
                        <div className="ml-2">-H "x-api-Key: your-api-key"</div>

                        <div className="text-cyan-400 mt-4"># POST request</div>
                        <div>curl -X POST https://mockapi.example.com/api/v1/users \</div>
                        <div className="ml-2">-H "x-api-Key: your-api-key" \</div>
                        <div className="ml-2">-H "Content-Type: application/json" \</div>
                        <div className="ml-2">-d '{'name": "John'}'</div>
                      </div>
                    </div>

                    <div className="p-6 rounded-lg border border-border bg-card">
                      <h3 className="text-lg font-bold text-foreground mb-3">Using JavaScript/Fetch</h3>
                      <div className="bg-muted p-4 rounded text-sm font-mono text-foreground text-left space-y-2 break-all">
                        <div className="text-cyan-400">// GET request</div>
                        <div>fetch('https://mockapi.example.com/api/v1/users', {"{"}</div>
                        <div className="ml-2">headers: {"{"}</div>
                        <div className="ml-4">'x-api-key': 'your-api-key'</div>
                        <div className="ml-2">{"}"}</div>
                        <div>{"}"})</div>
                        <div>.then(r =&gt; r.json())</div>
                        <div>.then(data =&gt; console.log(data))</div>

                        <div className="text-cyan-400 mt-4">// POST request</div>
                        <div>fetch('https://mockapi.example.com/api/v1/users', {"{"}</div>
                        <div className="ml-2">method: 'POST',</div>
                        <div className="ml-2">headers: {"{"}</div>
                        <div className="ml-4">'x-api-Key': 'your-api-key',</div>
                        <div className="ml-4">'Content-Type': 'application/json'</div>
                        <div className="ml-2">{"}"}, </div>
                        <div className="ml-2">
                          body: JSON.stringify({"{"}name: 'John'{"}"})
                        </div>
                        <div>{"}"})</div>
                      </div>
                    </div>

                    <div className="p-6 rounded-lg border border-border bg-card">
                      <h3 className="text-lg font-bold text-foreground mb-3">Response Format</h3>
                      <p className="text-muted-foreground mb-4">All responses are returned in JSON format:</p>
                      <div className="bg-muted p-4 rounded text-sm font-mono text-foreground text-left">
                        <pre className="text-balance">
                          {JSON.stringify(
                            {
                              id: "1",
                              name: "John Doe",
                              email: "john@example.com",
                              created_at: "2025-01-15T10:30:00Z",
                            },
                            null,
                            2,
                          )}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
