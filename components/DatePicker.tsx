'use client'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { X } from 'lucide-react'

type DatePickerProps = {
    value: Date | undefined
    onChange: (date: Date | undefined) => void
    label: string
    minDate: Date
    maxDate: Date
    disabled?: boolean
}
export default function DatePicker({
    value,
    onChange,
    label,
    minDate,
    maxDate,
    disabled
}: DatePickerProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <div className="flex items-center gap-2">
                    <button 
                        type="button"
                        className="p-0 border-0 text-3xl text-left w-full focus:outline-none"
                        disabled={disabled}
                        aria-label={label}>
                            {value ? format(value, 'MMM d, yyyy') : <span className="text-muted-foreground">Pick a date</span>}
                    </button>
                    {value && (
                        <button 
                            type="button" 
                            onClick={() => onChange(undefined)}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={value}
                    onSelect={onChange}
                    disabled={(date) => date < minDate || date > maxDate}
                />
            </PopoverContent>
        </Popover>
    )
}
