import * as XLSX from "xlsx";

import {
  getRiskLevelFromScore,
  resolveBackendDecision
} from "./fraudDecisionService.js";
import { predictFraud } from "./mlService.js";

const REQUIRED_COLUMNS = [
  "transaction_amount",
  "time_since_last_order",
  "ip_mismatch_flag",
  "device_type_encoded",
  "historical_fraud_count"
];

const MAX_ROWS = 300;
const BATCH_SIZE = 20;

const normalizeHeader = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

const coerceNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const parseWorkbookRows = (buffer, filename) => {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

  if (!firstSheet) {
    const error = new Error(`No worksheet found in ${filename}.`);
    error.statusCode = 400;
    throw error;
  }

  const rawRows = XLSX.utils.sheet_to_json(firstSheet, {
    defval: "",
    raw: false
  });

  if (!rawRows.length) {
    const error = new Error("Uploaded dataset is empty.");
    error.statusCode = 400;
    throw error;
  }

  return rawRows.map((row, index) => ({
    rowNumber: index + 2,
    values: Object.fromEntries(
      Object.entries(row).map(([key, value]) => [normalizeHeader(key), value])
    )
  }));
};

const splitIntoBatches = (items, batchSize) => {
  const batches = [];

  for (let index = 0; index < items.length; index += batchSize) {
    batches.push(items.slice(index, index + batchSize));
  }

  return batches;
};

const buildInsights = (analyzedRows) => {
  const statusCounts = {
    ALLOW: 0,
    REVIEW: 0,
    BLOCK: 0
  };
  const riskLevelCounts = {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
    CRITICAL: 0
  };

  let totalRisk = 0;

  analyzedRows.forEach((row) => {
    statusCounts[row.decision] += 1;
    riskLevelCounts[row.riskLevel] += 1;
    totalRisk += row.riskScore;
  });

  const averageRiskScore = analyzedRows.length
    ? Number((totalRisk / analyzedRows.length).toFixed(2))
    : 0;
  const highestRiskScore = analyzedRows.length
    ? Number(Math.max(...analyzedRows.map((row) => row.riskScore)).toFixed(2))
    : 0;

  const topRiskRows = [...analyzedRows]
    .sort((left, right) => right.riskScore - left.riskScore)
    .slice(0, 8);

  return {
    summary: {
      analyzedRows: analyzedRows.length,
      averageRiskScore,
      highestRiskScore,
      allowCount: statusCounts.ALLOW,
      reviewCount: statusCounts.REVIEW,
      blockCount: statusCounts.BLOCK
    },
    riskLevelCounts,
    chartData: [
      { name: "Allow", value: statusCounts.ALLOW },
      { name: "Review", value: statusCounts.REVIEW },
      { name: "Block", value: statusCounts.BLOCK }
    ],
    topRiskRows
  };
};

export const analyzeDatasetBuffer = async (buffer, filename) => {
  const parsedRows = parseWorkbookRows(buffer, filename);

  if (parsedRows.length > MAX_ROWS) {
    const error = new Error(`Dataset too large. Upload up to ${MAX_ROWS} rows per analysis.`);
    error.statusCode = 400;
    throw error;
  }

  const validationErrors = [];
  const validRows = [];

  parsedRows.forEach((row) => {
    const missingColumns = REQUIRED_COLUMNS.filter(
      (column) => !(column in row.values)
    );

    if (missingColumns.length) {
      validationErrors.push({
        rowNumber: row.rowNumber,
        reason: `Missing required columns: ${missingColumns.join(", ")}`
      });
      return;
    }

    const normalized = {
      transaction_amount: coerceNumber(row.values.transaction_amount),
      time_since_last_order: coerceNumber(row.values.time_since_last_order),
      ip_mismatch_flag: coerceNumber(row.values.ip_mismatch_flag),
      device_type_encoded: coerceNumber(row.values.device_type_encoded),
      historical_fraud_count: coerceNumber(row.values.historical_fraud_count)
    };

    const invalidFields = Object.entries(normalized)
      .filter(([, value]) => value === null)
      .map(([field]) => field);

    if (invalidFields.length) {
      validationErrors.push({
        rowNumber: row.rowNumber,
        reason: `Invalid numeric values for: ${invalidFields.join(", ")}`
      });
      return;
    }

    validRows.push({
      rowNumber: row.rowNumber,
      ...normalized
    });
  });

  const analyzedRows = [];

  for (const batch of splitIntoBatches(validRows, BATCH_SIZE)) {
    const batchResults = await Promise.all(
      batch.map(async (row) => {
        const mlResponse = await predictFraud({
          transaction_amount: row.transaction_amount,
          time_since_last_order: row.time_since_last_order,
          ip_mismatch_flag: row.ip_mismatch_flag,
          device_type_encoded: row.device_type_encoded,
          historical_fraud_count: row.historical_fraud_count
        });

        const riskScore = Number(mlResponse.fraud_probability_score.toFixed(2));
        const decision = resolveBackendDecision(riskScore);
        const riskLevel = getRiskLevelFromScore(riskScore);

        return {
          rowNumber: row.rowNumber,
          riskScore,
          riskLevel,
          decision,
          recommendedAction: mlResponse.recommended_action,
          features: {
            transactionAmount: row.transaction_amount,
            timeSinceLastOrder: row.time_since_last_order,
            ipMismatchFlag: row.ip_mismatch_flag,
            deviceTypeEncoded: row.device_type_encoded,
            historicalFraudCount: row.historical_fraud_count
          }
        };
      })
    );

    analyzedRows.push(...batchResults);
  }

  const insights = buildInsights(analyzedRows);

  return {
    dataset: {
      fileName: filename,
      uploadedRows: parsedRows.length,
      analyzedRows: analyzedRows.length,
      skippedRows: validationErrors.length,
      requiredColumns: REQUIRED_COLUMNS
    },
    ...insights,
    validationErrors: validationErrors.slice(0, 12)
  };
};
