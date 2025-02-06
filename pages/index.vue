<script setup>
import { ref, onMounted } from 'vue'
import { useNuxtApp } from '#app'
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js'

const phantom = ref(null)
const publicWalletAddress = ref('')
const isSending = ref(false) // To track the payment process

const receiverWalletAddress = 'D7LwfYCjLLCaeLTTijwBagFAmB3aPSm2Fx8K2DzvqLrz' // Predefined receiver wallet
const paymentAmount = 1 // 1 SOL

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

async function sendPayment() {
  if (!phantom.value || !publicWalletAddress.value) {
    alert('Please connect your Phantom Wallet first!')
    return
  }

  try {
    isSending.value = true
    const { solanaConnection } = useNuxtApp()
    const senderPublicKey = new PublicKey(publicWalletAddress.value)
    const receiverPublicKey = new PublicKey(receiverWalletAddress)

    // Create a transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: senderPublicKey,
        toPubkey: receiverPublicKey,
        lamports: paymentAmount * 1e9, // Convert SOL to lamports (1 SOL = 10^9 lamports)
      })
    )

    // Request Phantom to sign the transaction
    transaction.feePayer = senderPublicKey
    const { blockhash } = await solanaConnection.getRecentBlockhash()
    transaction.recentBlockhash = blockhash

    const signedTransaction = await phantom.value.signTransaction(transaction)
    const signature = await solanaConnection.sendRawTransaction(signedTransaction.serialize())
    await solanaConnection.confirmTransaction(signature, 'confirmed')

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
