import { Button, Input } from "antd";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { Tabs } from "antd";
const daiAddress = "0x01A01E8B862F10a3907D0fC7f47eBF5d34190341";
const daiAbi = [
  "function stakingBalance(uint256 _pid, address _user) view returns(uint256)",
  "function claim(uint256 _pid)",
  "function user(uint256 _pid, address _user) view returns(uint256,uint256,uint256)"
];
export default function  Claim({ newProvider, account }) {
  const [stAmount, setStAmount] = useState(null);
  const [finishedMetaNode, setFinishedMetaNode] = useState(null);
  const [pendingMetaNode, setPendingMetaNode] = useState(null);
  async function getMoney(){
    if (!newProvider) {
      alert("请先连接钱包");
      return;
    }
    
    try {
      const signer = await newProvider.getSigner();
      const daiContract = new ethers.Contract(daiAddress, daiAbi, signer);
      const tx = await daiContract.claim(0);
      const receipt = await tx.wait();
      console.log("交易确认:", receipt);
      alert("收益领取成功！");
    } catch (error) {
      console.error("领取收益失败:", error);
      alert("领取收益失败，请重试");
    }
  }
  async function lookUserInfo(){
    if (!newProvider) {
      alert("请先连接钱包");
      return;
    }
    try {
      const signer = await newProvider.getSigner();
      const daiContract = new ethers.Contract(daiAddress, daiAbi, signer);
      const [stAmountValue, finishedMetaNodeValue, pendingMetaNodeValue] = await daiContract.user(0, account);
      
      setStAmount(ethers.formatEther(stAmountValue));
      setFinishedMetaNode(ethers.formatEther(finishedMetaNodeValue));
      setPendingMetaNode(ethers.formatEther(pendingMetaNodeValue));
      
      console.log("质押金额:", ethers.formatEther(stAmountValue));
      console.log("已完成节点:", ethers.formatEther(finishedMetaNodeValue));
      console.log("待处理节点:", ethers.formatEther(pendingMetaNodeValue));
    } catch (error) {
      console.error("查询用户信息失败:", error);
      alert("查询用户信息失败，请重试");
    }
  }
  return (
    <>
      <div className="mb-4">
        <Button onClick={getMoney} className="mr-2">领取收益</Button>
        <Button onClick={lookUserInfo}>查看用户信息</Button>
      </div>
      
      {(stAmount !== null || finishedMetaNode !== null || pendingMetaNode !== null) && (
        <div className="mt-4 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold mb-3">用户信息</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">质押金额 (stAmount):</span>
              <span className="text-blue-600">{stAmount !== null ? `${stAmount} ETH` : '未查询'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">代币 (finishedMetaNode):</span>
              <span className="text-green-600">{finishedMetaNode !== null ? `${finishedMetaNode} ETH` : '未查询'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">等待处理 (pendingMetaNode):</span>
              <span className="text-orange-600">{pendingMetaNode !== null ? `${pendingMetaNode} ETH` : '未查询'}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
