import React from "react";
import { AlertCircleIcon, ArrowUpRightIcon, ImportIcon, PackageOpenIcon, PlusIcon, TrashIcon } from "lucide-react";
import Link from "next/link";
import { Spinner } from "../ui/spinner";
import { cn } from "@/lib/utils";
import { SearchForm } from "../search-form";
import { Button } from "../ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../ui/empty";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardTitle } from "../ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { useBulkSelection } from "../bulk/bulk-selection.context";
import { Checkbox } from "../ui/checkbox";


// TYPES
interface StateViewProps {
    message?: string
}

interface HelperViewProps extends StateViewProps {
    view?: string
}

type GlobalEmptyProps = {
    title: string;
    description?: string;
    newButtonLabel: string;
    disabled?: boolean;
    isCreating?: boolean;
    onCreatingText?: string;
    message?: string;
    secondaryButtonLabel?: string;
    onSecondaryCreatingText?: string;
    isSecondaryCreating?: boolean;
    onNew?: () => void;
    onSecondaryNew?: () => void;
    isSecondaryDisabled?: boolean,
    dialog?: boolean;
    dialogContent?: React.ReactNode,
    open?: boolean,
    showCloseButton?: boolean,
    newButtonIcon?: React.ReactNode,
    secondaryButtonIcon?: React.ReactNode
};

type GlobalHeaderProps = {
    title: string;
    description?: string | React.ReactNode;
    newButtonLabel?: string;
    secondaryButtonLabel?: string;
    disabled?: boolean;
    isCreating?: boolean;
    isSecondaryCreating?: boolean;
    onSecondaryCreatingText?: string;
    onCreatingText?: string;
    dialog?: boolean;
    secondaryDialog?: boolean;
    dialogContent?: React.ReactNode,
    secondaryDialogContent?: React.ReactNode,
    open?: boolean,
    showCloseButton?: boolean,
    newButtonIcon?: React.ReactNode,
    secondaryButtonIcon?: React.ReactNode,
    showNewButton?: boolean,
    showSecondaryButton?: boolean,
    actions?: React.ReactNode,
    isFetching?: boolean
    onSecondaryNew?: () => void;
    isSecondaryButtonDisabled?: boolean
} & (
        | { onNew: () => void; newButtonHref?: never }
        | { newButtonHref: string; onNew?: never }
        | { onNew?: never; newButtonHref?: never }
    );

export interface GlobalSearchProps {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    showSelect?: boolean;
    selectButtonText?: string | React.ReactNode;
    onButtonClick?: () => void
    showRefreshButton?: boolean
    onRefresh?: () => void
    isRefreshing?: boolean
    isFiltering?: boolean
    showBulkSelection?: boolean
}

interface GlobalPaginationProps {
    page: number
    pageSize: number
    totalPages: number
    totalCount: number
    onPageChange: (page: number) => void
    onPageSizeChange?: (size: number) => void
    disabled?: boolean
    topic?: string
}

interface GlobalListProps<T> {
    items: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
    getKey?: (item: T, index: number) => string | number;
    emptyView?: React.ReactNode;
    className?: string
}

interface GlobalItemProps {
    id?: string;
    href?: string;
    title: string | React.ReactNode;
    icon?: React.ReactNode;
    subtitle?: React.ReactNode;
    image?: React.ReactNode;
    actions?: React.ReactNode;
    onRemove?: () => void | Promise<void>;
    isRemoving?: boolean;
    className?: string
    badge?: React.ReactNode | string
    onClick?: () => void
    banners?: React.ReactNode
}



// COMPONENTS
export const GlobalHeader = ({
    title,
    description,
    newButtonLabel,
    secondaryButtonLabel,
    disabled,
    isCreating,
    isSecondaryCreating,
    onSecondaryCreatingText,
    onNew,
    newButtonHref,
    onCreatingText,
    dialog = false,
    secondaryDialog = false,
    dialogContent,
    secondaryDialogContent,
    open,
    showCloseButton = false,
    newButtonIcon,
    secondaryButtonIcon,
    showNewButton = true,
    showSecondaryButton = false,
    actions,
    isFetching,
    onSecondaryNew,
    isSecondaryButtonDisabled = true
}: GlobalHeaderProps) => {
    return (
        <header className="mb-4 flex items-center justify-between border-b border-gray-500 pb-5">
            <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {isFetching ?
                        <span className="flex items-center justify-center gap-2">
                            <Spinner />
                            <span>Loading...</span>
                        </span>
                        : title}
                </h2>
                {description && (
                    <p className="text-[12.5px] text-muted-foreground dark:text-gray-400">
                        {isFetching ? <span className="flex items-center gap-2">
                            <Spinner />
                            <span>Loading...</span>
                        </span> : description}
                    </p>
                )}
            </div>
            <div className="flex items-center gap-2">
                {isFetching ? <div className="flex items-center gap-2">
                    <Spinner />
                    <span>Loading...</span>
                </div> : showNewButton ? newButtonLabel && (onNew || newButtonHref) && (
                    newButtonHref ? (
                        <Link
                            href={newButtonHref}
                            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50`}
                            aria-disabled={disabled || isCreating}
                        >
                            {
                                newButtonIcon ? newButtonIcon : <PlusIcon className="mr-2 h-4 w-4" />
                            }{newButtonLabel || "Action"}
                        </Link>
                    ) : (
                        dialog ?
                            <Dialog open={open}>
                                <DialogTrigger asChild>
                                    <button
                                        onClick={onNew}
                                        className={cn(`inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded-sm shadow-sm text-white bg-primary hover:bg-secondary hover:border-gray-700 hover:text-primary disabled:opacity-50 cursor-pointer`, disabled || isCreating ? 'cursor-not-allowed pointer-events-none opacity-50 bg-secondary' : '')}
                                        aria-disabled={disabled || isCreating}
                                    >
                                        {
                                            isCreating ? <><Spinner className="mr-2 " /> {onCreatingText || "Creating Workflow."}</> : <>{
                                                newButtonIcon ? newButtonIcon : <PlusIcon className="mr-2 h-4 w-4" />
                                            }{newButtonLabel}</>
                                        }
                                    </button>
                                </DialogTrigger>

                                {/* MODAL CONTENT */}
                                <DialogContent className="sm:max-w-md border border-border shadow-xl" showCloseButton={showCloseButton}>
                                    {dialogContent}
                                </DialogContent>
                            </Dialog > : <button
                                onClick={onNew}
                                className={cn(`inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded-sm shadow-sm text-white bg-primary hover:bg-secondary hover:border-gray-700 hover:text-primary disabled:opacity-50 cursor-pointer`, disabled || isCreating ? 'cursor-not-allowed pointer-events-none opacity-50 bg-secondary' : '')}
                                aria-disabled={disabled || isCreating}
                            >
                                {
                                    isCreating ? <><Spinner className="mr-2 " /> {onCreatingText || "Creating Workflow."}</> : <>{
                                        newButtonIcon ? newButtonIcon : <PlusIcon className="mr-2 h-4 w-4" />
                                    }{newButtonLabel}</>
                                }
                            </button>
                    )
                ) : actions}

                {isFetching ? <div className="flex items-center gap-2">
                    <Spinner />
                    <span>Loading...</span>
                </div> : showSecondaryButton ? secondaryButtonLabel && (
                    secondaryDialog ?
                        <Dialog open={open}>
                            <DialogTrigger asChild>
                                <button
                                    onClick={onSecondaryNew}
                                    className={cn(`inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded-sm shadow-sm text-white bg-primary hover:bg-secondary hover:border-gray-700 hover:text-primary disabled:opacity-50 cursor-pointer`, disabled || isCreating ? 'cursor-not-allowed pointer-events-none opacity-50 bg-secondary' : '')}
                                    disabled={isSecondaryButtonDisabled || disabled || isCreating}
                                >
                                    {
                                        isCreating ? <><Spinner className="mr-2 " /> {onCreatingText || "Creating Workflow."}</> : <>{
                                            newButtonIcon ? newButtonIcon : <PlusIcon className="mr-2 h-4 w-4" />
                                        }{newButtonLabel}</>
                                    }
                                </button>
                            </DialogTrigger>

                            {/* MODAL CONTENT */}
                            <DialogContent className="sm:max-w-md border border-border shadow-xl" showCloseButton={showCloseButton}>
                                {secondaryDialogContent}
                            </DialogContent>
                        </Dialog > : <button
                            onClick={onSecondaryNew}
                            className={cn(`inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded-sm shadow-sm text-white bg-secondary border-gray-700 hover:text-primary disabled:opacity-50 cursor-pointer`, disabled || isCreating ? 'cursor-not-allowed pointer-events-none opacity-50 bg-secondary' : '', isSecondaryButtonDisabled ? 'cursor-not-allowed pointer-events-none opacity-50 bg-secondary' : '')}
                            disabled={isSecondaryButtonDisabled || disabled || isCreating}
                        >
                            {
                                isSecondaryCreating ? <><Spinner className="mr-2 " /> {onSecondaryCreatingText || "Creating Workflow."}</> : <>{
                                    secondaryButtonIcon ? secondaryButtonIcon : <PlusIcon className="mr-2 h-4 w-4" />
                                }{secondaryButtonLabel}</>
                            }
                        </button>

                ) : ""}
            </div>

        </header >
    )
}

export const GlobalContainer = ({
    header,
    search,
    pagination,
    children,
    className
}: {
    header?: React.ReactNode;
    search?: React.ReactNode;
    pagination?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
}) => {
    return (
        <div className={cn("flex flex-col gap-6 bg-red border w-full h-full max-w-screen max-h-screen p-7 overflow-y-auto", className)}>
            {header && header}
            {search && search}
            {children && children}
            {pagination && pagination}
        </div>
    )
}

export const GlobalSearch = ({ value, onChange, placeholder, showSelect, selectButtonText, onButtonClick, showRefreshButton, onRefresh, isRefreshing, isFiltering, showBulkSelection }: GlobalSearchProps) => {
    return (
        <SearchForm value={value} onChange={onChange} placeholder={placeholder} showSelect={showSelect} selectButtonText={selectButtonText} onButtonClick={onButtonClick} showRefreshButton={showRefreshButton} onRefresh={onRefresh} isRefreshing={isRefreshing} isFiltering={isFiltering} showBulkSelection={showBulkSelection} />
    )
}

export const GlobalPagination = ({
    page,
    pageSize,
    totalPages,
    onPageChange,
    disabled,
    totalCount,
    topic
}: GlobalPaginationProps) => {
    const start = (page - 1) * pageSize + 1
    const end = Math.min(page * pageSize, totalCount)


    return (
        <div className="flex items-center justify-between w-full py-[6.5px] px-2 rounded-md bg-input/30 backdrop-blur-md border border-white/10 shadow-lg">

            {/* Left side */}
            <div className="flex items-center">
                <span className="text-[11.5px] tracking-wide text-muted-foreground">
                    <span className="text-[11.5px] tracking-wide text-muted-foreground">
                        Showing{" "}
                        <span className="text-white/80">
                            {totalCount === 0 ? 0 : start}
                        </span>
                        –
                        <span className="text-white/80">
                            {end}
                        </span>{" "}
                        of{" "}
                        <span className="text-white/80">
                            {totalCount.toLocaleString()}
                        </span>
                        {" "}{topic}
                    </span>

                </span>

                {/* <Select
                    value={String(pageSize)}
                    onValueChange={(val) => onPageSizeChange(Number(val))}
                >
                    <SelectTrigger className="h-8 w-[85px] bg-black/30 border-white/10 text-white text-[13px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/80 border-white/10 text-white">
                        {[5, 10, 25, 50, 100].map((size) => (
                            <SelectItem key={size} value={String(size)} className="text-white text-[13px]">
                                {size} / page
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select> */}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
                <Button
                    size="sm"
                    variant="outline"
                    disabled={page === 1 || disabled}
                    onClick={() => onPageChange(Math.max(page - 1, 1))}
                    className="
            h-6 p-0 px-5 rounded-sm 
            border-white/10 bg-white/5 text-white
            hover:bg-white/10 hover:border-white/20
            disabled:opacity-30 disabled:cursor-not-allowed
            transition-all cursor-pointer
          "
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <Button
                    size="sm"
                    variant="outline"
                    disabled={page === totalPages || totalPages === 0 || disabled}
                    onClick={() => onPageChange(Math.min(page + 1, totalPages))}
                    className="
            h-6 p-0 px-5 rounded-sm  
            border-white/10 bg-white/5 text-white
            hover:bg-white/10 hover:border-white/20
            disabled:opacity-30 disabled:cursor-not-allowed
            transition-all cursor-pointer
          "
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

export const GlobalLoadingView = ({
    view = 'items',
    message
}: HelperViewProps) => {
    return (
        <div className="w-full flex items-center justify-center h-full border rounded-md">
            <div className="flex flex-col items-center justify-center gap-2">
                <Spinner className="text-primary size-5" />
                {
                    !!message ? <p className="text-sm font-semibold text-muted-foreground">{message}</p> : <p className="text-sm font-semibold text-muted-foreground">
                        {`Loading ${view}...`}
                    </p>
                }
            </div>
        </div>
    )
}

export const GlobalErrorView = ({
    view = 'items',
    message
}: HelperViewProps) => {
    return (
        <div className="w-full flex items-center justify-center h-full border rounded-md">
            <div className="flex flex-col items-center justify-center gap-2">
                <AlertCircleIcon className="text-primary size-5" />
                {
                    !!message ? <p className="text-sm font-semibold text-muted-foreground">{message}</p> : <p className="text-sm font-semibold text-muted-foreground">
                        {`Error in ${view}...`}
                    </p>
                }
            </div>
        </div>
    )
}

export const GlobalEmptyView = ({
    onNew,
    message,
    title,
    disabled,
    isCreating,
    newButtonLabel,
    onCreatingText,
    secondaryButtonLabel,
    onSecondaryCreatingText,
    isSecondaryCreating,
    isSecondaryDisabled = true,
    dialog,
    dialogContent,
    open,
    showCloseButton = false,
    newButtonIcon,
    secondaryButtonIcon,
    onSecondaryNew
}: GlobalEmptyProps) => {
    return (
        <Empty className="border h-full">
            <EmptyHeader>
                <EmptyMedia variant="icon" className="rounded-sm">
                    <PackageOpenIcon className="size-5" />
                </EmptyMedia>
                <EmptyTitle className="text-md">{title || "No Workflows Yet"}</EmptyTitle>
                <EmptyDescription className="text-xs">
                    {
                        message || "You haven&apos;t created any workflows yet. Get started by creating your first workflow."
                    }
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                <div className="flex gap-2">
                    {
                        dialog ? <Dialog open={open}>
                            <DialogTrigger asChild>
                                <button
                                    onClick={onNew}
                                    className={cn(`inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded-sm shadow-sm text-white bg-primary hover:bg-secondary hover:border-gray-700 hover:text-primary disabled:opacity-50 cursor-pointer`, disabled || isCreating ? 'cursor-not-allowed pointer-events-none opacity-50 bg-secondary' : '')}
                                    aria-disabled={disabled || isCreating}
                                >
                                    {
                                        isCreating ? <><Spinner className="mr-2 " /> {onCreatingText || "Creating Workflow."}</> : <>{
                                            newButtonIcon ? newButtonIcon : <PlusIcon className="mr-2 h-4 w-4" />
                                        }{newButtonLabel}</>
                                    }
                                </button>
                            </DialogTrigger>

                            {/* MODAL CONTENT */}
                            <DialogContent className="sm:max-w-md border border-border shadow-xl" showCloseButton={showCloseButton}>
                                {dialogContent}
                            </DialogContent>
                        </Dialog > : <button
                            onClick={onNew}
                            className={cn(`inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded-sm shadow-sm text-white bg-primary hover:bg-secondary hover:border-gray-700 hover:text-primary disabled:opacity-50 cursor-pointer`, disabled || isCreating ? 'cursor-not-allowed pointer-events-none opacity-50 bg-secondary' : '')}
                            aria-disabled={disabled || isCreating}
                        >
                            {
                                isCreating ? <><Spinner className="mr-2 " /> {onCreatingText || "Creating Workflow."}</> : <>{
                                    newButtonIcon ? newButtonIcon : <PlusIcon className="mr-2 h-4 w-4" />
                                }{newButtonLabel}</>
                            }
                        </button>
                    }

                    <button
                        onClick={onSecondaryNew}
                        className={cn(`inline-flex items-center px-3 py-2 border border-gray-700 text-xs font-medium rounded-sm shadow-sm text-white bg-muted disabled:opacity-50 cursor-pointer hover:text-primary`, isSecondaryDisabled || isSecondaryCreating ? 'cursor-not-allowed pointer-events-none opacity-50 bg-secondary' : '')}
                        aria-disabled={isSecondaryDisabled || isSecondaryCreating}
                    >
                        {
                            isSecondaryCreating ? <><Spinner className="mr-2 " /> {onSecondaryCreatingText || "Importing Workflow."}</> :

                                isSecondaryCreating ? <>< Spinner className="mr-2 " /> {onSecondaryCreatingText || "Creating Workflow."}</> : <>{
                                    secondaryButtonIcon ? secondaryButtonIcon : <ImportIcon className="mr-2 h-4 w-4" />
                                }{secondaryButtonLabel}</>

                        }
                    </button>
                </div>
            </EmptyContent>
        </Empty >
    )
}

export function GlobalList<T>({
    items,
    renderItem,
    getKey,
    emptyView,
    className
}: GlobalListProps<T>) {
    if (items.length === 0 && emptyView) return emptyView

    return (
        <div className={cn('flex flex-col gap-2', className)}>
            {items.map((item, index) => (
                <div key={getKey ? getKey(item, index) : index}>
                    {renderItem(item, index)}
                </div>
            ))}
        </div>
    )
}

export const GlobalItem = ({
    id,
    href,
    title,
    icon,
    subtitle,
    image,
    actions,
    isRemoving,
    className,
    badge,
    onClick,
    banners
}: GlobalItemProps & { id: string }) => {
    const { enabled, isSelected, toggle } = useBulkSelection()

    return (
        <div
            aria-disabled={isRemoving}
            onClick={!enabled ? onClick : undefined}
        >
            <Card
                className={cn(
                    "border p-3 px-2 rounded-md transition-colors",
                    enabled && isSelected(id) && "border-primary/60 bg-primary/5",
                    isRemoving &&
                    "opacity-50 cursor-not-allowed pointer-events-none",
                    onClick && !enabled && "cursor-pointer",
                    className
                )}
            >
                <CardContent className="flex items-center justify-between p-0">
                    <div className="flex items-center gap-3">
                        {/* BULK SELECT */}
                        {enabled && (
                            <Checkbox
                                checked={isSelected(id)}
                                onCheckedChange={() => toggle(id)}
                                onClick={e => e.stopPropagation()}
                            />
                        )}

                        {icon || image}

                        <div>
                            <CardTitle className="flex gap-2 items-center text-[14px] font-semibold">
                                <span>{title}</span>
                                {badge}
                            </CardTitle>

                            {subtitle && (
                                <CardDescription className="text-[11.5px]">
                                    {subtitle}
                                </CardDescription>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {banners && (
                            <div className="flex items-center gap-1">
                                {banners}
                            </div>
                        )}

                        {actions && !enabled && (
                            <div className="flex items-center gap-2">
                                {actions}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export const GlobalButton = ({
    children,
    onClick,
    disabled,
    className
}: {
    children: React.ReactNode
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
    disabled?: boolean
    className?: string
}) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                'flex items-center justify-center text-white disabled:text-muted-foreground',
                'disabled:cursor-not-allowed',
                className,
                'transition duration-200 hover:text-primary/80 active:text-primary/70',
            )}
        >
            {children}
        </button>
    )
}