import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Lock, BookOpen, Clock, BarChart3, Sparkles } from "lucide-react";
import Navigation from "@/components/Navigation";
import PageTransition from "@/components/PageTransition";

const Home = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const featureCards = [
    {
      icon: BookOpen,
      title: "Write Freely",
      description: "Express your thoughts without fear. Your diary entries are encrypted from the moment you write them.",
      color: "primary",
    },
    {
      icon: Lock,
      title: "FHEVM Encryption",
      description: "Your private thoughts are encrypted using Fully Homomorphic Encryption, ensuring complete privacy.",
      color: "primary",
      hasOverlay: true,
    },
    {
      icon: Clock,
      title: "Time Capsules",
      description: "Set unlock dates for your entries. Revisit your past thoughts when the time is right.",
      color: "accent",
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Track your diary statistics with real-time data from the blockchain smart contract.",
      color: "accent",
    },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
        <Navigation />

        {/* Hero Section */}
        <main className="flex-1 flex items-center justify-center px-4 pt-24 pb-32">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-5xl mx-auto text-center space-y-8"
          >
            {/* Floating decoration */}
            <motion.div
              className="absolute top-32 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl"
              animate={{
                y: [0, -20, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute top-40 right-20 w-32 h-32 bg-accent/10 rounded-full blur-xl"
              animate={{
                y: [0, 20, 0],
                scale: [1, 0.9, 1],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <motion.div variants={itemVariants} className="space-y-4">
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
                whileHover={{ scale: 1.05 }}
              >
                <Sparkles className="w-4 h-4" />
                Powered by FHEVM Technology
              </motion.div>
              
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                Private{" "}
                <motion.span
                  className="text-primary inline-block"
                  animate={{
                    textShadow: [
                      "0 0 20px hsla(180, 80%, 50%, 0.5)",
                      "0 0 40px hsla(180, 80%, 50%, 0.8)",
                      "0 0 20px hsla(180, 80%, 50%, 0.5)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Thoughts
                </motion.span>
                .
                <br />
                Encrypted{" "}
                <motion.span
                  className="text-accent inline-block"
                  animate={{
                    textShadow: [
                      "0 0 20px hsla(270, 60%, 60%, 0.5)",
                      "0 0 40px hsla(270, 60%, 60%, 0.8)",
                      "0 0 20px hsla(270, 60%, 60%, 0.5)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  Forever
                </motion.span>
                .
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Write your most intimate thoughts and encrypt them with FHEVM.
                Set unlock dates for future revelations or keep them private forever.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <Link to="/write">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" className="gap-2 px-8 shadow-lg shadow-primary/25">
                    Start Writing
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </motion.div>
              </Link>
              <Link to="/entries">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" variant="outline" className="gap-2 px-8">
                    My Diary
                  </Button>
                </motion.div>
              </Link>
              <Link to="/dashboard">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" variant="ghost" className="gap-2 px-8">
                    <BarChart3 className="w-5 h-5" />
                    Dashboard
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            {/* Feature Cards */}
            <motion.div
              variants={containerVariants}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16"
            >
              {featureCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <motion.div
                    key={card.title}
                    variants={itemVariants}
                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                    className={`p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm cursor-pointer group ${
                      card.hasOverlay ? "encrypt-overlay" : ""
                    }`}
                  >
                    <motion.div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto ${
                        card.color === "primary"
                          ? "bg-primary/10"
                          : "bg-accent/10"
                      }`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Icon
                        className={`w-6 h-6 ${
                          card.color === "primary" ? "text-primary" : "text-accent"
                        }`}
                      />
                    </motion.div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {card.description}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border/50 py-6">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>Encrypted Diary - Secure your thoughts with blockchain technology</p>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
};

export default Home;
