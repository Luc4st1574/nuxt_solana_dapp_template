<script setup>
import { ref, onMounted } from 'vue'
import { useNuxtApp } from '#app'
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js'

// Reactive state variables
const phantom = ref(null)
const publicWalletAddress = ref('')
const isSending = ref(false)
const sessionData = ref(null) 
const transactionSignature = ref('') // Store transaction signature

// Receiver wallet and payment amount (matches Go backend)
const receiverWalletAddress = 'D7LwfYCjLLCaeLTTijwBagFAmB3aPSm2Fx8K2DzvqLrz'
const paymentAmount = 1.0  // Ensure it's a float

onMounted(async () => {
  const { $phantom } = useNuxtApp()
  phantom.value = await $phantom
})

// Function to connect to Phantom Wallet.
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

// Function to send 1 SOL payment.
async function sendPayment() {
  if (!phantom.value || !publicWalletAddress.value) {
    alert('Please connect your Phantom Wallet first!')
    return
  }
  try {
    isSending.value = true

    const { $solanaConnection } = useNuxtApp()
    const senderPublicKey = new PublicKey(publicWalletAddress.value)
    const receiverPublicKey = new PublicKey(receiverWalletAddress)

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: senderPublicKey,
        toPubkey: receiverPublicKey,
        lamports: paymentAmount * 1e9, // Convert SOL to lamports
      })
    )

    transaction.feePayer = senderPublicKey
    const { blockhash } = await $solanaConnection.getRecentBlockhash()
    transaction.recentBlockhash = blockhash

    // Sign the transaction using Phantom
    const signedTransaction = await phantom.value.signTransaction(transaction)
    const signature = await $solanaConnection.sendRawTransaction(signedTransaction.serialize())
    await $solanaConnection.confirmTransaction(signature, 'confirmed')

    transactionSignature.value = signature  // Store the transaction signature
    console.log(`Transaction Signature: ${signature}`)
    
    alert(`Payment of ${paymentAmount} SOL sent successfully! Transaction: ${signature}`)
    
    // Call backend verification after successful transaction
    await verifyPaymentOnBackend(signature)
  } catch (error) {
    console.error('Payment failed:', error)
    alert('Payment failed. Please try again.')
  } finally {
    isSending.value = false
  }
}

// Function to verify the payment with the backend.
async function verifyPaymentOnBackend(signature) {
  try {
    const payload = {
      senderWallet: publicWalletAddress.value,
      expectedAmount: paymentAmount, // Send as float
      txSignature: signature // Include transaction signature
    }

    const response = await fetch('http://localhost:8080/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', 
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Verification failed')
    }

    const data = await response.json()
    console.log("Payment verified successfully! Session data:", data)
    sessionData.value = data // Store session data for display

  } catch (error) {
    console.error('Backend verification failed:', error)
    alert('Payment verification failed on the server.')
  }
}
</script>

<template>
  <div class="center-container">
    <div v-if="sessionData" class="session-info">
      <p>Welcome to our service!</p>
      <p>Session ID: {{ sessionData.gameHashID }}</p>
      <p>Expires: {{ new Date(sessionData.expirationDate).toLocaleString() }}</p>
    </div>

    <button v-if="phantom && !publicWalletAddress" @click="connectPhantom" class="button">
      Connect to Phantom Wallet
    </button>

    <div v-if="publicWalletAddress" class="connected-content">
      <p class="welcome-message">Welcome to the Solana network</p>
      <p class="wallet-address"><strong>{{ publicWalletAddress }}</strong></p>
      <button @click="sendPayment" class="button" :disabled="isSending">
        {{ isSending ? 'Sending Payment...' : 'Send 1 SOL' }}
      </button>
    </div>
  </div>
</template>
