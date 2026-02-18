import { useBulkSelection } from "../bulk-selection.context"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Users } from "lucide-react"
import { FieldLabel } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
// import { useBulkUpdateLeads } from "@/features/customers/hooks/use-leads"


interface Props {
    open: boolean
    onClose: () => void
}

export const BulkAssignLeadsDialog = ({ open, onClose }: Props) => {
    // const team = useTeamMembers()
    const { selectedIds, clear } = useBulkSelection()
    // const { mutateAsync, isPending } = useBulkUpdateLeads()

    const [assignee, setAssignee] = useState("")

    const onAssign = async () => {
        // if (!selectedIds.size || isPending) return

        // await mutateAsync({
        //     ids: [...selectedIds],
        //     assignedTo: assignee
        // }, {
        //     onSuccess: () => {
        //         clear()
        //         onClose()
        //     },
        //     onError: (error) => {
        //         console.log("LEAD_UPDATE_ERROR: ", error)
        //     },
        // })
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="w-sm">
                <DialogHeader className="border-b pb-4">
                    <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                        <Users className="size-5 text-primary" />
                        Assign Leads
                    </DialogTitle>
                    <DialogDescription>
                        Assign {selectedIds.size} leads to a team member.
                    </DialogDescription>
                </DialogHeader>

                {/* <div className="">
                    <FieldLabel className="mb-2">
                        <Users className="size-3.5 text-primary" /> Assign To
                    </FieldLabel>
                    <Select value={assignee} onValueChange={setAssignee}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select team member" />
                        </SelectTrigger>
                        <SelectContent>
                            {members.map(m => (
                                <SelectItem key={m.user.id} value={m.user.id}>
                                    {m.user.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div> */}

                <DialogFooter>
                    {/* <Button variant="destructive" onClick={onClose} disabled={isPending}>
                        Cancel
                    </Button> */}
                    {/* <Button onClick={onAssign} disabled={isPending || !assignee}>
                        {isPending ? <Spinner /> : <Users className="size-3.5" />}
                        {
                            isPending ? "Assigning Leads..." : "Assign Leads"
                        }
                    </Button> */}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
