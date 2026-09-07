"use client";

import React, { useState, useEffect } from "react";
import {
    Upload,
    FileText,
    Check,
    AlertTriangle,
    Info,
    RefreshCw,
    X,
    Database,
} from "@/components/shared/Icons";
import {
    demoReportsStore,
    type DataIntakeRecord,
} from "./demoReportsStore";

interface SampleRow {
    record_id: string;
    work_title: string;
    mp_name: string;
    state: string;
    constituency: string;
    work_type: string;
    allocation_lakhs: number;
    schema_status: "Valid" | "Warning";
}

const SAMPLE_PREVIEW_ROWS: SampleRow[] = [
    {
        record_id: "IMP-001",
        work_title: "Installation of Community RO Drinking Water Plant",
        mp_name: "Representative S. Kumar",
        state: "State Sector A",
        constituency: "North District",
        work_type: "Water Supply",
        allocation_lakhs: 18.5,
        schema_status: "Valid"
    },
    {
        record_id: "IMP-002",
        work_title: "Construction of Concrete Boundary Wall for Govt High School",
        mp_name: "Representative S. Kumar",
        state: "State Sector A",
        constituency: "North District",
        work_type: "Education Infrastructure",
        allocation_lakhs: 12.0,
        schema_status: "Valid"
    },
    {
        record_id: "IMP-003",
        work_title: "Rural CC Road from Panchayat Bhavan to Hospital Road",
        mp_name: "Representative P. Sharma",
        state: "State Sector B",
        constituency: "Central East",
        work_type: "Roads & Bridges",
        allocation_lakhs: 35.0,
        schema_status: "Warning"
    },
    {
        record_id: "IMP-004",
        work_title: "Installation of 10 Solar Street Lights at Village Market Square",
        mp_name: "Representative P. Sharma",
        state: "State Sector B",
        constituency: "Central East",
        work_type: "Rural Electrification",
        allocation_lakhs: 6.5,
        schema_status: "Valid"
    },
    {
        record_id: "IMP-005",
        work_title: "Augmentation of Anganwadi Center Building & Sanitation Unit",
        mp_name: "Representative M. Roy",
        state: "State Sector C",
        constituency: "Kolkata North",
        work_type: "Health & Sanitation",
        allocation_lakhs: 15.2,
        schema_status: "Valid"
    }
];

export const DataIntakeWorkflow: React.FC = () => {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [step, setStep] = useState<number>(1); // 1: Select, 2: Validating, 3: Preview/Confirm, 4: Processing, 5: Completed
    const [history, setHistory] = useState<DataIntakeRecord[]>([]);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    useEffect(() => {
        setHistory(demoReportsStore.getDataIntakes());
        const unsubscribe = demoReportsStore.subscribe(() => {
            setHistory(demoReportsStore.getDataIntakes());
        });
        return unsubscribe;
    }, []);

    const handleFile = (file: File) => {
        setSelectedFile(file);
        setStep(2); // Validating
        setTimeout(() => {
            setStep(3); // Preview & Validation summary
        }, 1100);
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleConfirmImport = () => {
        if (!selectedFile) return;
        setStep(4); // Processing

        setTimeout(() => {
            const isExcel = selectedFile.name.endsWith(".xlsx") || selectedFile.name.endsWith(".xls");
            const isPdf = selectedFile.name.endsWith(".pdf");
            const fileType = isPdf ? "PDF Sanction Order" : isExcel ? "Excel (.xlsx)" : "CSV";

            demoReportsStore.addDataIntake({
                fileName: selectedFile.name,
                fileType,
                fileSizeKb: Math.round(selectedFile.size / 1024) || 240,
                recordsCount: 120,
                validRecords: 118,
                warningsCount: 2,
                notes: "Ingested via multi-format validation pre-flight. 100% financial schema compliant.",
            });

            setStep(5); // Completed
            setStatusMessage(`Successfully imported ${selectedFile.name} into the active oversight repository.`);
        }, 1500);
    };

    const handleReset = () => {
        setSelectedFile(null);
        setStep(1);
        setStatusMessage(null);
    };

    const handleLoadSample = () => {
        const dummyFile = new File(
            ["Sample MPLADS Work Dataset Content"],
            "MPLADS_Sanctions_FY2025_Batch2.xlsx",
            { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }
        );
        handleFile(dummyFile);
    };

    return (
        <div className="space-y-6">
            {/* Header / Intro */}
            <div className="rounded-lg border border-[#dfe3e8] bg-white p-5 shadow-xs space-y-1">
                <div className="flex items-center gap-2 text-[#172033]">
                    <Upload size={18} className="text-[#174a7e]" />
                    <h2 className="text-sm font-bold uppercase tracking-wider">
                        Data Intake &amp; Ingestion Pipeline
                    </h2>
                </div>
                <p className="text-xs text-[#536174]">
                    Ingest new MPLADS sanction datasets, physical progress logs, and signed PDF sanction orders into the oversight workspace.
                </p>
            </div>

            {/* Workflow Step Progress Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {[
                    { num: 1, label: "1. Select File" },
                    { num: 2, label: "2. Schema Check" },
                    { num: 3, label: "3. Preview & Confirm" },
                    { num: 5, label: "4. Status & History" },
                ].map((s) => {
                    const active = (step === s.num) || (step === 2 && s.num === 2) || (step === 4 && s.num === 3) || (step === 5 && s.num === 5);
                    return (
                        <div
                            key={s.num}
                            className={`p-2.5 rounded-none border text-center font-bold text-[11px] uppercase tracking-wider transition ${
                                active
                                    ? "bg-[#174a7e] text-white border-[#174a7e]"
                                    : "bg-white text-[#536174] border-[#dfe3e8]"
                            }`}
                        >
                            {s.label}
                        </div>
                    );
                })}
            </div>

            {/* Status Message Alert */}
            {statusMessage && (
                <div className="p-3.5 bg-[#eaf5ef] border border-[#bbf7d0] text-xs text-[#2f7d5a] font-bold flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Check size={16} />
                        <span>{statusMessage}</span>
                    </div>
                    <button
                        type="button"
                        onClick={handleReset}
                        className="text-xs underline text-[#2f7d5a] hover:text-[#172033] cursor-pointer"
                    >
                        Upload Another File
                    </button>
                </div>
            )}

            {/* Step 1: File Selection Container */}
            {step === 1 && (
                <div className="space-y-4">
                    <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={`relative rounded-none border-2 border-dashed p-8 text-center transition ${
                            dragActive
                                ? "border-[#174a7e] bg-[#e8f0f8]"
                                : "border-[#dfe3e8] bg-white hover:border-[#174a7e]/60"
                        }`}
                    >
                        <input
                            type="file"
                            accept=".csv, .xlsx, .xls, .pdf"
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    handleFile(e.target.files[0]);
                                }
                            }}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />

                        <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
                            <div className="flex h-12 w-12 items-center justify-center rounded-none bg-[#f1f3f6] border border-[#dfe3e8] text-[#174a7e]">
                                <Upload size={22} />
                            </div>

                            <div>
                                <p className="text-sm font-bold text-[#172033]">
                                    Drag &amp; drop your data file here, or click to browse
                                </p>
                                <p className="text-xs text-[#536174] mt-1">
                                    Supported formats: <strong>CSV (.csv)</strong>, <strong>Excel (.xlsx, .xls)</strong>, <strong>PDF Sanction Documents (.pdf)</strong>
                                </p>
                            </div>

                            <div className="flex items-center gap-3 pt-2 text-[11px] text-[#536174]">
                                <span>Max file size: 50MB</span>
                                <span>•</span>
                                <span>UTF-8 / ISO-8859 Standard</span>
                                <span>•</span>
                                <span>Multi-sheet Workbooks</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-xs p-3 bg-[#fafbfc] border border-[#dfe3e8]">
                        <span className="text-[#536174]">
                            Want to test ingestion without an external file?
                        </span>
                        <button
                            type="button"
                            onClick={handleLoadSample}
                            className="font-bold text-[#174a7e] hover:underline cursor-pointer"
                        >
                            Load Sample Sanctions Dataset (Excel) →
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Validating State */}
            {step === 2 && (
                <div className="rounded-lg border border-[#dfe3e8] bg-white p-8 text-center space-y-3 shadow-xs">
                    <RefreshCw size={24} className="animate-spin text-[#174a7e] mx-auto" />
                    <h3 className="text-sm font-bold text-[#172033]">
                        Running Schema Validation &amp; Entity Extraction...
                    </h3>
                    <p className="text-xs text-[#536174]">
                        Normalizing columns against MoSPI MPLADS standard (24 fields) and running preliminary syntax check.
                    </p>
                </div>
            )}

            {/* Step 3: Preview, Validation Findings & Import Confirmation */}
            {step === 3 && selectedFile && (
                <div className="space-y-4">
                    {/* File Header Card */}
                    <div className="rounded-lg border border-[#dfe3e8] bg-white p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                            <FileText size={18} className="text-[#174a7e]" />
                            <div>
                                <span className="font-bold text-[#172033]">{selectedFile.name}</span>
                                <span className="text-[11px] text-[#536174] block font-mono">
                                    {(selectedFile.size / 1024).toFixed(1)} KB · Schema Check Passed
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 text-[11px] font-bold bg-[#eaf5ef] text-[#2f7d5a] border border-[#bbf7d0]">
                                120 Total Records Parsed
                            </span>
                            <span className="px-2.5 py-1 text-[11px] font-bold bg-[#fff4df] text-[#a56a00] border border-[#fde68a]">
                                2 Warnings
                            </span>
                        </div>
                    </div>

                    {/* Validation Summary Matrix */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div className="p-3 bg-white border border-[#dfe3e8]">
                            <span className="text-[10px] font-bold text-[#536174] uppercase block">Schema Compliance</span>
                            <span className="font-bold text-[#2f7d5a] text-sm mt-0.5 block">24 / 24 Fields Mapped</span>
                            <p className="text-[10px] text-[#536174] mt-1">Project ID, MP Name, Sanctions, Locations matched.</p>
                        </div>

                        <div className="p-3 bg-white border border-[#dfe3e8]">
                            <span className="text-[10px] font-bold text-[#536174] uppercase block">Valid Records</span>
                            <span className="font-bold text-[#172033] text-sm mt-0.5 block">118 / 120 (98.3%)</span>
                            <p className="text-[10px] text-[#536174] mt-1">Ready for direct integration into monitoring registry.</p>
                        </div>

                        <div className="p-3 bg-white border border-[#dfe3e8]">
                            <span className="text-[10px] font-bold text-[#536174] uppercase block">Non-Blocking Warnings</span>
                            <span className="font-bold text-[#a56a00] text-sm mt-0.5 block">2 Incomplete Block Codes</span>
                            <p className="text-[10px] text-[#536174] mt-1">Optional fields; will not block financial validation.</p>
                        </div>
                    </div>

                    {/* Tabular Data Preview */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-[#172033] uppercase tracking-wider text-[11px]">
                                Sample Data Preview (First 5 Extracted Records)
                            </span>
                            <span className="text-[#536174] text-[11px]">
                                Showing sample rows extracted from file
                            </span>
                        </div>

                        <div className="overflow-x-auto border border-[#dfe3e8] bg-white">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-[#174a7e] text-white">
                                        <th className="py-2 px-3 font-bold text-[10px] uppercase w-20">Row ID</th>
                                        <th className="py-2 px-3 font-bold text-[10px] uppercase">Work Description</th>
                                        <th className="py-2 px-3 font-bold text-[10px] uppercase">MP Representative</th>
                                        <th className="py-2 px-3 font-bold text-[10px] uppercase">Constituency &amp; State</th>
                                        <th className="py-2 px-3 font-bold text-[10px] uppercase">Category</th>
                                        <th className="py-2 px-3 font-bold text-[10px] uppercase text-right">Sanctioned (₹ Lakhs)</th>
                                        <th className="py-2 px-3 font-bold text-[10px] uppercase text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#dfe3e8] bg-white">
                                    {SAMPLE_PREVIEW_ROWS.map((row) => (
                                        <tr key={row.record_id} className="hover:bg-[#fafbfc]">
                                            <td className="py-2 px-3 font-mono font-bold text-[#174a7e] text-[11px]">
                                                {row.record_id}
                                            </td>
                                            <td className="py-2 px-3 font-semibold text-[#172033] max-w-xs truncate" title={row.work_title}>
                                                {row.work_title}
                                            </td>
                                            <td className="py-2 px-3 text-[#536174]">{row.mp_name}</td>
                                            <td className="py-2 px-3 text-[#536174]">{row.constituency}, {row.state}</td>
                                            <td className="py-2 px-3 text-[#536174]">{row.work_type}</td>
                                            <td className="py-2 px-3 font-mono font-bold text-[#172033] text-right">₹{row.allocation_lakhs.toFixed(2)} L</td>
                                            <td className="py-2 px-3 text-center">
                                                <span
                                                    className={`px-1.5 py-0.2 text-[10px] font-bold uppercase ${
                                                        row.schema_status === "Valid"
                                                            ? "text-[#2f7d5a] bg-[#eaf5ef] border border-[#bbf7d0]"
                                                            : "text-[#a56a00] bg-[#fff4df] border border-[#fde68a]"
                                                    }`}
                                                >
                                                    {row.schema_status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Confirmation Bar */}
                    <div className="p-4 bg-white border border-[#dfe3e8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="space-y-0.5">
                            <span className="font-bold text-[#172033]">Ready to Confirm Ingestion</span>
                            <p className="text-[11px] text-[#536174]">
                                Ingesting will load 120 records into the monitored corpus and trigger multi-detector evaluation.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="px-3.5 py-2 text-xs font-bold text-[#536174] hover:text-[#172033] bg-[#f1f3f6] border border-[#dfe3e8] cursor-pointer"
                            >
                                Cancel / Change File
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmImport}
                                className="px-4 py-2 text-xs font-bold text-white bg-[#174a7e] hover:bg-[#123b65] transition cursor-pointer flex items-center gap-1.5"
                            >
                                <Check size={14} />
                                <span>Confirm Ingestion</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 4: Processing State */}
            {step === 4 && (
                <div className="rounded-lg border border-[#dfe3e8] bg-white p-8 text-center space-y-3 shadow-xs">
                    <RefreshCw size={24} className="animate-spin text-[#174a7e] mx-auto" />
                    <h3 className="text-sm font-bold text-[#172033]">
                        Ingesting Records into Active Corpus...
                    </h3>
                    <p className="text-xs text-[#536174]">
                        Writing records to monitoring registry and triggering anomaly score calculations.
                    </p>
                </div>
            )}

            {/* Ingestion History Table */}
            <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-[#dfe3e8] pb-2 text-xs">
                    <div className="flex items-center gap-2 text-[#172033]">
                        <Database size={16} className="text-[#174a7e]" />
                        <h3 className="font-bold uppercase tracking-wider text-[11px]">
                            Recent Ingestion History &amp; Batch Records
                        </h3>
                    </div>
                    <span className="text-[11px] text-[#536174]">
                        {history.length} Ingestion Batches Recorded
                    </span>
                </div>

                <div className="overflow-x-auto border border-[#dfe3e8] rounded-none bg-white shadow-xs">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-[#174a7e] text-white">
                                <th className="py-2.5 px-3 font-bold text-[11px] uppercase tracking-wider w-32 whitespace-nowrap">
                                    Batch ID
                                </th>
                                <th className="py-2.5 px-3 font-bold text-[11px] uppercase tracking-wider">
                                    File Name &amp; Format
                                </th>
                                <th className="py-2.5 px-3 font-bold text-[11px] uppercase tracking-wider whitespace-nowrap">
                                    Uploaded On
                                </th>
                                <th className="py-2.5 px-3 font-bold text-[11px] uppercase tracking-wider text-right whitespace-nowrap">
                                    Records Count
                                </th>
                                <th className="py-2.5 px-3 font-bold text-[11px] uppercase tracking-wider whitespace-nowrap">
                                    Validation Status
                                </th>
                                <th className="py-2.5 px-3 font-bold text-[11px] uppercase tracking-wider whitespace-nowrap">
                                    Processing Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#dfe3e8] bg-white">
                            {history.map((item) => (
                                <tr key={item.id} className="hover:bg-[#fafbfc] transition">
                                    <td className="py-2.5 px-3 font-mono font-bold text-[#174a7e] whitespace-nowrap">
                                        {item.id}
                                    </td>
                                    <td className="py-2.5 px-3">
                                        <span className="font-bold text-[#172033] block">
                                            {item.file_name}
                                        </span>
                                        <span className="text-[10px] text-[#536174] block">
                                            {item.file_type} · {item.file_size_kb} KB · {item.target_registry}
                                        </span>
                                    </td>
                                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#536174] whitespace-nowrap">
                                        {item.uploaded_on}
                                    </td>
                                    <td className="py-2.5 px-3 font-mono font-bold text-[#172033] text-right whitespace-nowrap">
                                        {item.valid_records} / {item.total_records}
                                    </td>
                                    <td className="py-2.5 px-3 whitespace-nowrap">
                                        <span
                                            className={`px-2 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-wider border ${
                                                item.schema_status === "100% Compliant"
                                                    ? "bg-[#eaf5ef] text-[#2f7d5a] border-[#bbf7d0]"
                                                    : "bg-[#fff4df] text-[#a56a00] border-[#fde68a]"
                                            }`}
                                        >
                                            {item.schema_status}
                                        </span>
                                    </td>
                                    <td className="py-2.5 px-3 whitespace-nowrap">
                                        <span
                                            className={`px-2 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-wider border ${
                                                item.processing_status === "Ingested" || item.processing_status === "Ready for Review"
                                                    ? "bg-[#eaf5ef] text-[#2f7d5a] border-[#bbf7d0]"
                                                    : "bg-[#fff4df] text-[#a56a00] border-[#fde68a]"
                                            }`}
                                        >
                                            {item.processing_status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
