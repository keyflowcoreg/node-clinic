/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-graphite/20 border-t-graphite animate-spin rounded-full" />
        <p className="text-sm text-silver tracking-widest uppercase">Caricamento...</p>
      </div>
    </div>
  );
}
