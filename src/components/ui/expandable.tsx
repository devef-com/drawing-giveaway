import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'

const ExpandableContext = React.createContext<{
  isOpen: boolean
  toggleOpen: () => void
} | null>(null)

const useExpandable = () => {
  const context = React.useContext(ExpandableContext)
  if (!context) {
    throw new Error('Expandable components must be used within an Expandable')
  }
  return context
}

const expandableVariants = cva('rounded-lg', {
  variants: {
    variant: {
      default: '',
      outline: 'border border-border',
      ghost: 'border-transparent',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const expandableTitleVariants = cva(
  'flex items-center gap-2 text-sm w-full cursor-pointer p-2 hover:bg-accent/50 transition-colors font-medium',
  {
    variants: {
      variant: {
        default: '',
        outline: '',
        ghost: '',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

const expandableContentVariants = cva(
  'overflow-hidden transition-all duration-200',
  {
    variants: {
      variant: {
        default: '',
        outline: '',
        ghost: '',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

interface ExpandableProps
  extends React.ComponentProps<'div'>,
    VariantProps<typeof expandableVariants> {
  defaultOpen?: boolean
}

function Expandable({
  className,
  variant,
  defaultOpen = false,
  children,
  ...props
}: ExpandableProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  const toggleOpen = React.useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  return (
    <ExpandableContext.Provider value={{ isOpen, toggleOpen }}>
      <div
        data-slot="expandable"
        className={cn(expandableVariants({ variant }), className)}
        {...props}
      >
        {children}
      </div>
    </ExpandableContext.Provider>
  )
}

interface ExpandableTitleProps
  extends React.ComponentProps<'p'>,
    VariantProps<typeof expandableTitleVariants> {}

function ExpandableTitle({
  className,
  variant,
  children,
  ...props
}: ExpandableTitleProps) {
  const { isOpen, toggleOpen } = useExpandable()

  return (
    <p
      onClick={toggleOpen}
      className={cn(
        expandableTitleVariants({ variant }),
        isOpen
          ? 'text-text-light-primary dark:text-text-dark-primary'
          : 'text-text-light-secondary dark:text-text-dark-secondary',
        className,
      )}
      aria-expanded={isOpen}
      {...props}
    >
      <ChevronRight
        className={cn(
          'h-5 w-5 transition-transform duration-200',
          isOpen && 'rotate-90',
        )}
      />
      <span>{children}</span>
    </p>
  )
}

interface ExpandableContentProps
  extends React.ComponentProps<'div'>,
    VariantProps<typeof expandableContentVariants> {}

function ExpandableContent({
  className,
  variant,
  children,
  ...props
}: ExpandableContentProps) {
  const { isOpen } = useExpandable()

  return (
    <div
      className={cn(
        expandableContentVariants({ variant }),
        isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0',
        className,
      )}
      {...props}
    >
      <div className="p-4 pt-0">{children}</div>
    </div>
  )
}

export {
  Expandable,
  ExpandableTitle,
  ExpandableContent,
  expandableVariants,
  expandableTitleVariants,
  expandableContentVariants,
}
