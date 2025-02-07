<script setup>
import { ref, onMounted } from 'vue'
import { useNuxtApp } from '#app'
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js'

// Reactive references for wallet connection, payment state, and session data.
const phantom = ref(null)
const publicWalletAddress = ref('')
const isSending = ref(false)
const sessionData = ref(null) // To hold the session information from the backend

// Predefined receiver wallet (must match the Go config) and payment amount (1 SOL)
const receiverWalletAddress = 'D7LwfYCjLLCaeLTTijwBagFAmB3aPSm2Fx8K2DzvqLrz'
const paymentAmount = 1

// On component mount, retrieve the Phantom wallet instance from Nuxt's app context.
onMounted(async () => {
  const { $phantom } = useNuxtApp()
  phantom.value = await $phantom
})

// Function to connect to the Phantom Wallet.
async function connectPhantom() {
  if (!phantom.value) {
    alert('Phantom Wallet is not available. Please install it from https://phantom.app/')
    return
  }
  try {
    const response = await phantom.value.connect({ onlyIfTrusted: false })
    publicWalletAddress.value = response.publicKey.toString()
    console.log('Connected with Public Key:', publicWalletAddress.value)
  } catch (error) {
    console.error('Failed to connect Phantom Wallet:', error)
  }
}

// Function to send a payment (transfer 1 SOL).
async function sendPayment() {
  if (!phantom.value || !publicWalletAddress.value) {
    alert('Please connect your Phantom Wallet first!')
    return
  }
  try {
    isSending.value = true

    // Access the solanaConnection from the Nuxt app context.
    const { $solanaConnection } = useNuxtApp()

    const senderPublicKey = new PublicKey(publicWalletAddress.value)
    const receiverPublicKey = new PublicKey(receiverWalletAddress)

    // Create a transaction with a transfer instruction.
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: senderPublicKey,
        toPubkey: receiverPublicKey,
        lamports: paymentAmount * 1e9, // Convert SOL to lamports.
      })
    )

    // Set fee payer and fetch a recent blockhash for the transaction.
    transaction.feePayer = senderPublicKey
    const { blockhash } = await $solanaConnection.getRecentBlockhash()
    transaction.recentBlockhash = blockhash

    // Request Phantom to sign the transaction.
    const signedTransaction = await phantom.value.signTransaction(transaction)
    const signature = await $solanaConnection.sendRawTransaction(signedTransaction.serialize())
    await $solanaConnection.confirmTransaction(signature, 'confirmed')

    alert(`Payment of ${paymentAmount} SOL sent successfully!
Transaction Signature: ${signature}`)
    console.log(`Transaction Signature: ${signature}`)

    // After the transaction is confirmed on-chain,
    // call the Go backend to verify the payment.
    await verifyPaymentOnBackend()
  } catch (error) {
    console.error('Payment failed:', error)
    alert('Payment failed. Please try again.')
  } finally {
    isSending.value = false
  }
}

// Function to call the backend verification endpoint.
async function verifyPaymentOnBackend() {
  try {
    // Prepare the payload with the sender's wallet address and expected amount.
    const payload = {
      senderWallet: publicWalletAddress.value,
      expectedAmount: paymentAmount
    }
    // Replace the URL below with your backend’s URL (for example, if running locally, http://localhost:8080/verify-payment).
    const response = await fetch('http://localhost:8080/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      // Include credentials if your backend and front end are on different domains/ports.
      credentials: 'include',
      body: JSON.stringify(payload)
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Verification failed')
    }
    const data = await response.json()
    console.log("Payment verified successfully! Session data:", data)
    // Store the session data to display on the page.
    sessionData.value = data
  } catch (error) {
    console.error('Backend verification failed:', error)
    alert('Payment verification failed on the server.')
  }
}
</script>

<template>
  <div class="center-container">
    <!-- Session display: Only visible if sessionData is available -->
    <div v-if="sessionData" class="session-info">
      <p>Welcome to our service!</p>
      <p>Session ID: {{ sessionData.gameHashID }}</p>
      <p>Expires: {{ new Date(sessionData.expirationDate).toLocaleString() }}</p>
    </div>

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
