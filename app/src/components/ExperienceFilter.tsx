// ---------------------------------------------------------------
// ExperienceFilter — horizontal scrollable filter chips for
// browsing vehicles by experience tag (Date Night, Boss Move, etc.)
// ---------------------------------------------------------------

interface ExperienceFilterProps {
  tags: string[];
  activeTag: string;
  onTagChange: (tag: string) => void;
}

const ExperienceFilter = ({ tags, activeTag, onTagChange }: ExperienceFilterProps) => {
  return (
    <div className="relative">
      {/* Horizontal scrollable row; scrollbar hidden for clean look */}
      <div
        className="flex gap-3 overflow-x-auto pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {tags.map((tag) => {
          const isActive = tag === activeTag;
          return (
            <button
              key={tag}
              onClick={() => onTagChange(tag)}
              data-cursor="hover"
              className={`
                flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium
                transition-all duration-300 whitespace-nowrap
                ${
                  isActive
                    ? 'bg-[#D4AF37] text-[#050505] shadow-lg shadow-[#D4AF37]/20'
                    : 'border border-white/20 text-white/50 hover:border-[#D4AF37]/50 hover:text-white/80'
                }
              `}
            >
              {tag}
            </button>
          );
        })}
      </div>

      {/* Hide webkit scrollbar */}
      <style>{`
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default ExperienceFilter;
