import { Heart, Eye, Share2 } from 'lucide-react';

export const wishlistCountColumn = {
  header: 'Wishlist',
  cell: (prop) => (
    <div className="flex items-center gap-1.5">
      <Heart
        size={14}
        className="text-rose-500"
        fill={prop.wishlistCount > 0 ? 'currentColor' : 'none'}
      />
      <span>{prop.wishlistCount ?? 0}</span>
    </div>
  ),
};

export const shareCountColumn = {
  header: 'Shares',
  cell: (prop) => (
    <div className="flex items-center gap-1.5">
      <Share2 size={14} className="text-amber-500" />
      <span>{prop.shareCount ?? 0}</span>
    </div>
  ),
};

export const viewsCountColumn = {
  header: 'Total Views',
  cell: (prop) => (
    <div className="flex items-center gap-1.5">
      <Eye size={14} className="text-slate-400" />
      <span>{prop.views ?? 0}</span>
    </div>
  ),
};
