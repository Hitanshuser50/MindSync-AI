"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/components/auth-provider"
import { usePremium } from "@/hooks/use-premium"
import {
  Menu,
  X,
  Home,
  MessageCircle,
  BarChart2,
  BookOpen,
  Phone,
  User,
  LogOut,
  LogIn,
  Sparkles,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Chat", href: "/chat", icon: MessageCircle },
  { name: "Mood Tracker", href: "/mood", icon: BarChart2 },
  { name: "Self-Care", href: "/self-care", icon: BookOpen },
  { name: "Emergency", href: "/emergency", icon: Phone },
]

export default function Navbar() {
  const pathname = usePathname()
  const { user, isLoading: authLoading } = useAuth()
  const { isPremium } = usePremium()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        isScrolled ? "bg-background/80 backdrop-blur-md border-b shadow-sm" : "bg-background",
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </div>
            </motion.div>
            <motion.span
              className="font-bold text-lg hidden sm:inline-block"
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              MindfulMe
            </motion.span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link key={item.href} href={item.href} className="relative">
                <Button
                  variant="ghost"
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md transition-all",
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                  {isActive && (
                    <motion.div
                      className="absolute bottom-0 left-0 h-0.5 w-full bg-primary"
                      layoutId="navbar-indicator"
                      transition={{ type: "spring", duration: 0.5 }}
                    />
                  )}
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* User Menu or Auth Buttons */}
        <div className="flex items-center gap-2">
          {isPremium && (
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
              <Sparkles className="h-3 w-3" />
              <span>Premium</span>
            </div>
          )}

          {!authLoading && (
            <>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder.svg?height=32&width=32" alt={user.email || "User"} />
                        <AvatarFallback>{user.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/subscription" className="cursor-pointer">
                        <Sparkles className="mr-2 h-4 w-4" />
                        <span>Subscription</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      <LogIn className="mr-2 h-4 w-4" />
                      <span>Log in</span>
                    </Button>
                  </Link>
                  <Link href="/signup" className="hidden sm:block">
                    <Button size="sm">Sign up</Button>
                  </Link>
                </div>
              )}
            </>
          )}

          {/* Mobile Menu Trigger */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80vw] sm:w-[350px] pr-0">
              <div className="flex flex-col gap-6 px-2">
                <div className="flex items-center justify-between">
                  <Link href="/" className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <span className="font-bold text-lg">MindfulMe</span>
                  </Link>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <X className="h-5 w-5" />
                      <span className="sr-only">Close menu</span>
                    </Button>
                  </SheetTrigger>
                </div>

                <nav className="flex flex-col gap-1">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon

                    return (
                      <Link key={item.href} href={item.href}>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start gap-3 px-3 py-6",
                            isActive ? "bg-muted text-primary" : "text-muted-foreground",
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{item.name}</span>
                        </Button>
                      </Link>
                    )
                  })}
                </nav>

                {user ? (
                  <div className="flex flex-col gap-2 mt-4">
                    <div className="flex items-center gap-3 px-3 py-2">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/placeholder.svg?height=40&width=40" alt={user.email || "User"} />
                        <AvatarFallback>{user.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.email}</span>
                        {isPremium && (
                          <div className="flex items-center gap-1 text-primary text-xs">
                            <Sparkles className="h-3 w-3" />
                            <span>Premium Member</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Link href="/profile">
                      <Button variant="ghost" className="w-full justify-start gap-3">
                        <User className="h-5 w-5" />
                        <span>Profile</span>
                      </Button>
                    </Link>
                    <Link href="/subscription">
                      <Button variant="ghost" className="w-full justify-start gap-3">
                        <Sparkles className="h-5 w-5" />
                        <span>Subscription</span>
                      </Button>
                    </Link>
                    <Link href="/settings">
                      <Button variant="ghost" className="w-full justify-start gap-3">
                        <Settings className="h-5 w-5" />
                        <span>Settings</span>
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 text-destructive hover:text-destructive"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Log out</span>
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 mt-4">
                    <Link href="/login">
                      <Button variant="outline" className="w-full">
                        Log in
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button className="w-full">Sign up</Button>
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

