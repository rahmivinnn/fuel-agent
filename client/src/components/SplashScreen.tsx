import { AnimatePresence, motion } from "framer-motion";
import React from "react";

type SplashScreenProps = {
  show: boolean;
};

export const SplashScreen: React.FC<SplashScreenProps> = ({ show }) => {
  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          key="splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[60] overflow-hidden bg-white"
        >
          {/* Top Hexagon Pattern */}
          <motion.div
            className="absolute top-0 left-1/2 transform -translate-x-1/2"
            style={{
              top: '20px',
            }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 0.3, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <img 
              src="/hexagon.png" 
              alt="" 
              className="w-[250px] h-[150px]"
            />
          </motion.div>

          {/* Bottom Hexagon Pattern */}
          <motion.div
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
            style={{
              bottom: '40px',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 0.3, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <img 
              src="/hexagon.png" 
              alt="" 
              className="w-[250px] h-[150px]"
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
                src="/logo.png" 
                alt="FuelFriendly" 
                className="w-[15vw] h-[15vw] min-w-[80px] min-h-[80px] max-w-[150px] max-h-[150px] sm:w-32 sm:h-32"
              />
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default SplashScreen;