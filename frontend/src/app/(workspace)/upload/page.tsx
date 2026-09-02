"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UploadRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/reports?tab=data-issues&sub=intake");
    }, [router]);

    return (
        <div className="py-12 text-center text-xs text-[#536174]">
            Redirecting to Data Intake workspace...
        </div>
    );
}
