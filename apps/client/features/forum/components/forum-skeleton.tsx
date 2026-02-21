// features/forum/components/skeleton.tsx
export default function ForumSkeleton() {
  return (
    <div className="flex flex-col h-full space-y-6 p-4 sm:p-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-muted animate-pulse" />
          <div className="space-y-2">
            <div className="h-5 w-32 rounded bg-muted animate-pulse" />
            <div className="h-4 w-48 rounded bg-muted animate-pulse" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="size-10 rounded-full bg-muted animate-pulse" />
          <div className="size-10 rounded-full bg-muted animate-pulse" />
        </div>
      </div>

      {/* Messages area skeleton */}
      <div className="flex-1 space-y-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={`flex gap-3 ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
          >
            <div className="size-10 rounded-full bg-muted animate-pulse shrink-0" />
            <div className="space-y-2 max-w-[70%]">
              <div className="h-4 w-24 rounded bg-muted animate-pulse" />
              <div className="h-10 w-full rounded-lg bg-muted animate-pulse" />
              <div className="h-4 w-16 rounded bg-muted animate-pulse ml-auto" />
            </div>
          </div>
        ))}
      </div>

      {/* Input area skeleton */}
      <div className="border-t pt-4">
        <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
          <div className="size-10 rounded-full bg-muted animate-pulse" />
          <div className="flex-1 h-10 rounded-lg bg-muted animate-pulse" />
          <div className="size-10 rounded-full bg-muted animate-pulse" />
        </div>
      </div>
    </div>
  );
}