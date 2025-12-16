import { Link, useLocation } from "wouter";
import { Home, Package, Wallet, Settings } from "lucide-react";
import { motion } from "framer-motion";

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { path: "/dashboard", icon: Home, label: "Home", testId: "nav-home" },
    { path: "/my-orders", icon: Package, label: "My Orders", testId: "nav-orders" },
    { path: "/wallet", icon: Wallet, label: "Wallet", testId: "nav-wallet" },
    { path: "/settings", icon: Settings, label: "Settings", testId: "nav-settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="grid grid-cols-4">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Link 
              key={item.path} 
              href={item.path}
              data-testid={item.testId}
              className={`flex flex-col items-center justify-center gap-1 py-3 transition-colors ${
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                animate={isActive ? { y: [-2, 0] } : {}}
                transition={isActive ? { duration: 0.2 } : {}}
              >
                <Icon className="w-5 h-5" />
              </motion.div>
              <motion.span 
                className="text-xs font-medium"
                animate={isActive ? { fontWeight: 600 } : {}}
                transition={{ duration: 0.2 }}
              >
                {item.label}
              </motion.span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}