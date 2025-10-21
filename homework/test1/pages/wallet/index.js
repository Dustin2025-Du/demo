import { Button, Card, List, Typography, Space, Tag, Alert, Spin, Statistic, Select, Modal, message } from "antd";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getWalletList } from "../../utils/index";

export default function Wallet() {
    const [wallets, setWallets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [connectedWallet, setConnectedWallet] = useState(null);
    const [account, setAccount] = useState(null);
    const [balance, setBalance] = useState(null);
    const [balanceLoading, setBalanceLoading] = useState(false);
    const [networkInfo, setNetworkInfo] = useState(null);
    const [networkSwitchLoading, setNetworkSwitchLoading] = useState(false);
    const [showNetworkModal, setShowNetworkModal] = useState(false);

    useEffect(() => {
        detectWallets();
    }, []);

    const detectWallets = () => {
        setLoading(true);
        try {
            const detectedWallets = getWalletList();
            setWallets(detectedWallets);
        } catch (error) {
            console.error('检测钱包失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const connectWallet = async (wallet) => {
        try {
            if (wallet.provider && wallet.provider.request) {
                const accounts = await wallet.provider.request({ method: 'eth_requestAccounts' });
                if (accounts && accounts.length > 0) {
                    setConnectedWallet(wallet);
                    setAccount(accounts[0]);
                    // 连接成功后自动获取余额
                    await fetchBalance(wallet.provider, accounts[0]);
                    alert(`成功连接到 ${wallet.name}！\n账户地址: ${accounts[0]}`);
                }
            } else {
                alert(`${wallet.name} 钱包未正确初始化`);
            }
        } catch (error) {
            console.error('连接钱包失败:', error);
            alert(`连接 ${wallet.name} 失败: ${error.message}`);
        }
    };

    const disconnectWallet = async () => {
        try {
            if (connectedWallet && connectedWallet.provider) {
                // 尝试断开连接
                if (connectedWallet.provider.disconnect) {
                    await connectedWallet.provider.disconnect();
                }
                
                // 清除状态
                setConnectedWallet(null);
                setAccount(null);
                setBalance(null);
                setNetworkInfo(null);
                alert(`已断开 ${connectedWallet.name} 钱包连接`);
            }
        } catch (error) {
            console.error('断开钱包失败:', error);
            // 即使断开失败，也清除本地状态
            setConnectedWallet(null);
            setAccount(null);
            setBalance(null);
            setNetworkInfo(null);
            alert('钱包已断开连接');
        }
    };

    const formatAddress = (address) => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const fetchBalance = async (provider, address) => {
        setBalanceLoading(true);
        try {
            // 创建 ethers provider
            const ethersProvider = new ethers.BrowserProvider(provider);
            
            // 获取余额
            const balance = await ethersProvider.getBalance(address);
            const balanceInEth = ethers.formatEther(balance);
            setBalance(balanceInEth);
            
            // 获取网络信息
            const network = await ethersProvider.getNetwork();
            setNetworkInfo({
                name: network.name,
                chainId: network.chainId.toString(),
                ensAddress: network.ensAddress
            });
            
            console.log('余额查询成功:', balanceInEth, 'ETH');
        } catch (error) {
            console.error('获取余额失败:', error);
            alert('获取账户余额失败，请重试');
        } finally {
            setBalanceLoading(false);
        }
    };

    const refreshBalance = async () => {
        if (connectedWallet && account) {
            await fetchBalance(connectedWallet.provider, account);
        }
    };

    // 预定义网络列表
    const predefinedNetworks = [
        {
            chainId: '0x1',
            chainName: 'Ethereum Mainnet',
            rpcUrls: ['https://mainnet.infura.io/v3/'],
            blockExplorerUrls: ['https://etherscan.io'],
            nativeCurrency: {
                name: 'Ether',
                symbol: 'ETH',
                decimals: 18
            }
        },
        {
            chainId: '0x5',
            chainName: 'Goerli Testnet',
            rpcUrls: ['https://goerli.infura.io/v3/'],
            blockExplorerUrls: ['https://goerli.etherscan.io'],
            nativeCurrency: {
                name: 'Goerli Ether',
                symbol: 'ETH',
                decimals: 18
            }
        },
        {
            chainId: '0xaa36a7',
            chainName: 'Sepolia Testnet',
            rpcUrls: ['https://sepolia.infura.io/v3/'],
            blockExplorerUrls: ['https://sepolia.etherscan.io'],
            nativeCurrency: {
                name: 'Sepolia Ether',
                symbol: 'ETH',
                decimals: 18
            }
        },
        {
            chainId: '0x89',
            chainName: 'Polygon Mainnet',
            rpcUrls: ['https://polygon-rpc.com'],
            blockExplorerUrls: ['https://polygonscan.com'],
            nativeCurrency: {
                name: 'MATIC',
                symbol: 'MATIC',
                decimals: 18
            }
        },
        {
            chainId: '0x13881',
            chainName: 'Polygon Mumbai',
            rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
            blockExplorerUrls: ['https://mumbai.polygonscan.com'],
            nativeCurrency: {
                name: 'MATIC',
                symbol: 'MATIC',
                decimals: 18
            }
        },
        {
            chainId: '0x38',
            chainName: 'BSC Mainnet',
            rpcUrls: ['https://bsc-dataseed.binance.org'],
            blockExplorerUrls: ['https://bscscan.com'],
            nativeCurrency: {
                name: 'BNB',
                symbol: 'BNB',
                decimals: 18
            }
        },
        {
            chainId: '0x61',
            chainName: 'BSC Testnet',
            rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
            blockExplorerUrls: ['https://testnet.bscscan.com'],
            nativeCurrency: {
                name: 'BNB',
                symbol: 'BNB',
                decimals: 18
            }
        }
    ];

    const switchNetwork = async (network) => {
        if (!connectedWallet || !connectedWallet.provider) {
            message.error('请先连接钱包');
            return;
        }

        setNetworkSwitchLoading(true);
        try {
            // 尝试切换到指定网络
            await connectedWallet.provider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: network.chainId }]
            });
            
            message.success(`成功切换到 ${network.chainName}`);
            
            // 刷新余额和网络信息
            if (account) {
                await fetchBalance(connectedWallet.provider, account);
            }
            
        } catch (error) {
            console.error('切换网络失败:', error);
            
            // 如果网络不存在，尝试添加网络
            if (error.code === 4902) {
                try {
                    await connectedWallet.provider.request({
                        method: 'wallet_addEthereumChain',
                        params: [network]
                    });
                    message.success(`成功添加并切换到 ${network.chainName}`);
                    
                    // 刷新余额和网络信息
                    if (account) {
                        await fetchBalance(connectedWallet.provider, account);
                    }
                } catch (addError) {
                    console.error('添加网络失败:', addError);
                    message.error(`添加网络失败: ${addError.message}`);
                }
            } else {
                message.error(`切换网络失败: ${error.message}`);
            }
        } finally {
            setNetworkSwitchLoading(false);
            setShowNetworkModal(false);
        }
    };

    const getCurrentNetworkName = () => {
        if (!networkInfo) return '未知网络';
        
        const network = predefinedNetworks.find(n => 
            parseInt(n.chainId, 16).toString() === networkInfo.chainId
        );
        
        return network ? network.chainName : `网络 ${networkInfo.chainId}`;
    };

    return (
        <div className="container mx-auto p-6">
            <div className="mb-6">
                <Typography.Title level={2}>Web3 钱包检测</Typography.Title>
                <Typography.Paragraph>
                    检测当前浏览器中安装的 Web3 钱包
                </Typography.Paragraph>
                
                <Space className="mb-4">
                    <Button 
                        type="primary" 
                        onClick={detectWallets}
                        loading={loading}
                    >
                        重新检测钱包
                    </Button>
                    
                    {connectedWallet && (
                        <>
                            <Button 
                                danger
                                onClick={disconnectWallet}
                            >
                                断开钱包连接
                            </Button>
                            <Button 
                                type="default"
                                onClick={refreshBalance}
                                loading={balanceLoading}
                            >
                                刷新余额
                            </Button>
                            <Button 
                                type="default"
                                onClick={() => setShowNetworkModal(true)}
                            >
                                切换网络
                            </Button>
                        </>
                    )}
                </Space>

                {connectedWallet && (
                    <div className="mb-4">
                        <Alert
                            message={`已连接到 ${connectedWallet.name}`}
                            description={
                                <div>
                                    <div>钱包: {connectedWallet.name} {connectedWallet.icon}</div>
                                    <div>账户地址: <code>{account}</code></div>
                                    <div>格式化地址: <code>{formatAddress(account)}</code></div>
                                </div>
                            }
                            type="success"
                            showIcon
                            className="mb-4"
                        />
                        
                        {/* 余额和网络信息卡片 */}
                        <Card title="账户信息" className="mb-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Typography.Title level={5}>账户余额</Typography.Title>
                                    {balanceLoading ? (
                                        <Spin />
                                    ) : balance !== null ? (
                                        <Statistic
                                            value={parseFloat(balance)}
                                            precision={6}
                                            suffix="ETH"
                                            valueStyle={{ color: '#3f8600' }}
                                        />
                                    ) : (
                                        <Typography.Text type="secondary">未获取余额</Typography.Text>
                                    )}
                                </div>
                                
                                <div>
                                    <Typography.Title level={5}>网络信息</Typography.Title>
                                    {networkInfo ? (
                                        <div>
                                            <div><strong>网络名称:</strong> {getCurrentNetworkName()}</div>
                                            <div><strong>链ID:</strong> {networkInfo.chainId}</div>
                                            {networkInfo.ensAddress && (
                                                <div><strong>ENS地址:</strong> {networkInfo.ensAddress}</div>
                                            )}
                                        </div>
                                    ) : (
                                        <Typography.Text type="secondary">未获取网络信息</Typography.Text>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
            </div>

            {wallets.length === 0 ? (
                <Alert
                    message="未检测到钱包"
                    description="当前浏览器中未安装任何 Web3 钱包。请安装 MetaMask、Coinbase Wallet 或其他支持的钱包。"
                    type="warning"
                    showIcon
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wallets.map((wallet) => (
                        <Card
                            key={wallet.id}
                            className={`hover:shadow-lg transition-shadow ${
                                connectedWallet && connectedWallet.id === wallet.id 
                                    ? 'border-green-500 bg-green-50' 
                                    : ''
                            }`}
                            actions={[
                                connectedWallet && connectedWallet.id === wallet.id ? (
                                    <Button 
                                        danger
                                        onClick={disconnectWallet}
                                        className="w-full"
                                    >
                                        断开连接
                                    </Button>
                                ) : (
                                    <Button 
                                        type="primary" 
                                        onClick={() => connectWallet(wallet)}
                                        className="w-full"
                                        disabled={connectedWallet && connectedWallet.id !== wallet.id}
                                    >
                                        连接钱包
                                    </Button>
                                )
                            ]}
                        >
                            <div className="text-center">
                                <div className="text-4xl mb-2">{wallet.icon}</div>
                                <Typography.Title level={4}>{wallet.name}</Typography.Title>
                                <Space direction="vertical" size="small">
                                    <Tag color="green">已安装</Tag>
                                    {connectedWallet && connectedWallet.id === wallet.id && (
                                        <Tag color="blue">已连接</Tag>
                                    )}
                                </Space>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <div className="mt-8">
                <Typography.Title level={3}>检测到的钱包详情</Typography.Title>
                <List
                    dataSource={wallets}
                    renderItem={(wallet) => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={<span className="text-2xl">{wallet.icon}</span>}
                                title={wallet.name}
                                description={`钱包ID: ${wallet.id}`}
                            />
                        </List.Item>
                    )}
                />
            </div>

            {/* 网络切换模态框 */}
            <Modal
                title="切换网络"
                open={showNetworkModal}
                onCancel={() => setShowNetworkModal(false)}
                footer={null}
                width={600}
            >
                <div className="space-y-4">
                    <Typography.Paragraph>
                        选择要切换到的区块链网络。如果网络未添加到钱包中，系统会自动添加。
                    </Typography.Paragraph>
                    
                    <div className="grid grid-cols-1 gap-3">
                        {predefinedNetworks.map((network) => (
                            <Card
                                key={network.chainId}
                                className="cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => switchNetwork(network)}
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <Typography.Title level={5} className="mb-1">
                                            {network.chainName}
                                        </Typography.Title>
                                        <Typography.Text type="secondary">
                                            链ID: {network.chainId} ({parseInt(network.chainId, 16)})
                                        </Typography.Text>
                                        <div className="mt-1">
                                            <Tag color="blue">{network.nativeCurrency.symbol}</Tag>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Button 
                                            type="primary" 
                                            loading={networkSwitchLoading}
                                        >
                                            切换
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                    
                    <Alert
                        message="网络切换说明"
                        description="切换网络后，您的账户余额和交易历史将根据新网络更新。请确保您了解不同网络的特点。"
                        type="info"
                        showIcon
                    />
                </div>
            </Modal>
        </div>
    );
}