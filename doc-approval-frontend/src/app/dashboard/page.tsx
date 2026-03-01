"use client";

import { useAuth } from "@/lib/auth-context";
import UserDashboard from "./components/user-dashboard";
import ReviewerDashboard from "./components/reviewer-dashboard";

export default function DashboardPage() {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">
                    {user.role === "REVIEWER" || user.role === "ADMIN"
                        ? "Review pending documents and manage approvals."
                        : "Upload new documents and track their approval status."}
                </p>
            </div>

            {user.role === "REVIEWER" || user.role === "ADMIN" ? (
                <ReviewerDashboard />
            ) : (
                <UserDashboard />
            )}
        </div>
    );
}
