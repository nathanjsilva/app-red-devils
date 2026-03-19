import { ref, watch } from 'vue'

interface SEOData {
  title?: string
  description?: string
  image?: string
  url?: string
}

export function useSEO() {
  const title = ref('Red Devils')
  const description = ref('Sistema de gerenciamento e estatisticas da pelada Red Devils.')
  const image = ref('/logo-red-devils.png')
  const url = ref('https://red-devils.app/')

  const updateMetaTag = (name: string, content: string, property = false) => {
    const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`
    let tag = document.querySelector(selector) as HTMLMetaElement

    if (!tag) {
      tag = document.createElement('meta')
      if (property) {
        tag.setAttribute('property', name)
      } else {
        tag.setAttribute('name', name)
      }
      document.head.appendChild(tag)
    }

    tag.setAttribute('content', content)
  }

  const updateSEO = (data: SEOData) => {
    if (data.title) title.value = data.title
    if (data.description) description.value = data.description
    if (data.image) image.value = data.image
    if (data.url) url.value = data.url

    document.title = title.value
    updateMetaTag('description', description.value)
    updateMetaTag('og:title', title.value, true)
    updateMetaTag('og:description', description.value, true)
    updateMetaTag('og:image', image.value, true)
    updateMetaTag('og:url', url.value, true)
    updateMetaTag('twitter:card', 'summary_large_image')
    updateMetaTag('twitter:title', title.value)
    updateMetaTag('twitter:description', description.value)
    updateMetaTag('twitter:image', image.value)
  }

  watch([title, description, image, url], () => {
    updateSEO({})
  })

  return {
    title,
    description,
    image,
    url,
    updateSEO
  }
}
