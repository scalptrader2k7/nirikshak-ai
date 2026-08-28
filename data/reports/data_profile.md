# MPLADS Dataset Profile Report
Generated at: `2026-08-28T20:35:59.443058`

Source file: `mplads_raw.csv`

## 1. Summary Metrics
- **Total Rows**: 742
- **Total Columns**: 15
- **Exact Duplicate Rows**: 128 (17.25%)

## 2. Columns & Missing Values
| Column Name | Unique Values | Missing Values | Missing % |
| --- | --- | --- | --- |
| MP NAME | 72 | 0 | 0.00% |
| WORK | 54 | 0 | 0.00% |
| CATEGORY | 2 | 0 | 0.00% |
| STATE | 24 | 0 | 0.00% |
| CONSTITUENCY | 55 | 0 | 0.00% |
| IDA | 84 | 0 | 0.00% |
| CITY | 54 | 640 | 86.25% |
| WARD | 84 | 640 | 86.25% |
| BLOCK | 165 | 102 | 13.75% |
| VILLAGE | 483 | 102 | 13.75% |
| RECOMMENDED DATE | 9 | 0 | 0.00% |
| ALLOCATION AMOUNT | 95 | 0 | 0.00% |
| IDA APPROVAL | 2 | 0 | 0.00% |
| STATUS | 2 | 1 | 0.13% |
| HOUSE | 2 | 0 | 0.00% |

## 3. Numeric Summary: ALLOCATION AMOUNT
- **Minimum**: 16300.00
- **Maximum**: 5000000.00
- **Mean**: 408377.79
- **Median**: 300000.00
- **Standard Deviation**: 448728.51
- **Suspicious Zero Values**: 0
- **Suspicious Negative Values**: 0
- **Malformed/Non-numeric Strings**: 0

## 4. Date Summary: RECOMMENDED DATE
- **Total non-empty values**: 742
- **Successfully parsed (ISO standard)**: 742 (100.00%)
- **Failed to parse**: 0
- **Earliest Date**: `2024-02-25`
- **Latest Date**: `2024-03-04`

## 5. Whitespace and Capitalization Inconsistencies
| Column | Leading/Trailing Whitespace Rows | Multi-space Rows | Casing Inconsistencies? |
| --- | --- | --- | --- |
| MP NAME | 104 | 0 | No |
| WORK | 0 | 0 | No |
| CATEGORY | 0 | 0 | No |
| STATE | 0 | 0 | No |
| CONSTITUENCY | 0 | 0 | No |
| IDA | 0 | 0 | No |
| CITY | 0 | 0 | No |
| WARD | 0 | 0 | No |
| BLOCK | 0 | 0 | Yes |
| VILLAGE | 0 | 0 | No |
| RECOMMENDED DATE | 0 | 0 | No |
| ALLOCATION AMOUNT | 0 | 0 | No |
| IDA APPROVAL | 0 | 0 | No |
| STATUS | 0 | 0 | No |
| HOUSE | 0 | 0 | No |

## 6. Categorical Distributions (Top 10)
### Column: `MP NAME`
| Value | Count | Percentage |
| --- | --- | --- |
| Smt Jaya Bachchan | 168 | 22.64% |
| Kani K Navas | 62 | 8.36% |
| Mala Rajya Laxmi Shah | 44 | 5.93% |
| Smt Rajashree Mallick  | 32 | 4.31% |
| Shivkumar Chanabasappa Udasi | 31 | 4.18% |
| Bishweswar Tudu | 24 | 3.23% |
| Rahul Kaswan | 23 | 3.10% |
| Mr Gopal Jee Thakur | 22 | 2.96% |
| Smt Pramila Bisoyi  | 20 | 2.70% |
| Gaddam Ranjith Reddy | 20 | 2.70% |

### Column: `WORK`
| Value | Count | Percentage |
| --- | --- | --- |
| NA - Installing hand pumps | 165 | 22.24% |
| NA - Construction of roads, link roads, pathways or any other road with or without drainage system | 134 | 18.06% |
| NA - Lighting of public spaces | 96 | 12.94% |
| NA - Construction of community centers and community halls | 72 | 9.70% |
| NA - Street lights | 40 | 5.39% |
| NA - Construction of rooms and halls in school and colleges | 26 | 3.50% |
| NA - Construction of buildings for community cultural activities | 22 | 2.96% |
| NA - Crematoriums or structures on burial/ cremation ground for public convenience | 17 | 2.29% |
| NA - Construction of boundary walls of existing public and community buildings | 17 | 2.29% |
| NA - Construction of additional rooms and halls in the existing public and community building | 17 | 2.29% |

### Column: `CATEGORY`
| Value | Count | Percentage |
| --- | --- | --- |
| Normal/Others | 739 | 99.60% |
| Repair and Renovation | 3 | 0.40% |

### Column: `STATE`
| Value | Count | Percentage |
| --- | --- | --- |
| Uttar Pradesh | 200 | 26.95% |
| Odisha | 141 | 19.00% |
| Tamil Nadu | 71 | 9.57% |
| Karnataka | 54 | 7.28% |
| Rajasthan | 52 | 7.01% |
| Maharashtra | 51 | 6.87% |
| Uttarakhand | 45 | 6.06% |
| Telangana | 26 | 3.50% |
| Bihar | 25 | 3.37% |
| Himachal Pradesh | 14 | 1.89% |

### Column: `CONSTITUENCY`
| Value | Count | Percentage |
| --- | --- | --- |
| Sitting Rajya Sabha | 238 | 32.08% |
| RAMANATHAPURAM | 62 | 8.36% |
| TEHRI GARHWAL | 44 | 5.93% |
| JAGATSINGHPUR(SC) | 32 | 4.31% |
| HAVERI | 31 | 4.18% |
| MAYURBHANJ (ST) | 24 | 3.23% |
| CHURU | 23 | 3.10% |
| DARBHANGA | 22 | 2.96% |
| ASKA | 20 | 2.70% |
| DINDORI(ST) | 20 | 2.70% |

### Column: `IDA`
| Value | Count | Percentage |
| --- | --- | --- |
| DISTRICT MAGISTRATE BHADOHI_IDA | 168 | 22.64% |
| DISTRICT COLLECTOR UTTARKASHI_IDA | 44 | 5.93% |
| DISTRICT COLLECTOR RAMANATHAPURAM_IDA | 42 | 5.66% |
| DISTRICT COLLECTOR MAYURBHANJ_IDA | 40 | 5.39% |
| DISTRICT COLLECTOR NASHIK_IDA | 38 | 5.12% |
| DISTRICT COLLECTOR JAGATSINGHPUR_IDA | 32 | 4.31% |
| DEPUTY COMMISSIONER HAVERI_IDA | 31 | 4.18% |
| DISTRICT COLLECTOR CHURU_IDA | 23 | 3.10% |
| DISTRICT MAGISTRATE DARBANGA_IDA | 22 | 2.96% |
| DISTRICT COLLECTOR GANJAM_IDA | 22 | 2.96% |

### Column: `CITY`
| Value | Count | Percentage |
| --- | --- | --- |
| nan | 640 | 86.25% |
| Lucknow | 6 | 0.81% |
| Balurghat | 5 | 0.67% |
| Naugaon | 5 | 0.67% |
| Nagina | 5 | 0.67% |
| Balrampur | 5 | 0.67% |
| Haveri | 4 | 0.54% |
| Aranthangi | 4 | 0.54% |
| Benipur | 4 | 0.54% |
| Kavisurjyanagar | 4 | 0.54% |

### Column: `WARD`
| Value | Count | Percentage |
| --- | --- | --- |
| nan | 640 | 86.25% |
| Baidyanathpara (OG) - Ward No.25 | 5 | 0.67% |
| Haveri (Cmc) - Ward No.1 | 3 | 0.40% |
| Mudukulathur (TP) - Ward No.1 | 3 | 0.40% |
| Aranthangi (M) - Ward No.1 | 3 | 0.40% |
| Balrampur (MB) - Ward No.11 | 3 | 0.40% |
| Naugaon (NP)- Mulaana Ward No.7 | 2 | 0.27% |
| Lucknow (M Corp.) - Ward No.43 | 2 | 0.27% |
| Naugaon (NP)- Naugaon Gaon Ward No.5 | 2 | 0.27% |
| Tulsipur (NP) - Ward No.11 | 2 | 0.27% |

### Column: `RECOMMENDED DATE`
| Value | Count | Percentage |
| --- | --- | --- |
| 2024-03-03 | 266 | 35.85% |
| 2024-02-25 | 182 | 24.53% |
| 2024-03-01 | 69 | 9.30% |
| 2024-02-29 | 54 | 7.28% |
| 2024-03-02 | 52 | 7.01% |
| 2024-02-27 | 43 | 5.80% |
| 2024-03-04 | 35 | 4.72% |
| 2024-02-28 | 26 | 3.50% |
| 2024-02-26 | 15 | 2.02% |

### Column: `IDA APPROVAL`
| Value | Count | Percentage |
| --- | --- | --- |
| Action Pending | 734 | 98.92% |
| Approved by IDA | 8 | 1.08% |

### Column: `STATUS`
| Value | Count | Percentage |
| --- | --- | --- |
| Unsanctioned | 740 | 99.73% |
| nan | 1 | 0.13% |
| Ongoing | 1 | 0.13% |

### Column: `HOUSE`
| Value | Count | Percentage |
| --- | --- | --- |
| Lok Sabha | 492 | 66.31% |
| Rajya Sabha | 250 | 33.69% |
