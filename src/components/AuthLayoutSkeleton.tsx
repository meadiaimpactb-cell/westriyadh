import { Skeleton } from "./ui/skeleton";

export function AuthLayoutSkeleton() {
  return (
    <div className="flex min-h-screen">
      <div className="w-[280px] border-e p-4 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-8 w-3/4" />
      </div>
      <div className="flex-1 p-8 space-y-4">
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}
