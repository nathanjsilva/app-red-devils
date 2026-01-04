import { defineStore } from 'pinia'
import { ref } from 'vue'
import { PeladaService } from '../services/peladaService'
import type { Pelada, CreatePeladaRequest } from '../types'

export const usePeladasStore = defineStore('peladas', () => {
  // State
  const peladas = ref<Pelada[]>([])
  const currentPelada = ref<Pelada | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  const fetchPeladas = async () => {
    isLoading.value = true
    error.value = null
    try {
      peladas.value = await PeladaService.getAllPeladas()
    } catch (err) {
      error.value = 'Erro ao carregar peladas'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchPelada = async (id: number) => {
    isLoading.value = true
    error.value = null
    try {
      currentPelada.value = await PeladaService.getPelada(id)
      return currentPelada.value
    } catch (err) {
      error.value = 'Erro ao carregar pelada'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const createPelada = async (peladaData: CreatePeladaRequest) => {
    isLoading.value = true
    error.value = null
    try {
      const newPelada = await PeladaService.createPelada(peladaData)
      peladas.value.push(newPelada)
      return newPelada
    } catch (err) {
      error.value = 'Erro ao criar pelada'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updatePelada = async (id: number, peladaData: Partial<CreatePeladaRequest>) => {
    isLoading.value = true
    error.value = null
    try {
      const updatedPelada = await PeladaService.updatePelada(id, peladaData)
      
      // Atualizar na lista
      const index = peladas.value.findIndex(p => p.id === id)
      if (index !== -1) {
        peladas.value[index] = updatedPelada
      }
      
      // Atualizar currentPelada se for o mesmo
      if (currentPelada.value?.id === id) {
        currentPelada.value = updatedPelada
      }
      
      return updatedPelada
    } catch (err) {
      error.value = 'Erro ao atualizar pelada'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deletePelada = async (id: number) => {
    isLoading.value = true
    error.value = null
    try {
      await PeladaService.deletePelada(id)
      
      // Remover da lista
      peladas.value = peladas.value.filter(p => p.id !== id)
      
      // Limpar currentPelada se for o mesmo
      if (currentPelada.value?.id === id) {
        currentPelada.value = null
      }
    } catch (err) {
      error.value = 'Erro ao deletar pelada'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    peladas,
    currentPelada,
    isLoading,
    error,
    
    // Actions
    fetchPeladas,
    fetchPelada,
    createPelada,
    updatePelada,
    deletePelada,
    clearError
  }
})

