import { notFound } from "next/navigation";
import { db } from "@/lib/mock-db";
import PublicProfile from "@/components/users/PublicProfile";

type Props = { params: Promise<{ id: string }> };

export default async function UserProfilePage({ params }: Props) {
  const { id } = await params;

  const user = db.users.findById(id);
  if (!user) notFound();

  const stories = db.stories.getByUser(id);

  return <PublicProfile user={user} stories={stories} />;
}
