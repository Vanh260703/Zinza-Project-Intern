import LibraryContent from "@/components/profile/LibraryContent";

export default function LibraryPage() {
  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 flex flex-col gap-6">
      <div>
        <h2 className="text-white font-bold text-lg">Tủ truyện</h2>
        <p className="text-stone-500 text-sm mt-0.5">Truyện bạn đang theo dõi và đã đọc</p>
      </div>
      <LibraryContent />
    </div>
  );
}
