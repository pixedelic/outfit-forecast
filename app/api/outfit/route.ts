import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
    const { location, startDate, endDate } = await request.json()

    // 1. Chiama Open Meteo per geocodificare la città
    const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`
    )
    const geoData = await geoResponse.json()

    if (!geoData.results?.length) {
        return Response.json({ error: 'Location not found' }, { status: 404 })
    }

    const { latitude, longitude, name, country } = geoData.results[0]

    // 2. Chiama Open Meteo per i dati meteo
    const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max&start_date=${startDate}&end_date=${endDate}&timezone=auto`
    )
    const weatherData = await weatherResponse.json()

    // 3. Chiama Claude
    const message = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        messages: [
            {
                role: 'user',
                content: `Based on the following weather forecast for ${name}, ${country}, suggest what to wear each day. Be practical and specific.

Weather data:
${JSON.stringify(weatherData.daily, null, 2)}

Dates: from ${startDate} to ${endDate}`,
            },
        ],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
        return Response.json({ error: 'Unexpected response' }, { status: 500 })
    }

    return Response.json({ advice: content.text })
}