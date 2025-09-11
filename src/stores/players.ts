import { defineStore } from 'pinia'
import { ref } from 'vue'
import { PlayerService } from '../services/playerService'
import type { Player, UpdatePlayerRequest } from '../types'

export const usePlayersStore = defineStore('players', () => {
  // State
  const players = ref<Player[]>([])
  const currentPlayer = ref<Player | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  const fetchPlayers = async () => {
    isLoading.value = true
    error.value = null
    try {
      players.value = await PlayerService.getAllPlayers()
    } catch (err) {
      error.value = 'Erro ao carregar jogadores'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchPlayer = async (id: number) => {
    isLoading.value = true
    error.value = null
    try {
      currentPlayer.value = await PlayerService.getPlayer(id)
      return currentPlayer.value
    } catch (err) {
      error.value = 'Erro ao carregar jogador'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updatePlayer = async (id: number, playerData: UpdatePlayerRequest) => {
    isLoading.value = true
    error.value = null
    try {
      const updatedPlayer = await PlayerService.updatePlayer(id, playerData)
      
      // Atualizar na lista se existir
      const index = players.value.findIndex(p => p.id === id)
      if (index !== -1) {
        players.value[index] = updatedPlayer
      }
      
      // Atualizar currentPlayer se for o mesmo
      if (currentPlayer.value?.id === id) {
        currentPlayer.value = updatedPlayer
      }
      
      return updatedPlayer
    } catch (err) {
      error.value = 'Erro ao atualizar jogador'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deletePlayer = async (id: number) => {
    isLoading.value = true
    error.value = null
    try {
      await PlayerService.deletePlayer(id)
      
      // Remover da lista
      players.value = players.value.filter(p => p.id !== id)
      
      // Limpar currentPlayer se for o mesmo
      if (currentPlayer.value?.id === id) {
        currentPlayer.value = null
      }
    } catch (err) {
      error.value = 'Erro ao deletar jogador'
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
    players,
    currentPlayer,
    isLoading,
    error,
    
    // Actions
    fetchPlayers,
    fetchPlayer,
    updatePlayer,
    deletePlayer,
    clearError
  }
})
