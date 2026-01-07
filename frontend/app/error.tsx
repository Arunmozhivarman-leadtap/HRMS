"use client";

import { useEffect } from "react";
import { Button } from "../components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-md text-center">
      <h2 className="text-h2 font-bold text-foreground">Something went wrong!</h2>
      <p className="mt-md text-muted-foreground">
        We encountered an unexpected error. Please try again or contact support if the problem persists.
      </p>
      <Button onClick={() => reset()} className="mt-lg" variant="outline">
        Try again
      </Button>
    </div>
  );
}
