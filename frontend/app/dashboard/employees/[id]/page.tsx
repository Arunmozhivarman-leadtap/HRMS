"use client";

import { useEmployeeProfile } from "@/hooks/use-employee";
import { EmployeeProfileCard } from "@/components/employees/profile-card";
import { PersonalEditForm } from "@/components/employees/personal-edit-form";
import { BankingEditForm } from "@/components/employees/banking-edit-form";
import { StatutoryEditForm } from "@/components/employees/statutory-edit-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Shield, Landmark, History, ChevronLeft, Briefcase } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { EmploymentEditForm } from "@/components/employees/employment-edit-form";

export default function EmployeeDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const effectiveId = parseInt(id);
    const { user: currentUser } = useUser();

    const { data: employee, isLoading, error } = useEmployeeProfile(effectiveId);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-[300px] w-full rounded-2xl" />
                <Skeleton className="h-[500px] w-full rounded-2xl" />
            </div>
        );
    }

    if (error || !employee) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
                <p className="text-xl font-medium text-destructive font-serif">Employee Not Found</p>
                <p className="text-muted-foreground text-sm">The requested record might have been removed or you lack access.</p>
                <Button variant="outline" onClick={() => router.back()} className="mt-4 px-8 font-bold border-border/60">
                    <ChevronLeft className="mr-2 h-4 w-4" /> Return to Directory
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.back()} className="h-10 px-4 hover:bg-muted font-bold text-muted-foreground hover:text-foreground rounded-lg transition-all">
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back to List
                </Button>
            </div>

            <EmployeeProfileCard employee={employee} />

            <Tabs defaultValue="personal" className="w-full space-y-6">
                <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md py-4 border-b border-border/40">
                    <TabsList className="bg-muted/30 p-1.5 rounded-xl border border-border/40 inline-flex flex-wrap h-auto gap-1">
                        <TabsTrigger value="personal" className="rounded-lg px-8 py-3 text-sm font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md data-[state=active]:border-border/50 border border-transparent">
                            <User className="h-4 w-4 mr-2.5" /> Personal
                        </TabsTrigger>
                        <TabsTrigger value="employment" className="rounded-lg px-8 py-3 text-sm font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md data-[state=active]:border-border/50 border border-transparent">
                            <Briefcase className="h-4 w-4 mr-2.5" /> Employment
                        </TabsTrigger>
                        <TabsTrigger value="statutory" className="rounded-lg px-8 py-3 text-sm font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md data-[state=active]:border-border/50 border border-transparent">
                            <Shield className="h-4 w-4 mr-2.5" /> Statutory
                        </TabsTrigger>
                        <TabsTrigger value="banking" className="rounded-lg px-8 py-3 text-sm font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md data-[state=active]:border-border/50 border border-transparent">
                            <Landmark className="h-4 w-4 mr-2.5" /> Banking
                        </TabsTrigger>
                        <TabsTrigger value="audit" className="rounded-lg px-8 py-3 text-sm font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md data-[state=active]:border-border/50 border border-transparent">
                            <History className="h-4 w-4 mr-2.5" /> Audit Log
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="personal" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <Card className="bg-background border shadow-sm rounded-2xl overflow-hidden">
                        <CardHeader className="bg-muted/10 border-b border-border/40 px-8 py-6">
                            <CardTitle className="text-xl font-serif font-medium text-foreground tracking-tight">Personal Information</CardTitle>
                            <CardDescription className="text-muted-foreground font-medium">
                                Comprehensive profile details and contact information.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 md:p-10">
                            <PersonalEditForm employee={employee} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="employment" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <Card className="bg-background border shadow-sm rounded-2xl overflow-hidden">
                        <CardHeader className="bg-muted/10 border-b border-border/40 px-8 py-6">
                            <CardTitle className="text-xl font-serif font-medium text-foreground tracking-tight">Employment Details</CardTitle>
                            <CardDescription className="text-muted-foreground font-medium">
                                Organizational records, role assignment, and hierarchy information.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 md:p-10">
                            <EmploymentEditForm
                                employee={employee}
                                isAdmin={currentUser?.role === "super_admin" || currentUser?.role === "hr_admin"}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="statutory" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <Card className="bg-background border shadow-sm rounded-2xl overflow-hidden">
                        <CardHeader className="bg-muted/10 border-b border-border/40 px-8 py-6">
                            <CardTitle className="text-xl font-serif font-medium text-foreground tracking-tight">Statutory Details</CardTitle>
                            <CardDescription className="text-muted-foreground font-medium">
                                Government ID and tax compliance records.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 md:p-10">
                            <StatutoryEditForm employee={employee} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="banking" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <Card className="bg-background border shadow-sm rounded-2xl overflow-hidden">
                        <CardHeader className="bg-muted/10 border-b border-border/40 px-8 py-6">
                            <CardTitle className="text-xl font-serif font-medium text-foreground tracking-tight">Banking Details</CardTitle>
                            <CardDescription className="text-muted-foreground font-medium">
                                Salary disbursement account information.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 md:p-10">
                            <BankingEditForm employee={employee} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="audit" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <Card className="bg-background border shadow-sm rounded-2xl overflow-hidden">
                        <CardHeader className="bg-muted/10 border-b border-border/40 px-8 py-6">
                            <CardTitle className="text-xl font-serif font-medium text-foreground tracking-tight">System Audit logs</CardTitle>
                            <CardDescription className="text-muted-foreground font-medium">
                                Historical record of all changes to this employee profile.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-16 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <History className="h-10 w-10 text-muted-foreground/30" />
                                <p className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Audit trail recording is currently active for all modifications.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
