"use client"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { toast } from "sonner"

export function DashboardAlerts() {
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get("reason") === "already-logged-in") {
      toast.info("Jesteś już zalogowany. Wyloguj się aby założyć nowe konto.")
    }
  }, [searchParams])

  return null
}