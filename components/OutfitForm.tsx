'use client'
import { useState, SubmitEvent, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ArrowRight, LoaderCircle } from 'lucide-react'
import LocationSuggestions from '@/components/LocationSuggestions'
import { type NominatimResult } from '@/types/location'
import DatePicker from '@/components/DatePicker'
import WeatherAdvice from '@/components/WeatherAdvice'
import { type WeatherAdvice as WeatherAdviceType } from '@/types/advice'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function OutfitForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [errorLocation, setErrorLocation] = useState<string | null>(null)
  const [errorDate, setErrorDate] = useState<string | null>(null)
  const [errorLoading, setErrorLoading] = useState<string | null>(null)
  const [advice, setAdvice] = useState<WeatherAdviceType | null>(null)
  const today = new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
  })
  const [location, setLocation] = useState('')
  const [lat, setLat] = useState<string | null>(null)
  const [lon, setLon] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()
  const currentDate = new Date()
  const maxDate = new Date()
  maxDate.setDate(currentDate.getDate() + 16)
  const [wardrobe, setWardrobe] = useState('unisex')
  const [style, setStyle] = useState('casual')

  const fetchSuggestions = async (value: string) => {
      setLocation(value)
      if (value.length < 2) {
          setSuggestions([])
          return
      }
      const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&limit=10`
      )
      const data = await response.json()
      setSuggestions(data)
      setShowSuggestions(true)
  }

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const location = formData.get('location') as string
    if (!location) { setErrorLocation('Select a destination'); return }
    if (!startDate) { setErrorDate('Select a start date'); return }

    const start = new Date(startDate)
    const maxDate = new Date()
    maxDate.setDate(currentDate.getDate() + 16)

    if (start > maxDate) {
        setErrorLoading('Forecast is only available for the next 16 days.')
        return
    }
      
    try {
      setIsLoading(true)
      setErrorLocation(null)
      setErrorDate(null)
      setErrorLoading(null)
      const formatDate = (date: Date) => {
        const y = date.getFullYear()
        const m = String(date.getMonth() + 1).padStart(2, '0')
        const d = String(date.getDate()).padStart(2, '0')
        return `${y}-${m}-${d}`
      }
      const startDateStr = formatDate(startDate)
      const endDateStr = endDate ? formatDate(endDate) : startDateStr

      const response = await fetch('/api/outfit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ location, lat, lon, startDateStr, endDateStr, wardrobe, style })
      })

      if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Something went wrong')
      }

      const data = await response.json()
      setAdvice(JSON.parse(data.advice))
    } catch(err) {
      setErrorLoading(`Something went wrong while loading: ${err}`)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement
        if (!target.closest('#location-wrapper')) {
            setShowSuggestions(false)
        }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-7">
      <div className="w-full max-w-[1480px] gap-4 flex flex-col min-h-screen pb-4">
        <header className="font-mono text-[0.65em] uppercase tracking-[0.125em] py-5 border-be flex justify-between text-[var(--ink-soft)] items-center">
          <span><span className="relative inline-flex size-2 me-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent"></span>
            <span className="relative inline-flex size-2 rounded-full bg-accent"></span>
          </span>Live forecast desk</span>
          <span className="rounded-full me-2 bg-[var(--paper)] border border-[var(--rule-strong)] px-2 py-1">A Pixedelic Project</span>
          <span>{today}</span>
        </header>
        <div className="flex py-7 justify-between">
          <h1 className="text-[clamp(64px,11vw,168px)] text-gray-900 leading-[0.88]">
            Wear <span className="text-accent font-bold">u</span><br />going<span className="text-accent font-bold">?</span>
          </h1>
          <p className="max-w-[36ch] self-end">
            A weather-aware <strong>outfit dossier</strong>. Type where you&apos;re going, pick the days, get a styled look the sky won&apos;t ruin.
          </p>
        </div>
        <form className="grid grid-cols-[1fr_auto] border-y border-current/30" onSubmit={handleSubmit}>
          <div className="text-sm text-[var(--ink-soft)] relative border-current/30">
            <div className="grid grid-cols-[2fr_1fr_1fr] text-sm text-[var(--ink-soft)] relative border-current/30 divide-x">
              <div className="relative text-sm text-[var(--ink-soft)] p-5 border-current/30 ">
                <Label htmlFor="location" className="uppercase font-mono text-[0.75em] tracking-[0.2em] mb-4">
                  <span className="w-5 h-5 bg-black rounded-full flex items-center justify-center text-white">1</span>{errorLocation ? <span className="text-red-500">{errorLocation}</span> : "Where"}<sup>(*)</sup>
                </Label>
                <Input 
                  name="location" 
                  id="location" 
                  value={location}
                  onChange={(e) => fetchSuggestions(e.target.value)}
                  autoComplete="off"
                  placeholder="Enter city or location" 
                  className="p-0 border-0 rounded-none text-3xl! focus:outline-none focus:ring-0!" 
                />
                {showSuggestions && (
                    <LocationSuggestions
                        suggestions={suggestions}
                        onSelect={(suggestion) => {
                            setLocation(suggestion.display_name)
                            setLat(suggestion.lat)
                            setLon(suggestion.lon)
                            setShowSuggestions(false)
                        }}
                    />
                )}
              </div>
              <div className="text-[var(--ink-soft)] p-5 border-current/30">
                <Label htmlFor="startDate" className="uppercase font-mono text-[0.75em] tracking-[0.2em] mb-4">
                  <span className="w-5 h-5 bg-black rounded-full flex items-center justify-center text-white">2</span>{errorDate ? <span className="text-red-500">{errorDate}</span> : "From"}<sup>(*)</sup>
                </Label>
                <DatePicker
                  value={startDate}
                  onChange={setStartDate}
                  label="From"
                  minDate={currentDate}
                  maxDate={maxDate}
                />
              </div>
              <div className={"text-[var(--ink-soft)] p-5" + (!startDate ? " opacity-20" : "")}>
                <Label htmlFor="endDate" className="uppercase font-mono text-[0.75em] tracking-[0.2em] mb-4">
                  <span className="w-5 h-5 bg-black rounded-full flex items-center justify-center text-white">3</span>Until
                </Label>
                <DatePicker
                    value={endDate}
                    onChange={setEndDate}
                    label="Until"
                    minDate={startDate ?? currentDate}
                    maxDate={maxDate}
                    disabled={!startDate}
                />
              </div>
            </div>
            <div className="grid grid-cols-[1fr_1fr] text-[var(--ink-soft)] relative border-current/30 divide-x border-t">
              <div className="text-[var(--ink-soft)] p-5 border-current/30 flex gap-4">
                <Label className="uppercase font-mono text-[0.75em] tracking-[0.2em] mb-4">
                  <span className="w-5 h-5 bg-black rounded-full flex items-center justify-center text-white">4</span>Wardrobe
                </Label>
                <Select value={wardrobe} onValueChange={setWardrobe}>
                  <SelectTrigger className="p-0 border-0 rounded-none focus:outline-none focus:ring-0! h-auto shadow-none self-end text-3xl! ">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unisex" className="text-xl! focus:bg-[var(--paper)]">Unisex</SelectItem>
                    <SelectItem value="women" className="text-xl! focus:bg-[var(--paper)]">Women&apos;s</SelectItem>
                    <SelectItem value="men" className="text-xl! focus:bg-[var(--paper)]">Men&apos;s</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-[var(--ink-soft)] p-5 flex gap-4">
                <Label className="uppercase font-mono text-[0.75em] tracking-[0.2em] mb-4">
                  <span className="w-5 h-5 bg-black rounded-full flex items-center justify-center text-white">5</span>Style
                </Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger className="p-0 border-0 rounded-none focus:outline-none focus:ring-0! h-auto shadow-none self-end text-3xl! ">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casual" className="text-xl! focus:bg-[var(--paper)]">Casual</SelectItem>
                    <SelectItem value="smart-casual" className="text-xl! focus:bg-[var(--paper)]">Smart Casual</SelectItem>
                    <SelectItem value="elegant" className="text-xl! focus:bg-[var(--paper)]">Elegant</SelectItem>
                    <SelectItem value="formal" className="text-xl! focus:bg-[var(--paper)]">Formal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div />
            </div>
          </div>
          <Button className="h-full rounded-none border-none hover:bg-accent/90 disabled:bg-accent/90 disabled:opacity-100 cursor-pointer w-full px-7 gap-2 text-base" type="submit" disabled={isLoading}>
            <span className="inline-flex flex-col leading-[0] text-xl">
              <span className={`relative inline-flex` + (!isLoading && ` invisible`)}>Loading...</span>
              <span className={`relative inline-flex` + (isLoading && ` invisible`)}>Style my Forecast</span>
            </span>
            <LoaderCircle className={`animate-spin ` + (!isLoading && ` invisible`)} />
            <ArrowRight className={`` + (isLoading && ` invisible`)} />
          </Button>
        </form>

        {errorLoading && <p className="text-red-500 text-sm mt-2">{errorLoading}</p>}
        {advice && !isLoading && (
          <WeatherAdvice 
            advice={advice} 
            onClear={() => {
                setAdvice(null)
                setLocation('')
                setLat(null)
                setLon(null)
                setStartDate(undefined)
                setEndDate(undefined)
                setErrorLocation(null)
                setErrorDate(null)
                setErrorLoading(null)
            }}
        />
        )}
        <footer className="font-mono text-[0.65em] uppercase tracking-[0.125em] p-5 border-be border-current/30 flex justify-between text-[var(--ink-soft)] items-center bg-[var(--primary)] rounded-lg text-[var(--paper)] mt-auto">
          <span>© Pixedelic · 2026</span>
          <span>No trends. No influencers. Just the sky.</span>
        </footer>
      </div>
    </div>
  )
}