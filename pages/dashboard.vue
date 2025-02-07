<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from '#app'

const sessionData = ref(null)
const router = useRouter()

onMounted(() => {
  // Try to load the session data from localStorage.
  const data = localStorage.getItem('sessionData')
  if (data) {
    sessionData.value = JSON.parse(data)
  } else {
    // If no session data is found, redirect back to the payment page.
    router.push('/')
  }
})
</script>

<template>
  <div class="dashboard-container">
    <h1>Dashboard</h1>
    <div v-if="sessionData">
      <p>Welcome to our service!</p>
      <p>Session ID: {{ sessionData.gameHashID }}</p>
      <p>Expires: {{ new Date(sessionData.expirationDate).toLocaleString() }}</p>
      <p>Wallet Address: {{ sessionData.walletAddress }}</p>
      <p>Transaction Hash: {{ sessionData.transactionHash }}</p>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  max-width: 600px;
  margin: auto;
  padding: 1rem;
  text-align: center;
}
</style>
