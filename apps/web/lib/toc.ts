import { toc } from "mdast-util-toc"
import { remark } from "remark"
import { visit } from "unist-util-visit"
import type { Node } from "unist"
import type { Root } from "mdast"

const textTypes = ["text", "emphasis", "strong", "inlineCode"]

function flattenNode(node: Node): string {
  const p: string[] = []
  visit(node, (node: Node) => {
    if (!textTypes.includes(node.type)) return
    if ('value' in node && typeof node.value === 'string') {
      p.push(node.value)
    }
  })
  return p.join(``)
}

interface Item {
  title: string
  url: string
  items?: Item[]
}

interface Items {
  items?: Item[]
}

function getItems(node: Node, current: Item): Items {
  if (!node) {
    return {}
  }

  if (node.type === "paragraph") {
    visit(node, (item: Node) => {
      if (item.type === "link" && 'url' in item && typeof item.url === 'string') {
        current.url = item.url
        current.title = flattenNode(node)
      }

      if (item.type === "text") {
        current.title = flattenNode(node)
      }
    })

    return current
  }

  if (node.type === "list" && 'children' in node && Array.isArray(node.children)) {
    current.items = node.children.map((i: Node) => getItems(i, { title: '', url: '' })).filter((item): item is Item => 'title' in item && 'url' in item)

    return current
  } else if (node.type === "listItem" && 'children' in node && Array.isArray(node.children)) {
    const heading = getItems(node.children[0], { title: '', url: '' }) as Item

    if (node.children.length > 1) {
      getItems(node.children[1], heading)
    }

    return heading
  }

  return {}
}

const getToc = () => (node: Root, file: { data?: Record<string, unknown> }) => {
  const table = toc(node)
  if (table.map) {
    file.data = getItems(table.map, { title: '', url: '' }) as Record<string, unknown>
  }
}

export type TableOfContents = Items

export async function getTableOfContents(
  content: string
): Promise<TableOfContents> {
  const result = await remark().use(getToc).process(content)

  return result.data as TableOfContents
}
