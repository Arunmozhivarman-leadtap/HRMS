"use client";

import { useCompanySettings, useUploadCompanyLogo, useUploadLetterhead } from "@/hooks/use-settings";
import { CompanyForm } from "@/components/settings/company-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Upload, ImageIcon, FileCheck, ExternalLink } from "lucide-react";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { getPhotoUrl } from "@/lib/utils";

export default function CompanySettingsPage() {
  const { data: settings, isLoading } = useCompanySettings();
  const { toast } = useToast();
  const uploadLogoMutation = useUploadCompanyLogo();
  const uploadLetterheadMutation = useUploadLetterhead();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const letterheadInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadLogoMutation.mutate(file, {
        onSuccess: () => {
          toast({ title: "Logo updated", description: "Company branding logo has been saved." });
        }
      });
    }
  };

  const handleLetterheadUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadLetterheadMutation.mutate(file, {
        onSuccess: () => {
          toast({ title: "Letterhead updated", description: "Company letterhead template has been saved." });
        }
      });
    }
  };

  if (isLoading) {
    return <Skeleton className="h-[600px] w-full rounded-3xl" />;
  }

  const logoUrl = settings?.logo_url
    ? getPhotoUrl(settings.logo_url)
    : null;

  const letterheadUrl = settings?.letterhead_url
    ? getPhotoUrl(settings.letterhead_url)
    : null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-serif font-medium text-foreground tracking-tight">Official Profile</h3>
          <p className="text-sm text-muted-foreground">Legal and statutory identifiers for LeadTap Digi Solutions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="border shadow-sm rounded-xl overflow-hidden bg-white">
            <CardHeader className="bg-muted/30 pb-8 pt-8 px-8 border-b border-muted/20">
              <CardTitle className="text-2xl font-serif">Company Details</CardTitle>
              <CardDescription className="text-sm text-muted-foreground/80 font-medium">
                Manage your organization's legal information and address.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <CompanyForm initialData={settings} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="border shadow-sm rounded-xl overflow-hidden bg-zinc-900 text-white">
            <CardHeader className="pb-6">
              <CardTitle className="text-xl font-serif">Branding Assets</CardTitle>
              <CardDescription className="text-zinc-400 font-medium">Official logo used in documents.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="flex flex-col items-center gap-6">
                <div className="h-40 w-40 bg-zinc-800 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-zinc-700 shadow-inner">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="max-h-full max-w-full object-contain p-4" />
                  ) : (
                    <ImageIcon className="h-12 w-12 text-zinc-600" />
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  accept="image/*"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full h-11 rounded-xl border-zinc-700 bg-transparent hover:bg-zinc-800 transition-all font-bold uppercase tracking-widest text-[10px]"
                  disabled={uploadLogoMutation.isPending}
                >
                  <Upload className="mr-2 h-4 w-4" /> Change Company Logo
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm rounded-xl overflow-hidden bg-white">
            <CardHeader className="pb-6">
              <CardTitle className="text-xl font-serif">Letterhead</CardTitle>
              <CardDescription className="text-muted-foreground font-medium text-xs uppercase tracking-widest font-bold">Standard PDF/Image</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 border-2 border-dashed border-muted rounded-2xl flex flex-col items-center text-center gap-4">
                <div className="h-12 w-12 bg-muted/50 rounded-2xl flex items-center justify-center">
                  <FileCheck className="h-6 w-6 text-muted-foreground" />
                </div>
                {letterheadUrl ? (
                  <div className="space-y-4 w-full">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-primary">Letterhead template exists</p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-[9px] uppercase tracking-widest font-bold"
                        onClick={() => window.open(letterheadUrl, '_blank')}
                      >
                        <ExternalLink className="mr-2 h-3 w-3" /> View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 text-[9px] uppercase tracking-widest font-bold"
                        onClick={() => letterheadInputRef.current?.click()}
                        disabled={uploadLetterheadMutation.isPending}
                      >
                        Change
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">No custom letterhead uploaded.</p>
                    <Button
                      variant="ghost"
                      onClick={() => letterheadInputRef.current?.click()}
                      disabled={uploadLetterheadMutation.isPending}
                      size="sm"
                      className="text-primary font-bold uppercase tracking-widest text-[9px]"
                    >
                      {uploadLetterheadMutation.isPending ? "Uploading..." : "Upload template"}
                    </Button>
                  </>
                )}
                <input
                  type="file"
                  className="hidden"
                  ref={letterheadInputRef}
                  onChange={handleLetterheadUpload}
                  accept="image/*,application/pdf"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
