import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import React from 'react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
  }
>(({ className, variant = 'primary', size = 'md', ...props }, ref) => {
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-100'
  };

  const sizeClasses = {
    sm: 'text-sm px-3 py-1',
    md: 'px-4 py-2',
    lg: 'text-lg px-6 py-3'
  };

  return (
    <button
      className={cn(
        'rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = 'Button';

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      className={cn(
        'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => {
  return (
    <label
      className={cn('text-sm font-medium text-gray-700', className)}
      ref={ref}
      {...props}
    />
  );
});
Label.displayName = 'Label';

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 bg-white p-6 shadow-sm',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Card.displayName = 'Card';

export const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      type="checkbox"
      className={cn(
        'h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-2',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Checkbox.displayName = 'Checkbox';

// Tabs container component
export const Tabs = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    defaultValue: string;
    value?: string;
    onValueChange?: (value: string) => void;
  }
>(({ className, defaultValue, value, onValueChange, ...props }, ref) => {
  const [selectedTab, setSelectedTab] = React.useState(value || defaultValue);

  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedTab(value);
    }
  }, [value]);

  const handleValueChange = (newValue: string) => {
    setSelectedTab(newValue);
    onValueChange?.(newValue);
  };

  return (
    <div
      className={cn('w-full', className)}
      ref={ref}
      data-value={selectedTab}
      {...props}
    />
  );
});
Tabs.displayName = 'Tabs';

// TabsList component - the container for tab triggers
export const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      className={cn(
        'flex items-center justify-start space-x-1 rounded-md bg-gray-100 p-1',
        className
      )}
      ref={ref}
      role="tablist"
      {...props}
    />
  );
});
TabsList.displayName = 'TabsList';

// TabsTrigger component - the clickable tab button
export const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    value: string;
  }
>(({ className, value, ...props }, ref) => {
  const tabsContext = React.useContext(
    React.createContext<{
      value?: string;
      onValueChange?: (value: string) => void;
    }>({})
  );

  // Find nearest parent Tabs element to get the current selected value
  const parentTabsElement = React.useRef<HTMLElement | null>(null);
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);
  
  React.useEffect(() => {
    if (buttonRef.current) {
      let element = buttonRef.current.parentElement;
      while (element && !element.hasAttribute('data-value')) {
        element = element.parentElement;
      }
      parentTabsElement.current = element;
    }
  }, []);

  const isSelected = 
    parentTabsElement.current?.getAttribute('data-value') === value ||
    tabsContext.value === value;

  const handleClick = () => {
    const onValueChange = tabsContext.onValueChange;
    if (onValueChange) {
      onValueChange(value);
    } else if (parentTabsElement.current) {
      // Use a custom event if context is not available
      parentTabsElement.current.setAttribute('data-value', value);
      const event = new CustomEvent('tabChange', { detail: { value } });
      parentTabsElement.current.dispatchEvent(event);
    }
  };

  return (
    <button
      ref={(node) => {
        if (ref) {
          if (typeof ref === 'function') ref(node);
          else ref.current = node;
        }
        buttonRef.current = node;
      }}
      role="tab"
      aria-selected={isSelected}
      data-state={isSelected ? 'active' : 'inactive'}
      data-value={value}
      className={cn(
        'inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50',
        isSelected
          ? 'bg-white text-blue-700 shadow-sm'
          : 'text-gray-700 hover:bg-gray-50',
        className
      )}
      onClick={handleClick}
      {...props}
    />
  );
});
TabsTrigger.displayName = 'TabsTrigger';

// TabsContent component - the content panel activated by a tab
export const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: string;
  }
>(({ className, value, ...props }, ref) => {
  const tabsContext = React.useContext(
    React.createContext<{
      value?: string;
    }>({})
  );
  
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const [isSelected, setIsSelected] = React.useState(false);
  
  React.useEffect(() => {
    if (contentRef.current) {
      let element = contentRef.current.parentElement;
      while (element && !element.hasAttribute('data-value')) {
        element = element.parentElement;
      }
      
      if (element) {
        const updateVisibility = () => {
          const currentValue = element!.getAttribute('data-value');
          setIsSelected(currentValue === value);
        };
        
        updateVisibility();
        
        // Listen for custom tab change events
        const handleTabChange = () => {
          updateVisibility();
        };
        
        element.addEventListener('tabChange', handleTabChange);
        
        return () => {
          element?.removeEventListener('tabChange', handleTabChange);
        };
      }
    }
  }, [value]);
  
  if (!isSelected && tabsContext.value !== value) {
    return null;
  }
  
  return (
    <div
      ref={(node) => {
        if (ref) {
          if (typeof ref === 'function') ref(node);
          else ref.current = node;
        }
        contentRef.current = node;
      }}
      role="tabpanel"
      data-state={isSelected ? 'active' : 'inactive'}
      className={cn(
        'mt-2 ring-offset-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        className
      )}
      {...props}
    />
  );
});
TabsContent.displayName = 'TabsContent';
