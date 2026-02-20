"use client"

import {
  LogOut,
  Power,
  User,
} from "lucide-react"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { DialogHeader, DialogTitle, DialogDescription, Dialog, DialogFooter } from "@/components/ui/dialog"
import { Spinner } from "./ui/spinner"
import { useLogout } from "@/hooks/use-logout"
import BackdropDialog from "./ui/backdrop-dialog"
import { useState } from "react"
import { Button } from "./ui/button"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { logout, loading } = useLogout()
  const [open, setOpen] = useState(false)

  return (
    <>
      <LogoutDialog open={open} onOpenChange={setOpen} logout={logout} loading={loading} />

      {/* Sidebar User Menu */}
      <SidebarMenu >
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground flex items-center justify-center shadow-inner border p-2 h-auto"
          >
            <div className="border py-2 px-[3.5px] h-full rounded-sm bg-muted">
              <User className="h-[15px]  " />
            </div>
            <div className="grid flex-1 text-left text-[13px] tracking-wide">
              <span className="truncate font-semibold text-primary-foreground">{user.name}</span>
              <span className="truncate text-[10px] text-muted-foreground">{user.email}</span>
            </div>
            <Power className="ml-auto size-3 text-emerald-100/80 cursor-pointer hover:bg-muted" onClick={() => setOpen(true)} />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu >
    </>
  )
}

const LogoutDialog = ({
  open,
  onOpenChange,
  logout,
  loading
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  logout: () => void
  loading: boolean
}) => {
  return (
    <BackdropDialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader className="border-b pb-4">
        <DialogTitle className="text-lg font-semibold text-center flex items-center justify-start gap-x-2">
          <LogOut className="size-3.5" />
          {
            loading ? "Logging out..." : "Log Out"
          }
        </DialogTitle>
        <DialogDescription className="text-left text-muted-foreground">
          {
            loading ? "Please wait while we securely end your session." : "Are your sure you want to end your session?"
          }

        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button
          variant="destructive"
          className="btn btn-primary"
          onClick={() => logout()}
          disabled={loading}
        >
          {
            loading ? <Spinner /> : <LogOut className="size-3.5" />
          }
          {
            loading ? "Logging out..." : "Confirm"
          }
        </Button>
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={loading}
        >
          No
        </Button>
      </DialogFooter>
    </BackdropDialog>
  )
}
