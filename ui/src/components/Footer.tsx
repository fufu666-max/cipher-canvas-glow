import { Button } from "./ui/button";
import { Lock, Unlock } from "lucide-react";

const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-t border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-center">
          <Button 
            variant="default" 
            size="lg" 
            className="gap-2 px-8 shadow-lg hover-lift"
          >
            <Unlock className="w-5 h-5" />
            Decrypt Art
          </Button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
