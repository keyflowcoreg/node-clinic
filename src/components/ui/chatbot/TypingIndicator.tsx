export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-1.5 h-1.5 bg-graphite/40 rounded-full typing-dot typing-dot-1" />
      <div className="w-1.5 h-1.5 bg-graphite/40 rounded-full typing-dot typing-dot-2" />
      <div className="w-1.5 h-1.5 bg-graphite/40 rounded-full typing-dot typing-dot-3" />
    </div>
  )
}
