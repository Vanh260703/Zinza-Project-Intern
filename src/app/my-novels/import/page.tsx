import ImportZipForm from "@/components/my-novels/ImportZipForm";

export default function ImportZipPage() {
  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 flex flex-col gap-6">
      <div>
        <h2 className="text-white font-bold text-lg">Import từ ZIP</h2>
        <p className="text-stone-500 text-sm mt-0.5">Tải lên file ZIP chứa các chương truyện</p>
      </div>
      <ImportZipForm />
    </div>
  );
}
