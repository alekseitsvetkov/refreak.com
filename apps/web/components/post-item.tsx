import Link from "next/link"
import { Post } from "@prisma/client"

import { Skeleton } from "@/components/ui/skeleton"
import { PostOperations } from "@/components/post-operations"
import { DateDisplay } from "@/components/ui/date-display"

interface PostItemProps {
  post: Pick<Post, "id" | "title" | "published" | "createdAt">
}

export function PostItem({ post }: PostItemProps) {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="grid gap-1">
        <Link
          href={`/editor/${post.id}`}
          className="font-semibold hover:underline"
        >
          {post.title}
        </Link>
        <div>
          <DateDisplay
            date={post.createdAt}
            format="short"
            className="text-sm text-muted-foreground"
          />
        </div>
      </div>
      <PostOperations post={{ id: post.id, title: post.title }} />
    </div>
  )
}

PostItem.Skeleton = function PostItemSkeleton() {
  return (
    <div className="p-4">
      <div className="space-y-3">
        <Skeleton className="h-5 w-2/5" />
        <Skeleton className="size-4/5" />
      </div>
    </div>
  )
}
