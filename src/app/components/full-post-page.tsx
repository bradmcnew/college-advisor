import Link from "next/link";
import Image from "next/image";
import type { Card } from "~/app/types";
import { getPostById } from "~/server/queries";
import { notFound } from "next/navigation";

export default async function PostPage({ id }: { id: string }) {
  const postId = Number(id);

  if (Number.isNaN(postId)) {
    return notFound();
  }

  try {
    const post: Card = await getPostById(postId);

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-lg bg-white shadow-lg">
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
            <h1 className="mb-4 text-3xl font-bold text-gray-900">
              {post.name ?? "Untitled Post"}
            </h1>

            <div className="mb-6 flex items-center text-sm text-gray-500">
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

            <div className="prose max-w-none">
              <p className="text-gray-700">{post.description}</p>
            </div>

            {/* Additional Information */}
            <div className="mt-6 flex flex-wrap gap-4">
              <div className="flex items-center">
                <svg
                  className="mr-2 h-5 w-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>Graduation Year: {post.graduationYear}</span>
              </div>
              <div className="flex items-center">
                <svg
                  className="mr-2 h-5 w-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>School Year: {post.schoolYear}</span>
              </div>
              {/* Add more info as needed */}
            </div>

            {/* Call to Action */}
            <div className="mt-8">
              <Link
                href="/meet"
                className="inline-block rounded bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
              >
                Schedule a Video Meeting
              </Link>
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
