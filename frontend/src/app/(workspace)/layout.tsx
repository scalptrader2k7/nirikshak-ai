import React from "react";
import AppShell from "@/components/layout/AppShell";

export const metadata = {
    title: "NIRIKSHAK AI — Workspace",
    description: "Public Works Expenditure Audit & Risk Inspectorate",
};

export default function WorkspaceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AppShell>{children}</AppShell>;
}
