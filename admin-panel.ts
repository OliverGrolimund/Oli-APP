import { useState, useEffect } from 'react'
import { supabase, Player, Event } from '@/lib/supabase'

export default function AdminPanel() {
  const [players, setPlayers] = useState<Player[]>([])
  const [showCreateEvent, setShowCreateEvent] = useState(false)
  const [eventForm, setEventForm] = useState({
    title: '',
    location: '',
    event_date: '',
    time_from: '',
    time_to: '',
  })

  useEffect(() => {
    loadPlayers()
  }, [])

  const loadPlayers = async () => {
    const { data } = await supabase
      .from('players')
      .select('*')
      .order('nickname')
    
    setPlayers(data || [])
  }

  const togglePlayerActive = async (playerId: string, currentStatus: boolean) => {
    await supabase
      .from('players')
      .update({ is_active: !currentStatus })
      .eq('id', playerId)
    
    loadPlayers()
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await supabase
        .from('events')
        .insert([eventForm])
      
      setEventForm({
        title: '',
        location: '',
        event_date: '',
        time_from: '',
        time_to: '',
      })
      setShowCreateEvent(false)
      alert('Event erfolgreich erstellt!')
    } catch (error) {
      console.error('Error creating event:', error)
      alert('Fehler beim Erstellen des Events')
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Spielerverwaltung</h2>
        
        <div className="space-y-2">
          {players.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-md"
            >
              <div>
                <div className="font-medium text-gray-900">{player.nickname}</div>
                <div className="text-sm text-gray-600">{player.email}</div>
              </div>
              <button
                onClick={() => togglePlayerActive(player.id, player.is_active)}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  player.is_active
                    ? 'bg-success-500 text-white hover:bg-success-600'
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
              >
                {player.is_active ? 'Aktiv' : 'Blockiert'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Event erstellen</h2>
          <button
            onClick={() => setShowCreateEvent(!showCreateEvent)}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            {showCreateEvent ? 'Abbrechen' : '+ Neues Event'}
          </button>
        </div>

        {showCreateEvent && (
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titel
              </label>
              <input
                type="text"
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ort
              </label>
              <input
                type="text"
                value={eventForm.location}
                onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Datum
              </label>
              <input
                type="date"
                value={eventForm.event_date}
                onChange={(e) => setEventForm({ ...eventForm, event_date: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Von
                </label>
                <input
                  type="time"
                  value={eventForm.time_from}
                  onChange={(e) => setEventForm({ ...eventForm, time_from: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bis
                </label>
                <input
                  type="time"
                  value={eventForm.time_to}
                  onChange={(e) => setEventForm({ ...eventForm, time_to: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-success-600 hover:bg-success-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Event erstellen
            </button>
          </form>
        )}
      </div>
    </div>
  )
}