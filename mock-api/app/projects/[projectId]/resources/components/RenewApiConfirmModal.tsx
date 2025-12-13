"use client"
import { useEffect, useRef, useState } from "react"
import { renewKey } from "@/utilities/api/api"
import gsap from "gsap"
import { Button } from "@/components/ui/button"
import { useUser } from "@/hooks/useUser"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/shadcn-io/spinner"

interface RenewKeyConfirmModalProps {
    isOpen: boolean
    projectId: string
    onClose: () => void
    onConfirm: () => void
}

export const RenewKeyConfirmModal: React.FC<RenewKeyConfirmModalProps> = ({
    isOpen,
    projectId,
    onClose,
    onConfirm
}) => {
    const confirmModalRef = useRef<HTMLDivElement>(null)
    const confirmOverlayRef = useRef<HTMLDivElement>(null)
    const { user } = useUser()

    const [isSubmitting, setIsSubmitting] = useState(false)

    // GSAP Animation Logic
    useEffect(() => {
        const overlay = confirmOverlayRef.current
        const modal = confirmModalRef.current

        if (isOpen && modal && overlay) {
            gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.3 })
            gsap.fromTo(
                modal,
                { opacity: 0, scale: 0.95, y: -20 },
                { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" }
            )
        }
    }, [isOpen])

    const handleCloseAnimated = () => {
        if (isSubmitting) return // prevent closing while submitting
        onClose()
    }

    const handleConfirmAnimated = async () => {
        if (!user || isSubmitting) return

        try {
            setIsSubmitting(true)
            await renewKey(user.id, projectId)
            onConfirm()
        } catch (err) {
            console.error(err)
            toast.error("Failed to renew API key")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div
            ref={confirmOverlayRef}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={handleCloseAnimated}
        >
            <div
                ref={confirmModalRef}
                className="bg-card border border-border rounded-lg p-8 w-full max-w-md shadow-xl"
                onClick={(e) => e.stopPropagation()}
                style={{ opacity: 0 }}
            >
                <h2 className="text-2xl font-bold text-red-500 mb-2">
                    Renew API Key?
                </h2>

                <p className="text-muted-foreground mb-6">
                    Are you sure you want to renew your API key? This action is irreversible
                    and will invalidate the current key immediately.
                </p>

                <div className="flex gap-3 justify-end">
                    <Button
                        onClick={handleCloseAnimated}
                        variant="outline"
                        disabled={isSubmitting}
                        className="flex-1 max-w-[100px]"
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={handleConfirmAnimated}
                        disabled={isSubmitting}
                        className="flex-1 max-w-[150px] bg-red-600 text-white hover:bg-red-700 font-semibold"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center gap-2">
                                <Spinner className="w-4 h-4" />
                                Renewing...
                            </div>
                        ) : (
                            "Renew Key"
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
