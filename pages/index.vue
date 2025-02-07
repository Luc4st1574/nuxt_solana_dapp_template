<script setup>
import { ref, onMounted } from 'vue'
import { useNuxtApp } from '#app'
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js'

// Note: No need to import Buffer here because it is polyfilled via the Nuxt plugin

// Reactive references for wallet connection and payment state
const phantom = ref(null)
const publicWalletAddress = ref('')
const isSending = ref(false)

// Predefined receiver wallet and payment amount (1 SOL)
const receiverWalletAddress = 'D7LwfYCjLLCaeLTTijwBagFAmB3aPSm2Fx8K2DzvqLrz'
const paymentAmount = 1

// On component mount, retrieve the Phantom wallet instance from Nuxt's app context
onMounted(async () => {
  const { $phantom } = useNuxtApp()
  phantom.value = await $phantom
})

// Function to connect to the Phantom Wallet
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

// Function to send a payment (transfer 1 SOL)
async function sendPayment() {
  if (!phantom.value || !publicWalletAddress.value) {
    alert('Please connect your Phantom Wallet first!')
    return
  }

  try {
    isSending.value = true

    // Access the solanaConnection from the Nuxt app context with the dollar sign prefix
    const { $solanaConnection } = useNuxtApp()

    const senderPublicKey = new PublicKey(publicWalletAddress.value)
    const receiverPublicKey = new PublicKey(receiverWalletAddress)

    // Create a transaction with a transfer instruction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: senderPublicKey,
        toPubkey: receiverPublicKey,
        lamports: paymentAmount * 1e9, // Convert SOL to lamports (1 SOL = 10^9 lamports)
      })
    )

    // Set fee payer and fetch a recent blockhash for the transaction
    transaction.feePayer = senderPublicKey
    const { blockhash } = await $solanaConnection.getRecentBlockhash()
    transaction.recentBlockhash = blockhash

    // Request Phantom to sign the transaction
    const signedTransaction = await phantom.value.signTransaction(transaction)
    const signature = await $solanaConnection.sendRawTransaction(signedTransaction.serialize())
    await $solanaConnection.confirmTransaction(signature, 'confirmed')

    alert(`Payment of ${paymentAmount} SOL sent successfully! Transaction Signature: ${signature}`)
    console.log(`Transaction Signature: ${signature}`)
  } catch (error) {
    console.error('Payment failed:', error)
    alert('Payment failed. Please try again.')
  } finally {
    isSending.value = false
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

    <!-- Display Wallet Address and Send Payment Button -->
    <div v-if="publicWalletAddress" class="connected-content">
      <p class="welcome-message">
        Welcome to the Solana network
      </p>
      <p class="wallet-address">
        <strong>{{ publicWalletAddress }}</strong>
      </p>
      <button
        @click="sendPayment"
        class="button"
        :disabled="isSending"
      >
        {{ isSending ? 'Sending Payment...' : 'Send 1 SOL' }}
      </button>
    </div>
  </div>
</template>
