import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Menu, Home, Search, Heart, MessageSquare, User, LogIn, LogOut, Settings, Key, Edit } from "lucide-react";
import PasswordResetForm from "./password-reset-form";
import UsernameChangeForm from "./username-change-form";
import ProfileEditForm from "./profile-edit-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [showUsernameChange, setShowUsernameChange] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();

  const navItems = [
    { href: "/", icon: Home, label: "Discover", requireAuth: false },
    { href: "/search", icon: Search, label: "Search", requireAuth: false },
    { href: "/favorites", icon: Heart, label: "My List", requireAuth: true },
    { href: "/reviews", icon: MessageSquare, label: "Reviews", requireAuth: true },
    { href: "/profile", icon: User, label: "Profile", requireAuth: true },
  ];

  const accountItems = [
    { icon: Edit, label: "Edit Profile", action: () => setShowProfileEdit(true) },
    { icon: User, label: "Change Username", action: () => setShowUsernameChange(true) },
    { icon: Key, label: "Reset Password", action: () => setShowPasswordReset(true) },
  ];

  const userInitials = user?.firstName && user?.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : user?.email?.[0]?.toUpperCase() || "U";

  const handleNavClick = () => {
    setOpen(false);
  };

  const handleAccountAction = (action: () => void) => {
    setOpen(false);
    action();
  };

  const filteredNavItems = navItems.filter(item => !item.requireAuth || isAuthenticated);

  return (
    <>
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              aria-label="Open navigation menu"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[350px] bg-background">
            <SheetHeader className="pb-6">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img 
                    src="/icon-72x72.png" 
                    alt="AniGuide Logo" 
                    width="36" 
                    height="36" 
                    className="rounded-lg"
                  />
                </div>
                <SheetTitle className="text-lg font-bold">AniGuide</SheetTitle>
              </div>
            </SheetHeader>

            {/* User Section */}
            {isAuthenticated ? (
              <div className="mb-6">
                <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.profileImageUrl || ""} alt="Profile" />
                    <AvatarFallback className="bg-claret text-white text-sm">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    {user?.firstName && user?.lastName && (
                      <p className="font-medium text-sm truncate">
                        {user.firstName} {user.lastName}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <Button 
                  onClick={() => {
                    setOpen(false);
                    window.location.href = "/login";
                  }}
                  className="w-full bg-[#9C0D38] hover:bg-[#9C0D38]/90 text-[#DAD2D8]"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              </div>
            )}

            {/* Navigation Items */}
            <nav className="space-y-2">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={`w-full justify-start h-10 ${
                        isActive ? "bg-claret/10 text-claret" : ""
                      }`}
                      onClick={handleNavClick}
                    >
                      <Icon className="mr-3 h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </nav>

            {/* Account Management */}
            {isAuthenticated && (
              <>
                <Separator className="my-6" />
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground px-3 mb-3">
                    Account Settings
                  </h3>
                  {accountItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={index}
                        variant="ghost"
                        className="w-full justify-start h-10"
                        onClick={() => handleAccountAction(item.action)}
                      >
                        <Icon className="mr-3 h-4 w-4" />
                        {item.label}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-10 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      setOpen(false);
                      window.location.href = "/api/logout";
                    }}
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>

      {/* Account Management Dialogs */}
      <Dialog open={showPasswordReset} onOpenChange={setShowPasswordReset}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>
          <PasswordResetForm onSuccess={() => setShowPasswordReset(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={showUsernameChange} onOpenChange={setShowUsernameChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Username</DialogTitle>
          </DialogHeader>
          <UsernameChangeForm onSuccess={() => setShowUsernameChange(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={showProfileEdit} onOpenChange={setShowProfileEdit}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <ProfileEditForm onSuccess={() => setShowProfileEdit(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
