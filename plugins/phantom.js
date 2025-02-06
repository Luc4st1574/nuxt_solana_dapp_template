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

  return {
    provide: {
      phantom: getPhantomWallet(),
    },
  };
});
