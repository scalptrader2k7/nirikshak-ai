"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { SignInModal } from "@/components/auth/SignInModal";
import LandingPage from "@/app/page";

export default function SignInDirectRoute() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(true);

    const handleClose = () => {
        setIsOpen(false);
        router.push("/");
    };

    return (
        <div className="relative min-h-screen">
            {/* Underlying Landing Page */}
            <LandingPage />

            {/* Direct-route open Modal */}
            <SignInModal
                isOpen={isOpen}
                onClose={handleClose}
                initialRole="officer"
            />
        </div>
    );
}