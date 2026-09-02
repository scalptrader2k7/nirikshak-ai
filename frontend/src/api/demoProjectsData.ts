import type {
    InvestigationCase,
    CaseListResponse,
    Filters,
    PriorityLevel,
    DetectorName,
    SeverityLevel,
    Evidence,
    RelatedRecord,
} from "./types";

// Base template definitions for realistic generator
const STATES_CONFIG: {
    state: string;
    districts: { name: string; constituency: string; mp: string }[];
}[] = [
    {
        state: "Uttar Pradesh",
        districts: [
            { name: "Varanasi", constituency: "Varanasi", mp: "Hon. Representative (Varanasi)" },
            { name: "Gorakhpur", constituency: "Gorakhpur", mp: "Shri Ravi Kishan Shukla" },
            { name: "Lucknow", constituency: "Lucknow", mp: "Shri Rajnath Singh" },
            { name: "Kanpur Nagar", constituency: "Kanpur", mp: "Shri Satyadev Pachauri" },
            { name: "Prayagraj", constituency: "Allahabad", mp: "Prof. Rita Bahuguna Joshi" },
            { name: "Agra", constituency: "Agra", mp: "Prof. S. P. Singh Baghel" },
        ],
    },
    {
        state: "Maharashtra",
        districts: [
            { name: "Pune", constituency: "Pune", mp: "Hon. Representative (Pune)" },
            { name: "Nagpur", constituency: "Nagpur", mp: "Shri Nitin Gadkari" },
            { name: "Nashik", constituency: "Nashik", mp: "Shri Hemant Godse" },
            { name: "Thane", constituency: "Thane", mp: "Shri Rajan Vichare" },
            { name: "Aurangabad", constituency: "Aurangabad", mp: "Shri Imtiaz Jaleel" },
            { name: "Kolhapur", constituency: "Kolhapur", mp: "Shri Sanjay Mandlik" },
        ],
    },
    {
        state: "Gujarat",
        districts: [
            { name: "Navsari", constituency: "Navsari", mp: "Shri C. R. Patil" },
            { name: "Ahmedabad", constituency: "Ahmedabad West", mp: "Dr. Kirit Solanki" },
            { name: "Surat", constituency: "Surat", mp: "Smt. Darshana Jardosh" },
            { name: "Vadodara", constituency: "Vadodara", mp: "Smt. Ranjanben Bhatt" },
            { name: "Rajkot", constituency: "Rajkot", mp: "Shri Mohan Kundariya" },
        ],
    },
    {
        state: "Tamil Nadu",
        districts: [
            { name: "Chennai", constituency: "Chennai Central", mp: "Thiru Dayanidhi Maran" },
            { name: "Madurai", constituency: "Madurai", mp: "Shri Su. Venkatesan" },
            { name: "Coimbatore", constituency: "Coimbatore", mp: "Shri P. R. Natarajan" },
            { name: "Thoothukudi", constituency: "Thoothukkudi", mp: "Tmt. Kanimozhi Karunanidhi" },
            { name: "Tiruchirappalli", constituency: "Tiruchirappalli", mp: "Thiru Su. Thirunavukkarasar" },
        ],
    },
    {
        state: "Rajasthan",
        districts: [
            { name: "Jaipur", constituency: "Jaipur Rural", mp: "Hon. Representative (Jaipur Rural)" },
            { name: "Jodhpur", constituency: "Jodhpur", mp: "Shri Gajendra Singh Shekhawat" },
            { name: "Kota", constituency: "Kota", mp: "Shri Om Birla" },
            { name: "Bikaner", constituency: "Bikaner", mp: "Shri Arjun Ram Meghwal" },
            { name: "Udaipur", constituency: "Udaipur", mp: "Shri Arjun Lal Meena" },
        ],
    },
    {
        state: "Bihar",
        districts: [
            { name: "Patna", constituency: "Patna Sahib", mp: "Hon. Representative (Patna Sahib)" },
            { name: "Gaya", constituency: "Gaya", mp: "Shri Vijay Kumar" },
            { name: "Muzaffarpur", constituency: "Muzaffarpur", mp: "Shri Ajay Nishad" },
            { name: "Bhagalpur", constituency: "Bhagalpur", mp: "Shri Ajay Kumar Mandal" },
            { name: "Darbhanga", constituency: "Darbhanga", mp: "Shri Gopal Jee Thakur" },
        ],
    },
    {
        state: "Madhya Pradesh",
        districts: [
            { name: "Indore", constituency: "Indore", mp: "Hon. Representative (Indore)" },
            { name: "Bhopal", constituency: "Bhopal", mp: "Sadhvi Pragya Singh Thakur" },
            { name: "Gwalior", constituency: "Gwalior", mp: "Shri Vivek Narayan Shejwalkar" },
            { name: "Jabalpur", constituency: "Jabalpur", mp: "Shri Rakesh Singh" },
            { name: "Ujjain", constituency: "Ujjain", mp: "Shri Anil Firojiya" },
        ],
    },
    {
        state: "Karnataka",
        districts: [
            { name: "Mysuru", constituency: "Mysuru", mp: "Hon. Representative (Mysuru)" },
            { name: "Bengaluru Urban", constituency: "Bangalore South", mp: "Shri Tejasvi Surya" },
            { name: "Dharwad", constituency: "Dharwad", mp: "Shri Pralhad Joshi" },
            { name: "Belagavi", constituency: "Belgaum", mp: "Shri Mangala Suresh Angadi" },
            { name: "Dakshina Kannada", constituency: "Dakshina Kannada", mp: "Shri Nalin Kumar Kateel" },
        ],
    },
    {
        state: "Andhra Pradesh",
        districts: [
            { name: "Dr. B. R. Ambedkar Konaseema", constituency: "Amalapuram", mp: "Shri G. M. Harish" },
            { name: "Visakhapatnam", constituency: "Visakhapatnam", mp: "Shri M. V. V. Satyanarayana" },
            { name: "Guntur", constituency: "Guntur", mp: "Shri Jayadev Galla" },
            { name: "Tirupati", constituency: "Tirupati", mp: "Dr. M. Maddila Gurumoorthy" },
        ],
    },
    {
        state: "Nagaland",
        districts: [
            { name: "Kohima", constituency: "Nagaland", mp: "Shri Tokheho Yepthomi" },
            { name: "Dimapur", constituency: "Nagaland", mp: "Shri Tokheho Yepthomi" },
            { name: "Mokokchung", constituency: "Nagaland", mp: "Shri Tokheho Yepthomi" },
        ],
    },
    {
        state: "Kerala",
        districts: [
            { name: "Thiruvananthapuram", constituency: "Thiruvananthapuram", mp: "Dr. Shashi Tharoor" },
            { name: "Ernakulam", constituency: "Ernakulam", mp: "Shri Hibi Eden" },
            { name: "Kozhikode", constituency: "Kozhikode", mp: "Shri M. K. Raghavan" },
        ],
    },
    {
        state: "West Bengal",
        districts: [
            { name: "Kolkata", constituency: "Kolkata North", mp: "Shri Sudip Bandyopadhyay" },
            { name: "Darjeeling", constituency: "Darjeeling", mp: "Shri Raju Bista" },
            { name: "Murshidabad", constituency: "Murshidabad", mp: "Shri Abu Taher Khan" },
        ],
    },
    {
        state: "Odisha",
        districts: [
            { name: "Puri", constituency: "Puri", mp: "Shri Pinaki Misra" },
            { name: "Bhubaneswar", constituency: "Bhubaneswar", mp: "Smt. Aparajita Sarangi" },
            { name: "Cuttack", constituency: "Cuttack", mp: "Shri Bhartruhari Mahtab" },
        ],
    },
    {
        state: "Assam",
        districts: [
            { name: "Kamrup Metropolitan", constituency: "Gauhati", mp: "Smt. Queen Oja" },
            { name: "Dibrugarh", constituency: "Dibrugarh", mp: "Shri Rameswar Teli" },
            { name: "Silchar", constituency: "Silchar", mp: "Dr. Rajdeep Roy" },
        ],
    },
    {
        state: "Punjab",
        districts: [
            { name: "Amritsar", constituency: "Amritsar", mp: "Shri Gurjeet Singh Aujla" },
            { name: "Ludhiana", constituency: "Ludhiana", mp: "Shri Ravneet Singh Bittu" },
            { name: "Jalandhar", constituency: "Jalandhar", mp: "Shri Sushil Kumar Rinku" },
        ],
    },
    {
        state: "Telangana",
        districts: [
            { name: "Hyderabad", constituency: "Hyderabad", mp: "Shri Asaduddin Owaisi" },
            { name: "Secunderabad", constituency: "Secunderabad", mp: "Shri G. Kishan Reddy" },
            { name: "Karimnagar", constituency: "Karimnagar", mp: "Shri Bandi Sanjay Kumar" },
        ],
    },
    {
        state: "Haryana",
        districts: [
            { name: "Gurugram", constituency: "Gurgaon", mp: "Shri Rao Inderjit Singh" },
            { name: "Faridabad", constituency: "Faridabad", mp: "Shri Krishan Pal" },
            { name: "Karnal", constituency: "Karnal", mp: "Shri Sanjay Bhatia" },
        ],
    },
    {
        state: "Jharkhand",
        districts: [
            { name: "Ranchi", constituency: "Ranchi", mp: "Shri Sanjay Seth" },
            { name: "Dhanbad", constituency: "Dhanbad", mp: "Shri Pashupati Nath Singh" },
            { name: "Jamshedpur", constituency: "Jamshedpur", mp: "Shri Bidyut Baran Mahato" },
        ],
    },
    {
        state: "Chhattisgarh",
        districts: [
            { name: "Raipur", constituency: "Raipur", mp: "Shri Sunil Kumar Soni" },
            { name: "Bilaspur", constituency: "Bilaspur", mp: "Shri Arun Sao" },
            { name: "Durg", constituency: "Durg", mp: "Shri Vijay Baghel" },
        ],
    },
    {
        state: "Uttarakhand",
        districts: [
            { name: "Dehradun", constituency: "Tehri Garhwal", mp: "Smt. Mala Rajya Laxmi Shah" },
            { name: "Haridwar", constituency: "Haridwar", mp: "Dr. Ramesh Pokhriyal Nishank" },
            { name: "Nainital", constituency: "Nainital-Udhamsingh Nagar", mp: "Shri Ajay Bhatt" },
        ],
    },
    {
        state: "Himachal Pradesh",
        districts: [
            { name: "Shimla", constituency: "Shimla", mp: "Shri Suresh Kumar Kashyap" },
            { name: "Hamirpur", constituency: "Hamirpur", mp: "Shri Anurag Singh Thakur" },
            { name: "Mandi", constituency: "Mandi", mp: "Smt. Pratibha Singh" },
        ],
    },
    {
        state: "Jammu and Kashmir",
        districts: [
            { name: "Srinagar", constituency: "Srinagar", mp: "Dr. Farooq Abdullah" },
            { name: "Jammu", constituency: "Jammu", mp: "Shri Jugal Kishore Sharma" },
            { name: "Udhampur", constituency: "Udhampur", mp: "Dr. Jitendra Singh" },
        ],
    },
];

const WORK_CATEGORIES: { type: string; titles: string[]; avgCost: number }[] = [
    {
        type: "Roads & Pathways",
        titles: [
            "Construction of CC Road with Paver Blocks in Ward 14",
            "Interlocking Tile Road and Drain Construction from Main Gate to Primary School",
            "Bituminous Macadam Overlay of Link Road connecting Village to State Highway",
            "Construction of Concrete Pavement and Side Drainage Channel in Market Area",
            "Widening and Strengthening of Internal Village Approach Road",
        ],
        avgCost: 1250000,
    },
    {
        type: "Water Supply & Sanitation",
        titles: [
            "Installation of Solar-Powered Mini Drinking Water Tubewell with Storage Tank",
            "Deep Borewell Drinking Water Supply Scheme with Distribution Pipeline",
            "Construction of Community Sanitary Complex with Running Water Facility",
            "Rejuvenation of Traditional Village Water Reservoir with Sluice Gate",
            "Overhead Water Tank Construction (50,000 Litre Capacity) with Booster Pump",
        ],
        avgCost: 850000,
    },
    {
        type: "Community Infrastructure",
        titles: [
            "Construction of Multi-purpose Community Hall (Barat Ghar) with Boundary Wall",
            "Development of Open Air Gymnasium and Senior Citizens Sitting Shed in Public Park",
            "Construction of Gram Panchayat Citizen Service Facilitation Centre",
            "Community Crematorium Shed with Solar Lights and Water Connection",
            "Construction of Mahila Self-Help Group Training and Storage Hall",
        ],
        avgCost: 2200000,
    },
    {
        type: "Educational Facilities",
        titles: [
            "Construction of Additional Classrooms and Science Laboratory in Govt Senior Secondary School",
            "Modernization of Govt High School Library with Digital E-learning Terminals",
            "Construction of Boundary Wall, Gates, and Student Sanitation Block in Govt Girls School",
            "Installation of 10 kW Rooftop Solar PV System in Govt Composite School",
            "Construction of Mid-Day Meal Dining Hall with Clean Wash Stations",
        ],
        avgCost: 1650000,
    },
    {
        type: "Public Lighting",
        titles: [
            "Installation of 50 Nos Integrated LED Solar Street Lights in Gram Panchayat Wards",
            "High-Mast Solar Lighting System (12.5m) at Central Village Junction",
            "Smart Energy-efficient LED Street Light Fitting along 4 km Main Road",
            "Solar High-Mast Light System at Weekly Haat Bazaar Ground",
        ],
        avgCost: 650000,
    },
    {
        type: "Public Health Infrastructure",
        titles: [
            "Procurement and Deployment of Advanced Life Support (ALS) Ambulance for Sub-District Hospital",
            "Construction of Patient Waiting Shed and Drinking Water Station at Primary Health Centre",
            "Installation of Oxygen Generation and Delivery Pipeline in Community Health Centre",
            "Upgradation of Maternal and Child Care Ward with Diagnostic Equipment",
        ],
        avgCost: 3200000,
    },
    {
        type: "Irrigation & Drainage",
        titles: [
            "Construction of Check Dam for Agricultural Water Harvesting and Soil Conservation",
            "Concrete Field Irrigation Channel Lining covering 150 Hectares Ayacut",
            "Underground Reinforced Concrete Storm Water Drainage Conduit in Low-lying Area",
            "Construction of Siphon and Field Water Course Distribution Network",
        ],
        avgCost: 1850000,
    },
];

// Specific flagship seed cases reflecting highest priority review queue
const FLAGSHIP_CASES: Partial<InvestigationCase>[] = [
    {
        record_id: 1042,
        work: "Construction of CC Road with Paver Blocks in Ward 14, Varanasi",
        state: "Uttar Pradesh",
        constituency: "Varanasi",
        city: "Varanasi",
        mp_name: "Hon. Representative (Varanasi)",
        work_type: "Roads & Pathways",
        allocation_amount: 2500000, // ₹25.0 L (Peer median is ₹8.9 L -> Cost outlier)
        investigation_priority_score: 96.4,
        investigation_priority_level: "HIGH",
        primary_detector: "cost",
        cost_anomaly: true,
        exact_duplicate_anomaly: false,
        near_duplicate_anomaly: false,
        pattern_anomaly: false,
        primary_signal: "Allocation of ₹25.00 L exceeds district peer median of ₹8.90 L by 2.81x for equivalent CC road works.",
        summary: "Unit cost per meter is 2.8x higher than state Schedule of Rates. Requires rate analysis verification.",
        highest_severity: "high",
        highest_severity_score: 96.4,
        case_status: "OPEN",
    },
    {
        record_id: 1089,
        work: "Installation of 50 Nos Integrated LED Solar Street Lights in Pune Cantonment Wards",
        state: "Maharashtra",
        constituency: "Pune",
        city: "Pune",
        mp_name: "Hon. Representative (Pune)",
        work_type: "Public Lighting",
        allocation_amount: 1800000,
        investigation_priority_score: 94.8,
        investigation_priority_level: "HIGH",
        primary_detector: "exact_duplicate",
        cost_anomaly: false,
        exact_duplicate_anomaly: true,
        near_duplicate_anomaly: false,
        pattern_anomaly: false,
        primary_signal: "Identical title, ward location, and ₹18.00 L sanction amount match sanctioned work REC-00941 from previous FY.",
        summary: "Possible duplicate sanction across fiscal years. Field physical asset verification requested.",
        highest_severity: "high",
        highest_severity_score: 94.8,
        case_status: "OPEN",
    },
    {
        record_id: 1154,
        work: "Installation of Solar-Powered Mini Drinking Water Tubewell with Storage Tank in Village Khajrana",
        state: "Madhya Pradesh",
        constituency: "Indore",
        city: "Indore",
        mp_name: "Hon. Representative (Indore)",
        work_type: "Water Supply & Sanitation",
        allocation_amount: 1450000,
        investigation_priority_score: 91.2,
        investigation_priority_level: "HIGH",
        primary_detector: "near_duplicate",
        cost_anomaly: false,
        exact_duplicate_anomaly: false,
        near_duplicate_anomaly: true,
        pattern_anomaly: false,
        primary_signal: "94% lexical overlap and co-located geo-coordinates with two adjacent tube well works sanctioned in 2024.",
        summary: "High geographical proximity overlap. Desk audit recommends single cluster verification.",
        highest_severity: "high",
        highest_severity_score: 91.2,
        case_status: "OPEN",
    },
    {
        record_id: 1201,
        work: "Construction of Boundary Wall, Gates, and Student Sanitation Block in Govt Girls School, Patna",
        state: "Bihar",
        constituency: "Patna Sahib",
        city: "Patna",
        mp_name: "Hon. Representative (Patna Sahib)",
        work_type: "Educational Facilities",
        allocation_amount: 1950000,
        investigation_priority_score: 89.5,
        investigation_priority_level: "HIGH",
        primary_detector: "cost",
        cost_anomaly: true,
        exact_duplicate_anomaly: false,
        near_duplicate_anomaly: false,
        pattern_anomaly: false,
        primary_signal: "Boundary wall estimate exceeds state CPWD schedule of rates by 1.95x.",
        summary: "Cost divergence detected against district education infrastructure benchmarks.",
        highest_severity: "high",
        highest_severity_score: 89.5,
        case_status: "UNDER_REVIEW",
    },
    {
        record_id: 1248,
        work: "Development of Open Air Gymnasium and Senior Citizens Sitting Shed in Jaipur Rural Park",
        state: "Rajasthan",
        constituency: "Jaipur Rural",
        city: "Jaipur",
        mp_name: "Hon. Representative (Jaipur Rural)",
        work_type: "Community Infrastructure",
        allocation_amount: 2800000,
        investigation_priority_score: 88.0,
        investigation_priority_level: "HIGH",
        primary_detector: "pattern",
        cost_anomaly: false,
        exact_duplicate_anomaly: false,
        near_duplicate_anomaly: false,
        pattern_anomaly: true,
        primary_signal: "Repetitive vendor assignment pattern and split estimates below tender threshold.",
        summary: "Clustered repetitive sanction pattern under same executing agency.",
        highest_severity: "high",
        highest_severity_score: 88.0,
        case_status: "ASSIGNED",
    },
    {
        record_id: 1312,
        work: "Construction of Multi-purpose Community Hall (Barat Ghar) in Ward 7, Mysuru",
        state: "Karnataka",
        constituency: "Mysuru",
        city: "Mysuru",
        mp_name: "Hon. Representative (Mysuru)",
        work_type: "Community Infrastructure",
        allocation_amount: 3400000,
        investigation_priority_score: 86.4,
        investigation_priority_level: "HIGH",
        primary_detector: "near_duplicate",
        cost_anomaly: false,
        exact_duplicate_anomaly: false,
        near_duplicate_anomaly: true,
        pattern_anomaly: false,
        primary_signal: "Textual description matches earlier Phase-1 sanction with 88% token similarity.",
        summary: "Phase overlap check recommended prior to milestone fund disbursement.",
        highest_severity: "high",
        highest_severity_score: 86.4,
        case_status: "OPEN",
    },
];

// Deterministic generator to build the full 742-record corpus
function generateFull742Corpus(): InvestigationCase[] {
    const TOTAL = 742;
    const corpus: InvestigationCase[] = [];

    // First, insert the flagship cases
    FLAGSHIP_CASES.forEach((flagship, idx) => {
        corpus.push({
            rank: idx + 1,
            record_id: flagship.record_id || 1000 + idx,
            mp_name: flagship.mp_name || "Hon'ble MP",
            house: "Lok Sabha",
            state: flagship.state || "Uttar Pradesh",
            constituency: flagship.constituency || "Varanasi",
            city: flagship.city || "Varanasi",
            ward: `Ward ${((idx * 3 + 4) % 30) + 1}`,
            block: "Central Division",
            village: `Gram Panchayat ${((idx * 7) % 50) + 1}`,
            recommended_date: `2024-${String(((idx * 2) % 12) + 1).padStart(2, "0")}-15`,
            work: flagship.work || "Public Development Work",
            work_type: flagship.work_type || "Roads & Pathways",
            allocation_amount: flagship.allocation_amount || 1200000,
            expenditure_amount: null, // Explicitly null per honest data rules
            utilization_percent: null,
            physical_progress_percent: null,
            delay_days: null,
            investigation_priority_score: flagship.investigation_priority_score || 85.0,
            investigation_priority_level: flagship.investigation_priority_level || "HIGH",
            case_status: flagship.case_status || "OPEN",
            cost_anomaly: Boolean(flagship.cost_anomaly),
            exact_duplicate_anomaly: Boolean(flagship.exact_duplicate_anomaly),
            near_duplicate_anomaly: Boolean(flagship.near_duplicate_anomaly),
            pattern_anomaly: Boolean(flagship.pattern_anomaly),
            primary_detector: flagship.primary_detector || "cost",
            primary_signal: flagship.primary_signal || "Anomaly indicator flagged for review.",
            highest_severity: flagship.highest_severity || "high",
            highest_severity_score: flagship.highest_severity_score || 85.0,
            title: flagship.work || "Monitored Public Work",
            summary: flagship.summary || "Flagged for desk audit and evidence verification.",
            disclaimer: "Priority score reflects objective statistical indicators. It guides audit sequence and does not establish legal liability.",
            evidence_count: 3,
            evidence: [
                {
                    detector: flagship.primary_detector || "cost",
                    signal: flagship.primary_signal || "Signal detected",
                    severity: flagship.highest_severity || "high",
                    message: flagship.summary || "Evidence details",
                    formatted_message: flagship.primary_signal || "Signal details",
                },
            ],
            related_exact_duplicates: [],
            related_potentially_suspicious: [],
            related_contextual_near_duplicates: [],
        });
    });

    // Populate remaining records up to 742
    let stateIdx = 0;
    let categoryIdx = 0;

    for (let id = 1001; corpus.length < TOTAL; id++) {
        // Skip if ID was already added in flagship
        if (FLAGSHIP_CASES.some((f) => f.record_id === id)) {
            continue;
        }

        const stateGroup = STATES_CONFIG[stateIdx % STATES_CONFIG.length]!;
        const districtInfo = stateGroup.districts[(id * 3) % stateGroup.districts.length]!;
        const category = WORK_CATEGORIES[categoryIdx % WORK_CATEGORIES.length]!;
        const titleTemplate = category.titles[(id * 2) % category.titles.length]!;
        const workTitle = `${titleTemplate}, ${districtInfo.name}`;

        // Distribution of priority & detector
        // HIGH: ~45 (ranks 1-45)
        // MEDIUM: ~140 (ranks 46-185)
        // LOW: ~557 (ranks 186-742)
        const currentCount = corpus.length;
        let priorityLevel: PriorityLevel = "LOW";
        let priorityScore = 15.0 + ((id * 17) % 350) / 10;
        let severity: SeverityLevel = "low";
        let primaryDetector: DetectorName = "cost";
        let costAnomaly = false;
        let exactDuplicate = false;
        let nearDuplicate = false;
        let patternAnomaly = false;
        let signalText = "Standard allocation within district historical parameters.";
        let caseStatus = "OPEN";

        if (currentCount < 45) {
            priorityLevel = "HIGH";
            priorityScore = 75.0 + ((id * 11) % 245) / 10;
            severity = "high";
            nearDuplicate = id % 3 === 0;
            exactDuplicate = id % 5 === 0;
            patternAnomaly = id % 4 === 0;
            costAnomaly = !nearDuplicate && !exactDuplicate && !patternAnomaly;
            primaryDetector = exactDuplicate
                ? "exact_duplicate"
                : nearDuplicate
                ? "near_duplicate"
                : patternAnomaly
                ? "pattern"
                : "cost";
            signalText = exactDuplicate
                ? "Exact parameter match with previously sanctioned work."
                : nearDuplicate
                ? "Near-duplicate lexical similarity (>85%) with co-located work."
                : patternAnomaly
                ? "Clustered repetitive sanction pattern under same executing agency."
                : "Statistical cost outlier: allocation exceeds peer median by >2.0x.";
            if (id % 4 === 0) caseStatus = "UNDER_REVIEW";
            else if (id % 5 === 0) caseStatus = "ASSIGNED";
        } else if (currentCount < 185) {
            priorityLevel = "MEDIUM";
            priorityScore = 50.0 + ((id * 13) % 245) / 10;
            severity = "medium";
            costAnomaly = id % 3 === 0;
            patternAnomaly = id % 4 === 0;
            primaryDetector = costAnomaly ? "cost" : patternAnomaly ? "pattern" : "near_duplicate";
            signalText = "Moderate divergence from peer benchmark. Standard desk scrutiny recommended.";
            if (id % 6 === 0) caseStatus = "CLOSED";
            else if (id % 7 === 0) caseStatus = "ASSIGNED";
        } else {
            priorityLevel = "LOW";
            priorityScore = 10.0 + ((id * 7) % 395) / 10;
            severity = "low";
            const lowDetectors: DetectorName[] = ["cost", "pattern", "near_duplicate"];
            primaryDetector = lowDetectors[id % lowDetectors.length] || "cost";
            signalText = "Routine public work. Parameters conform to standard benchmarks.";
            if (id % 8 === 0) caseStatus = "CLOSED";
        }

        // Cost variance around category average
        const costMultiplier = priorityLevel === "HIGH" ? 1.8 : priorityLevel === "MEDIUM" ? 1.2 : 0.8 + ((id * 9) % 50) / 100;
        const allocationAmount = Math.round((category.avgCost * costMultiplier) / 10000) * 10000;

        const triggerLabel = primaryDetector === "cost"
            ? "Cost deviation"
            : primaryDetector === "exact_duplicate"
            ? "Duplicate record"
            : primaryDetector === "near_duplicate"
            ? "Near-duplicate record"
            : "Pattern deviation";

        const sanctionStatus: "Sanctioned" | "Unsanctioned" = id % 12 === 0 ? "Unsanctioned" : "Sanctioned";

        let reviewStatus: "Awaiting Review" | "Under Review" | "Verification Required" | "Reviewed" | "Closed" = "Awaiting Review";
        if (priorityLevel === "HIGH") {
            reviewStatus = id % 4 === 0 ? "Under Review" : id % 3 === 0 ? "Verification Required" : "Awaiting Review";
        } else if (priorityLevel === "MEDIUM") {
            reviewStatus = id % 5 === 0 ? "Under Review" : id % 6 === 0 ? "Reviewed" : "Awaiting Review";
        } else {
            reviewStatus = id % 4 === 0 ? "Reviewed" : id % 7 === 0 ? "Closed" : "Awaiting Review";
        }

        const record: InvestigationCase = {
            rank: corpus.length + 1,
            record_id: id,
            mp_name: districtInfo.mp,
            house: "Lok Sabha",
            state: stateGroup.state,
            constituency: districtInfo.constituency,
            city: districtInfo.name,
            ward: `Ward ${((id * 3) % 40) + 1}`,
            block: `${districtInfo.name} Block ${((id * 2) % 6) + 1}`,
            village: `Gram Panchayat ${((id * 5) % 60) + 1}`,
            recommended_date: `2024-${String(((id * 3) % 12) + 1).padStart(2, "0")}-${String(((id * 7) % 28) + 1).padStart(2, "0")}`,
            work: workTitle,
            work_type: category.type,
            allocation_amount: allocationAmount,
            expenditure_amount: null, // Explicit honest null
            utilization_percent: null,
            physical_progress_percent: null,
            delay_days: null,
            investigation_priority_score: parseFloat(priorityScore.toFixed(1)),
            investigation_priority_level: priorityLevel,
            case_status: caseStatus,
            sanction_status: sanctionStatus,
            review_status: reviewStatus,
            review_trigger: triggerLabel,
            cost_anomaly: costAnomaly,
            exact_duplicate_anomaly: exactDuplicate,
            near_duplicate_anomaly: nearDuplicate,
            pattern_anomaly: patternAnomaly,
            primary_detector: primaryDetector,
            primary_signal: signalText,
            highest_severity: severity,
            highest_severity_score: parseFloat(priorityScore.toFixed(1)),
            title: workTitle,
            summary: signalText,
            disclaimer: "Priority score reflects objective statistical indicators. It guides audit sequence and does not establish legal liability.",
            evidence_count: priorityLevel === "HIGH" ? 3 : priorityLevel === "MEDIUM" ? 2 : 1,
            evidence: [
                {
                    detector: primaryDetector,
                    signal: signalText,
                    severity: severity,
                    message: `Signal detected during automated intake scan for record ${id}.`,
                    formatted_message: signalText,
                },
            ],
            related_exact_duplicates: [],
            related_potentially_suspicious: [],
            related_contextual_near_duplicates: [],
        };

        corpus.push(record);
        stateIdx++;
        categoryIdx++;
    }

    // Sort by priority score descending initially to establish ranks 1 to 742
    corpus.sort((a, b) => b.investigation_priority_score - a.investigation_priority_score);
    corpus.forEach((item, index) => {
        item.rank = index + 1;
    });

    return corpus;
}

// Global cached in-memory dataset
export const DEMO_PROJECTS_CORPUS: InvestigationCase[] = generateFull742Corpus();

// Filtering and query engine matching the real API specification
export function queryDemoProjects(filters: Filters = {}): CaseListResponse {
    let results = [...DEMO_PROJECTS_CORPUS];

    // 1. Text Search (MP name, constituency, state, district/city, work title, record ID)
    if (filters.search && filters.search.trim() !== "") {
        const q = filters.search.trim().toLowerCase();
        results = results.filter((item) => {
            const idMatch = String(item.record_id).toLowerCase().includes(q) || `rec-${item.record_id}`.toLowerCase().includes(q);
            const mpMatch = item.mp_name?.toLowerCase().includes(q);
            const constituencyMatch = item.constituency?.toLowerCase().includes(q);
            const stateMatch = item.state?.toLowerCase().includes(q);
            const cityMatch = item.city?.toLowerCase().includes(q);
            const workMatch = item.work?.toLowerCase().includes(q) || item.title?.toLowerCase().includes(q);
            const workTypeMatch = item.work_type?.toLowerCase().includes(q);
            return Boolean(idMatch || mpMatch || constituencyMatch || stateMatch || cityMatch || workMatch || workTypeMatch);
        });
    }

    // 2. Geography Filters
    if (filters.state && filters.state !== "ALL") {
        results = results.filter((item) => item.state === filters.state);
    }
    if (filters.constituency && filters.constituency !== "ALL") {
        results = results.filter((item) => item.constituency === filters.constituency);
    }

    // 3. Representative (MP)
    if (filters.mp_name && filters.mp_name !== "ALL") {
        results = results.filter((item) => item.mp_name === filters.mp_name);
    }

    // 4. Work Type / Category
    if (filters.work_type && filters.work_type !== "ALL") {
        results = results.filter((item) => item.work_type === filters.work_type);
    }

    // 5. Risk / Priority Level (Low, Medium, High)
    if (filters.priority && filters.priority !== ("ALL" as any)) {
        results = results.filter((item) => item.investigation_priority_level === filters.priority);
    }

    // 6. Status (Sanctioned / Unsanctioned)
    const statusFilter = filters.sanction_status || (filters.status && (filters.status === "Sanctioned" || filters.status === "Unsanctioned") ? filters.status : null);
    if (statusFilter && statusFilter !== ("ALL" as any)) {
        results = results.filter((item) => item.sanction_status === statusFilter);
    }

    // 7. Review Status (Awaiting Review, Under Review, Verification Required, Reviewed, Closed)
    if (filters.review_status && filters.review_status !== ("ALL" as any)) {
        results = results.filter((item) => item.review_status === filters.review_status);
    }

    // 8. Review Trigger / Detector
    if (filters.review_trigger && filters.review_trigger !== ("ALL" as any)) {
        results = results.filter((item) => item.review_trigger === filters.review_trigger);
    } else if (filters.detector && filters.detector !== ("ALL" as any)) {
        results = results.filter((item) => item.primary_detector === filters.detector);
    }

    // 7. Severity Level
    if (filters.severity && filters.severity !== ("ALL" as any)) {
        results = results.filter((item) => item.highest_severity === filters.severity);
    }

    // 8. Min / Max Priority Score
    if (filters.min_score !== undefined && filters.min_score !== null) {
        results = results.filter((item) => item.investigation_priority_score >= (filters.min_score || 0));
    }
    if (filters.max_score !== undefined && filters.max_score !== null) {
        results = results.filter((item) => item.investigation_priority_score <= (filters.max_score || 100));
    }

    // 9. Sorting (whitelisted: rank, investigation_priority_score, allocation_amount, record_id)
    const sortBy = filters.sort_by || "investigation_priority_score";
    const sortOrder = filters.sort_order || "desc";

    results.sort((a, b) => {
        let valA: number | string = 0;
        let valB: number | string = 0;

        if (sortBy === "investigation_priority_score") {
            valA = a.investigation_priority_score;
            valB = b.investigation_priority_score;
        } else if (sortBy === "allocation_amount") {
            valA = a.allocation_amount || 0;
            valB = b.allocation_amount || 0;
        } else if (sortBy === "record_id") {
            valA = a.record_id;
            valB = b.record_id;
        } else if (sortBy === "rank") {
            valA = a.rank;
            valB = b.rank;
        }

        if (typeof valA === "string" || typeof valB === "string") {
            return sortOrder === "asc" ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
        }

        return sortOrder === "asc" ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });

    // 10. Pagination
    const totalRecords = results.length;
    const pageSize = filters.page_size || 25;
    const totalPages = Math.ceil(totalRecords / pageSize) || 1;
    const page = Math.min(Math.max(filters.page || 1, 1), totalPages);

    const startIndex = (page - 1) * pageSize;
    const paginatedData = results.slice(startIndex, startIndex + pageSize);

    return {
        data: paginatedData,
        pagination: {
            page,
            page_size: pageSize,
            total_records: totalRecords,
            total_pages: totalPages,
        },
        filters: {
            ...filters,
            page,
            page_size: pageSize,
            sort_by: sortBy,
            sort_order: sortOrder,
        },
    };
}

// Find single project record by ID
export function getDemoProjectById(recordId: number): InvestigationCase | undefined {
    return DEMO_PROJECTS_CORPUS.find((item) => item.record_id === recordId);
}

// Extract unique metadata options for cascading filters
export function getFilterMetadataOptions() {
    const states = Array.from(new Set(DEMO_PROJECTS_CORPUS.map((i) => i.state || "").filter(Boolean))).sort();
    const constituencies = Array.from(new Set(DEMO_PROJECTS_CORPUS.map((i) => i.constituency || "").filter(Boolean))).sort();
    const mps = Array.from(new Set(DEMO_PROJECTS_CORPUS.map((i) => i.mp_name || "").filter(Boolean))).sort();
    const workTypes = Array.from(new Set(DEMO_PROJECTS_CORPUS.map((i) => i.work_type || "").filter(Boolean))).sort();

    return {
        states,
        constituencies,
        mps,
        workTypes,
    };
}
