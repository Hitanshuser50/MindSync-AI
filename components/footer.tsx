import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, Heart, Mail, Github, Twitter } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container px-4 md:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-bold text-lg">MindfulMe</span>
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              Your companion for mental wellbeing and emotional support.
            </p>
          </div>

          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <h4 className="font-medium">Features</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/chat" className="text-muted-foreground hover:text-foreground transition-colors">
                    AI Chat Support
                  </Link>
                </li>
                <li>
                  <Link href="/mood" className="text-muted-foreground hover:text-foreground transition-colors">
                    Mood Tracking
                  </Link>
                </li>
                <li>
                  <Link href="/self-care" className="text-muted-foreground hover:text-foreground transition-colors">
                    Self-Care Library
                  </Link>
                </li>
                <li>
                  <Link href="/emergency" className="text-muted-foreground hover:text-foreground transition-colors">
                    Crisis Resources
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Connect</h4>
              <div className="flex space-x-2">
                <Button variant="ghost" size="icon" asChild>
                  <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                    <Twitter className="h-4 w-4" />
                    <span className="sr-only">Twitter</span>
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <Link href="https://github.com" target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4" />
                    <span className="sr-only">GitHub</span>
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <Link href="mailto:contact@mindfulme.app">
                    <Mail className="h-4 w-4" />
                    <span className="sr-only">Email</span>
                  </Link>
                </Button>
              </div>
              <div className="pt-2">
                <Link href="/subscription">
                  <Button size="sm" className="gap-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    Upgrade to Premium
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mt-8 pt-8 border-t">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} MindfulMe. All rights reserved.</p>
          <p className="text-xs text-muted-foreground flex items-center mt-4 md:mt-0">
            Made with <Heart className="h-3 w-3 mx-1 text-red-500" /> for mental wellbeing
          </p>
        </div>
      </div>
    </footer>
  )
}

