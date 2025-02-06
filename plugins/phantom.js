import { Connection, clusterApiUrl } from '@solana/web3.js';

export default defineNuxtPlugin(() => {
  if (import.meta.server) return; // Ensure the plugin runs only on the client side

  async function getPhantomWallet() {
    while (!globalThis.solana) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    if (globalThis.solana.isPhantom) {
      return globalThis.solana;
    } else {
      console.error('Phantom Wallet not found');
      return null;
    }
  }

  // Provide the Phantom wallet and Solana connection
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed'); // Using Solana Devnet

  return {
    provide: {
      phantom: getPhantomWallet(),
      solanaConnection: connection,
    },
  };
});
