import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isBack, setIsBack] = useState(false);

  useEffect(() => {
    const handler = () => setIsBack(true);
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  // Reset back flag on location change (forward navigation)
  useEffect(() => {
    setIsBack(false);
  }, [location]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location}
        initial={{ opacity: 0, x: isBack ? -20 : 20, scale: 0.98 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: isBack ? 20 : -20, scale: 0.98 }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 30, 
          mass: 0.8,
          opacity: { duration: 0.2 }
        }}
        style={{ 
          willChange: "transform, opacity",
          transformOrigin: "center center"
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export default PageTransition;