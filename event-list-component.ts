import { useState, useEffect } from 'react'
import { supabase, Event, EventResponse, Utensil } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

export default function EventList() {
  const [events, setEvents] = useState<Event[]>([])
  const [responses, setResponses] = useState<Record<string, EventResponse>>({})
  const [utensils, setUtensils] = useState<Utensil[]>([])
  const [loading, setLoading] = useState(true)
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Events laden
      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true })

      // Responses laden
      const { data: responsesData } = await supabase
        .from('event_responses')
        .select(`
          *,
          player:players(*),
          response_utensils(*, utensil:utensils(*))
        `)

      // Utensilien laden
      const { data: utensilsData } = await supabase
        .from('utensils')
        .select('*')

      setEvents(eventsData || [])
      
      // Responses in Map umwandeln für schnellen Zugriff
      const responsesMap: Record<string, EventResponse> = {}
      responsesData?.forEach((resp) => {
        if (resp.player_id === user?.id) {
          responsesMap[resp.event_id] = resp
        }
      })
      setResponses(responsesMap)
      
      setUtensils(utensilsData || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResponse = async (eventId: string, type: 'zusage' | 'absage') => {
    if (!user) return

    try {
      const existingResponse = responses[eventId]

      if (existingResponse) {
        // Update
        await supabase
          .from('event_responses')
          .update({ response_type: type })
          .eq('id', existingResponse.id)
      } else {
        // Insert
        await supabase
          .from('event_responses')
          .insert({
            event_id: eventId,
            player_id: user.id,
            response_type: type,
          })
      }

      await loadData()
    } catch (error) {
      console.error('Error updating response:', error)
    }
  }

  const getResponseCount = (eventId: string) => {
    return responses[eventId] ? 1 : 0
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {events.map((event) => {
        const myResponse = responses[event.id]
        const isZusage = myResponse?.response_type === 'zusage'
        const isAbsage = myResponse?.response_type === 'absage'

        return (
          <div key={event.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                <p className="text-gray-600 mt-1">
                  📍 {event.location}
                </p>
                <p className="text-gray-600">
                  📅 {format(new Date(event.event_date), 'dd.MM.yyyy', { locale: de })}
                </p>
                <p className="text-gray-600">
                  🕐 {event.time_from} - {event.time_to}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary-600">
                  {getResponseCount(event.id)}
                </div>
                <div className="text-sm text-gray-500">Teilnehmer</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleResponse(event.id, 'zusage')}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  isZusage
                    ? 'bg-success-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-success-100'
                }`}
              >
                ✓ Zusage
              </button>
              <button
                onClick={() => handleResponse(event.id, 'absage')}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  isAbsage
                    ? 'bg-danger-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-danger-100'
                }`}
              >
                ✗ Absage
              </button>
            </div>

            {myResponse && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  <strong>Utensilien:</strong>
                  <div className="flex gap-2 mt-2">
                    {utensils.map((utensil) => (
                      <span
                        key={utensil.id}
                        className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                      >
                        {utensil.icon} {utensil.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}

      {events.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Noch keine Events vorhanden
        </div>
      )}
    </div>
  )
}