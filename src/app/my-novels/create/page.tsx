import CreateNovelForm from "@/components/my-novels/CreateNovelForm";

export default function CreateNovelPage() {
  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 flex flex-col gap-6">
      <div>
        <h2 className="text-white font-bold text-lg">Đăng truyện mới</h2>
        <p className="text-stone-500 text-sm mt-0.5">Điền thông tin để đăng truyện của bạn</p>
      </div>
      <CreateNovelForm />
    </div>
  );
}
