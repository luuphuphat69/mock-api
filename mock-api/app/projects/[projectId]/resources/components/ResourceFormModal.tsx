"use client"

import type { FormEvent } from "react"
import { useEffect, useRef, useState } from "react"
import { ChevronDown, Database, Plus, Trash2 } from "lucide-react"
import gsap from "gsap"
import { faker, simpleFaker } from "@faker-js/faker"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/shadcn-io/spinner"
import { FAKER_MODULES } from "@/app/enum/fakermodules"
import { useUser } from "../../../../../hooks/useUser"

type GeneratedRecord = Record<string, unknown>
type SchemaFieldKey = keyof Pick<ISchemaField, "name" | "dataType" | "fakeType">

interface ResourceFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    name: string
    schema: ISchemaField[]
    records?: GeneratedRecord[]
  }) => Promise<void>
  initialData?: { name: string; schema: ISchemaField[]; records: GeneratedRecord[] } | null
}

const DEFAULT_SCHEMA: ISchemaField[] = [
  { name: "id", dataType: "string", fakeType: "" },
]

function getDefaultValue(field: ISchemaField): unknown {
  switch (field.dataType) {
    case "string":
      return simpleFaker.string.uuid()
    case "number":
      return simpleFaker.number.int()
    case "boolean":
      return simpleFaker.datatype.boolean()
    default:
      return null
  }
}

function generateFakeData(schemas: ISchemaField[], count: number): GeneratedRecord[] {
  return Array.from({ length: count }, () => {
    const row: GeneratedRecord = {}

    for (const field of schemas) {
      if (!field.fakeType) {
        row[field.name] = getDefaultValue(field)
        continue
      }

      try {
        const fakerFn = field.fakeType
          .split(".")
          .reduce<unknown>((current, key) => {
            if (current && typeof current === "object" && key in current) {
              return (current as Record<string, unknown>)[key]
            }

            return undefined
          }, faker)

        row[field.name] =
          typeof fakerFn === "function" ? fakerFn() : simpleFaker.string.sample()
      } catch {
        row[field.name] = simpleFaker.string.sample()
      }
    }

    return row
  })
}

export function ResourceFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: ResourceFormModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    schema: DEFAULT_SCHEMA,
  })
  const [generateCount, setGenerateCount] = useState(50)
  const [fakeModuleSearch, setFakeModuleSearch] = useState<Record<number, string>>({})
  const [openFakerDropdown, setOpenFakerDropdown] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { user, fetchUser } = useUser()

  const modalRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const isEditMode = !!initialData
  const maxRecords = user?.type === "free" ? 100 : 1000

  useEffect(() => {
    if (!isOpen) return

    void fetchUser()
    setOpenFakerDropdown(null)
    setFakeModuleSearch({})

    if (initialData) {
      setFormData({ name: initialData.name, schema: initialData.schema })
      setGenerateCount(initialData.records?.length || 50)
      return
    }

    setFormData({ name: "", schema: DEFAULT_SCHEMA })
    setGenerateCount(50)
  }, [fetchUser, initialData, isOpen])

  useEffect(() => {
    if (!isOpen || !modalRef.current || !overlayRef.current) return

    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 })
    gsap.fromTo(
      modalRef.current,
      { opacity: 0, scale: 0.98, y: 12 },
      { opacity: 1, scale: 1, y: 0, duration: 0.28, ease: "power3.out" },
    )
  }, [isOpen])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const resourceName = formData.name.trim()

    if (!resourceName) return toast.error("Please enter a resource name")
    if (formData.schema.length === 0) return toast.error("Resource must have at least 1 field")
    if (formData.schema.some((schema) => !schema.name.trim())) {
      return toast.error("All fields must have a name")
    }

    setIsLoading(true)

    try {
      const schemaChanged =
        isEditMode && JSON.stringify(formData.schema) !== JSON.stringify(initialData.schema)
      const recordCountChanged =
        isEditMode && generateCount !== (initialData.records?.length || 0)
      const shouldGenerate = !isEditMode || schemaChanged || recordCountChanged
      const payload: {
        name: string
        schema: ISchemaField[]
        records?: GeneratedRecord[]
      } = {
        name: resourceName,
        schema: formData.schema,
      }

      if (shouldGenerate) {
        payload.records = generateFakeData(formData.schema, generateCount)
      }

      await onSubmit(payload)
      onClose()
    } catch (err) {
      console.error(err)
      toast.error("Failed to save resource")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSchemaChange = (idx: number, field: SchemaFieldKey, value: string) => {
    setFormData((current) => ({
      ...current,
      schema: current.schema.map((schema, schemaIdx) => {
        if (schemaIdx !== idx) return schema

        return {
          ...schema,
          [field]: value,
          fakeType: field === "dataType" && value !== "fake" ? "" : schema.fakeType,
        }
      }),
    }))
  }

  const removeSchemaField = (idx: number, field: ISchemaField) => {
    if (idx === 0 && field.name === "id") {
      toast.error("Default 'id' field cannot be deleted")
      return
    }

    if (formData.schema.length <= 1) {
      toast.error("Keep at least 1 field")
      return
    }

    setFormData((current) => ({
      ...current,
      schema: current.schema.filter((_, schemaIdx) => schemaIdx !== idx),
    }))
  }

  const updateGenerateCount = (rawValue: string) => {
    let nextValue = Number.parseInt(rawValue, 10)
    if (Number.isNaN(nextValue)) return

    if (nextValue > maxRecords) {
      toast.error(
        user?.type === "free"
          ? "Maximum 100 records allowed for free tier"
          : "Maximum 1000 records allowed",
      )
      nextValue = maxRecords
    }

    if (nextValue < 1) nextValue = 1
    setGenerateCount(nextValue)
  }

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="resource-form-title"
        data-testid="resource-form-modal"
        className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
      >
        <div className="border-b border-border bg-muted/20 px-6 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-primary">
                <Database className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
                  Resource schema
                </p>
                <h2 id="resource-form-title" className="text-2xl font-semibold tracking-tight text-foreground">
                  {isEditMode ? "Edit resource" : "Create resource"}
                </h2>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
              {formData.schema.length} {formData.schema.length === 1 ? "field" : "fields"} · up
              to {maxRecords} records
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          aria-busy={isLoading}
          className="max-h-[calc(90vh-112px)] space-y-6 overflow-y-auto px-6 py-6"
        >
          <section className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="resource-name">Resource name</Label>
              <p className="text-sm text-muted-foreground">
                Used as the endpoint name, so keep it short and readable.
              </p>
            </div>
            <Input
              id="resource-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="customers"
              required
              disabled={isLoading}
              className="h-11 border-border bg-background focus-visible:border-primary focus-visible:ring-primary/20"
            />
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <Label>Schema fields</Label>
                <p className="text-sm text-muted-foreground">
                  Define the fields and choose faker modules for generated mock data.
                </p>
              </div>
              <Button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    schema: [...formData.schema, { name: "", dataType: "string", fakeType: "" }],
                  })
                }
                variant="outline"
                disabled={isLoading}
                className="shrink-0"
              >
                <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                Add field
              </Button>
            </div>

            <div className="space-y-3">
              {formData.schema.map((field, idx) => (
                <div
                  key={`${field.name}-${idx}`}
                  className="rounded-xl border border-border bg-background p-3"
                >
                  <div className="grid gap-3 md:grid-cols-[1fr_180px_44px]">
                    <Input
                      value={field.name}
                      disabled={isLoading || (idx === 0 && field.name === "id")}
                      onChange={(e) => {
                        if (idx === 0 && field.name === "id") return
                        handleSchemaChange(idx, "name", e.target.value)
                      }}
                      required
                      placeholder="Field name"
                      aria-label={`Field ${idx + 1} name`}
                      className="h-10 border-border bg-card"
                    />
                    <select
                      data-testid="select-data-type"
                      value={field.dataType}
                      onChange={(e) => {
                        handleSchemaChange(idx, "dataType", e.target.value)
                        setOpenFakerDropdown(null)
                      }}
                      disabled={isLoading}
                      aria-label={`Field ${idx + 1} data type`}
                      className="h-10 rounded-md border border-border bg-card px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="string">string</option>
                      <option value="number">number</option>
                      <option value="boolean">boolean</option>
                      <option value="fake">fake</option>
                    </select>
                    <Button
                      type="button"
                      onClick={() => removeSchemaField(idx, field)}
                      variant="outline"
                      size="icon"
                      disabled={isLoading}
                      className="border-border text-muted-foreground hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`Remove ${field.name || `field ${idx + 1}`}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>

                  {field.dataType === "fake" && (
                    <div className="relative mt-3">
                      <button
                        type="button"
                        data-testid="select-module-button"
                        onClick={() => setOpenFakerDropdown(openFakerDropdown === idx ? null : idx)}
                        disabled={isLoading}
                        className="flex h-10 w-full items-center justify-between rounded-md border border-border bg-card px-3 text-sm text-foreground transition hover:bg-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <span className={field.fakeType ? "font-medium" : "text-muted-foreground"}>
                          {field.fakeType || "Select faker module"}
                        </span>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      </button>
                      {openFakerDropdown === idx && (
                        <div
                          data-testid="faker-modules-container"
                          className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-border bg-popover shadow-lg"
                        >
                          <div className="border-b border-border p-2">
                            <Input
                              type="text"
                              placeholder="Search modules..."
                              value={fakeModuleSearch[idx] || ""}
                              onChange={(e) =>
                                setFakeModuleSearch({
                                  ...fakeModuleSearch,
                                  [idx]: e.target.value,
                                })
                              }
                              className="h-9 border-border bg-background text-sm"
                              autoFocus
                            />
                          </div>
                          <div className="max-h-52 overflow-y-auto p-1">
                            {FAKER_MODULES.filter((module) =>
                              module
                                .toLowerCase()
                                .includes((fakeModuleSearch[idx] || "").toLowerCase()),
                            ).map((module) => (
                              <button
                                key={module}
                                type="button"
                                onClick={() => {
                                  handleSchemaChange(idx, "fakeType", module)
                                  setOpenFakerDropdown(null)
                                  setFakeModuleSearch({ ...fakeModuleSearch, [idx]: "" })
                                }}
                                className="w-full rounded-lg px-3 py-2 text-left text-sm text-foreground transition hover:bg-muted focus:bg-muted focus:outline-none"
                              >
                                {module}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-muted/20 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <Label htmlFor="record-count" className="font-medium text-foreground">
                  Generate mock records
                </Label>
                <p className="text-sm text-muted-foreground">
                  {user?.type === "free"
                    ? "Free workspaces can generate up to 100 records."
                    : "Generate up to 1000 records for this resource."}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  id="record-count"
                  type="number"
                  min={1}
                  max={maxRecords}
                  value={generateCount}
                  onChange={(e) => updateGenerateCount(e.target.value)}
                  onBlur={() => {
                    if (generateCount < 1) setGenerateCount(1)
                    if (generateCount > maxRecords) setGenerateCount(maxRecords)
                  }}
                  disabled={isLoading}
                  className="h-10 w-28 border-border bg-card text-foreground"
                />
                <span className="text-sm text-muted-foreground">records</span>
              </div>
            </div>
          </section>

          <div className="sticky bottom-0 -mx-6 flex gap-3 border-t border-border bg-card/95 px-6 py-4 backdrop-blur">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1 gap-2">
              {isLoading && <Spinner className="h-4 w-4" />}
              {isLoading ? (isEditMode ? "Updating..." : "Creating...") : isEditMode ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}