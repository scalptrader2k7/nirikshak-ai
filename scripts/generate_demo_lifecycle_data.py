"""
NIRIKSHAK AI — Demonstration Lifecycle Enrichment Dataset Generator
(Demo Data Realism Pass)

Generates realistic, naturally occurring administrative project data for exactly 12 projects.
- Irregular, non-round monetary values matching government accounting
- Irregular, non-symmetrical calendar intervals
- Non-round physical progress percentages
- Factual, boring administrative remarks without fraud editorializing
- No scenario tags in raw CSV files
- Full preservation of synthetic provenance flags:
  * data_source = 'DEMONSTRATION_LIFECYCLE_DATA'
  * is_demo_enrichment = True
  * source_classification = 'SYNTHETIC_DEMONSTRATION'
"""

import json
import os
import pandas as pd

OUTPUT_DIR = os.path.join("data", "enrichment", "demo_lifecycle")
os.makedirs(OUTPUT_DIR, exist_ok=True)

DISCLAIMER = (
    "DEMONSTRATION ONLY: Synthetic lifecycle data generated for prototype demonstration. "
    "Not part of official MoSPI public record."
)

DEMO_PROJECTS = [
    # 1. Record 26: Healthy Control 1 (Road) - Rajasthan
    {
        "record_id": 26,
        "state": "Rajasthan",
        "constituency": "KARAULI-DHOLPUR",
        "work_type": "road",
        "sanctioned_amount": 987500.0,
        "approved_estimate": 978400.0,
        "revised_estimate": 978400.0,
        "funds_released": 742500.0,
        "expenditure_amount": 639340.0,
        "physical_progress_percent": 78.0,
        "work_order_number": "EE/PWD/KD/2024-25/W-104",
        "work_order_date": "2024-04-08",
        "agency_name": "M/s Marwar Construction & Co.",
        "sanction_date": "2024-03-21",
        "expected_completion_date": "2024-10-15",
        "actual_completion_date": None,
        "completion_certificate_available": False,
        "latitude": 26.5052,
        "longitude": 77.0248,
        "location_source": "SYNTHETIC_DEMO_COORDINATES",
        "is_healthy_control": True,
        "payments": [
            {
                "payment_id": "PAY-026-01",
                "voucher_no": "VCH-2024/05/081",
                "voucher_date": "2024-05-12",
                "payee_name": "M/s Marwar Construction & Co.",
                "amount": 218400.0,
                "milestone_linked": "Earthwork & Subgrade",
                "status": "PAID",
                "notes": "Running account bill I for earthwork excavation and embankment compaction."
            },
            {
                "payment_id": "PAY-026-02",
                "voucher_no": "VCH-2024/06/142",
                "voucher_date": "2024-06-19",
                "payee_name": "M/s Marwar Construction & Co.",
                "amount": 234650.0,
                "milestone_linked": "Granular Sub-Base (GSB)",
                "status": "PAID",
                "notes": "Running account bill II for GSB grade II laying and compaction."
            },
            {
                "payment_id": "PAY-026-03",
                "voucher_no": "VCH-2024/07/209",
                "voucher_date": "2024-07-28",
                "payee_name": "M/s Marwar Construction & Co.",
                "amount": 186290.0,
                "milestone_linked": "Wet Mix Macadam (WMM)",
                "status": "PAID",
                "notes": "Running account bill III for WMM layer casting and curing."
            }
        ],
        "milestones": [
            {"milestone_id": "MS-026-1", "milestone_index": 1, "milestone_name": "Earthwork & Subgrade", "planned_date": "2024-05-05", "actual_date": "2024-05-09", "payment_percentage": 25.0, "status": "COMPLETED"},
            {"milestone_id": "MS-026-2", "milestone_index": 2, "milestone_name": "Granular Sub-Base (GSB)", "planned_date": "2024-06-15", "actual_date": "2024-06-17", "payment_percentage": 25.0, "status": "COMPLETED"},
            {"milestone_id": "MS-026-3", "milestone_index": 3, "milestone_name": "Wet Mix Macadam (WMM)", "planned_date": "2024-07-25", "actual_date": "2024-07-26", "payment_percentage": 25.0, "status": "COMPLETED"},
            {"milestone_id": "MS-026-4", "milestone_index": 4, "milestone_name": "Pavement Quality Concrete (PQC)", "planned_date": "2024-10-15", "actual_date": None, "payment_percentage": 25.0, "status": "IN_PROGRESS"}
        ],
        "assets": [
            {"asset_id": "AST-2024-RD-026", "asset_name": "Karauli Sector 4 Link Road", "asset_category": "Rural Infrastructure - Road", "registration_date": "2024-04-15", "registration_status": "REGISTERED", "handover_to": "Zilla Parishad Karauli", "latitude": 26.5052, "longitude": 77.0248}
        ],
        "inspections": [
            {"inspection_id": "INS-2024-05-021", "inspection_date": "2024-05-10", "inspector_role": "Assistant Engineer (PWD)", "physical_progress_observed": 28.0, "quality_rating": "Satisfactory", "remarks": "Subgrade level and field density verified as per MoRTH specifications."},
            {"inspection_id": "INS-2024-07-064", "inspection_date": "2024-07-24", "inspector_role": "Executive Engineer (PWD)", "physical_progress_observed": 75.0, "quality_rating": "Satisfactory", "remarks": "WMM compaction and surface regularities within permissible tolerance limits."}
        ]
    },

    # 2. Record 10: Reality Gap / Advance Billing (Electrical) - Bihar
    {
        "record_id": 10,
        "state": "Bihar",
        "constituency": "DARBHANGA",
        "work_type": "electrical",
        "sanctioned_amount": 487000.0,
        "approved_estimate": 484200.0,
        "revised_estimate": 484200.0,
        "funds_released": 438300.0,
        "expenditure_amount": 382400.0,
        "physical_progress_percent": 27.0,
        "work_order_number": "DMC/ELEC/2024/042",
        "work_order_date": "2024-04-02",
        "agency_name": "M/s Mithila Infra Projects Pvt Ltd",
        "sanction_date": "2024-03-18",
        "expected_completion_date": "2024-08-20",
        "actual_completion_date": None,
        "completion_certificate_available": False,
        "latitude": 26.1548,
        "longitude": 85.8924,
        "location_source": "SYNTHETIC_DEMO_COORDINATES",
        "is_healthy_control": False,
        "payments": [
            {
                "payment_id": "PAY-010-01",
                "voucher_no": "VCH-2024/04/052",
                "voucher_date": "2024-04-18",
                "payee_name": "M/s Mithila Infra Projects Pvt Ltd",
                "amount": 145260.0,
                "milestone_linked": "Civil Foundation & Pedestal",
                "status": "PAID",
                "notes": "Advance procurement and foundation shuttering claim."
            },
            {
                "payment_id": "PAY-010-02",
                "voucher_no": "VCH-2024/05/115",
                "voucher_date": "2024-05-22",
                "payee_name": "M/s Mithila Infra Projects Pvt Ltd",
                "amount": 138400.0,
                "milestone_linked": "Civil Foundation & Pedestal",
                "status": "PAID",
                "notes": "Material supply invoice settlement for high mast pole segments."
            },
            {
                "payment_id": "PAY-010-03",
                "voucher_no": "VCH-2024/06/088",
                "voucher_date": "2024-06-25",
                "payee_name": "M/s Mithila Infra Projects Pvt Ltd",
                "amount": 98740.0,
                "milestone_linked": "High Mast Erection",
                "status": "PAID",
                "notes": "Running bill for high mast structural assemblies and delivery."
            }
        ],
        "milestones": [
            {"milestone_id": "MS-010-1", "milestone_index": 1, "milestone_name": "Civil Foundation & Pedestal", "planned_date": "2024-04-25", "actual_date": "2024-05-04", "payment_percentage": 30.0, "status": "COMPLETED"},
            {"milestone_id": "MS-010-2", "milestone_index": 2, "milestone_name": "High Mast Erection", "planned_date": "2024-06-10", "actual_date": None, "payment_percentage": 35.0, "status": "IN_PROGRESS"},
            {"milestone_id": "MS-010-3", "milestone_index": 3, "milestone_name": "Luminaire Assembly & Cabling", "planned_date": "2024-07-20", "actual_date": None, "payment_percentage": 20.0, "status": "PENDING"},
            {"milestone_id": "MS-010-4", "milestone_index": 4, "milestone_name": "Testing & Grid Commissioning", "planned_date": "2024-08-20", "actual_date": None, "payment_percentage": 15.0, "status": "PENDING"}
        ],
        "assets": [
            {"asset_id": "AST-2024-EL-010", "asset_name": "Darbhanga High Mast Lighting System", "asset_category": "Electrical / Municipal Lighting", "registration_date": "2024-04-10", "registration_status": "PENDING_REGISTRATION", "handover_to": "Darbhanga Municipal Corporation", "latitude": 26.1548, "longitude": 85.8924}
        ],
        "inspections": [
            {"inspection_id": "INS-2024-05-042", "inspection_date": "2024-05-28", "inspector_role": "Junior Engineer (Electrical)", "physical_progress_observed": 27.0, "quality_rating": "Needs Improvement", "remarks": "Foundation pedestal concrete cast; octagonal high mast pole segments not yet delivered to site."}
        ]
    },

    # 3. Record 75: Critical Delay (Electrical) - Telangana
    {
        "record_id": 75,
        "state": "Telangana",
        "constituency": "CHELVELLA",
        "work_type": "electrical",
        "sanctioned_amount": 170000.0,
        "approved_estimate": 168500.0,
        "revised_estimate": 168500.0,
        "funds_released": 170000.0,
        "expenditure_amount": 121150.0,
        "physical_progress_percent": 52.0,
        "work_order_number": "TSSPDCL/RR/WO-75/2023",
        "work_order_date": "2023-09-02",
        "agency_name": "M/s Deccan Electricals & Engineers",
        "sanction_date": "2023-08-14",
        "expected_completion_date": "2023-12-28",
        "actual_completion_date": None,
        "completion_certificate_available": False,
        "latitude": 17.3065,
        "longitude": 78.1364,
        "location_source": "SYNTHETIC_DEMO_COORDINATES",
        "is_healthy_control": False,
        "payments": [
            {
                "payment_id": "PAY-075-01",
                "voucher_no": "VCH-2023/10/019",
                "voucher_date": "2023-10-12",
                "payee_name": "M/s Deccan Electricals & Engineers",
                "amount": 62400.0,
                "milestone_linked": "Civil Plinth & Fencing",
                "status": "PAID",
                "notes": "Civil plinth construction and barbed fencing."
            },
            {
                "payment_id": "PAY-075-02",
                "voucher_no": "VCH-2023/11/094",
                "voucher_date": "2023-11-28",
                "payee_name": "M/s Deccan Electricals & Engineers",
                "amount": 58750.0,
                "milestone_linked": "Distribution Transformer Delivery",
                "status": "PAID",
                "notes": "Supply and placement of 25 kVA distribution transformer."
            }
        ],
        "milestones": [
            {"milestone_id": "MS-075-1", "milestone_index": 1, "milestone_name": "Civil Plinth & Fencing", "planned_date": "2023-10-05", "actual_date": "2023-10-10", "payment_percentage": 35.0, "status": "COMPLETED"},
            {"milestone_id": "MS-075-2", "milestone_index": 2, "milestone_name": "Distribution Transformer Delivery", "planned_date": "2023-11-15", "actual_date": "2023-11-25", "payment_percentage": 35.0, "status": "COMPLETED"},
            {"milestone_id": "MS-075-3", "milestone_index": 3, "milestone_name": "HT/LT Cabling & Metering", "planned_date": "2023-12-10", "actual_date": None, "payment_percentage": 20.0, "status": "IN_PROGRESS"},
            {"milestone_id": "MS-075-4", "milestone_index": 4, "milestone_name": "Final Charging & Inspection", "planned_date": "2023-12-28", "actual_date": None, "payment_percentage": 10.0, "status": "PENDING"}
        ],
        "assets": [
            {"asset_id": "AST-2023-EL-075", "asset_name": "Chevella Village 25kVA Substation Unit", "asset_category": "Electrical / Substation", "registration_date": "2023-09-15", "registration_status": "PENDING_REGISTRATION", "handover_to": "TSSPDCL Operation Division", "latitude": 17.3065, "longitude": 78.1364}
        ],
        "inspections": [
            {"inspection_id": "INS-2024-01-018", "inspection_date": "2024-01-22", "inspector_role": "Divisional Engineer (Operations)", "physical_progress_observed": 52.0, "quality_rating": "Fair", "remarks": "Installation stalled pending right-of-way permission for LT underground cabling along village approach road."}
        ]
    },

    # 4. Record 208: Cost Overrun (+34.97%) (Building) - Maharashtra
    {
        "record_id": 208,
        "state": "Maharashtra",
        "constituency": "DINDORI",
        "work_type": "building",
        "sanctioned_amount": 1494000.0,
        "approved_estimate": 1468750.0,
        "revised_estimate": 1982400.0,
        "funds_released": 1494000.0,
        "expenditure_amount": 1462340.0,
        "physical_progress_percent": 71.0,
        "work_order_number": "ZP/NASHIK/BLD/2023/182",
        "work_order_date": "2023-10-08",
        "agency_name": "M/s Sahyadri Civil Works LLP",
        "sanction_date": "2023-09-15",
        "expected_completion_date": "2024-07-15",
        "actual_completion_date": None,
        "completion_certificate_available": False,
        "latitude": 20.2036,
        "longitude": 73.8345,
        "location_source": "SYNTHETIC_DEMO_COORDINATES",
        "is_healthy_control": False,
        "payments": [
            {
                "payment_id": "PAY-208-01",
                "voucher_no": "VCH-2023/11/044",
                "voucher_date": "2023-11-20",
                "payee_name": "M/s Sahyadri Civil Works LLP",
                "amount": 482500.0,
                "milestone_linked": "Substructure & Raft Foundation",
                "status": "PAID",
                "notes": "RA Bill I - Foundation excavation, RCC raft and plinth beam casting."
            },
            {
                "payment_id": "PAY-208-02",
                "voucher_no": "VCH-2024/02/089",
                "voucher_date": "2024-02-16",
                "payee_name": "M/s Sahyadri Civil Works LLP",
                "amount": 491200.0,
                "milestone_linked": "Superstructure RCC Frame",
                "status": "PAID",
                "notes": "RA Bill II - RCC columns, tie beams and first floor roof slab."
            },
            {
                "payment_id": "PAY-208-03",
                "voucher_no": "VCH-2024/05/161",
                "voucher_date": "2024-05-28",
                "payee_name": "M/s Sahyadri Civil Works LLP",
                "amount": 488640.0,
                "milestone_linked": "Masonry & Plastering",
                "status": "PAID",
                "notes": "RA Bill III - AAC block masonry and internal cement plastering."
            }
        ],
        "milestones": [
            {"milestone_id": "MS-208-1", "milestone_index": 1, "milestone_name": "Substructure & Raft Foundation", "planned_date": "2023-11-15", "actual_date": "2023-11-18", "payment_percentage": 30.0, "status": "COMPLETED"},
            {"milestone_id": "MS-208-2", "milestone_index": 2, "milestone_name": "Superstructure RCC Frame", "planned_date": "2024-02-10", "actual_date": "2024-02-14", "payment_percentage": 30.0, "status": "COMPLETED"},
            {"milestone_id": "MS-208-3", "milestone_index": 3, "milestone_name": "Masonry & Plastering", "planned_date": "2024-05-20", "actual_date": "2024-05-25", "payment_percentage": 25.0, "status": "COMPLETED"},
            {"milestone_id": "MS-208-4", "milestone_index": 4, "milestone_name": "Flooring, Joinery & Electrification", "planned_date": "2024-07-15", "actual_date": None, "payment_percentage": 15.0, "status": "IN_PROGRESS"}
        ],
        "assets": [
            {"asset_id": "AST-2023-BL-208", "asset_name": "Dindori Community Hall", "asset_category": "Community Infrastructure", "registration_date": "2023-10-20", "registration_status": "REGISTERED", "handover_to": "Gram Panchayat Dindori", "latitude": 20.2036, "longitude": 73.8345}
        ],
        "inspections": [
            {"inspection_id": "INS-2024-03-015", "inspection_date": "2024-03-12", "inspector_role": "Executive Engineer (Public Works)", "physical_progress_observed": 62.0, "quality_rating": "Satisfactory", "remarks": "Foundation depth increased due to expansive clay subsoil stratum; revised TS estimate submitted for administrative sanction."}
        ]
    },

    # 5. Record 230: Duplicate Payment Signal (Building) - Karnataka
    {
        "record_id": 230,
        "state": "Karnataka",
        "constituency": "HAVERI",
        "work_type": "building",
        "sanctioned_amount": 300000.0,
        "approved_estimate": 295000.0,
        "revised_estimate": 295000.0,
        "funds_released": 250000.0,
        "expenditure_amount": 172900.0,
        "physical_progress_percent": 61.0,
        "work_order_number": "ED/HVR/2024/073",
        "work_order_date": "2024-03-28",
        "agency_name": "M/s Kaveri Builders & Engineering",
        "sanction_date": "2024-03-16",
        "expected_completion_date": "2024-09-10",
        "actual_completion_date": None,
        "completion_certificate_available": False,
        "latitude": 14.7954,
        "longitude": 75.3986,
        "location_source": "SYNTHETIC_DEMO_COORDINATES",
        "is_healthy_control": False,
        "payments": [
            {
                "payment_id": "PAY-230-01",
                "voucher_no": "VCH-2024/05/092",
                "voucher_date": "2024-05-11",
                "payee_name": "M/s Kaveri Builders & Engineering",
                "amount": 86450.0,
                "milestone_linked": "Brickwork & Internal Plaster",
                "status": "PAID",
                "notes": "Running account bill II for classroom masonry works against invoice INV-2024-041."
            },
            {
                "payment_id": "PAY-230-02",
                "voucher_no": "VCH-2024/05/098",
                "voucher_date": "2024-05-13",
                "payee_name": "M/s Kaveri Builders & Engineering",
                "amount": 86450.0,
                "milestone_linked": "Brickwork & Internal Plaster",
                "status": "PAID",
                "notes": "Settlement of bill II classroom masonry works against invoice INV-2024-041."
            }
        ],
        "milestones": [
            {"milestone_id": "MS-230-1", "milestone_index": 1, "milestone_name": "Plinth & Foundation", "planned_date": "2024-04-12", "actual_date": "2024-04-16", "payment_percentage": 35.0, "status": "COMPLETED"},
            {"milestone_id": "MS-230-2", "milestone_index": 2, "milestone_name": "Brickwork & Internal Plaster", "planned_date": "2024-05-20", "actual_date": "2024-05-24", "payment_percentage": 35.0, "status": "COMPLETED"},
            {"milestone_id": "MS-230-3", "milestone_index": 3, "milestone_name": "Roof Truss, Sheet Laying & Flooring", "planned_date": "2024-09-10", "actual_date": None, "payment_percentage": 30.0, "status": "IN_PROGRESS"}
        ],
        "assets": [
            {"asset_id": "AST-2024-BL-230", "asset_name": "Haveri Govt Higher Primary School Additional Classroom", "asset_category": "Educational Facility", "registration_date": "2024-04-05", "registration_status": "REGISTERED", "handover_to": "Dept of School Education Haveri", "latitude": 14.7954, "longitude": 75.3986}
        ],
        "inspections": [
            {"inspection_id": "INS-2024-04-032", "inspection_date": "2024-04-20", "inspector_role": "Assistant Executive Engineer", "physical_progress_observed": 38.0, "quality_rating": "Satisfactory", "remarks": "Plinth beam concrete cured properly; superstructure brickwork initiated."}
        ]
    },

    # 6. Record 170: Premature Disbursement Before Milestone (Building) - Tamil Nadu
    {
        "record_id": 170,
        "state": "Tamil Nadu",
        "constituency": "RAMANATHAPURAM",
        "work_type": "building",
        "sanctioned_amount": 500000.0,
        "approved_estimate": 492000.0,
        "revised_estimate": 492000.0,
        "funds_released": 395000.0,
        "expenditure_amount": 274700.0,
        "physical_progress_percent": 33.0,
        "work_order_number": "DRDA/RMD/2024/CW-170",
        "work_order_date": "2024-04-04",
        "agency_name": "M/s Chola Infra Developers",
        "sanction_date": "2024-03-19",
        "expected_completion_date": "2024-09-15",
        "actual_completion_date": None,
        "completion_certificate_available": False,
        "latitude": 9.3644,
        "longitude": 78.8398,
        "location_source": "SYNTHETIC_DEMO_COORDINATES",
        "is_healthy_control": False,
        "payments": [
            {
                "payment_id": "PAY-170-01",
                "voucher_no": "VCH-2024/04/061",
                "voucher_date": "2024-04-24",
                "payee_name": "M/s Chola Infra Developers",
                "amount": 118500.0,
                "milestone_linked": "Substructure & Basement",
                "status": "PAID",
                "notes": "RA Bill I - Substructure excavation and granite masonry basement."
            },
            {
                "payment_id": "PAY-170-02",
                "voucher_no": "VCH-2024/05/119",
                "voucher_date": "2024-05-14",
                "payee_name": "M/s Chola Infra Developers",
                "amount": 156200.0,
                "milestone_linked": "RCC Roof Slab Casting",
                "status": "PAID",
                "notes": "Part payment against roof centering, shuttering and steel binding."
            }
        ],
        "milestones": [
            {"milestone_id": "MS-170-1", "milestone_index": 1, "milestone_name": "Substructure & Basement", "planned_date": "2024-04-18", "actual_date": "2024-04-20", "payment_percentage": 30.0, "status": "COMPLETED"},
            {"milestone_id": "MS-170-2", "milestone_index": 2, "milestone_name": "RCC Roof Slab Casting", "planned_date": "2024-06-25", "actual_date": None, "payment_percentage": 35.0, "status": "IN_PROGRESS"},
            {"milestone_id": "MS-170-3", "milestone_index": 3, "milestone_name": "Brickwork, Plastering & Joinery", "planned_date": "2024-08-10", "actual_date": None, "payment_percentage": 20.0, "status": "PENDING"},
            {"milestone_id": "MS-170-4", "milestone_index": 4, "milestone_name": "Flooring, Painting & Handover", "planned_date": "2024-09-15", "actual_date": None, "payment_percentage": 15.0, "status": "PENDING"}
        ],
        "assets": [
            {"asset_id": "AST-2024-BL-170", "asset_name": "Ramanathapuram Anganwadi Centre", "asset_category": "Child Development Center", "registration_date": "2024-04-12", "registration_status": "PENDING_REGISTRATION", "handover_to": "ICDS Project Officer Ramanathapuram", "latitude": 9.3644, "longitude": 78.8398}
        ],
        "inspections": [
            {"inspection_id": "INS-2024-05-029", "inspection_date": "2024-05-20", "inspector_role": "Assistant Engineer (RD&PR)", "physical_progress_observed": 33.0, "quality_rating": "Needs Improvement", "remarks": "Shuttering and reinforcement binding in progress; concrete pouring scheduled for next week."}
        ]
    },

    # 7. Record 350: Rapid Turnkey Electrification (Electrical) - Odisha
    {
        "record_id": 350,
        "state": "Odisha",
        "constituency": "MAYURBHANJ",
        "work_type": "electrical",
        "sanctioned_amount": 48900.0,
        "approved_estimate": 48900.0,
        "revised_estimate": 48900.0,
        "funds_released": 48900.0,
        "expenditure_amount": 48150.0,
        "physical_progress_percent": 100.0,
        "work_order_number": "MBJ/MUNI/EL/2024/09",
        "work_order_date": "2024-03-24",
        "agency_name": "M/s Apex Infrastructure Services",
        "sanction_date": "2024-03-14",
        "expected_completion_date": "2024-05-05",
        "actual_completion_date": "2024-04-28",
        "completion_certificate_available": True,
        "latitude": 21.9324,
        "longitude": 86.7265,
        "location_source": "SYNTHETIC_DEMO_COORDINATES",
        "is_healthy_control": False,
        "payments": [
            {
                "payment_id": "PAY-350-01",
                "voucher_no": "VCH-2024/05/008",
                "voucher_date": "2024-05-06",
                "payee_name": "M/s Apex Infrastructure Services",
                "amount": 48150.0,
                "milestone_linked": "Supply and Fitting of LED Streetlights",
                "status": "PAID",
                "notes": "Final settlement for supply, erection and trial run of 15 LED fixtures."
            }
        ],
        "milestones": [
            {"milestone_id": "MS-350-1", "milestone_index": 1, "milestone_name": "Supply and Fitting of LED Streetlights", "planned_date": "2024-05-05", "actual_date": "2024-04-28", "payment_percentage": 100.0, "status": "COMPLETED"}
        ],
        "assets": [
            {"asset_id": "AST-2024-EL-350", "asset_name": "Baripada Ward 8 LED Lighting Cluster", "asset_category": "Electrical / Municipal Lighting", "registration_date": "2024-05-02", "registration_status": "REGISTERED", "handover_to": "Baripada Municipality", "latitude": 21.9324, "longitude": 86.7265}
        ],
        "inspections": [
            {"inspection_id": "INS-2024-04-038", "inspection_date": "2024-04-30", "inspector_role": "Municipal Engineer (Baripada)", "physical_progress_observed": 100.0, "quality_rating": "Satisfactory", "remarks": "15 LED luminaires verified energized; timer switch operational."}
        ]
    },

    # 8. Record 205: Healthy Control 2 (Completed on Time) (Electrical) - J&K
    {
        "record_id": 205,
        "state": "Jammu And Kashmir",
        "constituency": "BARAMULLAH",
        "work_type": "electrical",
        "sanctioned_amount": 98400.0,
        "approved_estimate": 98400.0,
        "revised_estimate": 98400.0,
        "funds_released": 98400.0,
        "expenditure_amount": 96850.0,
        "physical_progress_percent": 100.0,
        "work_order_number": "DC/BML/MPLADS/2023/312",
        "work_order_date": "2023-11-28",
        "agency_name": "M/s Chinar Energy Systems",
        "sanction_date": "2023-11-10",
        "expected_completion_date": "2024-02-28",
        "actual_completion_date": "2024-02-22",
        "completion_certificate_available": True,
        "latitude": 34.2094,
        "longitude": 74.3435,
        "location_source": "SYNTHETIC_DEMO_COORDINATES",
        "is_healthy_control": True,
        "payments": [
            {
                "payment_id": "PAY-205-01",
                "voucher_no": "VCH-2023/12/045",
                "voucher_date": "2023-12-18",
                "payee_name": "M/s Chinar Energy Systems",
                "amount": 49200.0,
                "milestone_linked": "Solar Module Delivery & Mounting",
                "status": "PAID",
                "notes": "Delivery and pole structure erection of solar lighting kits."
            },
            {
                "payment_id": "PAY-205-02",
                "voucher_no": "VCH-2024/03/012",
                "voucher_date": "2024-03-04",
                "payee_name": "M/s Chinar Energy Systems",
                "amount": 47650.0,
                "milestone_linked": "Battery Bank, Inverter & Commissioning",
                "status": "PAID",
                "notes": "Final bill after successful 72-hour burn-in trial."
            }
        ],
        "milestones": [
            {"milestone_id": "MS-205-1", "milestone_index": 1, "milestone_name": "Solar Module Delivery & Mounting", "planned_date": "2023-12-25", "actual_date": "2023-12-16", "payment_percentage": 50.0, "status": "COMPLETED"},
            {"milestone_id": "MS-205-2", "milestone_index": 2, "milestone_name": "Battery Bank, Inverter & Commissioning", "planned_date": "2024-02-28", "actual_date": "2024-02-22", "payment_percentage": 50.0, "status": "COMPLETED"}
        ],
        "assets": [
            {"asset_id": "AST-2023-EL-205", "asset_name": "Baramullah Solar Lighting Unit", "asset_category": "Renewable Energy / Solar", "registration_date": "2024-03-01", "registration_status": "REGISTERED", "handover_to": "Gram Panchayat Baramullah", "latitude": 34.2094, "longitude": 74.3435}
        ],
        "inspections": [
            {"inspection_id": "INS-2024-02-026", "inspection_date": "2024-02-25", "inspector_role": "Assistant Director (Planning)", "physical_progress_observed": 100.0, "quality_rating": "Good", "remarks": "All 8 standalone solar street units operational; battery charging cycle checked and verified."}
        ]
    },

    # 9. Record 450: Missing Site Inspection (Water) - UP
    {
        "record_id": 450,
        "state": "Uttar Pradesh",
        "constituency": "SITTING RAJYA SABHA",
        "work_type": "water",
        "sanctioned_amount": 63275.0,
        "approved_estimate": 62400.0,
        "revised_estimate": 62400.0,
        "funds_released": 54000.0,
        "expenditure_amount": 44650.0,
        "physical_progress_percent": 73.0,
        "work_order_number": "JN/LKO/RUR/2024/08",
        "work_order_date": "2024-03-22",
        "agency_name": "M/s Ganga Borewells & Water Tech",
        "sanction_date": "2024-03-12",
        "expected_completion_date": "2024-07-10",
        "actual_completion_date": None,
        "completion_certificate_available": False,
        "latitude": 26.8471,
        "longitude": 80.9467,
        "location_source": "SYNTHETIC_DEMO_COORDINATES",
        "is_healthy_control": False,
        "payments": [
            {
                "payment_id": "PAY-450-01",
                "voucher_no": "VCH-2024/04/088",
                "voucher_date": "2024-04-26",
                "payee_name": "M/s Ganga Borewells & Water Tech",
                "amount": 24800.0,
                "milestone_linked": "Drilling & Lowering of Casing Pipe",
                "status": "PAID",
                "notes": "RA Bill I - Rig boring up to 65m depth and PVC casing assembly."
            },
            {
                "payment_id": "PAY-450-02",
                "voucher_no": "VCH-2024/05/149",
                "voucher_date": "2024-05-30",
                "payee_name": "M/s Ganga Borewells & Water Tech",
                "amount": 19850.0,
                "milestone_linked": "Submersible Pump & Delivery Pipeline",
                "status": "PAID",
                "notes": "RA Bill II - Lowering 1.5HP submersible pump and riser pipe."
            }
        ],
        "milestones": [
            {"milestone_id": "MS-450-1", "milestone_index": 1, "milestone_name": "Drilling & Lowering of Casing Pipe", "planned_date": "2024-04-20", "actual_date": "2024-04-24", "payment_percentage": 40.0, "status": "COMPLETED"},
            {"milestone_id": "MS-450-2", "milestone_index": 2, "milestone_name": "Submersible Pump & Delivery Pipeline", "planned_date": "2024-05-25", "actual_date": "2024-05-28", "payment_percentage": 35.0, "status": "COMPLETED"},
            {"milestone_id": "MS-450-3", "milestone_index": 3, "milestone_name": "Overhead Tank Connection & Water Potability Test", "planned_date": "2024-07-10", "actual_date": None, "payment_percentage": 25.0, "status": "IN_PROGRESS"}
        ],
        "assets": [
            {"asset_id": "AST-2024-WT-450", "asset_name": "Lucknow Rural Tubewell Point 4", "asset_category": "Water Supply / Tubewell", "registration_date": "2024-03-30", "registration_status": "PENDING_REGISTRATION", "handover_to": "UP Jal Nigam (Rural)", "latitude": 26.8471, "longitude": 80.9467}
        ],
        # Factual absence: zero site inspections logged in database
        "inspections": []
    },

    # 10. Record 512: Healthy Control 3 (High Utilization Normal) (Water) - UP
    {
        "record_id": 512,
        "state": "Uttar Pradesh",
        "constituency": "SITTING RAJYA SABHA",
        "work_type": "water",
        "sanctioned_amount": 63275.0,
        "approved_estimate": 63275.0,
        "revised_estimate": 63275.0,
        "funds_released": 63275.0,
        "expenditure_amount": 58650.0,
        "physical_progress_percent": 92.0,
        "work_order_number": "JN/LKO/HP/2024/022",
        "work_order_date": "2024-03-18",
        "agency_name": "M/s Awadh Jal Engineering Works",
        "sanction_date": "2024-03-08",
        "expected_completion_date": "2024-06-25",
        "actual_completion_date": None,
        "completion_certificate_available": False,
        "latitude": 26.8524,
        "longitude": 80.9525,
        "location_source": "SYNTHETIC_DEMO_COORDINATES",
        "is_healthy_control": True,
        "payments": [
            {
                "payment_id": "PAY-512-01",
                "voucher_no": "VCH-2024/04/031",
                "voucher_date": "2024-04-06",
                "payee_name": "M/s Awadh Jal Engineering Works",
                "amount": 31200.0,
                "milestone_linked": "Boring & Hand Pump Cylinder Lowering",
                "status": "PAID",
                "notes": "Boring to required water table depth and cylinder lowering."
            },
            {
                "payment_id": "PAY-512-02",
                "voucher_no": "VCH-2024/05/074",
                "voucher_date": "2024-05-18",
                "payee_name": "M/s Awadh Jal Engineering Works",
                "amount": 27450.0,
                "milestone_linked": "Civil Platform & Soak Pit Construction",
                "status": "PAID",
                "notes": "Puccka apron platform casting and soakage pit masonry."
            }
        ],
        "milestones": [
            {"milestone_id": "MS-512-1", "milestone_index": 1, "milestone_name": "Boring & Hand Pump Cylinder Lowering", "planned_date": "2024-04-02", "actual_date": "2024-04-04", "payment_percentage": 50.0, "status": "COMPLETED"},
            {"milestone_id": "MS-512-2", "milestone_index": 2, "milestone_name": "Civil Platform & Soak Pit Construction", "planned_date": "2024-05-15", "actual_date": "2024-05-16", "payment_percentage": 40.0, "status": "COMPLETED"},
            {"milestone_id": "MS-512-3", "milestone_index": 3, "milestone_name": "Water Sample Testing & Handover", "planned_date": "2024-06-25", "actual_date": None, "payment_percentage": 10.0, "status": "IN_PROGRESS"}
        ],
        "assets": [
            {"asset_id": "AST-2024-WT-512", "asset_name": "India Mark II Hand Pump Unit 3", "asset_category": "Water Supply / Hand Pump", "registration_date": "2024-03-25", "registration_status": "REGISTERED", "handover_to": "Jal Sansthan Lucknow", "latitude": 26.8524, "longitude": 80.9525}
        ],
        "inspections": [
            {"inspection_id": "INS-2024-04-012", "inspection_date": "2024-04-10", "inspector_role": "Junior Engineer (Jal Sansthan)", "physical_progress_observed": 50.0, "quality_rating": "Good", "remarks": "Drilling completed; static water level verified at 38m depth."},
            {"inspection_id": "INS-2024-05-025", "inspection_date": "2024-05-22", "inspector_role": "Assistant Engineer (Jal Sansthan)", "physical_progress_observed": 92.0, "quality_rating": "Good", "remarks": "Platform concrete curing satisfactory; discharge rate 18 liters/minute verified."}
        ]
    },

    # 11. Record 117: Stalled Project / Under-utilization (Road) - Karnataka
    {
        "record_id": 117,
        "state": "Karnataka",
        "constituency": "SITTING RAJYA SABHA",
        "work_type": "road",
        "sanctioned_amount": 500000.0,
        "approved_estimate": 494500.0,
        "revised_estimate": 494500.0,
        "funds_released": 195000.0,
        "expenditure_amount": 0.0,
        "physical_progress_percent": 0.0,
        "work_order_number": "PWD/BLR/RD-117/2024",
        "work_order_date": "2024-04-05",
        "agency_name": "M/s Bengaluru Rural Roadworks",
        "sanction_date": "2024-03-18",
        "expected_completion_date": "2024-10-20",
        "actual_completion_date": None,
        "completion_certificate_available": False,
        "latitude": 12.97164,
        "longitude": 77.59462,
        "location_source": "SYNTHETIC_DEMO_COORDINATES",
        "is_healthy_control": False,
        "payments": [],
        "milestones": [
            {"milestone_id": "MS-117-1", "milestone_index": 1, "milestone_name": "Site Clearing & Alignment Survey", "planned_date": "2024-05-15", "actual_date": None, "payment_percentage": 20.0, "status": "PENDING"},
            {"milestone_id": "MS-117-2", "milestone_index": 2, "milestone_name": "Sub-base & Grading", "planned_date": "2024-07-20", "actual_date": None, "payment_percentage": 40.0, "status": "PENDING"},
            {"milestone_id": "MS-117-3", "milestone_index": 3, "milestone_name": "Asphalt Surface Course", "planned_date": "2024-10-20", "actual_date": None, "payment_percentage": 40.0, "status": "PENDING"}
        ],
        "assets": [
            {"asset_id": "AST-2024-RD-117", "asset_name": "Bengaluru North Rural Link Road", "asset_category": "Road Infrastructure", "registration_date": "2024-04-10", "registration_status": "NOT_REGISTERED", "handover_to": "PWD Karnataka (Rural Roads)", "latitude": 12.97164, "longitude": 77.59462}
        ],
        "inspections": [
            {"inspection_id": "INS-2024-05-036", "inspection_date": "2024-05-24", "inspector_role": "Assistant Engineer (PWD)", "physical_progress_observed": 0.0, "quality_rating": "Unsatisfactory", "remarks": "Site inspection reveals zero progress; contractor has not mobilized equipment or road rollers."}
        ]
    },

    # 12. Record 120: GIS Proximity Neighbor to 117 (~91.5m away) (Road) - Karnataka
    {
        "record_id": 120,
        "state": "Karnataka",
        "constituency": "SITTING RAJYA SABHA",
        "work_type": "road",
        "sanctioned_amount": 500000.0,
        "approved_estimate": 494500.0,
        "revised_estimate": 494500.0,
        "funds_released": 285000.0,
        "expenditure_amount": 138750.0,
        "physical_progress_percent": 36.0,
        "work_order_number": "PWD/BLR/RD-120/2024",
        "work_order_date": "2024-04-05",
        "agency_name": "M/s Bengaluru Rural Roadworks",
        "sanction_date": "2024-03-18",
        "expected_completion_date": "2024-10-20",
        "actual_completion_date": None,
        "completion_certificate_available": False,
        "latitude": 12.97228,
        "longitude": 77.59515,
        "location_source": "SYNTHETIC_DEMO_COORDINATES",
        "is_healthy_control": False,
        "payments": [
            {
                "payment_id": "PAY-120-01",
                "voucher_no": "VCH-2024/05/048",
                "voucher_date": "2024-05-16",
                "payee_name": "M/s Bengaluru Rural Roadworks",
                "amount": 138750.0,
                "milestone_linked": "Subgrade Preparation & Edge Kerb",
                "status": "PAID",
                "notes": "RA Bill I - Subgrade leveling and CC edge kerb laying."
            }
        ],
        "milestones": [
            {"milestone_id": "MS-120-1", "milestone_index": 1, "milestone_name": "Subgrade Preparation & Edge Kerb", "planned_date": "2024-05-10", "actual_date": "2024-05-14", "payment_percentage": 30.0, "status": "COMPLETED"},
            {"milestone_id": "MS-120-2", "milestone_index": 2, "milestone_name": "Interlocking Paver Block Laying", "planned_date": "2024-08-15", "actual_date": None, "payment_percentage": 45.0, "status": "IN_PROGRESS"},
            {"milestone_id": "MS-120-3", "milestone_index": 3, "milestone_name": "Joint Sand Filling & Finishing", "planned_date": "2024-10-20", "actual_date": None, "payment_percentage": 25.0, "status": "PENDING"}
        ],
        "assets": [
            {"asset_id": "AST-2024-RD-120", "asset_name": "Bengaluru North Paver Road Package 2", "asset_category": "Road Infrastructure", "registration_date": "2024-04-10", "registration_status": "PENDING_REGISTRATION", "handover_to": "PWD Karnataka (Rural Roads)", "latitude": 12.97228, "longitude": 77.59515}
        ],
        "inspections": [
            {"inspection_id": "INS-2024-05-032", "inspection_date": "2024-05-20", "inspector_role": "Assistant Engineer (PWD)", "physical_progress_observed": 36.0, "quality_rating": "Fair", "remarks": "Subgrade compaction tested; paver delivery awaited from yard."}
        ]
    }
]

def main():
    print("Generating NIRIKSHAK AI Realistic Demonstration Lifecycle Enrichment dataset...")

    lifecycle_rows = []
    payments_rows = []
    milestones_rows = []
    assets_rows = []
    inspections_rows = []

    for proj in DEMO_PROJECTS:
        rec_id = proj["record_id"]

        # Base lifecycle row (RAW administrative data: NO scenario tags!)
        row = {
            "record_id": rec_id,
            "state": proj["state"],
            "constituency": proj["constituency"],
            "work_type": proj["work_type"],
            "sanctioned_amount": proj["sanctioned_amount"],
            "approved_estimate": proj["approved_estimate"],
            "revised_estimate": proj["revised_estimate"],
            "funds_released": proj["funds_released"],
            "expenditure_amount": proj["expenditure_amount"],
            "physical_progress_percent": proj["physical_progress_percent"],
            "work_order_number": proj["work_order_number"],
            "work_order_date": proj["work_order_date"],
            "agency_name": proj["agency_name"],
            "sanction_date": proj["sanction_date"],
            "expected_completion_date": proj["expected_completion_date"],
            "actual_completion_date": proj["actual_completion_date"],
            "completion_certificate_available": proj["completion_certificate_available"],
            "latitude": proj["latitude"],
            "longitude": proj["longitude"],
            "location_source": proj["location_source"],
            "is_healthy_control": proj["is_healthy_control"],
            "is_demo_enrichment": True,
            "data_source": "DEMONSTRATION_LIFECYCLE_DATA",
            "source_classification": "SYNTHETIC_DEMONSTRATION",
            "disclaimer": DISCLAIMER
        }
        lifecycle_rows.append(row)

        # Update proj dict with provenance tags as well
        proj["is_demo_enrichment"] = True
        proj["data_source"] = "DEMONSTRATION_LIFECYCLE_DATA"
        proj["source_classification"] = "SYNTHETIC_DEMONSTRATION"
        proj["disclaimer"] = DISCLAIMER

        for p in proj["payments"]:
            p_copy = dict(p)
            p_copy["record_id"] = rec_id
            p_copy["is_demo_enrichment"] = True
            p_copy["data_source"] = "DEMONSTRATION_LIFECYCLE_DATA"
            p_copy["source_classification"] = "SYNTHETIC_DEMONSTRATION"
            payments_rows.append(p_copy)

        for m in proj["milestones"]:
            m_copy = dict(m)
            m_copy["record_id"] = rec_id
            m_copy["is_demo_enrichment"] = True
            m_copy["data_source"] = "DEMONSTRATION_LIFECYCLE_DATA"
            m_copy["source_classification"] = "SYNTHETIC_DEMONSTRATION"
            milestones_rows.append(m_copy)

        for a in proj["assets"]:
            a_copy = dict(a)
            a_copy["record_id"] = rec_id
            a_copy["is_demo_enrichment"] = True
            a_copy["data_source"] = "DEMONSTRATION_LIFECYCLE_DATA"
            a_copy["source_classification"] = "SYNTHETIC_DEMONSTRATION"
            assets_rows.append(a_copy)

        for ins in proj["inspections"]:
            ins_copy = dict(ins)
            ins_copy["record_id"] = rec_id
            ins_copy["is_demo_enrichment"] = True
            ins_copy["data_source"] = "DEMONSTRATION_LIFECYCLE_DATA"
            ins_copy["source_classification"] = "SYNTHETIC_DEMONSTRATION"
            inspections_rows.append(ins_copy)

    # 1. demo_project_lifecycle.csv
    df_lifecycle = pd.DataFrame(lifecycle_rows)
    df_lifecycle.to_csv(os.path.join(OUTPUT_DIR, "demo_project_lifecycle.csv"), index=False)
    print(f"Saved {len(df_lifecycle)} rows to demo_project_lifecycle.csv")

    # 2. demo_payments.csv
    df_payments = pd.DataFrame(payments_rows)
    df_payments.to_csv(os.path.join(OUTPUT_DIR, "demo_payments.csv"), index=False)
    print(f"Saved {len(df_payments)} rows to demo_payments.csv")

    # 3. demo_milestones.csv
    df_milestones = pd.DataFrame(milestones_rows)
    df_milestones.to_csv(os.path.join(OUTPUT_DIR, "demo_milestones.csv"), index=False)
    print(f"Saved {len(df_milestones)} rows to demo_milestones.csv")

    # 4. demo_assets.csv
    df_assets = pd.DataFrame(assets_rows)
    df_assets.to_csv(os.path.join(OUTPUT_DIR, "demo_assets.csv"), index=False)
    print(f"Saved {len(df_assets)} rows to demo_assets.csv")

    # 5. demo_inspections.csv
    df_inspections = pd.DataFrame(inspections_rows)
    df_inspections.to_csv(os.path.join(OUTPUT_DIR, "demo_inspections.csv"), index=False)
    print(f"Saved {len(df_inspections)} rows to demo_inspections.csv")

    # 6. demo_project_lifecycle.json
    with open(os.path.join(OUTPUT_DIR, "demo_project_lifecycle.json"), "w", encoding="utf-8") as f:
        json.dump({
            "metadata": {
                "count": len(DEMO_PROJECTS),
                "healthy_controls_count": sum(1 for p in DEMO_PROJECTS if p["is_healthy_control"]),
                "data_source": "DEMONSTRATION_LIFECYCLE_DATA",
                "source_classification": "SYNTHETIC_DEMONSTRATION",
                "disclaimer": DISCLAIMER
            },
            "records": DEMO_PROJECTS
        }, f, indent=2)
    print("Saved consolidated JSON to demo_project_lifecycle.json")

if __name__ == "__main__":
    main()
