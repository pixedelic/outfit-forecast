import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
    const { location, lat, lon, startDateStr, endDateStr, wardrobe, style } = await request.json()

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
        const geoData = await geoResponse.json()
        if (!geoData.results?.length) {
            return Response.json({ error: 'Location not found' }, { status: 404 })
        }
        ;({ latitude, longitude, name, country } = geoData.results[0])
    }

    const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max&start_date=${startDateStr}&end_date=${endDateStr}&timezone=auto`
    )
    const weatherData = await weatherResponse.json()

    const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [
        {
            role: 'user',
            content: `Based on the following weather forecast for ${name}, ${country}, return a JSON object with this exact structure and suggest outfits for a ${wardrobe} wardrobe in a ${style} style:
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
        return Response.json({ error: 'Unexpected response' }, { status: 500 })
    }

    return Response.json({ advice: content.text })
}