/**
 * Improved Drawing Participation Page with Number Slots System
 * 
 * This route uses the advanced NumberGrid component with virtual scrolling,
 * efficient slot management, and real-time status updates.
 * 
 * Features:
 * - Virtual scrolling for large number grids (handles 1000+ numbers efficiently)
 * - Real-time slot status updates (available, reserved, taken)
 * - Temporary reservations with expiration
 * - Responsive grid layout
 * - Better UX with loading states and visual feedback
 */

import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { NumberGrid } from '@/components/NumberGrid'
import type { DrawingStats } from '@/lib/number-slots'

export const Route = createFileRoute('/slot/$drawingId')({
  component: SlotDrawingParticipation,
})

interface Drawing {
  id: string
  title: string
  guidelines: string[] | null
  isPaid: boolean
  price: number
  winnerSelection: 'random' | 'number'
  quantityOfNumbers: number
  endAt: string
  createdAt: string
}

function SlotDrawingParticipation() {
  const { drawingId } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [selectedNumber, setSelectedNumber] = useState<number | null>(null)
  const [isReserving, setIsReserving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  })

  // Fetch drawing details
  const { data: drawing, isLoading: drawingLoading } = useQuery<Drawing>({
    queryKey: ['public-drawing', drawingId],
    queryFn: async () => {
      const response = await fetch(`/api/drawings/${drawingId}`)
      if (!response.ok) throw new Error('Failed to fetch drawing')
      return response.json()
    },
  })

  // Fetch drawing statistics
  const { data: stats } = useQuery<DrawingStats>({
    queryKey: ['drawing-stats', drawingId],
    queryFn: async () => {
      const response = await fetch(`/api/drawings/${drawingId}/stats`)
      if (!response.ok) throw new Error('Failed to fetch stats')
      return response.json()
    },
    enabled: !!drawing && drawing.winnerSelection === 'number',
    refetchInterval: 10000, // Refresh every 10 seconds
  })

  // Handle number selection with reservation
  const handleNumberSelect = async (number: number) => {
    if (isReserving) return

    setIsReserving(true)
    try {
      // Reserve the number temporarily (15 minutes)
      const response = await fetch(`/api/drawings/${drawingId}/reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number, expirationMinutes: 15 }),
      })

      if (response.ok) {
        const data = await response.json()
        setSelectedNumber(number)

        // Show expiration warning
        const expiresAt = new Date(data.expiresAt)
        const minutes = Math.floor((expiresAt.getTime() - Date.now()) / 60000)
        alert(`Number ${number} reserved for ${minutes} minutes. Please complete your registration.`)

        // Invalidate slots cache to show updated status
        queryClient.invalidateQueries({ queryKey: ['number-slots', drawingId] })
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to reserve number')
      }
    } catch (error) {
      console.error('Error reserving number:', error)
      alert('An error occurred while reserving the number')
    } finally {
      setIsReserving(false)
    }
  }

  // Submit registration mutation
  const participateMutation = useMutation({
    mutationFn: async (data: typeof formData & { selectedNumber?: number }) => {
      const response = await fetch(`/api/drawings/${drawingId}/participate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to register')
      }

      return response.json()
    },
    onSuccess: () => {
      alert('Successfully registered for the drawing!')
      queryClient.invalidateQueries({ queryKey: ['number-slots', drawingId] })
      queryClient.invalidateQueries({ queryKey: ['drawing-stats', drawingId] })
      navigate({ to: '/' })
    },
    onError: (error: Error) => {
      alert(error.message)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const registrationData = {
      ...formData,
      selectedNumber: drawing?.winnerSelection === 'number' ? selectedNumber ?? undefined : undefined,
    }

    participateMutation.mutate(registrationData)
  }

  // Loading state
  if (drawingLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="p-6 bg-slate-800/50 border-slate-700">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
              <p className="text-white ml-4">Loading drawing...</p>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // Drawing not found
  if (!drawing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="p-6 bg-slate-800/50 border-slate-700">
            <p className="text-white text-center text-xl">Drawing not found</p>
            <div className="text-center mt-4">
              <Button onClick={() => navigate({ to: '/' })} className="bg-cyan-600 hover:bg-cyan-700">
                Go Home
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Drawing Details Card */}
        <Card className="p-6 bg-slate-800/50 border-slate-700">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{drawing.title}</h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
                <div>
                  <p className="text-gray-400 mb-2">
                    <strong className="text-white">Type:</strong>{' '}
                    {drawing.isPaid ? (
                      <span className="text-yellow-400">Paid - ${(drawing.price / 100).toFixed(2)}</span>
                    ) : (
                      <span className="text-green-400">Free</span>
                    )}
                  </p>
                  <p className="text-gray-400 mb-2">
                    <strong className="text-white">Selection Method:</strong>{' '}
                    {drawing.winnerSelection === 'random' ? 'Random Selection' : 'Number Selection'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 mb-2">
                    <strong className="text-white">End Date:</strong>{' '}
                    {new Date(drawing.endAt).toLocaleString()}
                  </p>
                  {drawing.winnerSelection === 'number' && stats && (
                    <p className="text-gray-400 mb-2">
                      <strong className="text-white">Availability:</strong>{' '}
                      <span className="text-cyan-400">
                        {stats.available} / {stats.total} available
                      </span>
                      {' '}
                      <span className="text-gray-500">
                        ({stats.percentageTaken}% taken)
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {drawing.guidelines && drawing.guidelines.length > 0 && (
                <div className="mt-4 p-4 bg-slate-700/50 rounded-lg">
                  <strong className="text-white block mb-2">Guidelines:</strong>
                  <ul className="list-disc list-inside text-gray-300 space-y-1">
                    {drawing.guidelines.map((guideline, index) => (
                      <li key={index}>{guideline}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Number Selection Grid (only for number-based drawings) */}
        {drawing.winnerSelection === 'number' && (
          <Card className="p-6 bg-slate-800/50 border-slate-700">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-white mb-2">Select Your Number</h2>
              {selectedNumber ? (
                <div className="flex items-center gap-4 p-4 bg-cyan-900/30 rounded-lg border border-cyan-700">
                  <p className="text-white font-medium">
                    Selected Number: <span className="text-cyan-400 text-2xl font-bold">{selectedNumber}</span>
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedNumber(null)}
                    className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
                  >
                    Change Number
                  </Button>
                </div>
              ) : (
                <p className="text-gray-400">
                  Click on an available number to select it. Green numbers are available.
                </p>
              )}
            </div>

            <NumberGrid
              drawingId={drawingId}
              totalNumbers={drawing.quantityOfNumbers}
              onNumberSelect={handleNumberSelect}
              isSelectable={!selectedNumber && !isReserving}
              className="bg-slate-900/50"
            />

            {isReserving && (
              <div className="mt-4 text-center text-gray-400">
                <div className="inline-flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-500"></div>
                  Reserving number...
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Registration Form */}
        <Card className="p-6 bg-slate-800/50 border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-4">
            {drawing.winnerSelection === 'number' ? 'Confirm Your Registration' : 'Register for Drawing'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-white">
                Full Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Enter your full name"
                className="bg-slate-700 text-white border-slate-600 focus:border-cyan-500"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-white">
                Email (Optional)
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
                className="bg-slate-700 text-white border-slate-600 focus:border-cyan-500"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-white">
                Phone Number *
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                placeholder="+1 (555) 000-0000"
                className="bg-slate-700 text-white border-slate-600 focus:border-cyan-500"
              />
            </div>

            {drawing.isPaid && (
              <div className="p-4 bg-yellow-900/30 rounded-lg border border-yellow-700">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="text-yellow-200 font-medium">Payment Required</p>
                    <p className="text-yellow-100 text-sm mt-1">
                      This is a paid event. After registration, you will need to complete the payment
                      and upload proof. Your number will be reserved during this process.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/' })}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  participateMutation.isPending ||
                  (drawing.winnerSelection === 'number' && !selectedNumber)
                }
                className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                {participateMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Registering...
                  </span>
                ) : (
                  'Complete Registration'
                )}
              </Button>
            </div>
          </form>
        </Card>

        {/* Help/Info Section */}
        <Card className="p-4 bg-slate-800/30 border-slate-700">
          <div className="flex items-start gap-3 text-sm text-gray-400">
            <svg
              className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-white font-medium mb-1">How it works:</p>
              <ul className="space-y-1">
                {drawing.winnerSelection === 'number' ? (
                  <>
                    <li>• Select an available number from the grid (shown in green)</li>
                    <li>• Your number will be reserved for 15 minutes</li>
                    <li>• Complete the registration form with your details</li>
                    {drawing.isPaid && <li>• Upload payment proof to confirm your participation</li>}
                    <li>• Wait for the drawing date to see if you win!</li>
                  </>
                ) : (
                  <>
                    <li>• Fill out the registration form with your details</li>
                    {drawing.isPaid && <li>• Upload payment proof to confirm your participation</li>}
                    <li>• The winner will be selected randomly on the drawing date</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
