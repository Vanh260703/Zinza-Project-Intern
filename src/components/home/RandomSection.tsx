import SectionHeader from "./SectionHeader";

export default function RandomSection() {
  return (
    <section>
      <SectionHeader
        icon="🎲"
        title="Khám phá ngẫu nhiên"
        badge="Chất lượng >4.5⭐"
        iconBg="bg-violet-500/20"
      />
      <div className="flex gap-6 p-6 rounded-2xl bg-stone-900 border border-stone-800 animate-pulse">
        <div className="w-36 shrink-0 rounded-xl bg-stone-800" style={{ aspectRatio: "3/4" }} />
        <div className="flex-1 space-y-3 py-2">
          <div className="h-6 bg-stone-800 rounded w-2/3" />
          <div className="h-4 bg-stone-800 rounded w-1/3" />
          <div className="h-4 bg-stone-800 rounded w-1/2" />
          <div className="flex gap-2 mt-3">
            <div className="h-6 bg-stone-800 rounded-full w-16" />
            <div className="h-6 bg-stone-800 rounded-full w-20" />
          </div>
          <div className="h-4 bg-stone-800 rounded w-full mt-2" />
          <div className="h-4 bg-stone-800 rounded w-5/6" />
        </div>
      </div>
    </section>
  );
}
