export type WeatherDay = {
    location: string
    date: string
    temp_min: number
    temp_max: number
    wind_speed: string
    conditions: string
    icon: string
    outfit: string[]
    tip: string
}

export type WeatherAdvice = {
    days: WeatherDay[]
    general_tips: string[]
}