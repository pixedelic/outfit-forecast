'use client'

import { type WeatherAdvice } from '@/types/advice'
import { Cloud, CloudDrizzle, CloudFog, CloudHail, CloudLightning, CloudRain, CloudRainWind, CloudSnow, CloudSun, CloudSunRain, Snowflake, Sun, SunSnow, Ban, Thermometer, Wind } from 'lucide-react'

const weatherIcons = {
    'cloud': Cloud,
    'cloud-drizzle': CloudDrizzle,
    'cloud-fog': CloudFog,
    'cloud-hail': CloudHail,
    'cloud-lightning': CloudLightning,
    'cloud-rain': CloudRain,
    'cloud-rain-wind': CloudRainWind,
    'cloud-snow': CloudSnow,
    'cloud-sun': CloudSun,
    'cloud-sun-rain': CloudSunRain,
    'snowflake': Snowflake,
    'sun': Sun,
    'sun-snow': SunSnow,
}

type WeatherAdviceProps = {
    advice: WeatherAdvice
    onClear: () => void
}
export default function WeatherAdvice({ advice, onClear }: WeatherAdviceProps) {
    return (
    <div>
       {advice.days.map((day, index) => {
            const Icon = weatherIcons[day.icon as keyof typeof weatherIcons] ?? Cloud
            const date = new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'long',
                day: 'numeric',
            })
            const averageTemp = ((day.temp_max + day.temp_min) / 2).toFixed(0)
            return (
                <div key={day.date} className="mb-8">
                    <div className="uppercase font-mono text-[0.75em] tracking-[0.2em] mb-4 mt-6 text-[var(--accent)] justify-between flex items-center">
                        <div>
                            ({index + 1}) {day.location} - {date}
                        </div>
                        { index === 0 && (
                            <button onClick={onClear} aria-label="Clear advices" className="bg-[var(--accent)] rounded-full transition-all active:scale-97 cursor-pointer text-[var(--paper)] tracking-[0] flex items-center justify-center py-2 px-4 gap-2">
                                <Ban className="w-4 h-4 stroke-[var(--paper)]" /> Clear advices 
                            </button>
                        )}
                    </div>
                    <div className="border border-[var(--rule-strong)] rounded-lg p-6 flex justify-between items-center gap-8">
                        <div className="flex items-center gap-4 mb-2 w-1/3">
                            <Icon className="w-24 h-24 text-[var(--accent)]" />
                            <div>
                                <p className="text-2xl font-bold">{day.conditions}</p>
                                <p className="text-9xl font-bold">{averageTemp}<span className="text-[var(--accent)]">°</span></p>
                            </div>
                        </div>
                        <div className="w-1/4">
                            <p className="mb-2 flex gap-2"><Thermometer className="stroke-[var(--accent)] inline-flex" />Temperature: {day.temp_min}°C - {day.temp_max}°C</p>
                            <p className="mb-2 flex gap-2"><Wind className="stroke-[var(--accent)] inline-flex" />Wind Speed: {day.wind_speed}</p>
                        </div>
                        <div className="w-5/12">
                            <p className="mb-2 text-2xl"><span className="uppercase font-mono text-sm tracking-[0.2em] mb-4 mt-6 text-[var(--accent)]">Recommended outfit:</span><br />{day.outfit.join(', ')}</p>
                            <p className="text-base text-[var(--accent)]">{day.tip}</p>
                        </div>
                    </div>
                </div>
            )
        })}
    </div>
    )
}