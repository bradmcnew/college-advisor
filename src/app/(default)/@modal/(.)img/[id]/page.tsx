import { getPostById } from "~/server/queries";
import { getProfile } from "~/server/queries";
import { CalEmbedButton } from "~/app/components/cal-embed";
import Image from "next/image";
import { Modal } from "~/app/(default)/@modal/(.)img/[id]/modal";
import { requireAuth } from "~/lib/auth-utils";

export default async function PostModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();

  const { id: postId } = await params;
  const idAsNumber = Number(postId);

  if (Number.isNaN(idAsNumber)) {
    throw new Error("Invalid post ID");
  }

  const post = await getPostById(idAsNumber);
  const profile = await getProfile(post.createdById!);
  const username = profile?.calcomUsername;

  return (
    <Modal>
      <div className="flex flex-col items-center">
        {/* Image */}
        <div className="relative h-80 w-full overflow-hidden rounded-lg">
          <Image
            src={post.userImage ?? "/images/placeholder.jpg"}
            alt={`Post ${postId}`}
            fill
            className="rounded-lg object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        {/* Details */}
        <div className="mt-6 w-full">
          <h2 className="text-2xl font-bold text-gray-900">{post.name}</h2>
          <p className="mt-2 text-gray-700">{post.description}</p>

          <div className="mt-4 flex space-x-4">
            <span className="text-sm text-gray-500">School: {post.school}</span>
            <span className="text-sm text-gray-500">Major: {post.major}</span>
            <span className="text-sm text-gray-500">
              Graduation Year: {post.graduationYear}
            </span>
            <span className="text-sm text-gray-500">
              School Year: {post.schoolYear}
            </span>
          </div>

          {/* Call to Action */}
          <div className="mt-6 flex flex-col space-y-2">
            {username && (
              <CalEmbedButton username={username}>
                View {post.name}&apos;s Calendar
              </CalEmbedButton>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
