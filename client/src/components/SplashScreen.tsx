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
          className="fixed inset-0 z-[60] bg-[#35B458] overflow-hidden flex items-center justify-center"
        >
          {/* Pola diagonal atas — tetap di posisi atas */}
          <motion.div
            aria-hidden
            className="absolute left-1/2 -translate-x-1/2 w-full h-24 md:h-32 opacity-90 select-none pointer-events-none"
            style={{
              top: 0,
              backgroundImage: "url(/diagonal-2.svg)",
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              backgroundPosition: "center top",
              // Stabilize paint & stacking
              willChange: "transform, opacity",
              zIndex: 0,
              contain: "paint",
            }}
            initial={{ opacity: 0.9 }}
            animate={{
              opacity: [0.9, 0.9, 0],
            }}
            transition={{
              duration: 1.6,
              times: [0, 0.6, 1],
              ease: [0.16, 1, 0.3, 1],
            }}
          />

          {/* Pola diagonal bawah — tetap di posisi bawah */}
          <motion.div
            aria-hidden
            className="absolute left-1/2 -translate-x-1/2 w-full h-24 md:h-32 opacity-90 select-none pointer-events-none"
            style={{
              bottom: 0,
              backgroundImage: "url(/diagonal-1.svg)",
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              backgroundPosition: "center bottom",
              // Stabilize paint & stacking
              willChange: "transform, opacity",
              zIndex: 0,
              contain: "paint",
            }}
            initial={{ opacity: 0.9 }}
            animate={{
              opacity: [0.9, 0.9, 0],
            }}
            transition={{
              duration: 1.6,
              times: [0, 0.6, 1],
              ease: [0.16, 1, 0.3, 1],
              delay: 0.05,
            }}
          />

          {/* Center brand */}
          <div className="flex items-center justify-center px-8 w-full max-w-xs">
            <motion.img
              src="/logo.svg"
              alt="FuelFriendly"
              className="w-full max-w-[180px] h-auto drop-shadow-sm object-contain block"
              style={{
                // Promote to its own layer to avoid jitter when diagonals fade
                willChange: "transform, opacity",
                transform: "translateZ(0)",
                backfaceVisibility: "hidden",
                position: "relative",
                zIndex: 1,
              }}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: [0.92, 1.08, 1.0], opacity: [0, 1, 1] }}
              transition={{ duration: 1.2, times: [0, 0.6, 1], ease: [0.16, 1, 0.3, 1], delay: 0.9 }}
              loading="eager"
              decoding="async"
              draggable={false}
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                // Fallback jika SVG gagal
                target.src = "/logo.png";
              }}
            />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default SplashScreen;