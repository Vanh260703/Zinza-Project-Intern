import ProfileStats from "@/components/profile/ProfileStats";
import ProfileTabs from "@/components/profile/ProfileTabs";

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-5">
      <ProfileStats />
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
        <div className="mb-5">
          <h2 className="text-white font-bold text-lg">Hồ sơ cá nhân</h2>
          <p className="text-stone-500 text-sm mt-0.5">Quản lý thông tin tài khoản của bạn</p>
        </div>
        <ProfileTabs />
      </div>
    </div>
  );
}
