import { Button, Input } from "antd";
import { ethers } from "ethers";
import { use, useEffect, useState } from "react";
import { Card } from "antd";
const daiAddress = "0x01A01E8B862F10a3907D0fC7f47eBF5d34190341";
const daiAbi = [
  "function depositETH() payable",
  "function withdrawAmount(uint256 _pid, address _user) view returns(uint256 requestAmount, uint256 pendingWithdrawAmount)",
  "function stakingBalance(uint256 _pid, address _user) view returns(uint256)",
  "function unstake(uint256 _pid, uint256 _amount)",
  "function withdraw(uint256 _pid)"
];
let signer;
let daiContract;
let unstakeAmount = 0;
export default function Withdraw({ newProvider, account }) {
  const [userInfo, setUserInfo] = useState({});
  useEffect(() => {
    if (newProvider && account) {
      (async () => {
        signer = await newProvider.getSigner();
        daiContract = new ethers.Contract(daiAddress, daiAbi, signer);
        queryStakingBalance();
      })();
    }
  }, [newProvider, account]);
  /**
   * 查询质押 取款 冻结余额
   * @returns 
   */
  async function queryStakingBalance() {
    if (!newProvider) {
      alert("请先连接钱包");
      return;
    }

    const stakingBalance = await daiContract.stakingBalance(0, account);
    const [requestAmount, pendingWithdrawAmount] =await daiContract.withdrawAmount(0, account);
    let total=requestAmount;
    let ava=pendingWithdrawAmount;
    setUserInfo({
      stakingBalance: ethers.formatEther(stakingBalance),
      requestAmount: ethers.formatEther(ava),
      pendingWithdrawAmount: ethers.formatEther(total - ava),
    
    });
    console.log("质押余额:", ethers.formatEther(stakingBalance));
    console.log("取款金额:", ethers.formatEther(requestAmount));
    console.log("冻结金额:", ethers.formatEther(pendingWithdrawAmount));
  }
  /**
   * 解除质押
   * @returns 
   */
  async function unstake() {
    if (!newProvider) {
      alert("请先连接钱包");
      return;
    }
    // Convert the string amount to wei (BigInt)
    const amountInWei = ethers.parseEther(unstakeAmount.toString());
    const tx  =await daiContract.unstake(0, amountInWei);
    const receipt = await tx.wait();
    console.log("交易确认:", receipt);
    alert("解除质押成功");
    queryStakingBalance();
  }
  /**
   * 提款
   * @returns 
   */
  async function withdraw() {
    if (!newProvider) {
      alert("请先连接钱包");
      return;
    }
    await daiContract.withdraw(0);
    alert("提款成功");
    queryStakingBalance();
  }
  return (
    <>
      <div className="flex gap-[20px]">
        <Card style={{ width: 300 }}>
          <p>质押余额:</p>
          <p>{userInfo.stakingBalance} ETH</p>
        </Card>
        <Card style={{ width: 300 }}>
          <p>取款金额</p>
          <p>{userInfo.requestAmount} ETH</p>
        </Card>
        <Card style={{ width: 300 }}>
          <p>冻结金额:</p>
          <p>{userInfo.pendingWithdrawAmount} ETH</p>
        </Card>
      </div>

      <div>
        <p className="mt-[10px]">解除质押</p>
        <div className="flex py-[10px]">
          <Input onChange={(e) => unstakeAmount = e.target.value} placeholder="请输入解除质押金额" />
          &nbsp;&nbsp;
          <Button onClick={unstake} type="primary">确定</Button>
        </div>
      </div>

      <div>
        <p className="mt-[10px]">取款</p>
        <div className="flex py-[10px] items-center">
          <p>{userInfo.requestAmount} ETH&nbsp;&nbsp;</p>
          <Button onClick={withdraw} type="primary">确定</Button>
        </div>
      </div>
    </>
  );
}
