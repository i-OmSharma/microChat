import { motion } from "framer-motion";
import { MessageSquare, Shield, Smartphone, Upload, Zap, Users } from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Real-time Messaging",
    description: "Experience instant message delivery with typing indicators and read receipts.",
    color: "text-primary",
  },
  {
    icon: Shield,
    title: "End-to-End Encryption",
    description: "Your conversations are protected with military-grade encryption protocols.",
    color: "text-success",
  },
  {
    icon: Smartphone,
    title: "Cross-Platform",
    description: "Seamlessly switch between devices. Your messages sync everywhere.",
    color: "text-secondary",
  },
  {
    icon: Upload,
    title: "File Sharing",
    description: "Share documents, images, and videos up to 2GB with a single click.",
    color: "text-warning",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Optimized for speed. Messages delivered in under 100ms worldwide.",
    color: "text-primary",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Create channels, threads, and groups for organized team discussions.",
    color: "text-secondary",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 relative">
      <div className="absolute inset-0 bg-muted/30" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything you need to{" "}
            <span className="text-gradient">communicate</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to make your team more productive and connected.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="card-glass p-6 hover:border-primary/50 transition-all"
            >
              <div className={`p-3 rounded-xl bg-muted w-fit mb-4`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
