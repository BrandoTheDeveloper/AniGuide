import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Settings, LogOut, Key, Edit } from "lucide-react";
import PasswordResetForm from "./password-reset-form";
import UsernameChangeForm from "./username-change-form";
import ProfileEditForm from "./profile-edit-form";

export default function AccountMenu() {
  const { user, isAuthenticated } = useAuth();
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [showUsernameChange, setShowUsernameChange] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  if (!isAuthenticated) {
    return (
      <Button 
        onClick={() => window.location.href = "/api/login"}
        variant="outline"
        className="hidden md:flex"
      >
        Sign In
      </Button>
    );
  }

  const userInitials = user?.firstName && user?.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : user?.email?.[0]?.toUpperCase() || "U";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.profileImageUrl || ""} alt="Profile" />
              <AvatarFallback className="bg-claret text-[#07090d]">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              {user?.firstName && user?.lastName && (
                <p className="font-medium">{user.firstName} {user.lastName}</p>
              )}
              <p className="w-[200px] truncate text-sm text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowProfileEdit(true)}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowUsernameChange(true)}>
            <Edit className="mr-2 h-4 w-4" />
            <span>Change Username</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowPasswordReset(true)}>
            <Key className="mr-2 h-4 w-4" />
            <span>Reset Password</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => window.location.href = "/api/logout"}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Password Reset Dialog */}
      <Dialog open={showPasswordReset} onOpenChange={setShowPasswordReset}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>
          <PasswordResetForm onSuccess={() => setShowPasswordReset(false)} />
        </DialogContent>
      </Dialog>

      {/* Username Change Dialog */}
      <Dialog open={showUsernameChange} onOpenChange={setShowUsernameChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Username</DialogTitle>
          </DialogHeader>
          <UsernameChangeForm onSuccess={() => setShowUsernameChange(false)} />
        </DialogContent>
      </Dialog>

      {/* Profile Edit Dialog */}
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