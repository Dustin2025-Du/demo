import { Button, Input, Modal, Spin } from "antd";
import { dataSlice, ethers } from "ethers";
import { useEffect, useState } from "react";

/**
 * 合约配置
 */
const daiAddress = "0x01A01E8B862F10a3907D0fC7f47eBF5d34190341";
const daiAbi = [
  "function depositETH() payable",
  "function withdrawAmount(uint256 _pid, address _user) view returns(uint256 requestAmount, uint256 pendingWithdrawAmount)",
  "function stakingBalance(uint256 _pid, address _user) view returns(uint256)",
];
export default function Deposit({ newProvider, account }) {
  const [amount, setAmount] = useState();
  const [loading, setLoading] = useState(false);
  async function submit() {
    if (!amount || amount <= 0) {
      alert("请输入有效的质押金额");
      return;
    }

    if (!newProvider) {
      alert("请先连接钱包");
      return;
    }

    try {
      setLoading(true);
      const signer = await newProvider.getSigner();
      const daiContract = new ethers.Contract(daiAddress, daiAbi, signer);
      // 将ETH金额转换为wei
      const value = ethers.parseEther(amount);
      const tx = await daiContract.depositETH({ value: value });
      console.log("交易哈希:", tx.hash);

      // 等待交易确认
      const receipt = await tx.wait();
      console.log("交易确认:", receipt);
      alert("质押成功！");

      // 清空输入框
      setAmount("");
    } catch (error) {
      console.error("交易失败:", error);
      alert("交易失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div>
        <h3>质押</h3>
        <div>
          <Input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="请输入质押金额(ETH)"
          />
        </div>
        <Button onClick={submit} type="primary" loading={loading}>
          确认质押
        </Button>
      </div>
      
      {/* 居中loading模态框 */}
      <Modal
        open={loading}
        footer={null}
        closable={false}
        centered
        width={300}
        style={{
          background: 'rgba(0, 0, 0, 0.5)',
        }}
        bodyStyle={{
          textAlign: 'center',
          padding: '24px',
          background: 'white',
          borderRadius: '8px',
        }}
      >
        <div>
          <Spin size="large" />
          <div style={{ marginTop: 16, fontSize: 16, color: '#333' }}>
            交易处理中，请稍候...
          </div>
        </div>
      </Modal>
    </>
  );
}
