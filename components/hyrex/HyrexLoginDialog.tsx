"use client";

import { useState, FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface HyrexLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (token: string) => void;
  description?: string;
}

export function HyrexLoginDialog({
  open,
  onOpenChange,
  onSuccess,
  description = "Enter your Hyrex credentials to continue.",
}: HyrexLoginDialogProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleHyrexLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_HYREX_API_BASE_URL;
      if (!baseUrl) {
        throw new Error("Hyrex API base URL is not configured.");
      }

      const response = await fetch(`${baseUrl}/users/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const responseText = await response.text();
      let data: any = {};
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error("[HyrexLoginDialog] Failed to parse login response", {
          responseText,
          parseError,
        });
      }

      console.log("[HyrexLoginDialog] Login response", {
        status: response.status,
        hasToken:
          !!data?.token ||
          !!data?.access_token ||
          !!data?.access ||
          !!data?.data?.token,
      });

      if (!response.ok) {
        throw new Error(data?.message || data?.error || "Login failed");
      }

      const token =
        data?.access || data?.access_token || data?.token || data?.data?.token;
      if (!token) {
        console.error("[HyrexLoginDialog] Missing token in response", data);
        throw new Error(
          "Login succeeded but token is missing in response. Please try again or contact support.",
        );
      }

      if (typeof window !== "undefined") {
        window.localStorage.setItem("hyrex-auth-token", token);
        if (data?.refresh) {
          window.localStorage.setItem("hyrex-refresh-token", data.refresh);
        }
      }

      onSuccess?.(token);
      onOpenChange(false);
    } catch (err: any) {
      setError(err?.message || "Unable to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Login to Hyrex</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleHyrexLogin}>
          <div className="space-y-2">
            <Label htmlFor="hyrexEmail">Email</Label>
            <Input
              id="hyrexEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hyrexPassword">Password</Label>
            <Input
              id="hyrexPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
