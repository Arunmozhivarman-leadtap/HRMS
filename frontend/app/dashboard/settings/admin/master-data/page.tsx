"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MasterDataTable } from "@/components/settings/master-data-table";
import {
  Briefcase,
  Network,
  Clock
} from "lucide-react";

export default function MasterDataPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-serif font-medium text-foreground tracking-tight">Master Data Management</h3>
          <p className="text-sm text-muted-foreground">Configure organizational defaults and categorization systems.</p>
        </div>
      </div>

      <Tabs defaultValue="departments" className="w-full">
        <TabsList className="flex items-center bg-zinc-100/50 p-1 rounded-full border border-zinc-200/50 self-start md:self-auto shadow-sm mb-10 overflow-x-auto h-auto">
          <TabsTrigger value="departments" className="flex items-center gap-2 px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm shrink-0">
            <Network className="h-3.5 w-3.5" /> Departments
          </TabsTrigger>
          <TabsTrigger value="designations" className="flex items-center gap-2 px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm shrink-0">
            <Briefcase className="h-3.5 w-3.5" /> Designations
          </TabsTrigger>
          <TabsTrigger value="employment-types" className="flex items-center gap-2 px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm shrink-0">
            <Clock className="h-3.5 w-3.5" /> Emp Types
          </TabsTrigger>
        </TabsList>

        <TabsContent value="departments">
          <MasterDataTable
            type="departments"
            title="Departments"
            description="Manage organizational divisions and functional groups."
            fields={[
              { name: "name", label: "Department Name", placeholder: "e.g. Engineering" },
              { name: "description", label: "Description", placeholder: "Brief summary of activities" }
            ]}
          />
        </TabsContent>

        <TabsContent value="designations">
          <MasterDataTable
            type="designations"
            title="Designations"
            description="Define job titles and seniority levels across the company."
            fields={[
              { name: "name", label: "Job Title", placeholder: "e.g. Senior Developer" },
              { name: "level", label: "Grade / Level", placeholder: "e.g. L4, M2" }
            ]}
          />
        </TabsContent>

        <TabsContent value="employment-types">
          <MasterDataTable
            type="employment-types"
            title="Employment Types"
            description="Standard engagement models for staff members."
            fields={[
              { name: "name", label: "Type Name", placeholder: "e.g. Full-time Permanent" },
              { name: "description", label: "Details", placeholder: "e.g. Includes all statutory benefits" }
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
