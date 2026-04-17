"use client";

import Link from "next/link";
import { Button } from "@/components/ui/atoms/button";
import { Card } from "@/components/ui/molecules/card";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background dark:bg-background">
      <Card className="w-full max-w-md">
        <div className="flex flex-col items-center justify-center gap-8 p-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 text-foreground">
              Welcome to Kanban App
            </h1>
            <p className="text-lg text-muted-foreground">
              Multi-tenant board management system
            </p>
          </div>

          <div className="flex gap-4 w-full flex-col sm:flex-row">
            <Button variant="primary" className="w-full flex-1" asChild>
              <Link href="/register">Register</Link>
            </Button>
            <Button variant="secondary" className="w-full flex-1" asChild>
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </div>
      </Card>
    </main>
  );
}
