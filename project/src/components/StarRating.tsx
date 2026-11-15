import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  count?: number;
  size?: number;
  showCount?: boolean;
}

export default function StarRating({ rating, count, size = 16, showCount = true }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={
              star <= Math.round(rating)
                ? 'fill-gold-400 text-gold-400'
                : 'fill-gray-200 text-gray-200'
            }
          />
        ))}
      </div>
      <span className="text-sm font-semibold text-navy-700">
        {rating > 0 ? rating.toFixed(1) : '—'}
      </span>
      {showCount && count !== undefined && (
        <span className="text-xs text-gray-500">({count})</span>
      )}
    </div>
  );
}
