"use client";

import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { LogOut, FileText } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuth();

    if (!user) return null; // Let the AuthContext handle redirects

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground">
            <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-lg">
                            <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <h1 className="font-bold text-xl tracking-tight hidden sm:block">
                            DocuSeal
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-sm hidden sm:block">
                            <span className="text-muted-foreground mr-2">Logged in as</span>
                            <span className="font-medium bg-secondary px-2 py-1 rounded-md text-secondary-foreground">
                                {user.email}
                            </span>
                            <span className="ml-2 px-2 py-1 text-xs font-bold rounded-full bg-accent text-accent-foreground uppercase tracking-wider">
                                {user.role}
                            </span>
                        </div>
                        <Button variant="outline" size="sm" onClick={logout} className="gap-2">
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline">Sign out</span>
                        </Button>
                    </div>
                </div>
            </header>
            <main className="flex-1 container mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    );
}
