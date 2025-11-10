import { useAccount } from 'wagmi';
import { Wallet, CheckCircle2 } from 'lucide-react';
import { Card } from './ui/card';

const WalletStatus = () => {
  const { address, isConnected } = useAccount();

  if (!isConnected) {
    return (
      <Card className="p-4 bg-muted/50 border-border">
        <div className="flex items-center gap-3">
          <Wallet className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Connect your wallet to start creating
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Rainbow Wallet required to mint encrypted artwork NFT
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-primary/5 border-primary/20">
      <div className="flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-primary" />
        <div>
          <p className="text-sm font-medium flex items-center gap-2">
            Wallet Connected
          </p>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default WalletStatus;
