import { Link } from 'react-router';
import type { Vehicle } from '../types/database';

// ---------------------------------------------------------------
// VehicleCard — cinematic vehicle card with identity headline,
// hero image, price, and experience tag pills.
// ---------------------------------------------------------------

interface VehicleCardProps {
  vehicle: Vehicle;
}

const VehicleCard = ({ vehicle }: VehicleCardProps) => {
  const formattedPrice = `$${(vehicle.daily_price_cents / 100).toLocaleString()}/day`;

  return (
    <Link
      to={`/fleet/${vehicle.slug}`}
      data-cursor="hover"
      className="group block rounded-xl overflow-hidden bg-white/[0.03] border border-white/5 hover:border-[#D4AF37]/30 transition-all duration-500"
    >
      {/* Image container with 4:3 aspect ratio */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={vehicle.images[0] || '/images/placeholder-vehicle.jpg'}
          alt={vehicle.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />

        {/* Gradient overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent" />

        {/* Price badge */}
        <div className="absolute top-4 right-4 bg-[#050505]/70 backdrop-blur-sm border border-[#D4AF37]/30 rounded-full px-4 py-1.5">
          <span className="text-[#D4AF37] text-sm font-semibold">
            {formattedPrice}
          </span>
        </div>
      </div>

      {/* Card content */}
      <div className="p-5 space-y-3">
        {/* Identity headline — the primary pitch */}
        <h3 className="text-white text-lg font-semibold leading-snug tracking-tight group-hover:text-[#D4AF37] transition-colors duration-300">
          {vehicle.headline}
        </h3>

        {/* Vehicle name — secondary, label style */}
        <p className="museo-label text-white/40">
          {vehicle.name}
        </p>

        {/* Experience tags */}
        <div className="flex flex-wrap gap-2 pt-1">
          {vehicle.experience_tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] uppercase tracking-wider font-medium text-white/30 border border-white/10 rounded-full px-2.5 py-1"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
};

export default VehicleCard;
