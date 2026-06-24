// Shown in the right panel while GitHub/resume data is loading.
// Mirrors the shape of GitHubStats + ResumeStats cards so the
// layout doesn't jump when real data arrives.

function Bone({
  className = "",
  style = {},
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`animate-pulse rounded bg-(--color-surface-2) ${className}`}
      style={style}
    />
  );
}

// ─── GitHub card skeleton ─────────────────────────────────────────────────────
export function GitHubSkeleton() {
  return (
    <div className="rounded-lg border border-(--color-border) bg-(--color-surface) p-5">
      <div className="mb-4 flex items-center justify-between">
        <Bone className="h-3 w-28" />
        <Bone className="h-4 w-10 rounded-full" />
      </div>

      {/* User card */}
      <div className="flex items-center gap-4 rounded-lg border border-(--color-border) bg-(--color-surface) p-4">
        <Bone className="h-14 w-14 rounded-full shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <Bone className="h-4 w-32" />
          <Bone className="h-3 w-24" />
          <Bone className="h-3 w-48" />
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-4 grid grid-cols-4 gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-md border border-(--color-border) bg-(--color-surface) p-3">
            <Bone className="h-3 w-10 mb-2" />
            <Bone className="h-5 w-8" />
          </div>
        ))}
      </div>

      {/* Language bar */}
      <div className="mt-4">
        <Bone className="h-2 w-full rounded-full" />
        <div className="mt-2 flex gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <Bone className="h-2.5 w-2.5 rounded-full" />
              <Bone className="h-2.5 w-16" />
            </div>
          ))}
        </div>
      </div>

      {/* Repos */}
      <div className="mt-4 flex flex-col gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-md border border-(--color-border) bg-(--color-surface) p-3">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1.5 flex-1">
                <Bone className="h-3 w-36" />
                <Bone className="h-2.5 w-52" />
              </div>
              <Bone className="h-3 w-16 shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Resume card skeleton ─────────────────────────────────────────────────────
export function ResumeSkeleton() {
  return (
    <div className="rounded-lg border border-(--color-border) bg-(--color-surface) p-5">
      <div className="mb-4 flex items-center justify-between">
        <Bone className="h-3 w-28" />
        <Bone className="h-4 w-10 rounded-full" />
      </div>

      {/* Candidate card */}
      <div className="rounded-lg border border-(--color-border) bg-(--color-surface) p-4">
        <Bone className="h-3 w-20 mb-3" />
        <div className="flex flex-col gap-2">
          <Bone className="h-4 w-40" />
          <Bone className="h-3 w-52" />
          <Bone className="h-3 w-36" />
        </div>
      </div>

      {/* Skills */}
      <div className="mt-4">
        <Bone className="h-3 w-32 mb-2" />
        <div className="flex flex-wrap gap-2">
          {[...Array(8)].map((_, i) => (
            <Bone key={i} className="h-5 rounded-full" style={{ width: `${50 + i * 10}px` }} />
          ))}
        </div>
      </div>

      {/* Experience */}
      <div className="mt-4 flex flex-col gap-2">
        <Bone className="h-3 w-24 mb-1" />
        {[...Array(2)].map((_, i) => (
          <div key={i} className="rounded-md border border-(--color-border) bg-(--color-surface) p-3">
            <div className="flex justify-between">
              <Bone className="h-3 w-40" />
              <Bone className="h-3 w-20 shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Analysis report skeleton ─────────────────────────────────────────────────
// Shown in the full-screen report view while AI is running.
export function AnalysisSkeleton() {
  return (
    <div className="flex flex-col gap-5 rounded-lg border border-(--color-border) bg-(--color-surface) p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Bone className="h-3 w-24" />
        <Bone className="h-5 w-28 rounded-full" />
      </div>

      {/* Score cards */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="rounded-md border border-(--color-border) bg-(--color-canvas) p-3">
            <Bone className="h-3 w-3 mb-2" />
            <Bone className="h-6 w-10 mb-1" />
            <Bone className="h-2.5 w-16 mb-2" />
            <Bone className="h-0.5 w-full rounded-full" />
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="flex flex-col gap-1.5">
        <Bone className="h-3 w-full" />
        <Bone className="h-3 w-full" />
        <Bone className="h-3 w-3/4" />
      </div>

      {/* Heatmap */}
      <div>
        <Bone className="h-3 w-28 mb-3" />
        <div className="flex flex-col gap-2.5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Bone className="h-3 w-28 shrink-0" />
              <div className="flex gap-1">
                {[...Array(12)].map((_, j) => (
                  <Bone key={j} style={{ width: 12, height: 12, borderRadius: 3 }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lang proficiency */}
      <div>
        <Bone className="h-3 w-40 mb-2" />
        <div className="flex flex-col gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-md border border-(--color-border) bg-(--color-surface-2) p-3">
              <div className="flex items-center justify-between mb-1">
                <Bone className="h-3 w-24" />
                <Bone className="h-3 w-20" />
              </div>
              <Bone className="h-2.5 w-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Project quality */}
      <div>
        <Bone className="h-3 w-32 mb-2" />
        <div className="flex flex-col gap-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="rounded-md border border-(--color-border) bg-(--color-surface-2) p-3">
              <div className="flex items-center justify-between mb-2">
                <Bone className="h-3 w-40" />
                <Bone className="h-3 w-12" />
              </div>
              <Bone className="h-1 w-full rounded-full mb-2" />
              <Bone className="h-2.5 w-48 mb-1" />
              <Bone className="h-2.5 w-36" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
