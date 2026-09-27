from typing import Dict, Any, List

def run_demo_compliance_screening(
    project_raw: Dict[str, Any],
    financials: Dict[str, Any],
    progress: Dict[str, Any],
    payment_analysis: Dict[str, Any],
    assets: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Executes a multi-stage compliance checklist screening across project lifecycle gates.
    """
    checklist: List[Dict[str, Any]] = []

    # 1. Administrative Sanction Gate
    sanctioned = financials.get("sanctioned_amount", 0.0)
    has_sanction = bool(project_raw.get("sanction_date")) and sanctioned > 0
    checklist.append({
        "stage": "ADMINISTRATIVE_SANCTION",
        "status": "PASS" if has_sanction else "MISSING",
        "details": f"Sanction verified on {project_raw.get('sanction_date')} for Rs. {sanctioned:,.2f}" if has_sanction else "Missing sanction order"
    })

    # 2. Technical Estimate & Sanction Gate
    approved_est = financials.get("approved_estimate", 0.0)
    cost_overrun_status = financials.get("cost_overrun_status")
    if cost_overrun_status == "OVERRUN":
        est_status = "WARNING"
        est_details = f"Approved estimate exceeded: {financials.get('cost_overrun_percent')}% cost overrun detected."
    elif approved_est > 0:
        est_status = "PASS"
        est_details = f"Approved technical estimate verified: Rs. {approved_est:,.2f}"
    else:
        est_status = "MISSING"
        est_details = "Approved technical estimate not documented."
    checklist.append({
        "stage": "TECHNICAL_SANCTION_ESTIMATE",
        "status": est_status,
        "details": est_details
    })

    # 3. Work Order & Agency Contracting Gate
    wo_num = project_raw.get("work_order_number")
    agency = project_raw.get("agency_name")
    has_wo = bool(wo_num and agency)
    checklist.append({
        "stage": "WORK_ORDER_CONTRACTING",
        "status": "PASS" if has_wo else "MISSING",
        "details": f"Work order {wo_num} awarded to '{agency}'" if has_wo else "Work order or agency assignment missing."
    })

    # 4. Physical Inspection Gate
    inspections = project_raw.get("inspections", [])
    insp_count = len(inspections)
    phys_prog = progress.get("physical_progress_percent", 0.0)

    if phys_prog >= 50.0 and insp_count == 0:
        insp_status = "MISSING"
        insp_details = f"Non-compliance alert: Project is at {phys_prog}% physical progress but zero site inspections are recorded."
    elif insp_count > 0:
        insp_status = "PASS"
        insp_details = f"{insp_count} site inspection(s) recorded. Latest status satisfactory."
    else:
        insp_status = "NOT_YET_DUE"
        insp_details = "Early stage work; site inspection pending."
    checklist.append({
        "stage": "PHYSICAL_INSPECTION_GATE",
        "status": insp_status,
        "details": insp_details
    })

    # 5. Payment & Milestone Gate
    payment_signals = payment_analysis.get("anomaly_signals", [])
    has_dup = any(s.get("signal_type") in ("DUPLICATE_PAYMENT_VOUCHER", "POTENTIAL_DUPLICATE_PAYMENT") for s in payment_signals)
    has_premature = any(s.get("signal_type") == "PAYMENT_BEFORE_MILESTONE_COMPLETION" for s in payment_signals)

    if has_dup:
        pmt_status = "FAIL"
        pmt_details = "Payment integrity check failed: Duplicate voucher pattern detected."
    elif has_premature:
        pmt_status = "WARNING"
        pmt_details = "Payment milestone alignment warning: Voucher released before milestone completion."
    else:
        pmt_status = "PASS"
        pmt_details = "Disbursements align with validated milestone schedule."
    checklist.append({
        "stage": "PAYMENT_MILESTONE_GATE",
        "status": pmt_status,
        "details": pmt_details
    })

    # 6. Completion & Asset Register Gate
    cert_avail = bool(project_raw.get("completion_certificate_available"))
    is_reg = assets.get("asset_registered", False)

    if phys_prog >= 100.0:
        if cert_avail and is_reg:
            comp_status = "PASS"
            comp_details = "Project certified complete and asset successfully enrolled in district asset register."
        else:
            comp_status = "WARNING"
            comp_details = "Work finished physically but completion certificate or asset handover pending."
    else:
        comp_status = "IN_PROGRESS"
        comp_details = f"Project under execution ({phys_prog}% progress)."
    checklist.append({
        "stage": "COMPLETION_AND_HANDOVER",
        "status": comp_status,
        "details": comp_details
    })

    # Overall compliance calculation
    statuses = [item["status"] for item in checklist]
    if "FAIL" in statuses:
        overall = "NON_COMPLIANT"
    elif "MISSING" in statuses or "WARNING" in statuses:
        overall = "NEEDS_ATTENTION"
    else:
        overall = "COMPLIANT"

    return {
        "overall_status": overall,
        "stages_passed": statuses.count("PASS"),
        "total_stages": len(checklist),
        "checklist": checklist
    }
