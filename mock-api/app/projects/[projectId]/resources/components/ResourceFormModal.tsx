"use client"
import { useState, useEffect, useRef } from "react"
import { ChevronRight, Plus, Trash2 } from 'lucide-react'
import gsap from "gsap"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { simpleFaker, faker } from '@faker-js/faker'
import { FAKER_MODULES } from "@/app/enum/fakermodules"
import { Spinner } from '@/components/ui/shadcn-io/spinner';
import { useUser } from "../../../../../hooks/useUser";

interface ResourceFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { name: string; schema: ISchemaField[]; records?: any[] }) => Promise<void>
  initialData?: { name: string; schema: ISchemaField[]; records: [] } | null // If provided, we are in Edit Mode
}

export function ResourceFormModal({ isOpen, onClose, onSubmit, initialData }: ResourceFormModalProps) {

  const [formData, setFormData] = useState({
    name: "",
    schema: [{ name: "id", dataType: "string", fakeType: "" }] as ISchemaField[],
  })
  const [generateCount, setGenerateCount] = useState(50)
  const [fakeModuleSearch, setFakeModuleSearch] = useState<{ [key: number]: string }>({})
  const [openFakerDropdown, setOpenFakerDropdown] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false);
  const { user, fetchUser } = useUser()

  const modalRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const isEditMode = !!initialData

  // Initialize form on open
  useEffect(() => {
    if (isOpen) {
      fetchUser();
      if (initialData) {
        setFormData({ name: initialData.name, schema: initialData.schema })
      } else {
        setFormData({ name: "", schema: [{ name: "id", dataType: "string", fakeType: "" }] })
      }
    }
  }, [isOpen, initialData])

  // Animations
  useEffect(() => {
    if (isOpen && modalRef.current && overlayRef.current) {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 })
      gsap.fromTo(modalRef.current, { opacity: 0, scale: 0.95, y: -20 }, { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" })
    }
  }, [isOpen])

  const generateFakeData = (schemas: ISchemaField[], count: number) => {
    const result: any[] = []
    for (let i = 0; i < count; i++) {
      const row: any = {}
      for (const field of schemas) {
        if (!field.fakeType) {
          switch (field.dataType) {
            case "string": row[field.name] = simpleFaker.string.uuid(); break
            case "number": row[field.name] = simpleFaker.number.int(); break
            case "boolean": row[field.name] = simpleFaker.datatype.boolean(); break
            default: row[field.name] = null
          }
          continue
        }
        try {
          const path = field.fakeType.split(".")
          let fakerFn: any = faker
          for (const p of path) fakerFn = fakerFn[p]
          row[field.name] = typeof fakerFn === "function" ? fakerFn() : simpleFaker.string.sample()
        } catch (err) {
          row[field.name] = simpleFaker.string.sample()
        }
      }
      result.push(row)
    }
    return result
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) return toast.error("Please enter a resource name");
    if (formData.schema.length === 0) return toast.error("Resource must have at least 1 field");
    if (formData.schema.some((s) => !s.name)) return toast.error("All fields must have a name");

    setIsLoading(true);

    try {
      // Check if we are editing
      const isEdit = !!initialData;

      // Decide if we need to regenerate records
      const schemaChanged = isEdit && JSON.stringify(formData.schema) !== JSON.stringify(initialData.schema);
      const recordCountChanged = isEdit && generateCount !== (initialData.records?.length || 0);

      const shouldGenerate = !isEdit || schemaChanged || recordCountChanged;

      const payload: {
        name: string;
        schema: ISchemaField[];
        records?: any[];
      } = {
        name: formData.name,
        schema: formData.schema,
      };

      if (shouldGenerate) {
        payload.records = generateFakeData(formData.schema, generateCount);
      }

      await onSubmit(payload);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save resource");
    } finally {
      setIsLoading(false);
    }
  };


  const handleSchemaChange = (idx: number, field: string, value: string) => {
    const newSchema = [...formData.schema]
    // @ts-ignore
    newSchema[idx][field] = value
    if (field === 'dataType' && value !== 'fake') newSchema[idx].fakeType = ""
    setFormData({ ...formData, schema: newSchema })
  }

  return (
    isOpen && (
      <div ref={overlayRef} className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div ref={modalRef} className="bg-card border border-border rounded-lg p-8 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-bold text-foreground mb-6">{isEditMode ? "Edit Resource" : "Create New Resource"}</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="resource-name">Resource Name</Label>
              <Input
                id="resource-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-4">
              <Label>Schema</Label>
              {formData.schema.map((field, idx) => (
                <div key={idx} className="flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2 h-10">
                    <Input
                      value={field.name}
                      disabled={idx === 0 && field.name === "id"}
                      onChange={(e) => {
                        if (idx === 0 && field.name === "id") return;
                        handleSchemaChange(idx, 'name', e.target.value);
                      }}
                      required
                      placeholder="Field Name"
                    />
                    <div className="flex gap-2">
                      <select
                        value={field.dataType}
                        onChange={(e) => { handleSchemaChange(idx, 'dataType', e.target.value); setOpenFakerDropdown(null) }}
                        className="bg-background border border-border text-foreground rounded px-3 py-2 flex-1"
                      >
                        <option value="string">string</option>
                        <option value="number">number</option>
                        <option value="boolean">boolean</option>
                        <option value="fake">Fake</option>
                      </select>
                      <Button type="button"
                        onClick={() => {
                          // Protect ONLY the default id field (index 0)
                          if (idx === 0 && field.name === "id") {
                            return toast.error("Default 'id' field cannot be deleted");
                          }

                          if (formData.schema.length <= 1) {
                            return toast.error("Keep at least 1 field");
                          }

                          setFormData({
                            ...formData,
                            schema: formData.schema.filter((_, i) => i !== idx)
                          });
                        }}
                        variant="outline" className="border-border bg-background text-red-400 hover:bg-red-500 px-2">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Faker Module Selector Logic */}
                  {field.dataType === "fake" && (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setOpenFakerDropdown(openFakerDropdown === idx ? null : idx)}
                        className="w-full bg-background border border-border text-foreground rounded px-3 py-2 text-sm flex justify-between"
                      >
                        <span>{field.fakeType || "Select module"}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      {openFakerDropdown === idx && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded shadow-lg z-50">
                          <Input
                            type="text"
                            placeholder="Search modules..."
                            value={fakeModuleSearch[idx] || ""}
                            onChange={(e) => setFakeModuleSearch({ ...fakeModuleSearch, [idx]: e.target.value })}
                            className="bg-background border-b border-border text-foreground text-sm m-2 mb-0"
                            autoFocus
                          />
                          <div className="max-h-48 overflow-y-auto">
                            {FAKER_MODULES.filter(m => m.toLowerCase().includes((fakeModuleSearch[idx] || "").toLowerCase())).map((module) => (
                              <button
                                key={module}
                                type="button"
                                onClick={() => {
                                  handleSchemaChange(idx, 'fakeType', module)
                                  setOpenFakerDropdown(null)
                                  setFakeModuleSearch({ ...fakeModuleSearch, [idx]: "" })
                                }}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-cyan-500/20"
                              >{module}</button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              <Button
                type="button"
                onClick={() => setFormData({ ...formData, schema: [...formData.schema, { name: "", dataType: "string", fakeType: "" }] })}
                variant="outline"
                className="w-full border-border bg-background text-cyan-400 hover:bg-card"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Field
              </Button>
            </div>

            <div className="bg-background p-4 rounded-lg border border-border space-y-2">
              <Label className="text-foreground font-medium">Generate Mock Data (Records)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={1000}
                  value={generateCount}
                  onChange={(e) => {
                    let value = parseInt(e.target.value)
                    if (isNaN(value)) return

                    // Free tier limit
                    if (user?.type === 'free') {
                      if (value > 100) {
                        toast.error("Maximum 100 records allowed for free tier")
                        value = 100 // clamp to 100
                      } else if (value < 1) {
                        value = 1 // prevent going below 1
                      }
                    } else {
                      // Non-free users, still clamp min/max
                      if (value < 1) value = 1
                      if (value > 1000) value = 1000
                    }
                    setGenerateCount(value)
                  }}
                  onBlur={(e) => {
                    // ensure value is valid after losing focus
                    if (generateCount < 1) setGenerateCount(1)
                  }}
                  className="bg-background border-border text-foreground w-24"
                />
                <span className="text-muted-foreground text-sm">records</span>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" onClick={onClose} variant="outline" className="flex-1">Cancel</Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Spinner className="w-4 h-4" />
                    {isEditMode ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  isEditMode ? "Update" : "Create"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    )
  )
}