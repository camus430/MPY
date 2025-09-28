import { Search, Menu, Video, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border px-4 py-2">
      <div className="flex items-center justify-between max-w-full">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="hover:bg-youtube-hover"
          >
            <Menu className="h-6 w-6" />
          </Button>
          
          <div className="flex items-center gap-2">
            <Video className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">Mon Petit YouTube</h1>
          </div>
        </div>

        {/* Center section - Search */}
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

        {/* Right section */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-youtube-hover"
          >
            <Bell className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-youtube-hover rounded-full"
          >
            <User className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;