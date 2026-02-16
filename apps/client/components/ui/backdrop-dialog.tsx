import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogOverlay,
    DialogTrigger,
} from "@/components/ui/dialog"
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog"

interface BackdropDialogProps {
    open?: boolean            // external controlled mode
    children?: React.ReactNode
    trigger?: React.ReactNode // trigger mode
    onOpenChange?: (open: boolean) => void
}


const BackdropDialog = ({ open, children, trigger, onOpenChange }: BackdropDialogProps) => {
    const isControlled = typeof open === "boolean"

    return (
        <Dialog open={isControlled ? open : undefined} onOpenChange={onOpenChange}>
            {/* Trigger mode (uncontrolled) */}
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

            {open && <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-xl" />}

            <DialogContent className="sm:max-w-md border border-border shadow-xl max-h-[650px] overflow-y-auto scrollbar-none" showCloseButton={!open}>
                
                {children}
            </DialogContent>
        </Dialog>
    )
}

export default BackdropDialog
