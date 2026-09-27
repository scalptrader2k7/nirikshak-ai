import os
import pytest
from fastapi.testclient import TestClient
import pandas as pd
from src.api.main import app
from src.enrichment.demo_loader import (
    load_demo_projects, is_demo_record, get_demo_record_ids, get_demo_project_raw
)
from src.enrichment.demo_financials import compute_demo_financials
from src.enrichment.demo_progress import compute_demo_progress
from src.enrichment.demo_payments import analyze_demo_payments
from src.enrichment.demo_compliance import run_demo_compliance_screening
from src.enrichment.demo_service import get_demo_lifecycle_payload
from src.api.data_loader import get_clean_df

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_demo_api_env():
    from src.persistence.database import init_db, get_connection
    from src.auth.auth_service import provision_user
    from src.auth.session import create_session, COOKIE_NAME
    init_db()
    user = provision_user(
        email="demo.tester.mospi@nirikshak.gov.in",
        password="TestPassword123!",
        full_name="MoSPI Demo Tester",
        role="MOSPI",
        scope_type="NATIONAL",
        user_id="test_mospi_demo"
    )
    conn = get_connection()
    raw_token, _ = create_session(conn, user["user_id"])
    conn.close()
    client.cookies.set(COOKIE_NAME, raw_token, domain="testserver")
    client.headers["Authorization"] = f"Bearer {raw_token}"

TARGET_DEMO_IDS = [26, 10, 75, 208, 230, 170, 350, 205, 450, 512, 117, 120]
HEALTHY_CONTROL_IDS = [26, 205, 512]

# 1. Dataset Isolation, Synthetic Tags & Removal of Scenario Tags from Raw Data
def test_demo_dataset_isolation_and_tags():
    projects = load_demo_projects(force_reload=True)
    assert len(projects) == 12

    for rec_id, proj in projects.items():
        assert proj["is_demo_enrichment"] is True
        assert proj["data_source"] == "DEMONSTRATION_LIFECYCLE_DATA"
        assert proj["source_classification"] == "SYNTHETIC_DEMONSTRATION"
        assert "DEMONSTRATION ONLY" in proj["disclaimer"]

    # Raw demo CSV must NOT contain scenario_tag column (factual administrative data only)
    raw_csv = pd.read_csv("data/enrichment/demo_lifecycle/demo_project_lifecycle.csv")
    assert "scenario_tag" not in raw_csv.columns

    # Verify official dataset files have not been modified or overwritten
    official_clean = pd.read_csv("data/processed/mplads_clean.csv")
    assert len(official_clean) == 742
    assert "is_demo_enrichment" not in official_clean.columns

# 2. Demo Cohort Selection & Realistic Healthy Controls
def test_demo_cohort_selection():
    demo_ids = get_demo_record_ids()
    assert sorted(demo_ids) == sorted(TARGET_DEMO_IDS)

    # Verify at least 3 healthy controls
    projects = load_demo_projects()
    healthy_controls = [rec_id for rec_id, p in projects.items() if p.get("is_healthy_control")]
    assert len(healthy_controls) >= 3
    for hc in HEALTHY_CONTROL_IDS:
        assert hc in healthy_controls

    # Verify all 12 record IDs exist in official cleaned MPLADS snapshot
    clean_df = get_clean_df()
    official_ids = set(clean_df["original_row_index"].astype(int))
    for demo_id in TARGET_DEMO_IDS:
        assert demo_id in official_ids

# 3. Realistic Financial Intelligence Calculations
def test_financial_intelligence_calculations():
    # Record 26: Healthy on-track with irregular accounting values
    raw_26 = get_demo_project_raw(26)
    fin_26 = compute_demo_financials(raw_26)
    assert fin_26["sanctioned_amount"] == 987500.0
    assert fin_26["funds_released"] == 742500.0
    assert fin_26["expenditure_amount"] == 639340.0
    assert fin_26["remaining_balance"] == round(742500.0 - 639340.0, 2)
    assert fin_26["utilization_percent"] == round((639340.0 / 742500.0) * 100.0, 2)
    assert fin_26["cost_overrun_status"] == "WITHIN_ESTIMATE"

    # Record 208: Realistic non-round Cost Overrun (+34.97%)
    raw_208 = get_demo_project_raw(208)
    fin_208 = compute_demo_financials(raw_208)
    assert fin_208["cost_overrun_status"] == "OVERRUN"
    assert fin_208["cost_overrun_percent"] > 25.0
    assert fin_208["cost_overrun_amount"] == round(raw_208["revised_estimate"] - raw_208["approved_estimate"], 2)
    assert fin_208["financial_status"] == "BUDGET_OVERRUN_DETECTED"

    # Record 117: Stalled with unspent released funds
    raw_117 = get_demo_project_raw(117)
    fin_117 = compute_demo_financials(raw_117)
    assert fin_117["funds_released"] == 195000.0
    assert fin_117["expenditure_amount"] == 0.0
    assert fin_117["utilization_percent"] == 0.0
    assert fin_117["remaining_balance"] == 195000.0
    assert fin_117["financial_status"] == "UNSPENT_FUNDS_STALLED"

# 4. Realistic Execution Progress & Reality Gap
def test_execution_progress_and_reality_gap():
    # Record 10: Spend outpaces physical execution (87.25% spend vs 27% progress)
    raw_10 = get_demo_project_raw(10)
    fin_10 = compute_demo_financials(raw_10)
    prog_10 = compute_demo_progress(raw_10, fin_10)

    assert prog_10["physical_progress_percent"] == 27.0
    assert prog_10["financial_progress_percent"] > 80.0
    assert prog_10["reality_gap_percent"] > 50.0
    assert prog_10["reality_gap_alert"] is True
    assert prog_10["reality_gap_status"] == "HIGH_EXPENDITURE_LOW_PHYSICAL_PROGRESS"

    # Healthy controls have reasonable progress and no reality gap alert
    for hc in HEALTHY_CONTROL_IDS:
        raw_hc = get_demo_project_raw(hc)
        fin_hc = compute_demo_financials(raw_hc)
        prog_hc = compute_demo_progress(raw_hc, fin_hc)
        assert prog_hc["reality_gap_alert"] is False

# 5. Delay Days & Linear Trajectory Prediction
def test_delay_and_linear_trajectory():
    # Record 75: Critical delay > 120 days
    raw_75 = get_demo_project_raw(75)
    fin_75 = compute_demo_financials(raw_75)
    prog_75 = compute_demo_progress(raw_75, fin_75)

    assert prog_75["delay_days"] > 120
    assert prog_75["delay_status"] == "CRITICAL_DELAY"
    assert prog_75["prediction"]["trajectory_algorithm"] == "DEMO_LINEAR_TRAJECTORY_V1"
    assert prog_75["prediction"]["predicted_completion_date"] is not None

    # Record 205: Completed on time
    raw_205 = get_demo_project_raw(205)
    fin_205 = compute_demo_financials(raw_205)
    prog_205 = compute_demo_progress(raw_205, fin_205)

    assert prog_205["delay_days"] == 0
    assert prog_205["delay_status"] == "COMPLETED_ON_TIME"
    assert prog_205["prediction"]["confidence"] == "ACTUAL_COMPLETED"

# 6. Payment Anomaly Signals
def test_payment_anomaly_signals():
    # Record 230: Potential duplicate payment voucher
    raw_230 = get_demo_project_raw(230)
    pay_230 = analyze_demo_payments(raw_230["payments"], raw_230["milestones"], raw_230["agency_name"])
    assert pay_230["has_payment_anomalies"] is True
    assert any(s["signal_type"] == "POTENTIAL_DUPLICATE_PAYMENT" for s in pay_230["anomaly_signals"])

    # Record 170: Premature payment before milestone completion
    raw_170 = get_demo_project_raw(170)
    pay_170 = analyze_demo_payments(raw_170["payments"], raw_170["milestones"], raw_170["agency_name"])
    assert pay_170["has_payment_anomalies"] is True
    assert any(s["signal_type"] == "PAYMENT_BEFORE_MILESTONE_COMPLETION" for s in pay_170["anomaly_signals"])

    # Record 350: Vendor concentration
    raw_350 = get_demo_project_raw(350)
    pay_350 = analyze_demo_payments(raw_350["payments"], raw_350["milestones"], raw_350["agency_name"])
    assert any(s["signal_type"] == "VENDOR_CONCENTRATION_ALERT" for s in pay_350["anomaly_signals"])

    # Record 26: Healthy control (zero payment anomalies)
    raw_26 = get_demo_project_raw(26)
    pay_26 = analyze_demo_payments(raw_26["payments"], raw_26["milestones"], raw_26["agency_name"])
    assert pay_26["has_payment_anomalies"] is False
    assert len(pay_26["anomaly_signals"]) == 0

# 7. Asset Register & Inspections
def test_asset_register_and_inspections():
    # Record 205: Formal asset registration & handover
    payload_205 = get_demo_lifecycle_payload(205)
    asset_205 = payload_205["asset_register"]
    assert asset_205["asset_registered"] is True
    assert asset_205["registration_status"] == "REGISTERED"
    assert "Gram Panchayat" in asset_205["handover_recipient"]
    assert len(payload_205["inspections"]) == 1

    # Record 450: Progress 73% with zero inspections recorded in database
    payload_450 = get_demo_lifecycle_payload(450)
    assert payload_450["execution_progress"]["physical_progress_percent"] > 50.0
    assert len(payload_450["inspections"]) == 0

# 8. Geospatial Proximity Clustering
def test_geospatial_proximity_clustering():
    payload_117 = get_demo_lifecycle_payload(117)
    payload_120 = get_demo_lifecycle_payload(120)

    geo_117 = payload_117["geospatial"]
    geo_120 = payload_120["geospatial"]

    assert geo_117["location_source"] == "SYNTHETIC_DEMO_COORDINATES"
    assert geo_120["location_source"] == "SYNTHETIC_DEMO_COORDINATES"

    cluster_117 = geo_117["proximity_cluster"]
    assert cluster_117 is not None
    assert cluster_117["is_proximate_cluster"] is True
    assert cluster_117["neighbor_record_id"] == 120
    # Natural derived distance between GPS points (< 100m)
    assert 50.0 < cluster_117["distance_to_neighbor_meters"] < 100.0

    cluster_120 = geo_120["proximity_cluster"]
    assert cluster_120 is not None
    assert cluster_120["neighbor_record_id"] == 117

# 9. Compliance Checklist Screening
def test_compliance_checklist_screening():
    # Record 205: Compliant healthy project
    payload_205 = get_demo_lifecycle_payload(205)
    assert payload_205["compliance_screening"]["overall_status"] == "COMPLIANT"

    # Record 230: Potential duplicate voucher fails payment gate -> NON_COMPLIANT
    payload_230 = get_demo_lifecycle_payload(230)
    assert payload_230["compliance_screening"]["overall_status"] == "NON_COMPLIANT"
    assert any(c["stage"] == "PAYMENT_MILESTONE_GATE" and c["status"] == "FAIL" for c in payload_230["compliance_screening"]["checklist"])

    # Record 450: Missing inspection -> NEEDS_ATTENTION
    payload_450 = get_demo_lifecycle_payload(450)
    assert payload_450["compliance_screening"]["overall_status"] == "NEEDS_ATTENTION"
    assert any(c["stage"] == "PHYSICAL_INSPECTION_GATE" and c["status"] == "MISSING" for c in payload_450["compliance_screening"]["checklist"])

# 10. API Endpoint GET /projects/{record_id}/demo-lifecycle (No scenario tags in response)
def test_demo_lifecycle_api_endpoint():
    # Valid Demo Record
    resp_26 = client.get("/api/v1/projects/26/demo-lifecycle")
    assert resp_26.status_code == 200
    data_26 = resp_26.json()
    assert data_26["available"] is True
    assert data_26["is_demo_enrichment"] is True
    assert data_26["data_source"] == "DEMONSTRATION_LIFECYCLE_DATA"
    assert data_26["source_classification"] == "SYNTHETIC_DEMONSTRATION"
    assert "DEMONSTRATION ONLY" in data_26["disclaimer"]
    # Confirm scenario_tag is not exposed as a source field in API output
    assert "scenario_tag" not in data_26
    assert len(data_26["milestones"]) == 4

    # Valid Official MPLADS Record not in demo cohort (e.g. Record 1)
    resp_1 = client.get("/api/v1/projects/1/demo-lifecycle")
    assert resp_1.status_code == 200
    data_1 = resp_1.json()
    assert data_1["available"] is False
    assert data_1["is_demo_enrichment"] is False
    assert "only available for the 12 demonstration projects" in data_1["message"]

    # Non-existent Record (e.g. 99999) -> 404
    resp_404 = client.get("/api/v1/projects/99999/demo-lifecycle")
    assert resp_404.status_code == 404

# 11. Project Overview Seamless Demo Enrichment
def test_project_overview_incorporates_demo_enrichment():
    # Demo record has demo_enrichment populated
    resp_26 = client.get("/api/v1/projects/26/overview")
    assert resp_26.status_code == 200
    overview_26 = resp_26.json()
    assert overview_26["demo_enrichment"] is not None
    assert overview_26["demo_enrichment"]["available"] is True
    assert overview_26["demo_enrichment"]["record_id"] == 26
    assert "scenario_tag" not in overview_26["demo_enrichment"]

    # Non-demo record has demo_enrichment as null
    resp_1 = client.get("/api/v1/projects/1/overview")
    assert resp_1.status_code == 200
    overview_1 = resp_1.json()
    assert overview_1["demo_enrichment"] is None
    # Existing fields unchanged
    assert "project" in overview_1
    assert "lifecycle" in overview_1
    assert "financial" in overview_1
    assert "progress" in overview_1
    assert "workflow" in overview_1

# 12. Strict Isolation: Official Detectors and Datasets Untouched
def test_anomaly_engine_isolation():
    clean_df = get_clean_df()
    assert len(clean_df) == 742
    # Ensure no demonstration columns leaked into clean df
    for col in ["funds_released", "expenditure_amount", "scenario_tag", "is_demo_enrichment"]:
        assert col not in clean_df.columns
