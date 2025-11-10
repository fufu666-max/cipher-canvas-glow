import { useEffect, useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';

const WalletConnectionManager = () => {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const { disconnect } = useDisconnect();
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('disconnected');
  const [showReconnectPrompt, setShowReconnectPrompt] = useState(false);

  // BUG: 缺少完整的断线重连处理流程 - 只处理连接状态变化，但没有处理网络切换、钱包锁定等情况
  useEffect(() => {
    if (isConnected) {
      setConnectionStatus('connected');
      setShowReconnectPrompt(false);
    } else if (isReconnecting) {
      setConnectionStatus('reconnecting');
    } else {
      setConnectionStatus('disconnected');
      // BUG: 没有在断开连接后自动显示重连提示
      // setShowReconnectPrompt(true);
    }
  }, [isConnected, isReconnecting]);

  // BUG: 缺少网络状态监听，当用户切换网络时没有适当处理
  // useEffect(() => {
  //   const handleNetworkChange = () => {
  //     // 重新验证连接状态
  //     // 检查合约是否在当前网络上部署
  //   };
  //   window.ethereum?.on('chainChanged', handleNetworkChange);
  //   return () => window.ethereum?.removeListener('chainChanged', handleNetworkChange);
  // }, []);

  const handleReconnect = () => {
    // BUG: 重连逻辑不完整，没有检查钱包是否仍然可用
    setConnectionStatus('reconnecting');
    // 实际的重连应该通过RainbowKit的ConnectButton触发，这里只是设置状态
    setTimeout(() => {
      setConnectionStatus('connected');
      setShowReconnectPrompt(false);
    }, 2000);
  };

  // BUG: 缺少钱包锁定状态检测
  // const checkWalletLockStatus = async () => {
  //   if (window.ethereum) {
  //     try {
  //       await window.ethereum.request({ method: 'eth_accounts' });
  //     } catch (error) {
  //       setShowReconnectPrompt(true);
  //     }
  //   }
  // };

  if (!isConnected && !isConnecting && !isReconnecting) {
    return (
      <Alert className="border-amber-200 bg-amber-50">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <div className="flex items-center justify-between">
            <span>Please connect your wallet to access your encrypted diary.</span>
            {/* BUG: 这里应该有自动重连按钮，但被注释掉了 */}
            {/* <Button size="sm" variant="outline" onClick={handleReconnect}>
              Reconnect
            </Button> */}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      {connectionStatus === 'connected' && (
        <>
          <Wifi className="w-4 h-4 text-green-600" />
          <span className="text-green-600">Connected</span>
        </>
      )}
      {connectionStatus === 'reconnecting' && (
        <>
          <Wifi className="w-4 h-4 text-amber-600 animate-pulse" />
          <span className="text-amber-600">Reconnecting...</span>
        </>
      )}
      {connectionStatus === 'disconnected' && (
        <>
          <WifiOff className="w-4 h-4 text-red-600" />
          <span className="text-red-600">Disconnected</span>
          {showReconnectPrompt && (
            <Button size="sm" variant="outline" onClick={handleReconnect}>
              Reconnect
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default WalletConnectionManager;
