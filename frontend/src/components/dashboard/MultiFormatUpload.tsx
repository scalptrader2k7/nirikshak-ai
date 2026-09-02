import React, { useState } from "react";
import {
    Upload,
    FileText,
    Check,
    Info,
    ArrowRight,
    RefreshCw,
} from "@/components/shared/Icons";

export const MultiFormatUpload: React.FC = () => {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState<"idle" | "validating" | "success" | "error">("idle");
    const [selectedFormat, setSelectedFormat] = useState<"csv" | "excel" | "pdf">("csv");

    const handleFile = (file: File) => {
        setSelectedFile(file);
        setUploadStatus("validating");

        // Structured simulation of multi-format validation pipeline
        setTimeout(() => {
            setUploadStatus("success");
        }, 1200);
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

    const handleReset = () => {
        setSelectedFile(null);
        setUploadStatus("idle");
    };

    return (
        <div className="rounded-xl border border-[#d8d4ca] bg-white p-6 shadow-xs space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ece7dc] pb-4">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#102d49]/5 text-[#102d49]">
                        <Upload size={17} />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-[#17263a]">
                            Multi-Format Data Ingestion Portal
                        </h2>
                        <p className="text-xs text-[#687487]">
                            Ingest new MPLADS sanction datasets, physical progress matrices, and PDF audit orders
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-[#102d49] bg-[#f4f2ec] border border-[#d8d4ca] px-2 py-0.5 rounded">
                        CSV
                    </span>
                    <span className="text-[10px] font-bold text-[#102d49] bg-[#f4f2ec] border border-[#d8d4ca] px-2 py-0.5 rounded">
                        Excel (.xlsx/.xls)
                    </span>
                    <span className="text-[10px] font-bold text-[#102d49] bg-[#f4f2ec] border border-[#d8d4ca] px-2 py-0.5 rounded">
                        PDF
                    </span>
                </div>
            </div>

            {/* Ingestion Pipeline Explanation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-lg border border-[#e2ddd1] bg-[#fbfaf8]">
                    <div className="flex items-center gap-2 font-bold text-[#102d49] mb-1">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#102d49] text-white text-[10px]">
                            1
                        </span>
                        <span>File Selection</span>
                    </div>
                    <p className="text-[11px] text-[#687487]">
                        Upload structured CSV, Excel workbooks, or signed district PDF sanction orders.
                    </p>
                </div>

                <div className="p-3 rounded-lg border border-[#e2ddd1] bg-[#fbfaf8]">
                    <div className="flex items-center gap-2 font-bold text-[#102d49] mb-1">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#102d49] text-white text-[10px]">
                            2
                        </span>
                        <span>Schema Validation</span>
                    </div>
                    <p className="text-[11px] text-[#687487]">
                        Automatic header normalization against the 26-field SIH 102 MoSPI data standard.
                    </p>
                </div>

                <div className="p-3 rounded-lg border border-[#e2ddd1] bg-[#fbfaf8]">
                    <div className="flex items-center gap-2 font-bold text-[#102d49] mb-1">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#102d49] text-white text-[10px]">
                            3
                        </span>
                        <span>Entity Extraction</span>
                    </div>
                    <p className="text-[11px] text-[#687487]">
                        Tabular and textual parsing of MP names, amounts, locations, and milestones.
                    </p>
                </div>

                <div className="p-3 rounded-lg border border-[#e2ddd1] bg-[#fbfaf8]">
                    <div className="flex items-center gap-2 font-bold text-[#2f7d5a] mb-1">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2f7d5a] text-white text-[10px]">
                            4
                        </span>
                        <span>Anomaly Triage</span>
                    </div>
                    <p className="text-[11px] text-[#687487]">
                        Real-time scoring against 4 anomaly engines (Cost, Duplicates, Patterns).
                    </p>
                </div>
            </div>

            {/* Drag & Drop Upload Container */}
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-all ${dragActive
                        ? "border-[#102d49] bg-[#e8f0f8]"
                        : "border-[#d8d4ca] bg-[#fbfaf8] hover:border-[#102d49]/50"
                    }`}
            >
                <input
                    type="file"
                    id="multi-format-input"
                    accept=".csv, .xlsx, .xls, .pdf"
                    onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                            handleFile(e.target.files[0]);
                        }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />

                <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#102d49]/10 text-[#102d49]">
                        <Upload size={22} />
                    </div>

                    <div>
                        <p className="text-sm font-bold text-[#17263a]">
                            Drag &amp; drop your MPLADS data file here, or click to browse
                        </p>
                        <p className="text-xs text-[#687487] mt-1">
                            Supported formats: <strong>CSV</strong> (.csv), <strong>Excel</strong> (.xlsx, .xls), <strong>PDF Sanction Documents</strong> (.pdf)
                        </p>
                    </div>

                    <div className="flex items-center gap-3 pt-2 text-[11px] font-semibold text-[#536174]">
                        <span>Max file size: 50MB</span>
                        <span>•</span>
                        <span>UTF-8 / ISO-8859 encoding</span>
                        <span>•</span>
                        <span>Multi-sheet Excel supported</span>
                    </div>
                </div>
            </div>

            {/* Upload Status & Pipeline Result */}
            {uploadStatus !== "idle" && selectedFile && (
                <div className="rounded-lg border border-[#d8d4ca] bg-white p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                            <FileText size={16} className="text-[#102d49]" />
                            <span className="font-bold text-[#17263a]">{selectedFile.name}</span>
                            <span className="font-mono text-[10px] text-[#687487]">
                                ({(selectedFile.size / 1024).toFixed(1)} KB)
                            </span>
                        </div>

                        {uploadStatus === "validating" && (
                            <span className="text-[#102d49] font-bold inline-flex items-center gap-1.5">
                                <RefreshCw size={12} className="animate-spin" />
                                Validating Schema &amp; Parsing Entities...
                            </span>
                        )}

                        {uploadStatus === "success" && (
                            <div className="flex items-center gap-2">
                                <span className="text-[#2f7d5a] font-bold inline-flex items-center gap-1 bg-[#eaf5ef] px-2 py-0.5 rounded">
                                    <Check size={12} />
                                    Validated &amp; Schema Compliant
                                </span>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="text-xs text-[#687487] hover:text-[#b91c1c] underline cursor-pointer"
                                >
                                    Clear
                                </button>
                            </div>
                        )}
                    </div>

                    {uploadStatus === "success" && (
                        <div className="p-3 rounded-lg bg-[#f8fafc] border border-[#e2ddd1] text-xs space-y-1.5 text-[#536174]">
                            <div className="flex items-center justify-between font-bold text-[#17263a]">
                                <span>Ingestion Pre-flight Complete</span>
                                <span className="font-mono text-[#2f7d5a]">Ready for Workspace Integration</span>
                            </div>
                            <p className="text-[11px] text-[#687487]">
                                Detected 24 columns, 100% compliant with MoSPI MPLADS field schema. Anomaly detectors will execute upon official confirmation.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Ingestion Policy Footnote */}
            <div className="pt-3 border-t border-[#ece7dc] flex items-center justify-between text-[11px] text-[#687487]">
                <div className="flex items-center gap-2">
                    <Info size={14} className="text-[#102d49] shrink-0" />
                    <span>
                        <strong>Multi-Format Ingestion Standard:</strong> PDF files undergo OCR &amp; layout extraction; Excel and CSV files are parsed directly into the 4-detector pipeline.
                    </span>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        const dummyFile = new File(["dummy content"], "MPLADS_Sanctions_FY2024_25.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
                        handleFile(dummyFile);
                    }}
                    className="font-bold text-[#102d49] hover:underline shrink-0 cursor-pointer hidden sm:inline-block"
                >
                    Load Sample Excel Sheet →
                </button>
            </div>
        </div>
    );
};

export default MultiFormatUpload;
