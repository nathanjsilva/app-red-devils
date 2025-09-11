import { ref, watch } from 'vue'

interface SEOData {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
}

export function useSEO() {
  const title = ref('Red Devils - Sistema de Estatísticas de Futebol')
  const description = ref('Sistema de gerenciamento de estatísticas de futebol e pelada. Acompanhe rankings, jogadores e partidas.')
  const keywords = ref('futebol, pelada, estatísticas, ranking, jogadores, red devils')
  const image = ref('/src/assets/logo-red-devils.png')
  const url = ref('https://red-devils.app/')

  const updateMetaTag = (name: string, content: string, attribute: string = 'name') => {
    let meta = document.querySelector(`meta[${attribute}="${name}"]`)
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute(attribute, name)
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', content)
  }

  const updateMetaTags = () => {
    // Atualizar title
    document.title = title.value

    // Atualizar meta description
    updateMetaTag('description', description.value)
    updateMetaTag('keywords', keywords.value)

    // Atualizar Open Graph
    updateMetaTag('og:title', title.value, 'property')
    updateMetaTag('og:description', description.value, 'property')
    updateMetaTag('og:image', image.value, 'property')
    updateMetaTag('og:url', url.value, 'property')

    // Atualizar Twitter
    updateMetaTag('twitter:title', title.value, 'name')
    updateMetaTag('twitter:description', description.value, 'name')
    updateMetaTag('twitter:image', image.value, 'name')
    updateMetaTag('twitter:url', url.value, 'name')
  }

  const updateSEO = (data: SEOData) => {
    if (data.title) title.value = data.title
    if (data.description) description.value = data.description
    if (data.keywords) keywords.value = data.keywords
    if (data.image) image.value = data.image
    if (data.url) url.value = data.url
  }

  // Watcher para atualizar meta tags quando os valores mudarem
  watch([title, description, keywords, image, url], () => {
    updateMetaTags()
  }, { immediate: true })

  return {
    title,
    description,
    keywords,
    image,
    url,
    updateSEO
  }
}
