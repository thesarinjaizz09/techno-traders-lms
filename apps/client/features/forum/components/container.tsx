'use client'

import { GlobalContainer } from "@/components/globals/global-views"
import { BulkSelectionProvider } from '@/components/bulk/bulk-selection.context'

export const ForumContainer = ({ children }: { children: React.ReactNode }) => {
    return (
        <BulkSelectionProvider>
            <div className="relative h-full">
                <GlobalContainer className="p-0">
                    {children}
                </GlobalContainer>
            </div>
        </BulkSelectionProvider>
    )
}