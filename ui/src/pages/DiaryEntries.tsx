import { useState, useEffect } from 'react';
import { useAccount, useChainId, useWalletClient, usePublicClient } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BookOpen, Lock, Unlock, Eye, EyeOff, AlertCircle, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { getEncryptedDiaryContract } from '@/lib/contract';
import { initializeFHEVM, decryptDiaryContent } from '@/lib/fhevm';
import { BrowserProvider } from 'ethers';

interface DiaryEntry {
  id: number;
  author: string;
  createdAt: Date;
  unlockTimestamp: number;
  isPublic: boolean;
  isUnlocked: boolean;
  content?: string;
}

const DiaryEntries = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { toast } = useToast();

  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [decrypting, setDecrypting] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (isConnected && address) {
      loadEntries();
    }
  }, [isConnected, address, chainId]);

  const loadEntries = async (isRetry = false) => {
    if (!isRetry) {
      setLoading(true);
      setError(null);
    }

    try {
      if (!publicClient) {
        throw new Error('Public client not available');
      }
      
      // Convert viem PublicClient to ethers Provider
      const provider = new BrowserProvider(publicClient.transport as any);
      const contract = getEncryptedDiaryContract(provider, chainId);

      // Get user's entry IDs
      const userEntryIds = await contract.getUserEntries(address!);

      const entriesData: DiaryEntry[] = [];

      for (const entryId of userEntryIds) {
        const [author, createdAt, unlockTimestamp, isPublic] = await contract.getEntryMetadata(entryId);

        const now = Math.floor(Date.now() / 1000);
        const isUnlocked = unlockTimestamp === 0 ? false : now >= unlockTimestamp;

        entriesData.push({
          id: Number(entryId),
          author,
          createdAt: new Date(Number(createdAt) * 1000),
          unlockTimestamp: Number(unlockTimestamp),
          isPublic,
          isUnlocked,
        });
      }

      setEntries(entriesData.reverse()); // Show newest first
      setError(null); // Clear any previous errors
      setRetryCount(0); // Reset retry count on success
    } catch (error: any) {
      console.error('Failed to load entries:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      setError(errorMessage);

      if (retryCount < 3) {
        toast({
          title: "Failed to load entries",
          description: `Retrying... (${retryCount + 1}/3)`,
          variant: "destructive",
        });

        // Auto-retry after 2 seconds
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          loadEntries(true);
        }, 2000);
      } else {
        toast({
          title: "Failed to load entries",
          description: "Please check your connection and try again.",
          variant: "destructive",
        });
      }
    } finally {
      if (!isRetry) {
        setLoading(false);
      }
    }
  };

  const decryptEntry = async (entryId: number) => {
    if (!address) return;

    setDecrypting(prev => new Set(prev).add(entryId));

    try {
      if (!walletClient) {
        throw new Error('Wallet client not available');
      }

      const provider = new BrowserProvider(walletClient.transport as any);
      const signer = await provider.getSigner();
      const contract = getEncryptedDiaryContract(provider, chainId);

      // Check if entry can be decrypted
      const canDecrypt = await contract.connect(signer).canDecryptEntry(entryId);

      if (!canDecrypt) {
        toast({
          title: "Cannot decrypt",
          description: "This entry is not yet unlocked or you don't have permission.",
          variant: "destructive",
        });
        return;
      }

      const fhevmInstance = await initializeFHEVM(chainId);

      // Get encrypted content
      const encryptedContent = await contract.connect(signer).getEncryptedEntry(entryId);

      // Decrypt content
      const decryptedContent = await decryptDiaryContent(
        fhevmInstance,
        encryptedContent,
        contract.target as string,
        signer
      );

      // Update entry with decrypted content
      setEntries(prev => prev.map(entry =>
        entry.id === entryId
          ? { ...entry, content: decryptedContent.toString() }
          : entry
      ));

      toast({
        title: "Entry decrypted!",
        description: "Your diary entry has been successfully decrypted.",
      });

    } catch (error) {
      console.error('Failed to decrypt entry:', error);
      toast({
        title: "Failed to decrypt",
        description: "There was an error decrypting your diary entry.",
        variant: "destructive",
      });
    } finally {
      setDecrypting(prev => {
        const newSet = new Set(prev);
        newSet.delete(entryId);
        return newSet;
      });
    }
  };

  const getUnlockStatus = (entry: DiaryEntry) => {
    if (entry.unlockTimestamp === 0) {
      return { text: "Never unlocks", color: "destructive" as const, icon: Lock };
    }

    if (entry.isUnlocked) {
      return { text: "Unlocked", color: "default" as const, icon: Unlock };
    }

    const unlockDate = new Date(entry.unlockTimestamp * 1000);
    return {
      text: `Unlocks ${format(unlockDate, "MMM dd, yyyy")}`,
      color: "secondary" as const,
      icon: Lock
    };
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Connect Wallet to View Entries
            </CardTitle>
            <CardDescription>
              Please connect your wallet to view your encrypted diary entries.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Diary Entries</h1>
          <p className="text-muted-foreground">
            Your encrypted thoughts, safely stored on the blockchain.
          </p>
        </div>

        {error ? (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <div className="flex items-center justify-between">
                <span>Failed to load diary entries: {error}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadEntries()}
                  disabled={loading}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ) : loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No diary entries yet</h3>
              <p className="text-muted-foreground mb-4">
                Start writing your first encrypted diary entry.
              </p>
              <Button onClick={() => window.location.href = '/write'}>
                Write Your First Entry
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => {
              const status = getUnlockStatus(entry);
              const StatusIcon = status.icon;
              const isDecrypting = decrypting.has(entry.id);

              return (
                <Card key={entry.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          Entry #{entry.id}
                        </CardTitle>
                        <CardDescription>
                          Created {format(entry.createdAt, "PPP 'at' p")}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={status.color} className="flex items-center gap-1">
                          <StatusIcon className="w-3 h-3" />
                          {status.text}
                        </Badge>
                        {entry.isPublic && (
                          <Badge variant="outline">
                            <Eye className="w-3 h-3 mr-1" />
                            Public
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {entry.content ? (
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="whitespace-pre-wrap">{entry.content}</p>
                      </div>
                    ) : entry.isUnlocked ? (
                      <div className="space-y-4">
                        <p className="text-muted-foreground">
                          This entry is unlocked and ready to be decrypted.
                        </p>
                        <Button
                          onClick={() => decryptEntry(entry.id)}
                          disabled={isDecrypting}
                          variant="outline"
                        >
                          {isDecrypting ? "Decrypting..." : "Decrypt Entry"}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Lock className="w-4 h-4" />
                        <span>Entry is locked and encrypted</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiaryEntries;
