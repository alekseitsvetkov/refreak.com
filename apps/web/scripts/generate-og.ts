/*
  Node script to pre-generate static OG images for all posts.
  It calls the existing /api/og endpoint and writes PNG files
  to public/og/<locale>/<slug>.png
*/

import fs from "fs"
import path from "path"
import { allPosts } from "@/.contentlayer/generated"

async function ensureDir(dir: string) {
  await fs.promises.mkdir(dir, { recursive: true })
}

function absoluteBg(publicUrl: string, imagePath: string | undefined) {
  if (!imagePath) return ""
  if (imagePath.startsWith("http")) return imagePath
  return `${publicUrl}${imagePath}`
}

async function main() {
  const publicUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const outRoot = path.join(process.cwd(), "public", "og")
  await ensureDir(outRoot)

  const results: Array<{ slug: string; locale: string; outPath: string }> = []

  for (const post of allPosts) {
    const outDir = path.join(outRoot, post.locale)
    await ensureDir(outDir)
    const outPath = path.join(outDir, `${post.slugAsParams}.png`)

    const params = new URLSearchParams()
    params.set("heading", post.title)
    params.set("type", "Blog Post")
    params.set("mode", "dark")
    params.set("bg", absoluteBg(publicUrl, (post as any).image))

    const apiUrl = `${publicUrl}/api/og?${params.toString()}`
    const res = await fetch(apiUrl)
    if (!res.ok) {
      throw new Error(`Failed to render OG for ${post.slug} (${res.status})`)
    }
    const arrayBuf = await res.arrayBuffer()
    await fs.promises.writeFile(outPath, Buffer.from(arrayBuf))

    results.push({ slug: post.slugAsParams, locale: post.locale, outPath })
    console.log(`OG generated: ${path.relative(process.cwd(), outPath)}`)
  }

  console.log(`\nGenerated ${results.length} OG images into public/og`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})


