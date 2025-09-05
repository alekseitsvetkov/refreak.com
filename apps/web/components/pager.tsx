interface Link {
  items?: Link[]
}

export function flatten(links: Link[]): Link[] {
  return links.reduce((flat: Link[], link: Link) => {
    return flat.concat(link.items ? flatten(link.items) : link)
  }, [])
}
