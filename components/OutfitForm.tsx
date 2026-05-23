'use client'
import { useState, SubmitEvent } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import ReactMarkdown from 'react-markdown'


export default function OutfitForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [advice, setAdvice] = useState<string | null>(null)

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      setError(null)
      const formData = new FormData(e.currentTarget)
      const location = formData.get('location') as string
      const startDate = formData.get('startDate') as string
      const endDate = formData.get('endDate') as string
      const response = await fetch('/api/outfit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ location, startDate, endDate }),
      })
      const data = await response.json()
      setAdvice(data.advice);
    } catch(err) {
      setError(`Something went wrong while loading: ${err}`)
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <>
      <form onSubmit={handleSubmit}>
        <Input name="location" required placeholder="Enter city or location" />
        <Input name="startDate" required type="date" className="start-period" />
        <Input name="endDate" required type="date" className="end-period" />
        <Button>{isLoading ? `Loading...` : `Send`}</Button>
      </form>

      {error && <p>{error}</p>}
			{advice && (
			<ReactMarkdown>{advice}</ReactMarkdown>
			)}
    </>
  )
}