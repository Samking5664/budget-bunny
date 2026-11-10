import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";

export default function CsvUploader({ onBatchAdd }) {
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setLoading(true);
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          // Debug: Check your browser console to see what keys your CSV headers actually produced
          console.log("Parsed CSV sample row:", results.data[0]);

          // Map the CSV columns with expanded fallbacks for different header names
          const formattedData = results.data.map((row) => ({
            merchant_name:
              row.merchant_name ||
              row.Merchant ||
              row.merchant ||
              row.Description ||
              row.Payee ||
              row.Name ||
              "Unknown Merchant",
            amount: parseFloat(
              row.amount || row.Amount || row.price || row.Price || 0
            ),
            category: row.category || row.Category || "Other",
            transaction_date:
              row.transaction_date ||
              row.Date ||
              row.date ||
              new Date().toISOString().split("T")[0],
          }));

          onBatchAdd(formattedData);
          setLoading(false);
        },
        error: (err) => {
          console.error("CSV parse error:", err);
          setLoading(false);
        },
      });
    },
    [onBatchAdd]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
  });

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <h2 className="text-xl font-bold text-slate-800 mb-4">Bulk Upload</h2>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
          ${
            isDragActive
              ? "border-emerald-500 bg-emerald-50"
              : "border-slate-300 hover:border-emerald-400 hover:bg-slate-50"
          }`}
      >
        <input {...getInputProps()} />
        <div className="text-4xl mb-3">📁</div>
        {isDragActive ? (
          <p className="text-emerald-600 font-medium">Drop the CSV here ...</p>
        ) : (
          <div>
            <p className="text-slate-600 font-medium mb-1">
              {loading ? "Processing..." : "Drag & drop your bank CSV here"}
            </p>
            <p className="text-slate-400 text-sm">or click to select a file</p>
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
        <p className="font-semibold mb-1">Expected CSV Headers:</p>
        <code className="text-slate-700">Merchant, Amount, Category, Date</code>
      </div>
    </div>
  );
}
