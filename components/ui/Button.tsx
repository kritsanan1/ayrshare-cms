
import React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
          {
            'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500': variant === 'default',
            'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500': variant === 'outline',
            'text-gray-700 hover:bg-gray-100 focus:ring-blue-500': variant === 'ghost',
            'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500': variant === 'destructive',
          },
          {
            'h-8 px-3 text-sm': size === 'sm',
            'h-10 px-4': size === 'md',
            'h-12 px-6 text-lg': size === 'lg',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'
