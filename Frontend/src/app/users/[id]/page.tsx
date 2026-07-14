import { notFound } from "next/navigation";
import { getPublicProfile } from "@/lib/api/publicProfile";
import PublicProfile from "@/components/users/PublicProfile";

type Props = { params: Promise<{ id: string }> };

export default async function UserProfilePage({ params }: Props) {
  const { id } = await params;
  const data = await getPublicProfile(id);
  if (!data) notFound();

  return <PublicProfile user={data.user} stories={data.stories} />;
}
