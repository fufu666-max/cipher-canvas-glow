import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Sparkles, Shield, Eye } from 'lucide-react';

interface DecryptionEffectProps {
  isDecrypting: boolean;
  isComplete: boolean;
  onComplete?: () => void;
  children?: React.ReactNode;
}

const DecryptionEffect = ({ isDecrypting, isComplete, onComplete, children }: DecryptionEffectProps) => {
  const [phase, setPhase] = useState<'idle' | 'scanning' | 'unlocking' | 'revealing' | 'complete'>('idle');
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    if (isDecrypting && !isComplete) {
      setPhase('scanning');
      
      // Generate particles
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 0.5,
      }));
      setParticles(newParticles);

      const timer1 = setTimeout(() => setPhase('unlocking'), 1000);
      const timer2 = setTimeout(() => setPhase('revealing'), 2000);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [isDecrypting, isComplete]);

  useEffect(() => {
    if (isComplete) {
      setPhase('complete');
      onComplete?.();
    }
  }, [isComplete, onComplete]);

  if (phase === 'idle' && !isDecrypting) {
    return <>{children}</>;
  }

  return (
    <div className="relative overflow-hidden rounded-xl">
      <AnimatePresence mode="wait">
        {phase !== 'complete' && (
          <motion.div
            key="decryption-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="absolute inset-0 z-10 flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 212, 212, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
              backdropFilter: 'blur(8px)',
            }}
          >
            {/* Scanning grid effect */}
            {phase === 'scanning' && (
              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent"
                  animate={{
                    y: ['0%', '100%', '0%'],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  style={{ height: '20%' }}
                />
                <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 gap-1 p-4 opacity-30">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="bg-primary/40 rounded-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{
                        duration: 0.5,
                        delay: Math.random() * 1,
                        repeat: Infinity,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Unlocking animation */}
            {phase === 'unlocking' && (
              <motion.div
                className="flex flex-col items-center gap-4"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <motion.div
                  className="relative"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <Shield className="w-16 h-16 text-primary" />
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    <Lock className="w-8 h-8 text-accent" />
                  </motion.div>
                </motion.div>
                <motion.p
                  className="text-lg font-semibold text-primary"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  Decrypting...
                </motion.p>
              </motion.div>
            )}

            {/* Revealing animation */}
            {phase === 'revealing' && (
              <motion.div
                className="flex flex-col items-center gap-4"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <motion.div
                  animate={{
                    scale: [1, 1.5, 1],
                    rotate: [0, 180, 360],
                  }}
                  transition={{ duration: 1 }}
                >
                  <Unlock className="w-16 h-16 text-accent" />
                </motion.div>
                <motion.div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  <span className="text-lg font-semibold text-accent">Revealing Content!</span>
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                </motion.div>
              </motion.div>
            )}

            {/* Floating particles */}
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute w-2 h-2 bg-primary rounded-full"
                initial={{
                  x: `${particle.x}%`,
                  y: `${particle.y}%`,
                  opacity: 0,
                  scale: 0,
                }}
                animate={{
                  y: [`${particle.y}%`, `${particle.y - 30}%`],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  delay: particle.delay,
                  repeat: Infinity,
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success flash effect */}
      <AnimatePresence>
        {phase === 'complete' && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-20 bg-gradient-to-r from-primary/30 to-accent/30"
          />
        )}
      </AnimatePresence>

      {/* Content */}
      <motion.div
        animate={{
          filter: phase === 'complete' ? 'blur(0px)' : 'blur(4px)',
          opacity: phase === 'complete' ? 1 : 0.3,
        }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default DecryptionEffect;
