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
        initial={{ x: isBack ? -20 : 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: isBack ? 20 : -20, opacity: 0 }}
        transition={{ 
          duration: 0.2,
          ease: [0.22, 1, 0.36, 1]
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export default PageTransition;