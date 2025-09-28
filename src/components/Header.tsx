import { Search, Menu, Video, Bell, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const isMobile = useIsMobile();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left section */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="hover:bg-youtube-hover flex-shrink-0"
          >
            <Menu className="h-6 w-6" />
          </Button>
          
          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            <Video className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
            <h1 className="text-sm sm:text-xl font-semibold text-foreground truncate">
              {isMobile ? "MPY" : "Mon Petit YouTube"}
            </h1>
          </div>
        </div>

        {/* Center section - Search (hidden on mobile) */}
        {!isMobile && (
          <div className="flex-1 max-w-2xl mx-8">
            <div className="flex">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Rechercher..."
                  className="w-full pr-4 py-2 rounded-l-full border-r-0 focus:ring-primary"
                />
              </div>
              <Button
                variant="secondary"
                className="px-6 rounded-r-full border border-l-0 hover:bg-youtube-light-gray"
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Right section */}
        <div className="flex items-center gap-1 sm:gap-2">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-youtube-hover flex-shrink-0"
            >
              <Search className="h-5 w-5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-youtube-hover flex-shrink-0"
          >
            <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-youtube-hover rounded-full flex-shrink-0"
            title={user?.email}
          >
            <User className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
          <Button
            variant="ghost" 
            size="icon"
            onClick={handleSignOut}
            className="hover:bg-youtube-hover flex-shrink-0"
            title="Se déconnecter"
          >
            <LogOut className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;