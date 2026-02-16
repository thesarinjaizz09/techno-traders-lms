// bulk-selection.context.tsx
"use client"

import { createContext, useContext, useState, useMemo } from "react"

type BulkSelectionContextType = {
    selectedIds: Set<string>
    toggle: (id: string) => void
    selectAll: (ids: string[]) => void
    clear: () => void
    isSelected: (id: string) => boolean
    isAllSelected: (ids: string[]) => boolean
    count: number
    enabled: boolean
    setEnabled: (v: boolean) => void
}

const BulkSelectionContext =
    createContext<BulkSelectionContextType | null>(null)

export const BulkSelectionProvider = ({
    children,
}: {
    children: React.ReactNode
}) => {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [enabled, setEnabled] = useState(false)

    const toggle = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }

    const selectAll = (ids: string[]) => {
        setSelectedIds(new Set(ids))
    }

    const clear = () => setSelectedIds(new Set())

    const value = useMemo(
        () => ({
            selectedIds,
            toggle,
            selectAll,
            clear,
            isSelected: (id: string) => selectedIds.has(id),
            count: selectedIds.size,
            enabled,
            setEnabled,

            isAllSelected: (ids: string[]) =>
                ids.length > 0 && ids.every(id => selectedIds.has(id)),
        }),
        [selectedIds, enabled]
    )


    return (
        <BulkSelectionContext.Provider value={value}>
            {children}
        </BulkSelectionContext.Provider>
    )
}

export const useBulkSelection = () => {
    const ctx = useContext(BulkSelectionContext)
    if (!ctx)
        throw new Error(
            "useBulkSelection must be used inside BulkSelectionProvider"
        )
    return ctx
}
