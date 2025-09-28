import { Home, Users, UserCheck, ChevronDown } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
import { useCreators } from "@/hooks/useVideos";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

const menuItems = [
  { icon: Home, label: "Accueil", path: "/" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: creators = [] } = useCreators();
  const [subscriptionsOpen, setSubscriptionsOpen] = useState(true);
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const getNavClass = (active: boolean) =>
    active ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50";

  const handleCreatorClick = (creatorId: string, creatorName: string) => {
    navigate(`/?creator=${creatorId}&name=${encodeURIComponent(creatorName)}`);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent className="pt-4">
        {/* Navigation principale */}
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

        {/* Section Abonnements avec créateurs */}
        {!collapsed && (
          <Collapsible open={subscriptionsOpen} onOpenChange={setSubscriptionsOpen}>
            <SidebarGroup>
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel className="cursor-pointer hover:bg-muted/50 rounded-md p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5" />
                    <span className="font-medium">Abonnements</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${subscriptionsOpen ? 'rotate-180' : ''}`} />
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {creators.length === 0 ? (
                      <SidebarMenuItem>
                        <div className="px-2 py-1 text-sm text-muted-foreground">
                          Aucun créateur
                        </div>
                      </SidebarMenuItem>
                    ) : (
                      creators.map((creator, index) => (
                        <SidebarMenuItem key={`creator-${creator.id}-${index}`}>
                          <SidebarMenuButton 
                            onClick={() => handleCreatorClick(creator.id, creator.name)}
                            className="cursor-pointer hover:bg-muted/50 p-3"
                          >
                            <Avatar className="h-6 w-6 flex-shrink-0">
                              <AvatarImage src={creator.avatar_url || ''} alt={creator.name} />
                              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                {creator.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate text-sm font-medium ml-1">{creator.name}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        )}

        {/* Section Créateurs */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Gestion
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={getNavClass(isActive("/creators"))}>
                  <Link to="/creators">
                    <UserCheck className="h-5 w-5" />
                    {!collapsed && <span>Créateurs</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}