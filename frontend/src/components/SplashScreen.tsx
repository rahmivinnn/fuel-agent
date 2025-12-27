import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { useTheme } from "./ThemeProvider";

type SplashScreenProps = {
  show: boolean;
};

export const SplashScreen: React.FC<SplashScreenProps> = ({ show }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          key="splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[60] overflow-hidden bg-[#3AC36C]"
        >
          {/* Top Hexagon Pattern */}
          <motion.div
            className="absolute -top-20 right-1/4 transform translate-x-1/2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 0.4, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <img 
              src={isDark ? "/hexagon-dark.png" : "/hexagon.png"}
              alt="" 
              className="w-64 h-64 object-contain filter brightness-0 invert rotate-180"
            />
          </motion.div>

          {/* Bottom Hexagon Pattern */}
          <motion.div
            className="absolute -bottom-20 left-1/4 transform -translate-x-1/2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 0.4, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <img 
              src={isDark ? "/hexagon-dark.png" : "/hexagon.png"}
              alt="" 
              className="w-64 h-64 object-contain filter brightness-0 invert"
            />
          </motion.div>

          {/* Center Logo */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <img 
                src={isDark ? "/logo-dark.png" : "/logo-white.png"}
                alt="FuelFriendly" 
                className="w-48 h-48 object-contain"
              />
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default SplashScreen;