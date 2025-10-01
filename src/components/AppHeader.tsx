import { Video, Bell, User, LogOut, Search, Plus, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { SidebarTrigger } from "@/components/ui/sidebar";
import SearchDialog from "@/components/SearchDialog";
import AddVideoDialog from "@/components/AddVideoDialog";
import CreateCreatorDialog from "@/components/CreateCreatorDialog";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AppHeader = () => {
  const isMobile = useIsMobile();
  const { user, signOut } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [creatorDialogOpen, setCreatorDialogOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <SidebarTrigger className="lg:hidden" />
          <div className="flex items-center gap-2">
            <Video className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold text-foreground">
              {isMobile ? "MPY" : "Mon Petit YouTube"}
            </h1>
          </div>
        </div>

        {/* Center section - Search Button */}
        <div className="flex-1 flex justify-center">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSearchOpen(true)}
            className="rounded-full w-10 h-10 hover:bg-accent"
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                size="icon"
                className="rounded-full bg-red-600 hover:bg-red-700 text-white"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem 
                onClick={() => setVideoDialogOpen(true)}
                className="cursor-pointer gap-2"
              >
                <Video className="h-4 w-4 text-blue-600" />
                <span>Ajouter une vidéo</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setCreatorDialogOpen(true)}
                className="cursor-pointer gap-2"
              >
                <Youtube className="h-4 w-4 text-red-600" />
                <span>Ajouter un créateur</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" title={user?.email}>
            <User className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            title="Se déconnecter"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      
      <AddVideoDialog 
        open={videoDialogOpen} 
        onOpenChange={setVideoDialogOpen}
      />
      
      <CreateCreatorDialog 
        open={creatorDialogOpen} 
        onOpenChange={setCreatorDialogOpen}
      />
    </header>
  );
};

export default AppHeader;