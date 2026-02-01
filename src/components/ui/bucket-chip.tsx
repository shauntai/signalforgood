import { cn } from "@/lib/utils";
import { BUCKETS, type BucketSlug } from "@/lib/constants";

interface BucketChipProps {
  bucket: BucketSlug;
  showLabel?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const bucketColorMap: Record<BucketSlug, string> = {
  education: 'bg-bucket-education',
  jobs: 'bg-bucket-jobs',
  housing: 'bg-bucket-housing',
  health: 'bg-bucket-health',
};

const bucketTextMap: Record<BucketSlug, string> = {
  education: 'text-bucket-education',
  jobs: 'text-bucket-jobs',
  housing: 'text-bucket-housing',
  health: 'text-bucket-health',
};

export function BucketChip({ bucket, showLabel = true, size = 'sm', className }: BucketChipProps) {
  const bucketData = BUCKETS.find(b => b.slug === bucket);
  
  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 rounded-full",
      size === 'sm' ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
      showLabel ? "bg-secondary" : "",
      className
    )}>
      <span className={cn(
        "rounded-full",
        size === 'sm' ? "h-2 w-2" : "h-2.5 w-2.5",
        bucketColorMap[bucket]
      )} />
      {showLabel && (
        <span className={cn("font-medium", bucketTextMap[bucket])}>
          {bucketData?.name}
        </span>
      )}
    </div>
  );
}
