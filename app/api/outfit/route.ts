import Anthropic from '@anthropic-ai/sdk'
import { type WeatherAdvice } from '@/types/advice'

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
})

type OutfitRequest = {
    location?: string
    lat?: string | null
    lon?: string | null
    startDateStr?: string
    endDateStr?: string
    wardrobe?: string
    style?: string
}

function errorResponse(error: string, status: number) {
    return Response.json({ error }, { status })
}

function isWeatherAdvice(value: unknown): value is WeatherAdvice {
    if (!value || typeof value !== 'object') return false

    const advice = value as WeatherAdvice
    return (
        Array.isArray(advice.days) &&
        advice.days.every((day) => (
            typeof day.location === 'string' &&
            typeof day.date === 'string' &&
            typeof day.temp_min === 'number' &&
            typeof day.temp_max === 'number' &&
            typeof day.wind_speed === 'string' &&
            typeof day.conditions === 'string' &&
            typeof day.icon === 'string' &&
            Array.isArray(day.outfit) &&
            day.outfit.every((item) => typeof item === 'string') &&
            typeof day.tip === 'string'
        )) &&
        Array.isArray(advice.general_tips) &&
        advice.general_tips.every((tip) => typeof tip === 'string')
    )
}

function parseAdvice(text: string) {
    try {
        const advice = JSON.parse(text)
        return isWeatherAdvice(advice) ? advice : null
    } catch {
        return null
    }
}

export async function POST(request: Request) {
    try {
        if (!process.env.ANTHROPIC_API_KEY) {
            return errorResponse('Missing Anthropic API key', 500)
        }

        const body = await request.json() as OutfitRequest
        const { location, lat, lon, startDateStr, endDateStr, wardrobe, style } = body

        if (!location || !startDateStr || !endDateStr) {
            return errorResponse('Missing required forecast details', 400)
        }

        let latitude: string, longitude: string, name: string, country: string

        if (lat && lon) {
            latitude = lat
            longitude = lon
            name = location.split(', ')[0]
            country = ''
        } else {
            const geoResponse = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`
            )
            if (!geoResponse.ok) {
                return errorResponse('Could not search for that location', 502)
            }

            const geoData = await geoResponse.json()
            if (!geoData.results?.length) {
                return errorResponse('Location not found', 404)
            }
            ;({ latitude, longitude, name, country } = geoData.results[0])
        }

        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max&start_date=${startDateStr}&end_date=${endDateStr}&timezone=auto`
        )
        if (!weatherResponse.ok) {
            return errorResponse('Could not load the weather forecast', 502)
        }

        const weatherData = await weatherResponse.json()
        if (!weatherData.daily) {
            return errorResponse('Weather forecast data was incomplete', 502)
        }

        const message = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        messages: [
            {
                role: 'user',
                content: `Based on the following weather forecast for ${name}, ${country}, return a JSON object with this exact structure and suggest outfits for a ${wardrobe ?? 'unisex'} wardrobe in a ${style ?? 'casual'} style:
    {
    "days": [
        {
        "location": "${name}",
        "date": "YYYY-MM-DD",
        "temp_min": number,
        "temp_max": number,
        "wind_speed": string in the format "X km/h",
        "conditions": "brief weather description, less than 30 characters",
        "icon": "one of: cloud, cloud-drizzle, cloud-fog, cloud-hail, cloud-lightning, cloud-rain, cloud-rain-wind, cloud-snow, cloud-sun, cloud-sun-rain, snowflake, sun, sun-snow",
        "outfit": ["item1", "item2", "item3"],
        "tip": "one practical tip for the day"
        }
    ],
    "general_tips": ["tip1", "tip2"]
}

Weather data:
${JSON.stringify(weatherData.daily, null, 2)}

Dates: from ${startDateStr} to ${endDateStr}

Return only valid JSON, no markdown, no explanation.`,
                },
            ],
        })

        const content = message.content[0]
        if (content.type !== 'text') {
            return errorResponse('Unexpected AI response', 500)
        }

        const advice = parseAdvice(content.text)
        if (!advice) {
            return errorResponse('The AI response was not valid. Please try again.', 502)
        }

        return Response.json({ advice })
    } catch (error) {
        console.error(error)
        return errorResponse('Something went wrong while preparing your forecast', 500)
    }
}
