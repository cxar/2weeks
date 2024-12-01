"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CreateProjectForm } from "@/components/forms/create-project-form"

interface CreateProjectModalProps {
  userId: string
  isOpen: boolean
  onClose: () => void
}

export function CreateProjectModal({ userId, isOpen, onClose }: CreateProjectModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Learning Sprint</DialogTitle>
        </DialogHeader>
        <CreateProjectForm 
          userId={userId} 
          onSuccess={onClose}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  )
} 