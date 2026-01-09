import { motion } from "framer-motion";
import { MessageCircle, Home, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-mesh" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center relative z-10 px-4"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="inline-block mb-8"
        >
          <div className="w-24 h-24 rounded-2xl gradient-primary flex items-center justify-center mx-auto shadow-lg shadow-primary/25">
            <MessageCircle className="w-12 h-12 text-white" />
          </div>
        </motion.div>

        <h1 className="text-8xl font-bold text-gradient mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button className="gradient-primary border-0 text-white gap-2">
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          </Link>
          <Button variant="outline" onClick={() => window.history.back()} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;