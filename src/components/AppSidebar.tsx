import { Home, TrendingUp, Users, Clock, ThumbsUp, PlaySquare, UserCheck } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { icon: Home, label: "Accueil", path: "/" },
  { icon: Users, label: "Abonnements", path: "/subscriptions" },
  { icon: UserCheck, label: "Créateurs", path: "/creators" },
  { icon: TrendingUp, label: "Tendances", path: "#" },
  { icon: PlaySquare, label: "Bibliothèque", path: "#" },
  { icon: Clock, label: "Historique", path: "#" },
  { icon: ThumbsUp, label: "Vidéos likées", path: "#" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const getNavClass = (active: boolean) =>
    active ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50";

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent className="pt-4">
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild className={getNavClass(isActive(item.path))}>
                    {item.path !== "#" ? (
                      <Link to={item.path}>
                        <item.icon className="h-5 w-5" />
                        {!collapsed && <span>{item.label}</span>}
                      </Link>
                    ) : (
                      <div className="cursor-pointer">
                        <item.icon className="h-5 w-5" />
                        {!collapsed && <span>{item.label}</span>}
                      </div>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}