import { Link, useLocation } from "react-router-dom";
import Logo from "./Logo";
import { Button } from "./ui/button";
import { Wallet } from "lucide-react";

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
              Home
            </Link>
            <Link
              to="/canvas"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/canvas") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Create
            </Link>
            <Link
              to="/gallery"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/gallery") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Gallery
            </Link>
            
            <Button variant="default" size="sm" className="gap-2">
              <Wallet className="w-4 h-4" />
              Connect Wallet
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
