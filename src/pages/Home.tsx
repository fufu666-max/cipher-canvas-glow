import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Lock, Palette, Sparkles } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4 pt-24 pb-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4 animate-fade-in">
            <h1 className="text-6xl md:text-7xl font-bold tracking-tight">
              Create in <span className="text-primary glow-text">Silence</span>.
              <br />
              Reveal in <span className="text-accent glow-text">Light</span>.
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Draw and encrypt digital sketches until exhibition day. 
              Decryption reveals the original art transparently on-chain.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <Link to="/canvas">
              <Button size="lg" className="gap-2 px-8 hover-lift">
                Start Creating
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/gallery">
              <Button size="lg" variant="outline" className="gap-2 px-8 hover-lift">
                View Gallery
              </Button>
            </Link>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-16 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="p-6 rounded-lg border border-border bg-card hover-lift">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <Palette className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Draw & Create</h3>
              <p className="text-sm text-muted-foreground">
                Use our intuitive canvas to create digital artwork with powerful drawing tools.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-card hover-lift encrypt-overlay">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Encrypt Art</h3>
              <p className="text-sm text-muted-foreground">
                Lock your masterpiece with cryptographic encryption until the reveal date.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-card hover-lift">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4 mx-auto">
                <Sparkles className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Mint as NFT</h3>
              <p className="text-sm text-muted-foreground">
                Mint your encrypted artwork as an NFT with Rainbow Wallet integration.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
