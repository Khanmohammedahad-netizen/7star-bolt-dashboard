interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
  draggable?: boolean;
  onDragStart?: () => void;
  onClick?: () => void;
}

export function Badge({ children, variant = 'neutral', size = 'md', className = '', draggable, onDragStart, onClick, ...props }: BadgeProps) {
  const variants = {
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    neutral: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md font-medium border ${variants[variant]} ${sizes[size]} ${className}`}
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={onClick}
      {...props}
    >
      {children}
    </span>
  );
}
