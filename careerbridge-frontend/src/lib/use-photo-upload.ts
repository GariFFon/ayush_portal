"use client"

import { useCallback, useState } from "react"
import { toast } from "sonner"

import { useAuth } from "@/contexts/auth-context"
import { uploadProfilePhoto } from "@/lib/api"

const MAX = 5 * 1024 * 1024

/** Upload a new profile picture, then refresh the signed-in user. */
export function usePhotoUpload() {
  const { refreshUser } = useAuth()
  const [uploading, setUploading] = useState(false)

  const upload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) return toast.error("Please choose an image file.")
      if (file.size > MAX) return toast.error("Photo must be 5 MB or smaller.")
      setUploading(true)
      try {
        await uploadProfilePhoto(file)
        await refreshUser()
        toast.success("Photo updated")
      } catch {
        toast.error("Couldn't upload the photo. Try again.")
      } finally {
        setUploading(false)
      }
    },
    [refreshUser]
  )

  return { upload, uploading }
}
