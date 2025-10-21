"use client";
import { Button, Modal, Select, message } from "antd";
import {
  searchWalletList,
  connetWallet,
  getBalance,
  getNetworkParams,
  switchNetwork,
} from "../util/index";
import { useEffect, useState } from "react";
export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState();
  const [list, setList] = useState([]);
  const [account, setAccount] = useState();
  const [balance, setBalance] = useState();
  let curWallet=null;
  useEffect(()=>{
    const curAccount=window.localStorage.getItem("curAccount");
    if(curAccount){
      setAccount(curAccount);
      connetWallet(searchWalletList()[Number(curWallet)],connetSuccess)
    }
  },[])
  const showModal = () => {
    setList(searchWalletList());
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const connetSuccess = (account) => {
    setIsModalOpen(false);
    setAccount(account);
    getBalance(account, setBalance);
    window.localStorage.setItem("curAccount",account)
  };
  const options = getNetworkParams();

  const handleChange = (value) => {
    switchNetwork(value, () => {
      getBalance(account, setBalance);
      message.success('网络切换成功');
    });
  };
  return (
    <>
      <div className="p-[10px]">
        <Button className="ml-[20px]" onClick={showModal}>
          连接钱包
        </Button>
        &nbsp;&nbsp;网络：
        <Select
          placeholder="请选择网络"
          onChange={handleChange}
          style={{ width: 120 }}
          options={options}
        />
        <div className="flex  p-[10px] items-center">
          <h2 className="ml-[10px]">钱包地址: {account}</h2>
          <div className="ml-[10px]">余额：{balance}</div>
        </div>
      </div>

      <Modal
        title="钱包列表"
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="确定"
        cancelText="关闭"
      >
        {list.map((wallet,index) => (
          <div key={wallet.id} className="flex items-center mb-[10px] ">
            <h3 className="w-[100px]">{wallet.name}</h3>
            <Button
              onClick={() => {
                curWallet=index;
                window.localStorage.setItem("curWallet",curWallet)
                connetWallet(wallet, connetSuccess);
              
              }}
            >
              连接
            </Button>
          </div>
        ))}
      </Modal>
    </>
  );
}
