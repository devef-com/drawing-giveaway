import { useState, useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  EraserIcon,
  Pencil,
  Trash2,
  CalendarIcon,
  PlusIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { authClient } from '@/lib/auth-client'
import { useDrawing } from '@/querys/useDrawing'
import { format } from 'date-fns'
import useMobile from '@/hooks/useMobile'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { datetimeLocalToUtcISOString } from '@/lib/utils'

export const Route = createFileRoute('/drawings/$drawingId/edit')({
  component: EditDrawing,
})

function EditDrawing() {
  const { t } = useTranslation()
  const { drawingId } = Route.useParams()
  const navigate = useNavigate()
  const session = authClient.useSession()
  const queryClient = useQueryClient()
  const { data: drawing, isLoading: drawingLoading } = useDrawing(
    drawingId,
    !!session.data,
  )

  const [formData, setFormData] = useState({
    title: '',
    guidelines: [] as string[],
    isPaid: false,
    price: 0,
    winnerSelection: 'system' as 'manually' | 'system',
    quantityOfNumbers: 100,
    playWithNumbers: false,
    winnersAmount: 1,
    winnerNumbers: [] as number[],
    endAt: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentGuideline, setCurrentGuideline] = useState('')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState({
    hours: '12',
    minutes: '00',
  })
  const [isOpen, setIsOpen] = useState(false)
  const isMobile = useMobile()
  const [endAtError, setEndAtError] = useState('')
  // Populate form data when drawing is loaded
  useEffect(() => {
    if (drawing) {
      const endDate = new Date(drawing.endAt)
      const year = endDate.getFullYear()
      const monthNumber = endDate.getMonth() + 1
      const month = String(monthNumber).padStart(2, '0')
      const dayNumber = endDate.getDate()
      const day = String(dayNumber).padStart(2, '0')
      const hours = String(endDate.getHours()).padStart(2, '0')
      const minutes = String(endDate.getMinutes()).padStart(2, '0')
      const isoString = `${year}-${month}-${day}T${hours}:${minutes}`

      setFormData({
        title: drawing.title,
        guidelines: drawing.guidelines || [],
        isPaid: drawing.isPaid,
        price: drawing.price ? drawing.price : 0,
        winnerSelection: drawing.winnerSelection,
        quantityOfNumbers: drawing.quantityOfNumbers,
        playWithNumbers: drawing.playWithNumbers || false,
        winnersAmount: drawing.winnersAmount,
        winnerNumbers: drawing.winnerNumbers || [],
        endAt: isoString,
      })
      setSelectedDate(endDate)
      setSelectedTime({
        hours: endDate.getHours().toString().padStart(2, '0'),
        minutes: endDate.getMinutes().toString().padStart(2, '0'),
      })
    }
  }, [drawing])

  const addGuideline = () => {
    if (!currentGuideline.trim()) return

    if (editingIndex !== null) {
      const newGuidelines = [...formData.guidelines]
      newGuidelines[editingIndex] = currentGuideline
      setFormData({ ...formData, guidelines: newGuidelines })
      setEditingIndex(null)
    } else {
      setFormData({
        ...formData,
        guidelines: [...formData.guidelines, currentGuideline],
      })
    }
    setCurrentGuideline('')
  }

  const removeGuideline = (index: number) => {
    const newGuidelines = formData.guidelines.filter((_, i) => i !== index)
    setFormData({ ...formData, guidelines: newGuidelines })
  }

  const editGuideline = (index: number) => {
    setCurrentGuideline(formData.guidelines[index])
    setEditingIndex(index)
  }

  const clearGuideline = () => {
    setCurrentGuideline('')
    setEditingIndex(null)
  }

  const handleDateTimeConfirm = () => {
    if (selectedDate) {
      const dateTime = new Date(selectedDate)
      dateTime.setHours(parseInt(selectedTime.hours))
      dateTime.setMinutes(parseInt(selectedTime.minutes))

      const year = dateTime.getFullYear()
      const month = String(dateTime.getMonth() + 1).padStart(2, '0')
      const day = String(dateTime.getDate()).padStart(2, '0')
      const hours = String(dateTime.getHours()).padStart(2, '0')
      const minutes = String(dateTime.getMinutes()).padStart(2, '0')
      const isoString = `${year}-${month}-${day}T${hours}:${minutes}`
      setEndAtError('')
      setFormData({ ...formData, endAt: isoString })
      setIsOpen(false)
    }
  }

  const handleQuickPreset = (hours: number) => {
    const now = new Date()
    now.setHours(now.getHours() + hours)
    setSelectedDate(now)
    setSelectedTime({
      hours: now.getHours().toString().padStart(2, '0'),
      minutes: now.getMinutes().toString().padStart(2, '0'),
    })

    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hrs = String(now.getHours()).padStart(2, '0')
    const mins = String(now.getMinutes()).padStart(2, '0')
    const isoString = `${year}-${month}-${day}T${hrs}:${mins}`

    setEndAtError('')
    setFormData({ ...formData, endAt: isoString })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate endAt before submission
    if (!formData.endAt) {
      setEndAtError(t('editDrawing.pleaseSelectEndDateTime'))
      const endAtSection = document.getElementById('endAt-section')
      if (endAtSection) {
        endAtSection.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    setEndAtError('')
    setIsSubmitting(true)

    try {
      // Filter out empty guidelines
      const filteredGuidelines = formData.guidelines.filter((g) => g.trim())

      const response = await fetch(`/api/drawings/${drawingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          guidelines: filteredGuidelines,
          isPaid: formData.isPaid,
          price: formData.isPaid ? formData.price : 0,
          winnerSelection: formData.winnerSelection,
          winnersAmount: formData.winnersAmount,
          endAt: datetimeLocalToUtcISOString(formData.endAt),
          // Note: playWithNumbers and quantityOfNumbers are NOT editable
        }),
      })

      if (response.ok) {
        toast.success(t('editDrawing.updatedSuccessfully'))
        queryClient.invalidateQueries({ queryKey: ['drawing', drawingId] })
        navigate({ to: `/drawings/${drawingId}` })
      } else {
        const error = await response.json()
        toast.error(error.message || t('editDrawing.failedToUpdate'))
      }
    } catch (error) {
      console.error('Error updating drawing:', error)
      toast.error(t('editDrawing.failedToUpdate'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!session.data) {
    return (
      <div className="min-h-screen bg-linear-to-b from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="p-6 bg-slate-800/50 border-slate-700">
            <p className="text-white text-center">
              {t('editDrawing.pleaseLoginToEdit')}{' '}
              <a
                href="/authentication/login"
                className="text-cyan-400 hover:text-cyan-300"
              >
                {t('editDrawing.login')}
              </a>
            </p>
          </Card>
        </div>
      </div>
    )
  }

  if (drawingLoading) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="p-6">
            <p className="text-center">{t('editDrawing.loading')}</p>
          </Card>
        </div>
      </div>
    )
  }

  if (!drawing) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="p-6">
            <p className="text-center">{t('editDrawing.drawingNotFound')}</p>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <Card className="p-6">
          <h1 className="text-xl font-bold mb-2">{t('editDrawing.title')}</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title" className="mb-1">
                {t('editDrawing.titleLabel')}
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label className="mb-2">
                {t('editDrawing.guidelinesOptional')}
              </Label>
              <div className="relative">
                <textarea
                  value={currentGuideline}
                  onChange={(e) => setCurrentGuideline(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault()
                      addGuideline()
                      ;(e.target as HTMLTextAreaElement).style.height = 'auto'
                    }
                  }}
                  placeholder={t('editDrawing.enterGuidelineText')}
                  className="min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 pr-24 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none overflow-hidden"
                  style={{
                    height: 'auto',
                    minHeight: '80px',
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement
                    target.style.height = 'auto'
                    target.style.height = target.scrollHeight + 'px'
                  }}
                />
                <div className="absolute bottom-4 right-2 flex gap-1">
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    onClick={clearGuideline}
                    disabled={!currentGuideline}
                  >
                    <EraserIcon className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon-sm"
                    onClick={addGuideline}
                    disabled={!currentGuideline.trim()}
                    className="bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90"
                  >
                    <PlusIcon className="size-4" />
                  </Button>
                </div>
              </div>

              {formData.guidelines.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {formData.guidelines.map((guideline, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 group ml-1"
                    >
                      <span className="flex-1 inline-flex gap-2 text-sm py-1.5">
                        <div className="bg-primary w-1 h-1 rounded-full aspect-square mt-2" />{' '}
                        {guideline}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="outline"
                          onClick={() => editGuideline(index)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="outline"
                          onClick={() => removeGuideline(index)}
                          className="text-destructive hover:text-destructive border-red-200 dark:border-red-800/20"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Paid Event Switch */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <Label htmlFor="isPaid" className="flex-1">
                {t('editDrawing.paid')}
              </Label>
              <Switch
                id="isPaid"
                checked={formData.isPaid}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isPaid: checked })
                }
              />
            </div>

            {formData.isPaid && (
              <div>
                <Label htmlFor="price" className="mb-1">
                  {t('editDrawing.priceLabel')}
                </Label>
                <Input
                  id="price"
                  type="number"
                  min="1"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: parseFloat(e.target.value),
                    })
                  }
                  required={formData.isPaid}
                />
              </div>
            )}

            {/* Play with Numbers - Read Only */}
            <div className="hidden items-center justify-between rounded-lg border p-4 opacity-60">
              <Label htmlFor="playWithNumbers" className="flex-1">
                {t('editDrawing.playWithNumbers')}
              </Label>
              <Switch
                id="playWithNumbers"
                checked={formData.playWithNumbers}
                disabled
              />
            </div>
            <p className="hidden text-xs text-muted-foreground -mt-4">
              {t('editDrawing.cannotChangeAfterCreation')}
            </p>

            {/* Quantity of Numbers - Read Only when playWithNumbers is true */}
            {formData.playWithNumbers && (
              <div className="hidden opacity-60">
                <Label htmlFor="quantityOfNumbers" className="mb-1">
                  {t('editDrawing.quantityOfNumbers')}
                </Label>
                <Input
                  id="quantityOfNumbers"
                  type="number"
                  value={formData.quantityOfNumbers}
                  disabled
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t('editDrawing.cannotChangeAfterCreation')}
                </p>
              </div>
            )}

            {/* Winner Selection Method */}
            <div>
              <Label htmlFor="winnerSelection" className="mb-1">
                {t('editDrawing.winnerSelectionMethod')}
              </Label>
              <Select
                value={formData.winnerSelection}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    winnerSelection: value as 'manually' | 'system',
                  })
                }
                disabled={!formData.playWithNumbers}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={t('editDrawing.winnerSelectionMethod')}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manually">
                    {t('editDrawing.enterNumberManually')}
                  </SelectItem>
                  <SelectItem value="system">
                    {t('editDrawing.systemGenerated')}
                  </SelectItem>
                </SelectContent>
              </Select>
              {formData.winnerSelection === 'manually' ? (
                <p className="text-xs text-muted-foreground mt-1">
                  {t('editDrawing.userMustEnterWinnerNumbers')}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">
                  {t('editDrawing.systemWillChooseRandomly')}
                </p>
              )}
              {!formData.playWithNumbers && (
                <p className="text-xs text-muted-foreground mt-1">
                  {t('editDrawing.notAllowedToChange')}
                </p>
              )}
            </div>

            {/* Number of Winners */}
            <div>
              <Label htmlFor="winnersAmount" className="mb-1">
                {t('editDrawing.numbersOfWinners')}
              </Label>
              <Input
                id="winnersAmount"
                type="number"
                min="1"
                value={formData.winnersAmount}
                onChange={(e) => {
                  const value = e.target.value
                  setFormData({
                    ...formData,
                    winnersAmount: parseInt(value),
                  })
                }}
                onInvalid={(e) => {
                  ;(e.target as HTMLInputElement).setCustomValidity(
                    t('editDrawing.pleaseEnterNumberGreaterThanZero'),
                  )
                }}
                onInput={(e) => {
                  ;(e.target as HTMLInputElement).setCustomValidity('')
                }}
                required
              />
            </div>

            <div id="endAt-section">
              <Label className="mb-1">{t('editDrawing.endDateTime')}</Label>
              {endAtError && (
                <p className="text-sm text-destructive mt-1 mb-2">
                  {endAtError}
                </p>
              )}
              <div className="flex gap-2 mb-2 flex-wrap">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="text-xs font-thin"
                  onClick={() => handleQuickPreset(168)}
                >
                  {t('editDrawing.nextWeek')}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="text-xs font-thin"
                  onClick={() => handleQuickPreset(360)}
                >
                  {t('editDrawing.fifteenDays')}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="text-xs font-thin"
                  onClick={() => handleQuickPreset(720)}
                >
                  {t('editDrawing.nextMonth')}
                </Button>
              </div>

              {isMobile ? (
                <Drawer open={isOpen} onOpenChange={setIsOpen}>
                  <DrawerTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endAt ? (
                        format(new Date(formData.endAt), 'PPP p')
                      ) : (
                        <span>{t('editDrawing.pickDateTime')}</span>
                      )}
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent className="max-h-full">
                    <DrawerHeader>
                      <DrawerTitle>
                        {t('editDrawing.selectEndDateTime')}
                      </DrawerTitle>
                    </DrawerHeader>

                    <div
                      className="px-4 space-y-4 overflow-y-scroll scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
                      style={{ WebkitOverflowScrolling: 'touch' }}
                    >
                      <div className="flex justify-center">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          autoFocus
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="justify-center text-md">
                          {t('editDrawing.time')}
                        </Label>
                        <div className="flex gap-2 items-center justify-center">
                          <Select
                            value={selectedTime.hours}
                            onValueChange={(value) =>
                              setSelectedTime({ ...selectedTime, hours: value })
                            }
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 24 }, (_, i) => (
                                <SelectItem
                                  key={i}
                                  value={i.toString().padStart(2, '0')}
                                >
                                  {i.toString().padStart(2, '0')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <span className="text-2xl">:</span>
                          <Select
                            value={selectedTime.minutes}
                            onValueChange={(value) =>
                              setSelectedTime({
                                ...selectedTime,
                                minutes: value,
                              })
                            }
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {['00', '15', '30', '45'].map((min) => (
                                <SelectItem key={min} value={min}>
                                  {min}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {selectedDate && (
                        <div className="text-center text-sm text-muted-foreground">
                          {format(
                            new Date(
                              selectedDate.getFullYear(),
                              selectedDate.getMonth(),
                              selectedDate.getDate(),
                              parseInt(selectedTime.hours),
                              parseInt(selectedTime.minutes),
                            ),
                            'PPP p',
                          )}
                        </div>
                      )}
                      <DrawerFooter className="flex-row">
                        <Button
                          className="w-1/2"
                          onClick={handleDateTimeConfirm}
                          disabled={!selectedDate}
                        >
                          {t('editDrawing.confirm')}
                        </Button>
                        <DrawerClose asChild>
                          <Button variant="outline" className="w-1/2">
                            {t('editDrawing.cancel')}
                          </Button>
                        </DrawerClose>
                      </DrawerFooter>
                    </div>
                  </DrawerContent>
                </Drawer>
              ) : (
                <Popover open={isOpen} onOpenChange={setIsOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endAt ? (
                        format(new Date(formData.endAt), 'PPP p')
                      ) : (
                        <span>{t('editDrawing.pickDateTime')}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-4 space-y-4">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        autoFocus
                      />

                      <div className="space-y-2 px-4">
                        <Label>{t('editDrawing.time')}</Label>
                        <div className="flex gap-2 items-center">
                          <Select
                            value={selectedTime.hours}
                            onValueChange={(value) =>
                              setSelectedTime({ ...selectedTime, hours: value })
                            }
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 24 }, (_, i) => (
                                <SelectItem
                                  key={i}
                                  value={i.toString().padStart(2, '0')}
                                >
                                  {i.toString().padStart(2, '0')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <span className="text-xl">:</span>
                          <Select
                            value={selectedTime.minutes}
                            onValueChange={(value) =>
                              setSelectedTime({
                                ...selectedTime,
                                minutes: value,
                              })
                            }
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {['00', '15', '30', '45'].map((min) => (
                                <SelectItem key={min} value={min}>
                                  {min}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {selectedDate && (
                        <div className="text-center text-sm text-muted-foreground px-4">
                          {format(
                            new Date(
                              selectedDate.getFullYear(),
                              selectedDate.getMonth(),
                              selectedDate.getDate(),
                              parseInt(selectedTime.hours),
                              parseInt(selectedTime.minutes),
                            ),
                            'PPP p',
                          )}
                        </div>
                      )}

                      <div className="flex gap-2 p-4 pt-0">
                        <Button
                          className="flex-1"
                          onClick={handleDateTimeConfirm}
                          disabled={!selectedDate}
                        >
                          {t('editDrawing.confirm')}
                        </Button>
                        <Button
                          className="flex-1"
                          variant="outline"
                          onClick={() => setIsOpen(false)}
                        >
                          {t('editDrawing.cancel')}
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <Button
                type="button"
                onClick={() => navigate({ to: `/drawings/${drawingId}` })}
                variant="outline"
              >
                {t('editDrawing.cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting} variant="primary">
                {isSubmitting
                  ? t('editDrawing.saving')
                  : t('editDrawing.saveChanges')}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
