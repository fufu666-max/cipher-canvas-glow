import { useState } from 'react';
import { useAccount, useChainId, useWalletClient } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Lock, Unlock, Save } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { getEncryptedDiaryContractWithSigner } from '@/lib/contract';
import { initializeFHEVM, encryptDiaryContent } from '@/lib/fhevm';
import { useNavigate } from 'react-router-dom';
import { BrowserProvider } from 'ethers';

const WriteDiary = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [content, setContent] = useState('');
  const [unlockDate, setUnlockDate] = useState<Date>();
  const [isPublic, setIsPublic] = useState(false);
  const [neverUnlock, setNeverUnlock] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to write a diary entry.",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please write something in your diary.",
        variant: "destructive",
      });
      return;
    }

    // FIXED: Added length validation on submit to prevent saving invalid content
    if (content.length > 1000) {
      toast({
        title: "Content too long",
        description: "Please shorten your diary entry to 1000 characters or less.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (!walletClient) {
        throw new Error('Wallet client not available');
      }

      // Initialize FHEVM
      const fhevmInstance = await initializeFHEVM(chainId);

      // Get signer from wallet client
      const provider = new BrowserProvider(walletClient.transport as any);
      const signer = await provider.getSigner();

      // Get contract instance
      const contract = getEncryptedDiaryContractWithSigner(signer, chainId);

      // Encrypt content
      const contractAddress = contract.target as string;
      const { handles, inputProof } = await encryptDiaryContent(
        fhevmInstance,
        contractAddress,
        address,
        content
      );

      // Calculate unlock timestamp
      const unlockTimestamp = neverUnlock ? 0 : (unlockDate ? Math.floor(unlockDate.getTime() / 1000) : 0);

      // Create diary entry
      const tx = await contract.createEntry(
        handles[0],
        inputProof,
        unlockTimestamp,
        isPublic
      );

      await tx.wait();

      toast({
        title: "Diary entry created!",
        description: "Your encrypted diary entry has been saved to the blockchain.",
      });

      // Reset form
      setContent('');
      setUnlockDate(undefined);
      setIsPublic(false);
      setNeverUnlock(false);

      // Navigate to entries page
      navigate('/');

    } catch (error) {
      console.error('Failed to create diary entry:', error);
      toast({
        title: "Failed to create entry",
        description: "There was an error creating your diary entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Connect Wallet to Write
            </CardTitle>
            <CardDescription>
              Please connect your wallet to create encrypted diary entries.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="w-5 h-5" />
            Write New Diary Entry
          </CardTitle>
          <CardDescription>
            Your thoughts will be encrypted and stored securely on the blockchain.
            Set an unlock date to reveal your entry in the future, or keep it private forever.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="content">Your Thoughts</Label>
            <Textarea
              id="content"
              placeholder="Write your diary entry here..."
              value={content}
              onChange={(e) => {
                // FIXED: Proper content length validation with user feedback
                // Prevents data loss by warning users before truncation
                const newContent = e.target.value;
                if (newContent.length <= 1000) { // Reasonable limit for diary entries
                  setContent(newContent);
                } else {
                  toast({
                    title: "Content too long",
                    description: "Diary entries are limited to 1000 characters. Please shorten your entry.",
                    variant: "destructive",
                  });
                  // Don't update content to prevent data loss
                }
              }}
              rows={8}
              className="resize-none"
            />
            <p className="text-sm text-muted-foreground text-right">
              {content.length}/1000 characters
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Unlock Settings</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="never-unlock"
                    checked={neverUnlock}
                    onCheckedChange={setNeverUnlock}
                  />
                  <Label htmlFor="never-unlock" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Never unlock (keep private forever)
                  </Label>
                </div>
              </div>

              {!neverUnlock && (
                <div className="space-y-2">
                  <Label>Unlock Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !unlockDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {unlockDate ? format(unlockDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={unlockDate}
                        onSelect={setUnlockDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Privacy Settings</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is-public"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                    disabled={neverUnlock}
                  />
                  <Label htmlFor="is-public" className="flex items-center gap-2">
                    <Unlock className="w-4 h-4" />
                    Make public after unlock
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  {neverUnlock
                    ? "Entry will remain private forever"
                    : isPublic
                      ? "Entry will be visible to everyone after unlock date"
                      : "Entry will only be visible to you after unlock date"
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !content.trim() || (!neverUnlock && !unlockDate)}
              className="min-w-32"
            >
              {isSubmitting ? "Encrypting..." : "Save Entry"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WriteDiary;
