// use-bulk-lead-dialogs.ts
"use client"

import { useState } from "react"

export type BulkDialogType = "delete" | "assign" | "update" | null

export const useBulkDialogs = () => {
    const [open, setOpen] = useState<BulkDialogType>(null)

    return {
        openDelete: () => setOpen("delete"),
        openAssign: () => setOpen("assign"),
        openUpdate: () => setOpen("update"),
        close: () => setOpen(null),
        open,
    }
}
