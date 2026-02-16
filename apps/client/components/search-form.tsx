import { Funnel, ListChecks, RefreshCcw, RotateCw, Search, SlidersHorizontal, X } from "lucide-react"
import { Label } from "@/components/ui/label"
import { SidebarInput } from "@/components/ui/sidebar"
import { GlobalSearchProps } from "./globals/global-views"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"
import { useBulkSelection } from "@/components/bulk/bulk-selection.context"

export function SearchForm({
  value,
  onChange,
  placeholder,
  showSelect = false,
  selectButtonText = "Filter",
  onButtonClick,
  showRefreshButton = false,
  onRefresh,
  isRefreshing,
  isFiltering,
  showBulkSelection = false
}: GlobalSearchProps) {
  const { clear, setEnabled, enabled } = useBulkSelection()

  return (
    <div className="relative flex items-center">
      {
        showBulkSelection && <Button
          variant={enabled ? "secondary" : "outline"}
          onClick={() => {
            clear()
            setEnabled(!enabled)
          }}
          className="cursor-pointer text-[13px] text-muted-foreground rounded-sm mr-2"
        >
          {enabled ? <X className="size-3.5 text-red-500" /> : <ListChecks className="size-3.5" />}
        </Button>
      }

      {showRefreshButton && <Button
        variant={isRefreshing ? "secondary" : "outline"}
        // size='icon-sm'
        className="cursor-pointer text-[12px] text-muted-foreground rounded-sm mr-2"
        onClick={onRefresh}
      >
        <RotateCw className={cn("size-3.5", isRefreshing && "animate-spin")} />
      </Button>}

      <div className="relative flex items-center space-x-2">
        <Label htmlFor="search" className="sr-only">
          Search
        </Label>

        <SidebarInput
          id="search"
          placeholder={
            placeholder
          }
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 p-3 pl-8 w-sm rounded-sm text-xs"
        />

        <Search className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 opacity-50 select-none" />
      </div>

      {showSelect && <Button
        variant={isFiltering ? "secondary" : "outline"}
        className="cursor-pointer text-[12px] text-muted-foreground rounded-sm"
        onClick={onButtonClick}
      >
        <SlidersHorizontal className="size-3.5" />
        {
          selectButtonText || "Filter"
        }
      </Button>}
    </div>
  )
}

