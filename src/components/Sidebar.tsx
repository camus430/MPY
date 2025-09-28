import { Home, TrendingUp, Users, Clock, ThumbsUp, PlaySquare, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar = ({ isOpen }: SidebarProps) => {
  const location = useLocation();
  
  const menuItems = [
    { icon: Home, label: "Accueil", path: "/" },
    { icon: UserCheck, label: "Créateurs", path: "/creators" },
    { icon: TrendingUp, label: "Tendances", path: "#" },
    { icon: Users, label: "Abonnements", path: "#" },
    { icon: PlaySquare, label: "Bibliothèque", path: "#" },
    { icon: Clock, label: "Historique", path: "#" },
    { icon: ThumbsUp, label: "Vidéos likées", path: "#" },
  ];

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-background border-r border-border transition-all duration-300 z-40",
        isOpen ? "w-60" : "w-20"
      )}
    >
      <div className="p-3">
        <nav className="space-y-1">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            const ItemComponent = item.path !== "#" ? Link : "div";
            
            return (
              <ItemComponent
                key={index}
                to={item.path !== "#" ? item.path : undefined}
                className="block"
              >
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-6 px-4 py-3 h-auto hover:bg-youtube-hover rounded-lg",
                    isActive && "bg-youtube-hover"
                  )}
                >
                  <item.icon className="h-6 w-6 flex-shrink-0" />
                  {isOpen && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </Button>
              </ItemComponent>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;