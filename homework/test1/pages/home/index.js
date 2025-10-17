import { Button, Input } from "antd";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { Tabs } from "antd";
import Withdraw from "@/components/withdraw";
import Deposit from '@/components/deposit'
import Claim from "@/components/claim";
let newProvider;
export default function Home() {
  const [account, setAccount] = useState(null);
  const [balance, setbalance] = useState(null);
  const items = [
    {
      key: "1",
      label: "质押",
      children: <Deposit newProvider={newProvider} account={account}/>,
    },
    {
      key: "2",
      label: "取款",
      children: <Withdraw newProvider={newProvider} account={account} />,
    },
    {
      key:"3",
      label:"收益",
      children:<Claim newProvider={newProvider} account={account}></Claim>
    }
  ];

  async function connectWallet() {
    try {
      console.log("连接钱包");
      // 检查是否安装了MetaMask
      if (!window.ethereum) {
        throw new Error("请安装MetaMask钱包");
      }

      // 请求连接钱包
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        newProvider = new ethers.BrowserProvider(window.ethereum);

        const signer = await newProvider.getSigner();
        const address = await signer.getAddress();
        const balance = await newProvider.getBalance(address);
        setAccount(address);
        setbalance(ethers.formatEther(balance));
        console.log("钱包连接成功:", address);
      }
    } catch (error) {
      console.error("连接钱包失败:", error);
    }
  }
  return (
    <>
      <div className="w-[800px] mx-auto">
        <div className="flex items-center my-[20px]">
          <Button onClick={connectWallet} type="primary">
            连接钱包
          </Button>
          <div>&nbsp;钱包地址：{account} </div>
          <div>&nbsp;钱包余额：{balance}</div>
        </div>

        <Tabs items={items} centered />
      </div>
    </>
  );
}
