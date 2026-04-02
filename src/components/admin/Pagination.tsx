import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

type PaginationProps = {
  total: number;
  perPage?: number;
  currentPage: number;
  onChange: (page: number) => void;
};

export function Pagination({ total, perPage = 15, currentPage, onChange }: PaginationProps) {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;

  const pages: (number | 'ellipsis')[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== 'ellipsis') {
      pages.push('ellipsis');
    }
  }

  return (
    <div className="flex items-center justify-between mt-6">
      <div className="text-xs text-silver">
        Pagina {currentPage} di {totalPages} ({total} risultati)
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 border border-silver/30 sharp-edge text-graphite hover:bg-ivory transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {pages.map((p, i) =>
          p === 'ellipsis' ? (
            <span key={`e${i}`} className="px-2 text-silver text-sm">...</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={cn(
                'min-w-[36px] h-9 text-sm font-medium sharp-edge transition-colors',
                p === currentPage
                  ? 'bg-graphite text-ivory'
                  : 'border border-silver/30 text-graphite hover:bg-ivory'
              )}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 border border-silver/30 sharp-edge text-graphite hover:bg-ivory transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
