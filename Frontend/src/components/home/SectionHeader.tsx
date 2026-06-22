type SectionHeaderProps = {
  icon: string;
  title: string;
  badge?: string;
  iconBg?: string;
};

export default function SectionHeader({
  icon,
  title,
  badge,
  iconBg = "bg-amber-500/20",
}: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className={`flex items-center justify-center w-8 h-8 ${iconBg} rounded-lg`}>
        <span className="text-base">{icon}</span>
      </div>
      <h2 className="text-white text-xl font-bold">{title}</h2>
      {badge && (
        <span className="text-xs px-2 py-0.5 bg-violet-500/20 text-violet-400 rounded-full font-medium border border-violet-500/30">
          {badge}
        </span>
      )}
      <div className="flex-1 h-px bg-stone-700/60 ml-2" />
    </div>
  );
}
