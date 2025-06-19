import { Link, useLocation } from "wouter";
import { Truck, ClipboardCheck, MessageCircle, Settings, Crown } from "lucide-react";

export default function BottomNavigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Truck, label: "Home" },
    { path: "/dot-practice", icon: ClipboardCheck, label: "DOT Practice" },
    { path: "/coach", icon: MessageCircle, label: "Coach" },
    { path: "/subscribe", icon: Crown, label: "Premium" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex items-center justify-around">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location === path;
          return (
            <Link key={path} href={path}>
              <button
                className={`flex flex-col items-center space-y-1 p-2 transition-colors ${
                  isActive ? "text-truck-blue" : "text-gray-400 hover:text-truck-blue"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
