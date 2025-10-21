export const searchWalletList = () => {
  const wallets = [];
  // 检查 MetaMask
  if (window.ethereum.isMetaMask) {
    wallets.push({
      name: "MetaMask",
      id: "metamask",
      installed: true,
      provider: window.ethereum,
    });
  }
  if (window.okxwallet.isOkxWallet) {
    wallets.push({
      name: "okx",
      id: "okx",
      installed: true,
      provider: window.ethereum,
    });
  }
  console.log(wallets);
  return wallets;
};

export const connetWallet = async (wallet, callback) => {
  if (wallet.provider && wallet.provider.request) {
    const accounts = await wallet.provider.request({
      method: "eth_requestAccounts",
    });
    if (accounts && accounts.length > 0) {
      callback(accounts[0]);
      console.log("成功连接");
    }
  } else {
    console.log("连接失败");
  }
};

export const getBalance = async (account, callback) => {
  const balance = await window.ethereum.request({
    method: "eth_getBalance",
    params: [account, "latest"],
  });
  const ethBalance = parseInt(balance);
  callback(formatEthereumAmount(ethBalance));
};
export const getNetworkParams = (chainId) => {
  const networks = [
    {
      chainId: "0x1",
      chainName: "Ethereum Mainnet",
      rpcUrls: ["https://mainnet.infura.io/v3/"],
      nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
      blockExplorerUrls: ["https://etherscan.io"],
      value: "0x1",
      label: "Ethereum Mainnet",
    },
    {
      chainId: "0xaa36a7",
      chainName: "Sepolia Testnet",
      rpcUrls: ["https://sepolia.infura.io/v3/"],
      nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
      blockExplorerUrls: ["https://sepolia.etherscan.io"],
      value: "0xaa36a7",
      label: "Sepolia",
    },
  ];

  return networks;
};
export const switchNetwork = async (chainId,callback) => {
  const hexChainId = chainId.toString().startsWith("0x")
    ? chainId
    : `0x${chainId.toString(16)}`;
  await window.ethereum.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: hexChainId }],
  });
  callback()
};
function formatEthereumAmount(weiAmount, decimals = 18) {
    if (!weiAmount) return '0';
    
    // 1 ether = 10^18 wei
    const etherValue = Number(weiAmount) / 1e18;
    
    // 格式化为指定小数位数
    return etherValue.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals
    });
}