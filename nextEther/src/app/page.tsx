"use client";
import { ethers } from "ethers";
import { useEffect, useState } from "react";

// 扩展 Window 接口以包含 ethereum 属性
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string }) => Promise<string[]>;
    };
  }
}

export default function Home() {
  const [network, setNetwork] = useState<ethers.Network | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [spender, setSpender] = useState<string | null>(null);
  const [amount, setAmount] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [transferEvents, setTransferEvents] = useState<Array<{
    from: string;
    to: string;
    amount: string;
    blockNumber: number;
    transactionHash: string;
    timestamp: string;
  }>>([]);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  useEffect(() => {
    (async () => {
      const SEPOLIA_RPC_URL = "https://ethereum-sepolia.publicnode.com";
      const providerSepolia = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
      setNetwork(await providerSepolia.getNetwork());
    })();
  }, []);
  
  async function connectWallet() {
    try {
      setError(null);
      console.log("连接钱包");
      
      // 检查是否安装了MetaMask
      if (!window.ethereum) {
        throw new Error("请安装MetaMask钱包");
      }

      // 请求连接钱包
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        const newProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(newProvider);
        const signer = await newProvider.getSigner();
        const address = await signer.getAddress();
        
        setAccount(address);
        setIsConnected(true);
        console.log("钱包连接成功:", address);
      }
    } catch (error) {
      console.error("连接钱包失败:", error);
      setError(error instanceof Error ? error.message : "连接钱包时发生未知错误");
    }
  }
  async function disconnectWallet() {
    setAccount(null);
    setIsConnected(false);
    setError(null);
    console.log("钱包已断开连接");
  }

  async function getBalance() {
    try {
      if (!provider || !account) {
        throw new Error("请先连接钱包");
      }
      
      setError(null);
      console.log("正在获取余额...");
      
      const balance = await provider.getBalance(account);
      const balanceInEth = ethers.formatEther(balance);
      setBalance(balanceInEth);
      
      console.log("余额:", balanceInEth, "ETH");
    } catch (error) {
      console.error("获取余额失败:", error);
      setError(error instanceof Error ? error.message : "获取余额时发生未知错误");
    }
  }
  const daiAddress = "0x52E71f4E95EaC4654598BAad770612C8a83957ab";
  const DaiAbi = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function balanceOf(address) view returns (uint)",
    "function transfer(address to, uint amount)",
    "function approve(address spender, uint amount) returns (bool)",
    "function transferFrom(address from, address to, uint amount) returns (bool)",
    "event Transfer(address indexed from, address indexed to, uint amount)"
  ];

  
  async function getContractBalance() {
    try {
      if (!provider || !account) {
        throw new Error("请先连接钱包");
      }
      
      setError(null);
      console.log("正在获取合约余额...");
      
      const signer = await provider.getSigner();
      const daiContract = new ethers.Contract(daiAddress, DaiAbi, signer);
      const balance = await daiContract.balanceOf(account);
      alert("合约余额: " + ethers.formatEther(balance) + " DAI");
      
      console.log("合约余额:", ethers.formatEther(balance), "DAI");
    } catch (error) {
      console.error("获取合约余额失败:", error);
      setError(error instanceof Error ? error.message : "获取合约余额时发生未知错误");
    }
  }
  async function onClickApprove() { 
    try {
      if (!provider || !account) {
        throw new Error("请先连接钱包");
      }
      
      if (!spender || !amount) {
        alert("请输入授权地址和金额");
        return;
      }
      
      setError(null);
      console.log("正在执行授权...");
      
      // 将金额转换为正确的格式 (DAI通常是18位小数)
      const amountInWei = ethers.parseEther(amount);
      
      const signer = await provider.getSigner();
      const daiContract = new ethers.Contract(daiAddress, DaiAbi, signer);
      
      // 执行授权交易
      const tx = await daiContract.approve(spender, amountInWei);
      console.log("授权交易已发送:", tx.hash);
      
      // 等待交易确认
      const receipt = await tx.wait();
      console.log("授权交易已确认:", receipt);
      
      alert(`授权成功！\n交易哈希: ${tx.hash}\n授权地址: ${spender}\n授权金额: ${amount} DAI`);
      
    } catch (error) {
      console.error("授权失败:", error);
      setError(error instanceof Error ? error.message : "授权时发生未知错误");
      alert("授权失败: " + (error instanceof Error ? error.message : "未知错误"));
    }
  }
  async function onClickTransfer() {
    if(!spender || !amount) {
      alert("请输入授权地址和金额");
      return;
    }
    if (!provider) {
      alert("请先连接钱包");
      return;
    }
    const signer = await provider.getSigner();
    const daiContract = new ethers.Contract(daiAddress, DaiAbi, signer);
    const tx=await daiContract.transfer(spender, amount)
    const receipt=await tx.wait()
    alert("转账成功"+receipt);
    console.log("转账成功"+receipt);
  }

  // 开始监听Transfer事件
  async function startListeningTransfer() {
    try {
      if (!provider) {
        throw new Error("请先连接钱包");
      }
      
      setError(null);
      console.log("开始监听Transfer事件...");
      
      // 创建合约实例
      const daiContract = new ethers.Contract(daiAddress, DaiAbi, provider);
      setContract(daiContract);
      
      // 监听Transfer事件
      daiContract.on("Transfer", (from, to, amount, event) => {
        console.log("监听到Transfer事件:", { from, to, amount: ethers.formatEther(amount), event });
        
        const transferEvent = {
          from,
          to,
          amount: ethers.formatEther(amount),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
          timestamp: new Date().toLocaleString()
        };
        
        setTransferEvents(prev => [transferEvent, ...prev]);
      });
      
      setIsListening(true);
      console.log("Transfer事件监听已启动");
      
    } catch (error) {
      console.error("启动监听失败:", error);
      setError(error instanceof Error ? error.message : "启动监听时发生未知错误");
    }
  }

  // 停止监听Transfer事件
  async function stopListeningTransfer() {
    try {
      if (contract) {
        contract.removeAllListeners("Transfer");
        setContract(null);
      }
      
      setIsListening(false);
      console.log("Transfer事件监听已停止");
      
    } catch (error) {
      console.error("停止监听失败:", error);
      setError(error instanceof Error ? error.message : "停止监听时发生未知错误");
    }
  }

  // 清空事件列表
  function clearTransferEvents() {
    setTransferEvents([]);
  }

  // 组件卸载时清理监听器
  useEffect(() => {
    return () => {
      if (contract) {
        contract.removeAllListeners("Transfer");
      }
    };
  }, [contract]);
  return (
    <>
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">以太坊钱包连接</h1>
        <div className="mb-4 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600">网络信息:</p>
          <p>网络名称: {network?.name}</p>
          <p>链ID: {network?.chainId}</p>
        </div>

        <div className="mb-4">
          {isConnected ? (
            <div className="p-4 bg-green-100 rounded-lg">
              <p className="text-green-800">✅ 钱包已连接</p>
              <p className="text-sm text-gray-600">地址: {account}</p>
              <button 
                onClick={disconnectWallet} 
                className="mt-2 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                断开连接
              </button>
            </div>
          ) : (
            <div className="p-4 bg-yellow-100 rounded-lg">
              <p className="text-yellow-800">⚠️ 钱包未连接</p>
              <button 
                onClick={connectWallet} 
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                连接钱包
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-100 rounded-lg">
            <p className="text-red-800">❌ 错误: {error}</p>
          </div>
        )}

        <div className="p-4 bg-blue-100 rounded-lg">
          <p className="text-blue-800 font-medium">钱包余额</p>
          {balance ? (
            <p className="text-lg font-bold text-blue-900">{balance} ETH</p>
          ) : (
            <p className="text-gray-600">点击下方按钮获取余额</p>
          )}
          <button 
            onClick={getBalance}
            disabled={!isConnected}
            className={`mt-2 px-4 py-2 rounded-md ${
              isConnected 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isConnected ? '获取余额' : '请先连接钱包'}
          </button>
        </div>
        <br/>
       
        <div className="p-4 bg-blue-100 rounded-lg">
          <p className="text-blue-800 font-medium">合约余额</p>
          <button
            onClick={getContractBalance}
            className={`mt-2 px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600`}
          >
           获取合约余额
          </button>
        </div>

        <br/>
        <div className="p-4 bg-blue-100 rounded-lg">
          <p className="text-blue-800 font-medium">授权转账</p>
          <div>
            地址<input value={spender || ""} onChange={(e)=>setSpender(e.target.value)} type="text" placeholder="授权地址" />
            金额<input value={amount || ""}  onChange={(e)=>setAmount(e.target.value)} type="text" placeholder="授权金额" />
          </div>
          <button
            onClick={onClickApprove}
            className={`mt-2 px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600`}
          >
           授权
          </button>
        </div>

        <br/>
        <div className="p-4 bg-blue-100 rounded-lg">
          <p className="text-blue-800 font-medium">转账代币</p>
          <div>
            地址<input value={spender || ""} onChange={(e)=>setSpender(e.target.value)} type="text" placeholder="授权地址" />
            金额<input value={amount || ""}  onChange={(e)=>setAmount(e.target.value)} type="text" placeholder="授权金额" />
          </div>
          <button
            onClick={onClickTransfer}
            className={`mt-2 px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600`}
          >
           授权
          </button>
        </div>

        <br/>
        <div className="p-4 bg-green-100 rounded-lg">
          <p className="text-green-800 font-medium">Transfer事件监听</p>
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              状态: {isListening ? 
                <span className="text-green-600 font-bold">🟢 正在监听</span> : 
                <span className="text-gray-600">⚪ 未监听</span>
              }
            </p>
            <div className="space-x-2">
              <button
                onClick={startListeningTransfer}
                disabled={!isConnected || isListening}
                className={`px-4 py-2 rounded-md ${
                  isConnected && !isListening 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                开始监听
              </button>
              <button
                onClick={stopListeningTransfer}
                disabled={!isListening}
                className={`px-4 py-2 rounded-md ${
                  isListening 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                停止监听
              </button>
              <button
                onClick={clearTransferEvents}
                className="px-4 py-2 rounded-md bg-gray-500 text-white hover:bg-gray-600"
              >
                清空事件
              </button>
            </div>
          </div>
          
          {transferEvents.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                监听到的事件 ({transferEvents.length} 个):
              </p>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {transferEvents.map((event, index) => (
                  <div key={index} className="p-3 bg-white rounded border text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="font-medium">从:</span> 
                        <span className="text-blue-600">{event.from}</span>
                      </div>
                      <div>
                        <span className="font-medium">到:</span> 
                        <span className="text-green-600">{event.to}</span>
                      </div>
                      <div>
                        <span className="font-medium">金额:</span> 
                        <span className="text-purple-600">{event.amount} DAI</span>
                      </div>
                      <div>
                        <span className="font-medium">区块:</span> 
                        <span className="text-gray-600">{event.blockNumber}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">交易哈希:</span> 
                        <span className="text-gray-500 break-all">{event.transactionHash}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">时间:</span> 
                        <span className="text-gray-500">{event.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
