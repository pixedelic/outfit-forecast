'use client'

import { type NominatimResult } from '@/types/location'
import { MapPin } from 'lucide-react'

type LocationSuggestionsProps = {
    suggestions: NominatimResult[]
    onSelect: (suggestion: NominatimResult) => void
}
export default function LocationSuggestions({ suggestions, onSelect }: LocationSuggestionsProps) {
  return (
    <ul id="location-wrapper" className="absolute top-full left-0 w-full bg-white border border-[var(--ink)] z-10 rounded-b-md overflow-auto max-h-[250px] shadow-[0_16px_36px_-12px_#18160f4d,_0_2px_0_var(--accent)]">
      {suggestions.map((suggestion) => {
        const locationParts = suggestion.display_name.split(', ')
        return (
          <li 
            key={suggestion.place_id} 
            onClick={() => onSelect(suggestion)}
            onKeyDown={(e) => e.key === 'Enter' && onSelect(suggestion)}
            tabIndex={0}
            role="option"
            aria-selected="false"
            className="px-4 py-2 cursor-pointer hover:bg-[var(--accent-light)] focus:bg-[var(--accent-light)] focus-visible:bg-[var(--accent-light)] text-sm truncate bottom-border"
          >
            <span className="flex items-center relative">
              <MapPin className="inline-block mr-2 text-[var(--muted-foreground)] me-4 shrink-0 h-5 w-5" />
              <span className="flex flex-col text-lg max-w-xs">
                <span className="text-[var(--foreground)] font-bold">{locationParts[0]}</span>
                <span className="font-mono text-[0.65em] uppercase tracking-[0.125em] overflow-hidden text-ellipsis">{locationParts[1] + ", " + locationParts[2]}</span>
              </span>
              <span className="font-mono uppercase tracking-[0.125em] justify-self-end ml-auto self-end flex-col flex text-right self-stretch justify-end gap-1">
                <span className="text-[0.75em]">
                  {locationParts[-1] || locationParts[locationParts.length - 1] || ''}
                </span>
                <span className="text-[0.65em]">
                  {parseFloat(suggestion.lat).toFixed(2)}, {parseFloat(suggestion.lon).toFixed(2)}
                </span>
              </span>
            </span>
          </li>
        )
      })}
    </ul>
  )
}