import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Lock, BookOpen, Clock } from "lucide-react";
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
              Private <span className="text-primary glow-text">Thoughts</span>.
              <br />
              Encrypted <span className="text-accent glow-text">Forever</span>.
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Write your most intimate thoughts and encrypt them with FHEVM.
              Set unlock dates for future revelations or keep them private forever.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <Link to="/write">
              <Button size="lg" className="gap-2 px-8 hover-lift">
                Start Writing
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/entries">
              <Button size="lg" variant="outline" className="gap-2 px-8 hover-lift">
                My Diary
              </Button>
            </Link>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-16 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="p-6 rounded-lg border border-border bg-card hover-lift">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Write Freely</h3>
              <p className="text-sm text-muted-foreground">
                Express your thoughts without fear. Your diary entries are encrypted from the moment you write them.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-card hover-lift encrypt-overlay">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">FHEVM Encryption</h3>
              <p className="text-sm text-muted-foreground">
                Your private thoughts are encrypted using Fully Homomorphic Encryption, ensuring complete privacy.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-card hover-lift">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4 mx-auto">
                <Clock className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Time Capsules</h3>
              <p className="text-sm text-muted-foreground">
                Set unlock dates for your entries. Revisit your past thoughts when the time is right.
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
