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
    <AnimatePresence mode="sync">
      <motion.div
        key={location}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ 
          duration: 0.15,
          ease: "easeInOut"
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export default PageTransition;