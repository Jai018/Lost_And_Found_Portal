import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

// ─── Button ────────────────────────────────────────────────────────────────

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconRight,
  fullWidth = false,
  className,
  disabled,
  ...props
}) => {
  const variants = {
    primary:   'btn-primary',
    secondary: 'btn-secondary',
    ghost:     'btn-ghost',
    accent:    'btn-accent',
    danger:    'inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50',
  };
  const sizes = {
    sm:  'text-xs px-3 py-2 rounded-lg',
    md:  'text-sm',
    lg:  'text-base px-8 py-4',
    xl:  'text-lg px-10 py-5',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={clsx(
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon}
      {children}
      {!loading && iconRight}
    </motion.button>
  );
};

// ─── Badge ─────────────────────────────────────────────────────────────────

interface BadgeProps {
  variant?: 'lost' | 'found' | 'active' | 'resolved' | 'pending' | 'success' | 'warning' | 'info';
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'active', children, className, dot = false }) => {
  const variants = {
    lost:     'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50',
    found:    'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/50',
    active:   'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50',
    resolved: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700',
    pending:  'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/50',
    success:  'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50',
    warning:  'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50',
    info:     'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-800/50',
  };

  const dots: Record<BadgeProps['variant'] & string, string> = {
    lost:     'bg-red-500',
    found:    'bg-green-500',
    active:   'bg-blue-500',
    resolved: 'bg-gray-400',
    pending:  'bg-yellow-500',
    success:  'bg-emerald-500',
    warning:  'bg-amber-500',
    info:     'bg-primary-500',
  };

  return (
    <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold', variants[variant!], className)}>
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full', dots[variant!])} />}
      {children}
    </span>
  );
};

// ─── Card ──────────────────────────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = false,
  glass = false,
  padding = 'md',
  onClick,
}) => {
  const paddings = { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8' };

  return (
    <motion.div
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
      onClick={onClick}
      className={clsx(
        'rounded-2xl transition-all duration-300',
        glass
          ? 'glass'
          : 'bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800',
        hover && 'hover:shadow-card-hover cursor-pointer',
        'shadow-card',
        paddings[padding],
        className
      )}
    >
      {children}
    </motion.div>
  );
};

// ─── Input ─────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  onIconRightClick?: () => void;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, iconRight, onIconRightClick, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              'input-field',
              icon && 'pl-10',
              iconRight && 'pr-10',
              error && 'border-red-400 dark:border-red-600 focus:ring-red-500',
              className
            )}
            {...props}
          />
          {iconRight && (
            <button
              type="button"
              onClick={onIconRightClick}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {iconRight}
            </button>
          )}
        </div>
        {error && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>}
        {hint && !error && <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

// ─── Textarea ──────────────────────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={clsx(
            'input-field resize-none',
            error && 'border-red-400 dark:border-red-600 focus:ring-red-500',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

// ─── Select ────────────────────────────────────────────────────────────────

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, id, children, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={clsx(
            'input-field cursor-pointer',
            error && 'border-red-400 dark:border-red-600',
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options ? options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          )) : children}
        </select>
        {error && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';

// ─── Modal ─────────────────────────────────────────────────────────────────

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showClose?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  size = 'md',
  showClose = true,
}) => {
  const sizes = {
    sm:   'max-w-sm',
    md:   'max-w-lg',
    lg:   'max-w-2xl',
    xl:   'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={clsx(
          'relative w-full bg-white dark:bg-navy-900 rounded-2xl shadow-floating z-10 max-h-[90vh] overflow-y-auto',
          sizes[size]
        )}
      >
        {(title || showClose) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-navy-800">
            {title && <h2 className="text-lg font-display font-bold text-gray-900 dark:text-white">{title}</h2>}
            {showClose && (
              <button
                onClick={onClose}
                className="ml-auto p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-navy-800 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}
        <div className="p-6">{children}</div>
      </motion.div>
    </motion.div>
  );
};

// ─── Avatar ────────────────────────────────────────────────────────────────

interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  verified?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({ src, name, size = 'md', className, verified }) => {
  const sizes = { xs: 'w-6 h-6 text-xs', sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 text-base', lg: 'w-12 h-12 text-lg', xl: 'w-16 h-16 text-2xl' };
  const initials = name ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  return (
    <div className={clsx('relative inline-flex', className)}>
      <div className={clsx('rounded-full overflow-hidden flex items-center justify-center font-semibold bg-gradient-to-br from-primary-400 to-primary-600 text-white flex-shrink-0', sizes[size])}>
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      {verified && (
        <span className="absolute -bottom-0.5 -right-0.5 bg-blue-500 rounded-full p-0.5">
          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </span>
      )}
    </div>
  );
};

// ─── Skeleton Loader ───────────────────────────────────────────────────────

export const Skeleton: React.FC<{ className?: string; rounded?: string }> = ({
  className,
  rounded = 'rounded-xl',
}) => (
  <div
    className={clsx(
      'skeleton',
      rounded,
      className
    )}
    style={{
      background: 'linear-gradient(90deg, var(--color-border) 25%, var(--color-border-light) 50%, var(--color-border) 75%)',
      backgroundSize: '400% 100%',
      animation: 'shimmer 1.8s ease-in-out infinite',
    }}
  />
);

export const ItemCardSkeleton: React.FC = () => (
  <div className="card p-0 overflow-hidden">
    <Skeleton className="h-52 w-full" rounded="rounded-none" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  </div>
);

// ─── Progress Steps ────────────────────────────────────────────────────────

interface Step {
  label: string;
  icon?: React.ReactNode;
}

interface ProgressStepsProps {
  steps: (string | Step)[];
  current: number;
  className?: string;
}

export const ProgressSteps: React.FC<ProgressStepsProps> = ({ steps, current, className }) => (
  <div className={clsx('flex items-center w-full', className)}>
    {steps.map((step, i) => (
      <React.Fragment key={i}>
        <div className="flex flex-col items-center gap-1">
          <motion.div
            initial={false}
            animate={{
              backgroundColor: i < current ? '#10b981' : i === current ? '#6366f1' : '#e5e7eb',
              scale: i === current ? 1.1 : 1,
            }}
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-md"
          >
            {i < current ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <span className={i > current ? 'text-gray-500' : ''}>{i + 1}</span>
            )}
          </motion.div>
          <span className={clsx(
            'text-xs font-medium hidden sm:block',
            i === current ? 'text-primary-600 dark:text-primary-400' :
            i < current ? 'text-emerald-600 dark:text-emerald-400' :
            'text-gray-400 dark:text-gray-600'
          )}>
            {typeof step === 'string' ? step : step.label}
          </span>
        </div>
        {i < steps.length - 1 && (
          <div className="flex-1 mx-2 mb-4">
            <div className="h-0.5 w-full bg-gray-200 dark:bg-navy-700 rounded-full overflow-hidden">
              <motion.div
                initial={false}
                animate={{ width: i < current ? '100%' : '0%' }}
                transition={{ duration: 0.4 }}
                className="h-full bg-gradient-to-r from-emerald-400 to-primary-500 rounded-full"
              />
            </div>
          </div>
        )}
      </React.Fragment>
    ))}
  </div>
);

// ─── Stat Card ─────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  color?: 'primary' | 'accent' | 'green' | 'red' | 'blue';
  loading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, color = 'primary', loading }) => {
  const colors = {
    primary: 'from-primary-500 to-primary-600',
    accent:  'from-accent-400 to-accent-600',
    green:   'from-emerald-400 to-emerald-600',
    red:     'from-red-400 to-red-600',
    blue:    'from-blue-400 to-blue-600',
  };

  if (loading) {
    return (
      <div className="card p-6 space-y-3">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-32" />
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="card p-6 group cursor-default"
    >
      <div className="flex items-start justify-between">
        <div className={clsx('p-3 rounded-xl bg-gradient-to-br text-white shadow-md group-hover:shadow-lg transition-shadow', colors[color])}>
          {icon}
        </div>
        {trend && (
          <div className={clsx('flex items-center gap-1 text-xs font-semibold', trend.value >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500')}>
            <svg className={clsx('w-3 h-3', trend.value < 0 && 'rotate-180')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-display font-bold text-gray-900 dark:text-white counter-number">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{title}</p>
        {trend && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{trend.label}</p>}
      </div>
    </motion.div>
  );
};

// ─── Empty State ───────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
    {icon && (
      <div className="mb-6 p-6 bg-primary-50 dark:bg-primary-950/30 rounded-3xl text-primary-400">
        {icon}
      </div>
    )}
    <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white">{title}</h3>
    {description && <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-sm">{description}</p>}
    {action && <div className="mt-6">{action}</div>}
  </div>
);

// ─── Divider ──────────────────────────────────────────────────────────────

export const Divider: React.FC<{ label?: string; className?: string }> = ({ label, className }) => (
  <div className={clsx('relative flex items-center', className)}>
    <div className="flex-grow h-px bg-gray-200 dark:bg-navy-700" />
    {label && (
      <span className="mx-3 text-sm text-gray-500 dark:text-gray-400 font-medium shrink-0">{label}</span>
    )}
    <div className="flex-grow h-px bg-gray-200 dark:bg-navy-700" />
  </div>
);

// ─── Tooltip ──────────────────────────────────────────────────────────────

export const Tooltip: React.FC<{ content: string; children: React.ReactNode; position?: 'top' | 'bottom' | 'left' | 'right' }> = ({
  content,
  children,
  position = 'top',
}) => {
  const [visible, setVisible] = React.useState(false);

  const posStyles = {
    top:    '-top-10 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left:   'right-full mr-2 top-1/2 -translate-y-1/2',
    right:  'left-full ml-2 top-1/2 -translate-y-1/2',
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={clsx(
            'absolute z-50 px-2.5 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-medium rounded-lg whitespace-nowrap pointer-events-none shadow-lg',
            posStyles[position]
          )}
        >
          {content}
        </motion.div>
      )}
    </div>
  );
};
