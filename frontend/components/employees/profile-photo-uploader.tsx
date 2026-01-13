"use client";

import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, Trash2, X } from "lucide-react";
import { useUploadPhoto, useUpdateEmployee } from "@/hooks/use-employee";
import { useToast } from "@/hooks/use-toast";
import { cn, getPhotoUrl } from "@/lib/utils";

interface ProfilePhotoUploaderProps {
  employeeId: number;
  currentPhoto?: string | null;
  fullName: string;
  isEditable?: boolean;
}

export function ProfilePhotoUploader({
  employeeId,
  currentPhoto,
  fullName,
  isEditable = true,
}: ProfilePhotoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadPhoto } = { uploadPhoto: useUploadPhoto() }; // Extract mutation
  const updateEmployee = useUpdateEmployee();
  const { toast } = useToast();

  const profilePhotoUrl = getPhotoUrl(currentPhoto);

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 2MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      await uploadPhoto.mutateAsync({ id: employeeId, file });
      toast({
        title: "Photo updated",
        description: "Your profile photo has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Could not upload photo.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    if (confirm("Are you sure you want to remove your profile photo?")) {
      try {
        await updateEmployee.mutateAsync({
          id: employeeId,
          data: { profile_photo: null } as any,
        });
        toast({
          title: "Photo removed",
          description: "Your profile photo has been removed.",
        });
      } catch (error: any) {
        toast({
          title: "Action failed",
          description: error.message || "Could not remove photo.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="relative group">
      <Avatar className="h-32 w-32 border-4 border-background shadow-md rounded-2xl overflow-hidden transition-all duration-300 group-hover:shadow-lg">
        <AvatarImage src={profilePhotoUrl} alt={fullName} className="object-cover" />
        <AvatarFallback className="text-3xl bg-secondary/30 text-secondary-foreground font-serif">
          {initials}
        </AvatarFallback>

        {isUploading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
        )}
      </Avatar>

      {isEditable && (
        <div className="absolute -bottom-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 rounded-full shadow-lg border border-border/40 hover:scale-110 active:scale-95 transition-all"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            title="Upload Photo"
          >
            <Camera className="h-4 w-4" />
          </Button>

          {currentPhoto && (
            <Button
              size="icon"
              variant="destructive"
              className="h-8 w-8 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all"
              onClick={handleRemove}
              disabled={isUploading}
              title="Remove Photo"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
}
