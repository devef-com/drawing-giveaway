import { createFileRoute } from '@tanstack/react-router'
import {
  Expandable,
  ExpandableContent,
  ExpandableTitle,
} from '@/components/ui/expandable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { m } from '@/lang'
import { useLanguage } from '@/lib/i18n'

export const Route = createFileRoute('/support')({
  component: SupportPage,
})

function SupportPage() {
  const { locale } = useLanguage()

  return (
    <div>
      <main className="container mx-auto py-10 px-4 max-w-3xl min-h-[calc(100svh-129px)]">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">{m.support_title()}</h1>
            <p className="text-muted-foreground text-lg">
              {m.support_subtitle()}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{m.support_faq_title()}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Expandable className="border rounded-md">
                <ExpandableTitle>{m.support_faq_whatIsGiway_q()}</ExpandableTitle>
                <ExpandableContent>
                  <p className="text-muted-foreground">
                    {m.support_faq_whatIsGiway_a()}
                  </p>
                </ExpandableContent>
              </Expandable>

              <Expandable className="border rounded-md">
                <ExpandableTitle>
                  {m.support_faq_freeVsPaid_q()}
                </ExpandableTitle>
                <ExpandableContent>
                  <p className="text-muted-foreground">
                    {m.support_faq_freeVsPaid_a()}
                  </p>
                </ExpandableContent>
              </Expandable>

              <Expandable className="border rounded-md">
                <ExpandableTitle>
                  {m.support_faq_playWithNumbers_q()}
                </ExpandableTitle>
                <ExpandableContent>
                  <p className="text-muted-foreground">
                    {m.support_faq_playWithNumbers_a()}
                  </p>
                </ExpandableContent>
              </Expandable>

              <Expandable className="border rounded-md">
                <ExpandableTitle>
                  {m.support_faq_moreParticipants_q()}
                </ExpandableTitle>
                <ExpandableContent>
                  <p className="text-muted-foreground">
                    {m.support_faq_moreParticipants_a()}
                  </p>
                </ExpandableContent>
              </Expandable>

              <Expandable className="border rounded-md">
                <ExpandableTitle>
                  {m.support_faq_rejectParticipant_q()}
                </ExpandableTitle>
                <ExpandableContent>
                  <p className="text-muted-foreground">
                    {m.support_faq_rejectParticipant_a()}
                  </p>
                </ExpandableContent>
              </Expandable>

              <Expandable className="border rounded-md">
                <ExpandableTitle>{m.support_faq_packsExpire_q()}</ExpandableTitle>
                <ExpandableContent>
                  <p className="text-muted-foreground">
                    {m.support_faq_packsExpire_a()}
                  </p>
                </ExpandableContent>
              </Expandable>
            </CardContent>
          </Card>

          <div className="text-center space-y-4 pt-8">
            <h2 className="text-2xl font-semibold">{m.support_contact_title()}</h2>
            <p className="text-muted-foreground">
              {m.support_contact_subtitle()}
            </p>
            {/* Placeholder for contact button or email */}
            <a
              href="mailto:team@giway.com"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              {m.support_contact_button()}
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
