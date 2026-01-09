import { motion } from "framer-motion";
import { ArrowRight, Zap, Shield, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-muted/30" />
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6"
          >
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Real-time messaging powered by AI</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          >
            Connect Seamlessly,{" "}
            <span className="text-gradient">Chat Instantly</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
          >
            Experience the future of team communication. Lightning-fast, secure, and beautifully 
            designed messaging that your team will love.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/login" className="btn-hero inline-flex items-center gap-2">
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#features" className="btn-hero-outline inline-flex items-center justify-center gap-2">
              Learn More
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-border/50"
          >
            {[
              { value: "10M+", label: "Active Users" },
              { value: "99.9%", label: "Uptime" },
              { value: "150+", label: "Countries" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl md:text-4xl font-bold text-gradient">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Floating Icons */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute left-10 top-1/3 hidden lg:block"
        >
          <div className="p-4 rounded-2xl glass">
            <Shield className="w-8 h-8 text-success" />
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute right-10 top-1/2 hidden lg:block"
        >
          <div className="p-4 rounded-2xl glass">
            <Globe className="w-8 h-8 text-secondary" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
