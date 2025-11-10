import { Link, useLocation } from "react-router-dom";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Logo from "./Logo";
import { Button } from "./ui/button";
import WalletConnectionManager from "./WalletConnectionManager";

const Navigation = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <Logo />
          </Link>
          
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              My Diary
            </Link>
            <Link
              to="/write"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/write") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Write Entry
            </Link>
            <Link
              to="/entries"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/entries") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              All Entries
            </Link>
            
            <div className="flex items-center gap-4">
              <WalletConnectionManager />
              <ConnectButton
                chainStatus="icon"
                showBalance={false}
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
