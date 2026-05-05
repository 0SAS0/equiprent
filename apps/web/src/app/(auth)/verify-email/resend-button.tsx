"use client"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { useState } from "react"

export function ResendVerificationButton({ email }: { email: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")

  const handleResend = async () => {
    setStatus("sending")
    try {
      const { error } = await authClient.sendVerificationEmail({ email })
      setStatus(error ? "error" : "sent")
      if (!error) {
        setTimeout(() => setStatus("idle"), 60_000)
      }
    } catch {
      setStatus("error")
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        variant="outline"
        className="flex-1 w-full"
        type="button"
        onClick={handleResend}
        disabled={status === "sending" || status === "sent"}
      >
        {status === "sending"
          ? "Sending…"
          : status === "sent"
            ? "Email sent!"
            : "Send another verification email"}
      </Button>
      {status === "error" && (
        <p className="text-sm text-destructive">
          Failed to resend. Please try again.
        </p>
      )}
    </div>
  )
}
