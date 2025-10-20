"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import Link from "next/link";

interface PageHeaderProps {
  title: string;
  description?: string;
  showBackButton?: boolean;
  backHref?: string;
  showHomeButton?: boolean;
  actions?: React.ReactNode;
}

export default function PageHeader({
  title,
  description,
  showBackButton = true,
  backHref,
  showHomeButton = false,
  actions,
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <div className="bg-white border-b-2 border-brand-sky/30 shadow-sm mb-6">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Navigation buttons */}
          <div className="flex items-center gap-2">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="text-brand-navy hover:text-brand-teal hover:bg-brand-sky/20"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            {showHomeButton && (
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-brand-navy hover:text-brand-teal hover:bg-brand-sky/20"
                >
                  <Home className="h-4 w-4 mr-1" />
                  Dashboard
                </Button>
              </Link>
            )}
          </div>

          {/* Center: Title (if no description) */}
          {!description && title && (
            <h1 className="text-xl font-bold text-brand-navy flex-1 text-center">{title}</h1>
          )}

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {actions}
          </div>
        </div>

        {/* Description row (if provided) */}
        {description && (
          <div className="mt-3">
            <h1 className="text-2xl font-bold text-brand-navy">{title}</h1>
            <p className="text-gray-600 mt-1">{description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
