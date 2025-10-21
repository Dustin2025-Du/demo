export const getWalletList = () => {
  const wallets = [];
  
  // 检查 MetaMask
  if (typeof window.ethereum !== 'undefined') {
    wallets.push({
      name: 'MetaMask',
      id: 'metamask',
      icon: '🦊',
      installed: true,
      provider: window.ethereum
    });
  }
  
  // 检查 Coinbase Wallet
  if (window.coinbaseWalletExtension) {
    wallets.push({
      name: 'Coinbase Wallet',
      id: 'coinbase',
      icon: '🔵',
      installed: true,
      provider: window.coinbaseWalletExtension
    });
  }
  
  // 检查 Trust Wallet
  if (window.trustwallet) {
    wallets.push({
      name: 'Trust Wallet',
      id: 'trust',
      icon: '🛡️',
      installed: true,
      provider: window.trustwallet
    });
  }
  
  // 检查 WalletConnect
  if (window.WalletConnect) {
    wallets.push({
      name: 'WalletConnect',
      id: 'walletconnect',
      icon: '🔗',
      installed: true,
      provider: window.WalletConnect
    });
  }
  
  // 检查 Phantom (Solana)
  if (window.solana && window.solana.isPhantom) {
    wallets.push({
      name: 'Phantom',
      id: 'phantom',
      icon: '👻',
      installed: true,
      provider: window.solana
    });
  }
  
  // 检查 Brave Wallet
  if (window.ethereum && window.ethereum.isBraveWallet) {
    wallets.push({
      name: 'Brave Wallet',
      id: 'brave',
      icon: '🦁',
      installed: true,
      provider: window.ethereum
    });
  }
  
  // 检查 Opera Wallet
  if (window.ethereum && window.ethereum.isOpera) {
    wallets.push({
      name: 'Opera Wallet',
      id: 'opera',
      icon: '🎭',
      installed: true,
      provider: window.ethereum
    });
  }
  
  // 检查 Binance Wallet
  if (window.BinanceChain) {
    wallets.push({
      name: 'Binance Wallet',
      id: 'binance',
      icon: '🟡',
      installed: true,
      provider: window.BinanceChain
    });
  }
  
  // 检查 Rabby Wallet
  if (window.ethereum && window.ethereum.isRabby) {
    wallets.push({
      name: 'Rabby Wallet',
      id: 'rabby',
      icon: '🐰',
      installed: true,
      provider: window.ethereum
    });
  }
  
  // 检查 OKX Wallet
  if (window.okxwallet) {
    wallets.push({
      name: 'OKX Wallet',
      id: 'okx',
      icon: '⚡',
      installed: true,
      provider: window.okxwallet
    });
  }
  
  // 检查 TokenPocket
  if (window.tokenpocket) {
    wallets.push({
      name: 'TokenPocket',
      id: 'tokenpocket',
      icon: '💼',
      installed: true,
      provider: window.tokenpocket
    });
  }
  
  // 检查 imToken
  if (window.imToken) {
    wallets.push({
      name: 'imToken',
      id: 'imtoken',
      icon: '🔐',
      installed: true,
      provider: window.imToken
    });
  }
  
  // 检查 BitKeep
  if (window.bitkeep) {
    wallets.push({
      name: 'BitKeep',
      id: 'bitkeep',
      icon: '🔷',
      installed: true,
      provider: window.bitkeep
    });
  }
  
  // 检查 Math Wallet
  if (window.ethereum && window.ethereum.isMathWallet) {
    wallets.push({
      name: 'Math Wallet',
      id: 'math',
      icon: '🧮',
      installed: true,
      provider: window.ethereum
    });
  }
  
  return wallets;
};