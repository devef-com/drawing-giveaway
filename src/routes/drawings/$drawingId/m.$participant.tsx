import { Asset, Participant as BaseParticipant } from '@/db/schema'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import type { ParticipantStatus } from '@/lib/participants'
import { Card } from '@/components/ui/card'
import { AlertCircleIcon, ImageIcon } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { ParticipantComments } from '@/components/ParticipantComments'

export const Route = createFileRoute('/drawings/$drawingId/m/$participant')({
  component: RouteComponent,
})

type Participant = BaseParticipant & { numbers: number[] }

function RouteComponent() {
  const { t } = useTranslation()
  const { participant: participantId, drawingId } = Route.useParams()
  const navigate = useNavigate()
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [selectedStatus, setSelectedStatus] =
    useState<ParticipantStatus>('pending')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showImageModal, setShowImageModal] = useState(false)

  const { data: participantAssets } = useQuery<Asset>({
    queryKey: ['participant-proof', participantId],
    queryFn: async () => {
      const response = await fetch(
        `/api/participants/assets?participantId=${participantId}`,
      )
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || t('manageParticipant.fetchAssetsFailed'))
      }
      return result
    },
  })

  useEffect(() => {
    const fetchParticipant = async () => {
      // Try to get participant from navigation state first
      const state = window.history.state
      if (state && state.name) {
        setParticipant(state as Participant)
        setIsLoading(false)
        return
      }

      // If no state, fetch from API
      try {
        const response = await fetch(`/api/participant/${participantId}`)
        if (!response.ok) {
          throw new Error(t('manageParticipant.fetchFailed'))
        }
        const data = await response.json()
        setParticipant(data)
      } catch (error) {
        toast.error(t('manageParticipant.loadFailed'))
        navigate({
          to: '/drawings/$drawingId',
          params: { drawingId },
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchParticipant()
  }, [participantId, drawingId, navigate])

  if (isLoading) {
    return <div className="container mx-auto p-4">{t('manageParticipant.loading')}</div>
  }

  if (!participant) {
    return <div className="container mx-auto p-4">{t('manageParticipant.notFound')}</div>
  }

  const currentStatus: ParticipantStatus =
    participant.isEligible === true
      ? 'approved'
      : participant.isEligible === false
        ? 'rejected'
        : 'pending'

  const isStatusLocked = currentStatus === 'rejected'

  const handleStatusChange = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/participant/${participantId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: selectedStatus }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t('manageParticipant.updateFailed'))
      }

      toast.success(data.message || t('manageParticipant.updateSuccess'))

      navigate({
        to: '/drawings/$drawingId',
        params: { drawingId },
      })
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t('manageParticipant.updateFailed'),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const participantNumbers = () => {
    if (participant.numbers?.length > 0) {
      return participant.numbers
    } else if (participant.logNumbers && participant.logNumbers.length > 0) {
      return participant.logNumbers
    } else if (
      currentStatus === 'rejected' &&
      (participant.logNumbers || [])?.length > 0
    ) {
      return participant.logNumbers || []
    } else {
      return []
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">{t('manageParticipant.title')}</h2>
          <div className="space-y-3">
            <div>
              <span className="font-semibold">{t('manageParticipant.name')}</span> {participant.name}
            </div>
            <div>
              <span className="font-semibold">{t('manageParticipant.phone')}</span> {participant.phone}
            </div>
            {participant.email && (
              <div>
                <span className="font-semibold">{t('manageParticipant.email')}</span>{' '}
                {participant.email}
              </div>
            )}
            <div>
              <span className="font-semibold">{t('manageParticipant.currentStatus')}</span>{' '}
              <span
                className={`inline-block px-2 py-1 rounded text-sm ${
                  currentStatus === 'approved'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                    : currentStatus === 'rejected'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                }`}
              >
                {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="font-semibold">{t('manageParticipant.selectedNumbers')}</span>{' '}
              <section className="flex gap-2">
                {participantNumbers().length > 0
                  ? participantNumbers().map((num) => (
                      <div
                        key={num}
                        className="py-0.5 px-1 rounded-sm border border-neutral-300 dark:border-neutral-600"
                      >
                        {num}
                      </div>
                    ))
                  : t('manageParticipant.noNumbers')}
              </section>
            </div>
          </div>
        </Card>

        {/* Asset Preview Section */}
        {participantAssets && participantAssets.url && (
          <Card className="rounded-lg p-6 mt-4">
            <h3 className="text-lg font-semibold mb-2">{t('manageParticipant.payoutProof')}</h3>
            {participantAssets.mimeType?.startsWith('image/') ? (
              <>
                <figure className="h-50">
                  <img
                    src={participantAssets.url}
                    alt="Payout Proof"
                    className="w-full h-full object-scale-down rounded border cursor-pointer"
                    onClick={() => setShowImageModal(true)}
                  />
                </figure>

                <a
                  href={participantAssets.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline ml-2"
                >
                  <ImageIcon className=" h-4 w-4 inline-block mr-1" /> {t('manageParticipant.openInNewTab')}
                </a>
                <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
                  <DialogContent className="flex flex-col items-center justify-center p-0 shadow-none sm:max-w-2/3">
                    <img
                      src={participantAssets.url}
                      alt="Full Size Payout Proof"
                      className="max-w-full max-h-[90vh] rounded border-0"
                      // style={{ background: '#fff' }}
                    />
                  </DialogContent>
                </Dialog>
              </>
            ) : participantAssets.mimeType === 'application/pdf' ? (
              <a
                href={participantAssets.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                {t('manageParticipant.viewPdf')}
              </a>
            ) : (
              <a
                href={participantAssets.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                {t('manageParticipant.downloadFile')}
              </a>
            )}
          </Card>
        )}

        <div className="bg-white border border-neutral-300 dark:bg-gray-900 dark:border-none rounded-lg shadow-md p-6 mt-4">
          <h3 className="text-xl font-semibold mb-4">
            {t('manageParticipant.changeStatus')}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('manageParticipant.selectNewStatus')}
              </label>
              {isStatusLocked && (
                <div className="mb-2">
                  <div className="flex gap-2 items-center">
                    <AlertCircleIcon className="text-red-500" />
                    <p className="text-sm text-red-500">
                      {t('manageParticipant.rejectedLocked')}
                    </p>
                  </div>
                  <div className="ml-8 mt-2">
                    <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary">
                      {t('manageParticipant.reassignSoon')}
                    </p>
                  </div>
                </div>
              )}
              <div className="inline-flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden w-full">
                <button
                  type="button"
                  onClick={() => setSelectedStatus('pending')}
                  disabled={isStatusLocked}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    selectedStatus === 'pending'
                      ? 'bg-neutral-200 text-gray-900 dark:bg-gray-700 dark:text-white'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  } ${isStatusLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {t('manageParticipant.pending')}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStatus('rejected')}
                  disabled={isStatusLocked}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors border-x border-gray-300 dark:border-gray-600 ${
                    selectedStatus === 'rejected'
                      ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                      : 'bg-gray-50 text-gray-700 hover:bg-red-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-red-900/20'
                  } ${isStatusLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {t('manageParticipant.reject')}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStatus('approved')}
                  disabled={isStatusLocked}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    selectedStatus === 'approved'
                      ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-gray-50 text-gray-700 hover:bg-green-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-green-900/20'
                  } ${isStatusLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {t('manageParticipant.approved')}
                </button>
              </div>
            </div>
            <Button
              onClick={handleStatusChange}
              disabled={
                isStatusLocked ||
                isSubmitting ||
                selectedStatus === currentStatus
              }
              className="w-full"
            >
              {isSubmitting ? t('manageParticipant.updating') : t('manageParticipant.updateStatus')}
            </Button>
          </div>
        </div>

        <ParticipantComments participantId={participantId} />

        <details className="hidden mt-4">
          <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400">
            Debug Info
          </summary>
          <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto">
            {JSON.stringify({ participantId, participant }, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  )
}
