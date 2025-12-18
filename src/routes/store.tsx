import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { Image, Mail, Package, Sparkles, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { PayPalCheckoutButton } from '@/components/PayPalCheckoutButton'
import { usePacks } from '@/querys/usePacks'
import { useUserBalance } from '@/querys/useUserBalance'
import { authClient } from '@/lib/auth-client'
import { m } from '@/lang'
import { useLanguage } from '@/lib/i18n'

export const Route = createFileRoute('/store')({
  component: StorePage,
})

function StorePage() {
  const { locale } = useLanguage()
  const session = authClient.useSession()
  const { data: packs, isLoading: isPacksLoading } = usePacks()
  const {
    data: balance,
    isLoading: isBalanceLoading,
    refetch,
  } = useUserBalance(!!session.data)
  const [selectedPackId, setSelectedPackId] = useState<number | null>(null)

  // Group packs by type
  const rafflesPacks =
    packs?.filter((p) => p.giwayType === 'play_with_numbers') ?? []
  const giveawayPacks = packs?.filter((p) => p.giwayType === 'no_numbers') ?? []

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
  }

  const onSuccess = () => {
    toast.success(m.store_packPurchased())
    refetch()
    setSelectedPackId(null)
  }

  if (!session.data) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="p-6">
            <p className="text-center">
              {m.store_loginRequired({ login: '' }).split('{login}')[0]}
              <Link
                to="/authentication/login"
                className="text-primary hover:underline"
              >
                {m.store_loginLink()}
              </Link>
              {m.store_loginRequired({ login: '' }).split('{login}')[1]}
            </p>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{m.store_title()}</h1>
            <p className="text-muted-foreground">
              {m.store_subtitle()}
            </p>
          </div>
          <Link to="/drawings/create">
            <Button>{m.store_createGiway()}</Button>
          </Link>
        </div>

        {/* Current Balance */}
        {!isBalanceLoading && balance && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                {m.store_currentBalance()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border bg-muted/50">
                  <p className="font-medium mb-2">
                    {m.store_raffleBalance()}
                  </p>
                  <div className="flex gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {balance.playWithNumbers.participants} {m.store_participants()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Image className="h-4 w-4" />
                      {balance.playWithNumbers.images} {m.store_images()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {balance.playWithNumbers.emails} {m.store_emails()}
                    </span>
                  </div>
                </div>
                <div className="p-4 rounded-lg border bg-muted/50">
                  <p className="font-medium mb-2">{m.store_giveawayBalance()}</p>
                  <div className="flex gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {balance.noNumbers.participants} {m.store_participants()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Image className="h-4 w-4" />
                      {balance.noNumbers.images} {m.store_images()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {balance.noNumbers.emails} {m.store_emails()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isPacksLoading ? (
          <Card className="p-6">
            <p className="text-center">{m.store_loadingPacks()}</p>
          </Card>
        ) : packs && packs.length > 0 ? (
          <>
            {/* Raffles Packs */}
            {rafflesPacks.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">
                  {m.store_rafflePacks()}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {rafflesPacks.map((pack) => (
                    <Card key={pack.id} className="flex flex-col">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Package className="h-5 w-5" />
                          {pack.name}
                        </CardTitle>
                        <CardDescription>
                          {m.store_raffleDescription()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <ul className="space-y-2">
                          <li className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-primary" />
                            <span>
                              {pack.participants.toLocaleString()} {m.store_participants()}
                            </span>
                          </li>
                          <li className="flex items-center gap-2 text-sm">
                            <Image className="h-4 w-4 text-primary" />
                            <span>{pack.images} {m.store_images()}</span>
                          </li>
                          <li className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-primary" />
                            <span>{pack.emails.toLocaleString()} {m.store_emails()}</span>
                          </li>
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <div className="w-full space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold">
                              {formatPrice(pack.price)}
                            </span>
                            <Button
                              variant="outline"
                              onClick={() =>
                                setSelectedPackId(
                                  selectedPackId === pack.id ? null : pack.id,
                                )
                              }
                            >
                              {selectedPackId === pack.id
                                ? m.common_cancel()
                                : m.store_buyPack()}
                            </Button>
                          </div>
                          {selectedPackId === pack.id && session.data?.user && (
                            <PayPalCheckoutButton
                              packId={pack.id}
                              className="w-full"
                              onSuccess={onSuccess}
                            />
                          )}
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Giveaway Packs */}
            {giveawayPacks.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">
                  {m.store_giveawayPacks()}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {giveawayPacks.map((pack) => (
                    <Card key={pack.id} className="flex flex-col">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Package className="h-5 w-4" />
                          {pack.name}
                        </CardTitle>
                        <CardDescription>
                          {m.store_giveawayDescription()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <ul className="space-y-2">
                          <li className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-primary" />
                            <span>
                              {pack.participants.toLocaleString()} {m.store_participants()}
                            </span>
                          </li>
                          <li className="flex items-center gap-2 text-sm">
                            <Image className="h-4 w-4 text-primary" />
                            <span>{pack.images} {m.store_images()}</span>
                          </li>
                          {pack.emails > 0 && (
                            <li className="flex items-center gap-2 text-sm">
                              <Mail className="h-4 w-4 text-primary" />
                              <span>{pack.emails.toLocaleString()} {m.store_emails()}</span>
                            </li>
                          )}
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <div className="w-full space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold">
                              {formatPrice(pack.price)}
                            </span>
                            <Button
                              variant="outline"
                              onClick={() =>
                                setSelectedPackId(
                                  selectedPackId === pack.id ? null : pack.id,
                                )
                              }
                            >
                              {selectedPackId === pack.id
                                ? m.common_cancel()
                                : m.store_buyPack()}
                            </Button>
                          </div>
                          {selectedPackId === pack.id && session.data?.user && (
                            <PayPalCheckoutButton
                              packId={pack.id}
                              className="w-full"
                              onSuccess={onSuccess}
                            />
                          )}
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">
              {m.store_noPacks()}
            </p>
          </Card>
        )}

        {/* Monthly Free Info */}
        <Card className="mt-8 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>{m.store_monthlyFree_title()}</CardTitle>
            <CardDescription>
              {m.store_monthlyFree_description()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {m.store_monthlyFree_participants()}
              </span>
              <span className="flex items-center gap-1">
                <Image className="h-4 w-4" />{m.store_monthlyFree_images()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {m.store_monthlyFree_note()}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
