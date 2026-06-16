import UserDetailContent from "@/components/admin/users/UserDetailContent";

type Props = { params: Promise<{ id: string }> };

export default async function AdminUserDetailPage({ params }: Props) {
  const { id } = await params;
  return <UserDetailContent userId={id} />;
}
