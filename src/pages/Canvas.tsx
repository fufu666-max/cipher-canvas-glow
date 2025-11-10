import { useRef, useState, useEffect } from "react";
import { useAccount } from 'wagmi';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import WalletStatus from "@/components/WalletStatus";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Lock, Eraser, Download, Palette } from "lucide-react";
import { toast } from "sonner";

const Canvas = () => {
  const { isConnected } = useAccount();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [brushSize, setBrushSize] = useState(3);
  const [brushColor, setBrushColor] = useState("#000000");
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        setContext(ctx);
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!context || isEncrypted) return;
    setIsDrawing(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      context.beginPath();
      context.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context || isEncrypted) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      context.strokeStyle = brushColor;
      context.lineWidth = brushSize;
      context.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      context.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (context && canvasRef.current) {
      context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      toast.success("Canvas cleared");
    }
  };

  const toggleEncrypt = () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }
    setIsEncrypted(!isEncrypted);
    if (!isEncrypted) {
      toast.success("Artwork encrypted! 🔒");
    } else {
      toast.success("Artwork decrypted! 🔓");
    }
  };

  const downloadCanvas = () => {
    if (canvasRef.current) {
      const url = canvasRef.current.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = "cipher-canvas-artwork.png";
      link.href = url;
      link.click();
      toast.success("Artwork downloaded!");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1 pt-24 pb-32 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8 space-y-4">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-2">Create Your Masterpiece</h1>
              <p className="text-muted-foreground">Draw freely on the digital canvas</p>
            </div>
            <WalletStatus />
          </div>

          {/* Tools */}
          <div className="bg-card border border-border rounded-lg p-4 mb-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-muted-foreground" />
                <input
                  type="color"
                  value={brushColor}
                  onChange={(e) => setBrushColor(e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer border border-border"
                  disabled={isEncrypted || !isConnected}
                />
              </div>

              <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Brush Size:</span>
                <Slider
                  value={[brushSize]}
                  onValueChange={(value) => setBrushSize(value[0])}
                  min={1}
                  max={20}
                  step={1}
                  className="flex-1"
                  disabled={isEncrypted || !isConnected}
                />
                <span className="text-sm font-medium w-8">{brushSize}px</span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCanvas}
                  disabled={isEncrypted || !isConnected}
                  className="gap-2"
                >
                  <Eraser className="w-4 h-4" />
                  Clear
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadCanvas}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                <Button
                  variant={isEncrypted ? "default" : "outline"}
                  size="sm"
                  onClick={toggleEncrypt}
                  className="gap-2"
                >
                  <Lock className="w-4 h-4" />
                  {isEncrypted ? "Encrypted" : "Encrypt"}
                </Button>
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={1000}
              height={600}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className={`w-full border border-border rounded-lg bg-white shadow-lg cursor-crosshair ${
                isEncrypted ? "encrypt-overlay pointer-events-none" : ""
              }`}
              style={{ maxWidth: "100%", height: "auto" }}
            />
            {isEncrypted && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-lg">
                <div className="text-center space-y-2">
                  <Lock className="w-12 h-12 text-primary mx-auto animate-pulse" />
                  <p className="text-lg font-semibold">Artwork Encrypted</p>
                  <p className="text-sm text-muted-foreground">Waiting for exhibition day...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Canvas;
