"use client"

import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { useBulkSelection } from "./bulk-selection.context"
import { X } from "lucide-react"
import React from "react"

interface BulkActionBarProps {
    bulkActionButtonAText?: React.ReactNode
    bulkActionButtonBText?: React.ReactNode
    bulkActionButtonCText?: React.ReactNode
    onClickButtonA?: () => void
    onClickButtonB?: () => void
    onClickButtonC?: () => void
    visibleIds?: string[]
}

export const BulkActionBar = ({
    bulkActionButtonAText,
    bulkActionButtonBText,
    bulkActionButtonCText,
    onClickButtonA,
    onClickButtonB,
    onClickButtonC,
    visibleIds = []
}: BulkActionBarProps) => {
    const { count, clear, setEnabled, selectAll, isAllSelected } = useBulkSelection()

    if (!count) return null


    const allSelected =
        visibleIds.length > 0 && isAllSelected(visibleIds)

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-md border-muted bg-muted p-3 px-4 shadow-xl"
            >
                <span className="text-xs">
                    {count} selected
                </span>

                {visibleIds.length > 0 && (
                    <Button
                        variant={allSelected ? "outline" : "outline"}
                        className="text-xs"
                        onClick={() =>
                            allSelected ? clear() : selectAll(visibleIds)
                        }
                    >
                        {allSelected ? "Clear All" : `Select All (${visibleIds.length})`}
                    </Button>
                )}

                {
                    bulkActionButtonAText && (
                        <Button variant='destructive' className="cursor-pointer text-xs" onClick={onClickButtonA}>
                            {bulkActionButtonAText}
                        </Button>
                    )
                }
                {
                    bulkActionButtonBText && (
                        <Button className="cursor-pointer text-xs" onClick={onClickButtonB}>
                            {bulkActionButtonBText}
                        </Button>
                    )
                }
                {
                    bulkActionButtonCText && (
                        <Button className="cursor-pointer text-xs" onClick={onClickButtonC}>
                            {bulkActionButtonCText}
                        </Button>
                    )
                }

                <Button
                    variant="destructive"
                    onClick={() => {
                        clear()
                        setEnabled(false)
                    }}
                >
                    <span className="text-xs">Cancel</span>
                </Button>
            </motion.div>
        </AnimatePresence>
    )
}
