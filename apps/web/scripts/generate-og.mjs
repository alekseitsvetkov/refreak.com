import fs from "fs"
import path from "path"
import { fileURLToPath, pathToFileURL } from "url"
import { setTimeout as wait } from "timers/promises"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true })
}

const DEFAULT_BG = "/images/blog/blog-picture.png"
function absoluteBg(publicUrl, imagePath) {
  if (!imagePath) return `${publicUrl}${DEFAULT_BG}`
  // If the post image already points to a static OG file, fall back to the default background
  if (imagePath.startsWith("/og/")) return `${publicUrl}${DEFAULT_BG}`
  if (imagePath.startsWith("http")) return imagePath
  return `${publicUrl}${imagePath}`
}

async function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { method: "HEAD" })
      if (res.ok || res.status === 404) return true
    } catch {}
    await wait(500)
  }
  return false
}

async function main() {
  const publicUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const ready = await waitForServer(publicUrl)
  if (!ready) {
    console.warn(`Server not reachable at ${publicUrl}. Start the app (next start) and rerun.`)
    process.exit(0)
  }

  // Dynamically import Contentlayer generated data to avoid package export restrictions
  const generatedPath = path.join(process.cwd(), ".contentlayer", "generated", "index.mjs")
  const { allPosts } = await import(pathToFileURL(generatedPath).href)

  const outRoot = path.join(process.cwd(), "public", "og")
  await ensureDir(outRoot)

  const results = []
  const failures = []

  for (const post of allPosts) {
    try {
      const outDir = path.join(outRoot, post.locale)
      await ensureDir(outDir)
      const outPath = path.join(outDir, `${post.slugAsParams}.png`)

      const params = new URLSearchParams()
      params.set("heading", post.title)
      params.set("type", "Blog Post")
      params.set("mode", "dark")
      params.set("bg", absoluteBg(publicUrl, post.image))

      const apiUrl = `${publicUrl}/api/og?${params.toString()}`
      const res = await fetch(apiUrl)
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }
      const arrayBuf = await res.arrayBuffer()
      await fs.promises.writeFile(outPath, Buffer.from(arrayBuf))
      results.push(outPath)
      console.log(`OG generated: ${path.relative(process.cwd(), outPath)}`)
    } catch (e) {
      console.error(`OG failed for ${post.locale}/${post.slugAsParams}: ${e}`)
      failures.push({ locale: post.locale, slug: post.slugAsParams })
      continue
    }
  }

  console.log(`\nGenerated ${results.length} OG images into public/og`)
  if (failures.length) {
    console.warn("Failures:")
    for (const f of failures) console.warn(` - ${f.locale}/${f.slug}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})


