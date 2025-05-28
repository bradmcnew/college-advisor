import Image from "next/image";
import type { Card } from "~/app/types";
import { getPostById } from "~/server/queries";
import { notFound } from "next/navigation";
import { requireAuth } from "~/lib/auth-utils";
import { getProfile } from "~/server/queries";
import { CalEmbedButton } from "~/app/components/cal-embed";
import { Button } from "~/components/ui/button";

export default async function PostPage({ id }: { id: string }) {
  await requireAuth();

  const postId = Number(id);

  if (Number.isNaN(postId)) {
    return notFound();
  }

  try {
    const post: Card = await getPostById(postId);
    const profile = await getProfile(post.createdById!);
    const calcomUsername = profile?.calcomUsername;

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-card text-card-foreground mx-auto max-w-4xl overflow-hidden rounded-lg shadow-lg transition-colors duration-200">
          {/* Image Section */}
          <div className="relative h-80 w-full overflow-hidden">
            <Image
              src={post.userImage ?? "/images/placeholder.jpg"}
              alt={post.name ?? "Post image"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
            />
          </div>

          {/* Content Section */}
          <div className="p-6">
            <h1 className="text-foreground mb-4 text-3xl font-bold">
              {post.name ?? "Untitled Post"}
            </h1>

            <div className="text-muted-foreground mb-6 flex items-center text-sm">
              <time dateTime={post.createdAt?.toISOString()}>
                {post.createdAt?.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <span className="mx-2">|</span>
              <span>
                {post.school} • {post.major}
              </span>
            </div>

            <div className="prose dark:prose-invert max-w-none">
              <p className="text-foreground">{post.description}</p>
            </div>

            {/* Additional Information */}
            <div className="mt-6 flex flex-wrap gap-4">
              <div className="flex items-center">
                <svg
                  className="text-primary mr-2 h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-foreground">
                  Graduation Year: {post.graduationYear}
                </span>
              </div>
              <div className="flex items-center">
                <svg
                  className="text-primary mr-2 h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-foreground">
                  School Year: {post.schoolYear}
                </span>
              </div>
            </div>

            {/* Call to Action */}
            <div className="mt-8 flex flex-col space-y-2">
              <Button>Schedule a Video Meeting</Button>
              {calcomUsername && (
                <CalEmbedButton username={calcomUsername}>
                  View {post.name}&apos;s Calendar
                </CalEmbedButton>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching post:", error);
    return notFound();
  }
}
