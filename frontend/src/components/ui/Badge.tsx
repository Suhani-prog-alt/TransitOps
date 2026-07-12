import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'blue' | 'yellow' | 'red' | 'purple' | 'gray';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'gray', className = '' }) => {
  const styles = {
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    yellow: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    purple: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    gray: 'bg-white/5 text-gray-400 border-white/10',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export const VehicleStatusBadge: React.FC<{ status: 'Available' | 'In Trip' | 'In Shop' | 'Retired' | string }> = ({ status }) => {
  const normalized = status.toLowerCase();
  
  if (normalized === 'available') return <Badge variant="green">Available</Badge>;
  if (normalized === 'in trip') return <Badge variant="blue">On Trip</Badge>;
  if (normalized === 'in shop') return <Badge variant="yellow">In Shop</Badge>;
  if (normalized === 'retired') return <Badge variant="red">Retired</Badge>;
  
  return <Badge>{status}</Badge>;
};

export const MaintenancePriorityBadge: React.FC<{ priority: 'Low' | 'Medium' | 'High' | 'Critical' | string }> = ({ priority }) => {
  const normalized = priority.toLowerCase();

  if (normalized === 'low') return <Badge variant="gray">Low</Badge>;
  if (normalized === 'medium') return <Badge variant="blue">Medium</Badge>;
  if (normalized === 'high') return <Badge variant="yellow">High</Badge>;
  if (normalized === 'critical') return <Badge variant="red">Critical</Badge>;

  return <Badge>{priority}</Badge>;
};
