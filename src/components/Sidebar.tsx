import { Home, TrendingUp, Users, Clock, ThumbsUp, PlaySquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar = ({ isOpen }: SidebarProps) => {
  const menuItems = [
    { icon: Home, label: "Accueil", active: true },
    { icon: TrendingUp, label: "Tendances" },
    { icon: Users, label: "Abonnements" },
    { icon: PlaySquare, label: "Bibliothèque" },
    { icon: Clock, label: "Historique" },
    { icon: ThumbsUp, label: "Vidéos likées" },
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
          {menuItems.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-6 px-4 py-3 h-auto hover:bg-youtube-hover rounded-lg",
                item.active && "bg-youtube-hover"
              )}
            >
              <item.icon className="h-6 w-6 flex-shrink-0" />
              {isOpen && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </Button>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;