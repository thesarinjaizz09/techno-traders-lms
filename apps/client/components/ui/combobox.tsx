"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"


interface ComboboxProps {
    mode: string;
    items: { value: string; label: string }[];
    span: "half" | "full" | "third" | "oneth";
    onSelect?: (selected: { value: string; label: string }) => void; // <- add this
    value?: string; // optional controlled value
}

export function Combobox({ mode, items, span, onSelect, value: controlledValue }: ComboboxProps) {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState(controlledValue || "");

    // Keep internal state in sync if controlled
    React.useEffect(() => {
        if (controlledValue !== undefined) setValue(controlledValue);
    }, [controlledValue]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "bg-[#16223B]/80 shadow-lg text-white justify-between h-[30px] font-normal text-[10px] rounded-sm transition-all duration-300 backdrop-blur-md shadow-lg shadow-[#E3B341]/10 hover:shadow-[#E3B341]/20 overflow-hidden text-ellipsis bg-[#001f11]/70 border border-green-900/40 backdrop-blur-md shadow-inner hover:shadow-[0_0_20px_rgba(0,255,100,0.05)] transition border border-gray-800",
                        span === "full" && "w-full"
                    )}
                    style={
                        span === "half"
                            ? { width: "49%" }
                            : span === "third"
                                ? { width: "65%" }
                                : span === "oneth"
                                    ? { width: "33%" }
                                    : {}
                    }
                >
                    {(value && items.find((item) => item.value === value)?.label) || mode}

                    <ChevronsUpDown className="opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent
                align="start"
                className="p-0 min-w-[var(--radix-popover-trigger-width)] w-fit bg-[#001f11]/70 border border-green-900/40 backdrop-blur-md shadow-inner hover:shadow-[0_0_20px_rgba(0,255,100,0.05)] transition border border-gray-800"
            >
                <Command className="bg-[#001f11]/70 border border-green-900/40 backdrop-blur-md shadow-inner hover:shadow-[0_0_20px_rgba(0,255,100,0.05)] transition border border-gray-800">
                    <CommandInput placeholder="Search..." className="h-9 text-[10px]" />
                    <CommandList>
                        <CommandEmpty>
                            <span className="text-[9px] text-white">No results found.</span>
                        </CommandEmpty>
                        <CommandGroup>
                            {items.map((item) => (
                                <CommandItem
                                    key={item.value}
                                    value={item.value}
                                    onSelect={(currentValue) => {
                                        setValue(currentValue === value ? "" : currentValue);
                                        setOpen(false);
                                        // Trigger parent's onSelect
                                        if (onSelect) {
                                            const selectedItem = items.find((i) => i.value === currentValue);
                                            if (selectedItem) onSelect(selectedItem);
                                        }
                                    }}
                                >
                                    {item.label}
                                    <Check
                                        className={cn(
                                            "ml-auto",
                                            value === item.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}