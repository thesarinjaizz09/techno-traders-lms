import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useBulkSelection } from "../bulk-selection.context"
import { Trash, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
// import { useBulkDeleteLeads } from "@/features/customers/hooks/use-leads"

export const BulkDeleteLeadsDialog = ({ open, onClose }: {
    open: boolean
    onClose: () => void
}) => {
    const { selectedIds, clear, setEnabled } = useBulkSelection()
    // const { mutateAsync, isPending } = useBulkDeleteLeads()

    // const onDelete = async () => {
    //     if (!selectedIds.size || isPending) return

    //     await mutateAsync({
    //         ids: [...selectedIds],
    //     }, { onSuccess: () => {
    //         clear()
    //         onClose()
    //     }, onError: (error) => console.log("LEAD_DELETE_ERROR: ", error) })
    // }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="w-sm">
                <DialogHeader className="border-b pb-4">
                    <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                        <Trash className="size-5 text-primary" />
                        Delete Customers
                    </DialogTitle>
                    <DialogDescription>
                        This will permanently delete {selectedIds.size} customers.
                        This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    {/* <Button variant="secondary" onClick={onClose} disabled={isPending}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onDelete}
                        disabled={isPending || !selectedIds.size}
                    >
                        {isPending ? <Spinner /> : <Trash className="size-3.5" />}
                        {
                            isPending ? "Deleting Customers..." : "Delete Customers"
                        }
                    </Button> */}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
