# Data Quality & Pipeline Audit Report
Generated at: `2026-08-28T20:36:34.583857`

## 1. Summary Metrics
- **Raw Row Count**: 742
- **Processed Row Count**: 742
- **Exact Duplicate Row Count**: 182
- **Invalid Numeric (Allocation) Count**: 0
- **Invalid Date (Recommended) Count**: 0

## 2. Column Mapping & Schema
| Original Column | Cleaned Column | Type in Cleaned |
| --- | --- | --- |
| MP NAME | mp_name | object |
| WORK | work | object |
| CATEGORY | category | object |
| STATE | state | object |
| CONSTITUENCY | constituency | object |
| IDA | ida | object |
| CITY | city | object |
| WARD | ward | object |
| BLOCK | block | object |
| VILLAGE | village | object |
| RECOMMENDED DATE | recommended_date | object |
| ALLOCATION AMOUNT | allocation_amount | float64 |
| IDA APPROVAL | ida_approval | object |
| STATUS | status | object |
| HOUSE | house | object |

## 3. Missing Value Analysis (Before vs After)
| Raw Column | Missing Count (Raw) | Cleaned Column | Missing Count (Cleaned) |
| --- | --- | --- | --- |
| MP NAME | 0 | mp_name | 0 |
| WORK | 0 | work | 0 |
| CATEGORY | 0 | category | 0 |
| STATE | 0 | state | 0 |
| CONSTITUENCY | 0 | constituency | 0 |
| IDA | 0 | ida | 0 |
| CITY | 640 | city | 640 |
| WARD | 640 | ward | 640 |
| BLOCK | 102 | block | 102 |
| VILLAGE | 102 | village | 102 |
| RECOMMENDED DATE | 0 | recommended_date | 0 |
| ALLOCATION AMOUNT | 0 | allocation_amount | 0 |
| IDA APPROVAL | 0 | ida_approval | 0 |
| STATUS | 1 | status | 1 |
| HOUSE | 0 | house | 0 |

## 4. Anomalies & Quality Issues Log
### Invalid Numeric Values (0 occurrences)
- None detected.

### Invalid Dates (0 occurrences)
- None detected.

## 5. Important Data Limitations & Notes
1. **Ambiguous Dates**: No assumptions were made for ambiguous date strings. Non-standard dates are coerced to empty strings.
2. **Numeric Fields**: Non-numeric allocation amounts were set to null rather than imputed or estimated.
3. **Duplicate Fields**: All rows have been retained. Exact duplicate records are tagged with `exact_duplicate_group_id` and can be analyzed as anomalies.
4. **Casing & Descriptions**: Text descriptions are stripped of leading/trailing whitespace and normalized, but descriptions are not rewritten.
