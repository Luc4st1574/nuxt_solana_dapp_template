<script setup>
import { ref, onMounted } from 'vue'
import { useNuxtApp } from '#app'

const phantom = ref(null)
const publicWalletAddress = ref('')

onMounted(async () => {
  const { $phantom } = useNuxtApp()
  phantom.value = await $phantom
})

async function connectPhantom() {
  if (!phantom.value) {
    alert('Phantom Wallet is not available. Please install it from https://phantom.app/')
    return
  }

  try {
    const response = await phantom.value.connect({ onlyIfTrusted: false })
    publicWalletAddress.value = response.publicKey.toString()
    console.log('Connected with Public Key:', response.publicKey.toString())
  } catch (error) {
    console.error('Failed to connect Phantom Wallet:', error)
  }
}
</script>

<template>
  <div class="center-container">
    <!-- Connect Wallet Button -->
    <button
      v-if="phantom && !publicWalletAddress"
      @click="connectPhantom"
      class="button"
    >
      Connect to Phantom Wallet
    </button>

    <!-- Display Wallet Address -->
    <div v-if="publicWalletAddress" class="connected-content">
      <p class="welcome-message">
        Welcome to the Solana network
      </p>
      <p class="wallet-address">
        <strong>{{ publicWalletAddress }}</strong>
      </p>
    </div>

    <!-- Phantom Not Found / Loading -->
    <div class="text-white flex flex-col items-center space-y-4" v-if="phantom === null">
      <div class="flex space-x-4 items-center">
        <svg class="animate-spin h-7 w-7 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p>Checking for Phantom Wallet...</p>
      </div>
      <a href="https://phantom.app/" target="_blank" class="text-purple-500 text-sm hover:text-purple-300">
        Get Phantom Wallet
      </a>
    </div>
  </div>
</template>
