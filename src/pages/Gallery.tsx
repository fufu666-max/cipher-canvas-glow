import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Lock, Calendar, User } from "lucide-react";
import { Card } from "@/components/ui/card";

const Gallery = () => {
  // Mock encrypted artworks
  const artworks = [
    {
      id: 1,
      title: "Hidden Landscape #1",
      artist: "0x742d...4f8c",
      revealDate: "2025-12-01",
      encrypted: true,
    },
    {
      id: 2,
      title: "Abstract Emotions",
      artist: "0x8a3f...2e1d",
      revealDate: "2025-11-20",
      encrypted: true,
    },
    {
      id: 3,
      title: "Digital Dreams",
      artist: "0x5c2b...9a7e",
      revealDate: "2025-11-15",
      encrypted: true,
    },
    {
      id: 4,
      title: "Cryptic Beauty",
      artist: "0x1f8d...6c4a",
      revealDate: "2025-12-10",
      encrypted: true,
    },
    {
      id: 5,
      title: "Encrypted Vision",
      artist: "0x9e2a...3b5f",
      revealDate: "2025-11-25",
      encrypted: true,
    },
    {
      id: 6,
      title: "Silent Masterpiece",
      artist: "0x4d7c...8e2b",
      revealDate: "2025-12-05",
      encrypted: true,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 pt-24 pb-32 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold mb-4">Encrypted Gallery</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore encrypted artworks waiting to be revealed. Each piece is secured on-chain 
              until its exhibition date.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artworks.map((artwork) => (
              <Card
                key={artwork.id}
                className="overflow-hidden hover-lift cursor-pointer group"
              >
                <div className="aspect-square bg-gradient-to-br from-muted to-background relative encrypt-overlay">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lock className="w-16 h-16 text-primary/30 group-hover:text-primary/50 transition-colors animate-pulse" />
                  </div>
                  {artwork.encrypted && (
                    <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded-full">
                      Encrypted
                    </div>
                  )}
                </div>
                
                <div className="p-4 space-y-3">
                  <h3 className="font-semibold text-lg">{artwork.title}</h3>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>{artwork.artist}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Reveals: {artwork.revealDate}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Gallery;
