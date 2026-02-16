import { useState } from "react"
import { useBulkSelection } from "../bulk-selection.context"
import { LeadStatus } from "@/lib/generated/prisma/enums"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileText, Flag } from "lucide-react"
import { FieldLabel } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { useBulkUpdateLeads } from "@/features/customers/hooks/use-leads"

interface Props {
    open: boolean
    onClose: () => void
}

export const BulkUpdateLeadsDialog = ({ open, onClose }: Props) => {
    const { selectedIds, clear } = useBulkSelection()
    const { mutateAsync, isPending } = useBulkUpdateLeads()
    const [notes, setNotes] = useState<string>("")
    const [status, setStatus] = useState<LeadStatus>(LeadStatus.NEW)

    const onUpdate = async () => {
        if (!selectedIds.size || isPending) return

        await mutateAsync({
            ids: [...selectedIds],
            notes,
            status,
        }, {
            onSuccess: () => {
                clear()
                onClose()
            },
            onError: (error) => {
                console.log("LEAD_UPDATE_ERROR: ", error)
            },
        })
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="w-sm">
                <DialogHeader className="border-b pb-4">
                    <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                        <Flag className="size-5 text-primary" />
                        Edit Customers
                    </DialogTitle>
                    <DialogDescription>
                        Update details for {selectedIds.size} selected customers.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="">
                    <FieldLabel className="mb-2">
                        <Flag className="size-3.5 text-primary" /> Status
                    </FieldLabel>

                    <Select
                        value={status}
                        onValueChange={(value) => {
                            setStatus(value as LeadStatus)
                        }}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>

                        <SelectContent>
                            {Object.values(LeadStatus).map((status) => (
                                <SelectItem key={status} value={status}>
                                    {status}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <FieldLabel className="mb-2">
                        <FileText className="size-3.5 text-primary" /> Notes
                    </FieldLabel>
                    <textarea
                        placeholder="Any additional details to add…"
                        rows={4}
                        className="border rounded-md text-xs px-3 py-2 w-full bg-background border-muted h-24 font-mono focus:outline-none"
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                    />
                </div>

                <DialogFooter>
                    <Button variant="destructive" onClick={onClose} disabled={isPending}>
                        Cancel
                    </Button>
                    <Button onClick={onUpdate} disabled={isPending || !selectedIds.size || notes.length === 0 && !status}>
                        {isPending ? <Spinner /> : <Flag className="size-3.5" />}
                        {
                            isPending ? "Updating Customers..." : "Update Customers"
                        }
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    )
}
