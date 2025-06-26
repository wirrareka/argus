"use client"

import * as React from "react"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export type Template = {
  id: string;             // musi byt rovnake ako id sablony v rendereri
  name: string;
  image: string;
}

export const Templates = [
  {
    id: "hofat-front",
    name: "Ho FAT or.3 FRONT SIDE",
    image: "hofat-or3-front-side.png",
  },
  {
    id: "hofat-or3-side-side",
    name: "Ho FAT or.3 SIDE SIDE",
    image: "hofat-or3-side-side.png",
  }
] as Template[];

interface Props {
  selected: Template
  onChange?: (template: Template) => void
}

export function TemplateSelect({ selected, onChange }: Props) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {selected
            ? Templates.find((template) => template.id === selected.id)?.name
            : "Vyberte šablónu..."}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {Templates.map(template => (
                <CommandItem
                  key={template.id}
                  value={template.name}
                  onSelect={(currentValue) => {
                    const currentTemplate = Templates.find(t => t.name === currentValue)
                    if (onChange && currentTemplate) {
                      onChange(currentTemplate)
                    }
                    setOpen(false)
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      selected?.id === template.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {template.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
