import { SignInForm } from "@/features/auth/components/sign-in-form";
import { Logo } from "@/components/ui/logo";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full flex bg-background font-sans overflow-hidden">

      {/* Left Side - Visual/Branding */}
      <div className="hidden lg:flex flex-1 relative bg-zinc-50 flex-col justify-between p-12 border-r">
        {/* Abstract Grid Pattern (Inspired by ref.png) */}
        <div className="absolute top-0 right-0 w-3/4 h-3/4 opacity-90 pointer-events-none">
          <div className="grid grid-cols-6 grid-rows-6 gap-0 w-full h-full">
            {/* Row 1 */}
            <div className="col-start-4 row-start-1 bg-red-100/50" />
            <div className="col-start-5 row-start-1 bg-orange-100/30" />
            <div className="col-start-6 row-start-1 bg-red-500" />

            {/* Row 2 */}
            <div className="col-start-3 row-start-2 bg-blue-50/50" />
            <div className="col-start-4 row-start-2 bg-red-500" />
            <div className="col-start-5 row-start-2 bg-red-600" />
            <div className="col-start-6 row-start-2 bg-orange-400" />

            {/* Row 3 */}
            <div className="col-start-4 row-start-3 bg-red-400" />
            <div className="col-start-5 row-start-3 bg-red-100" />
            <div className="col-start-6 row-start-3 bg-orange-100" />

            {/* Row 4 */}
            <div className="col-start-5 row-start-4 bg-red-50" />
            <div className="col-start-6 row-start-4 bg-orange-500" />
          </div>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10">
          <div className="mb-8 flex items-center gap-4">
            <Image
              src="/leadtap-logo.png"
              alt="LeadTap Logo"
              width={120}
              height={120}
              className="h-auto w-[80px]"
            />
            <div className="flex flex-col">
              <span className="font-medium text-xl text-foreground tracking-tight">LeadTap Digi Solutions LLP</span>
              <span className="text-sm text-muted-foreground mt-2 tracking-wider">Employee workspace</span>
            </div>
          </div>
          <h1 className="text-6xl font-serif font-medium text-foreground tracking-tight leading-[1.2] mt-62 shadow-none">

            Welcome back
          </h1>
          <p className="mt-6 text-lg text-muted-foreground ">
            Enter your LeadTap credentials to access the workspace.
          </p>

        </div>

        <div className="relative z-10 flex gap-12 text-sm font-medium text-muted-foreground">

          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            </div>
            <span>Employee First</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /></svg>
            </div>
            <span>Secure & Compliant</span>
          </div>
        </div>
      </div>

      {/* Right Side - Sign In Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-12 relative">
        <div className="w-full max-w-[400px] space-y-8">
          <div className="flex flex-col space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">Sign In to your account</h2>

          </div>

          <SignInForm />

          <div className="flex items-center justify-center lg:justify-start gap-4 mt-8 pt-8 border-t border-dashed w-full">
            <span className="text-xs text-muted-foreground">Need help?</span>
            <a href="mailto:support@leadtap.com" className="text-xs font-medium hover:underline text-foreground">Contact IT Support</a>
          </div>
        </div>
      </div>

    </div>
  );
}
