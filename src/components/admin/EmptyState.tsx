import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="w-14 h-14 bg-ivory border border-silver/30 flex items-center justify-center sharp-edge mb-4">
        <Icon className="w-6 h-6 text-silver" />
      </div>
      <h3 className="text-base font-display font-medium text-graphite mb-1">{title}</h3>
      {description && <p className="text-sm text-silver max-w-sm text-center">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
