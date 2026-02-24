'use client';

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const SEVERITY_COLOR: Record<string, string> = {
  HIGH: "bg-rose-100 text-rose-700 border-rose-200",
  MEDIUM: "bg-amber-100 text-amber-700 border-amber-200",
  LOW: "bg-blue-100 text-blue-700 border-blue-200",
};

const SAMPLE_SYNC = [
  {
    productName: "Paracetamol 500mg",
    genericName: "Paracetamol",
    batchNumber: "B22",
    quantity: 8,
    expiry: "2026-04-30",
    distributorName: "ABC Distributors",
    distributorContact: "+91-9876543210",
    distributorLocation: "Ernakulam",
  },
];

export default function StockIntelligencePage() {
  const qc = useQueryClient();
  const [connectorName, setConnectorName] = useState("Primary POS Connector");
  const [softwareType, setSoftwareType] = useState("MARG_DIRECT_DB");
  const [syncPayload, setSyncPayload] = useState(JSON.stringify(SAMPLE_SYNC, null, 2));

  const { data: blueprints } = useQuery({
    queryKey: ["connector-blueprints"],
    queryFn: async () => {
      const res = await api.get("/intelligence/connector-blueprints");
      return res.data;
    },
  });

  const { data: connectors = [] } = useQuery({
    queryKey: ["retailer-connectors"],
    queryFn: async () => {
      const res = await api.get("/intelligence/connectors");
      return res.data;
    },
  });

  const activeConnector = connectors[0];

  const { data: stocks = [], isLoading: stocksLoading } = useQuery({
    queryKey: ["retailer-stocks"],
    queryFn: async () => {
      const res = await api.get("/intelligence/retailer/stocks");
      return res.data;
    },
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ["retailer-alerts"],
    queryFn: async () => {
      const res = await api.get("/intelligence/retailer/alerts");
      return res.data;
    },
  });

  const { data: matches = [] } = useQuery({
    queryKey: ["retailer-matches"],
    queryFn: async () => {
      const res = await api.get("/intelligence/retailer/matches");
      return res.data;
    },
  });

  const createConnector = useMutation({
    mutationFn: async () => {
      const config =
        softwareType === "MARG_DIRECT_DB"
          ? blueprints?.margDirectDbPreset?.configTemplate
          : blueprints?.universalDirectDb?.configTemplate;

      const res = await api.post("/intelligence/connectors", {
        name: connectorName,
        softwareType,
        config: config || { mode: "manual" },
        syncIntervalMinutes: 15,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Connector created");
      qc.invalidateQueries({ queryKey: ["retailer-connectors"] });
    },
    onError: () => toast.error("Failed to create connector"),
  });

  const runSync = useMutation({
    mutationFn: async () => {
      if (!activeConnector?.id) throw new Error("Create connector first");
      let records: any[] = [];
      try {
        records = JSON.parse(syncPayload);
      } catch {
        throw new Error("Payload must be valid JSON array");
      }

      const res = await api.post(`/intelligence/connectors/${activeConnector.id}/sync`, { records });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(`Sync complete: ${data.recordsUpserted} records`);
      qc.invalidateQueries({ queryKey: ["retailer-stocks"] });
      qc.invalidateQueries({ queryKey: ["retailer-alerts"] });
      qc.invalidateQueries({ queryKey: ["retailer-matches"] });
      qc.invalidateQueries({ queryKey: ["retailer-connectors"] });
    },
    onError: (e: any) => toast.error(e?.message || "Sync failed"),
  });

  const topMatches = useMemo(() => matches.slice(0, 8), [matches]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tighter text-slate-900">Stock Intelligence</h1>
        <p className="text-slate-500 font-medium">
          Sync pharmacy software stock, detect risks, and match distributors automatically.
        </p>
      </div>

      <Card className="border-slate-100 shadow-sm">
        <CardHeader>
          <CardTitle>Connector Setup</CardTitle>
          <CardDescription>Create one connector per pharmacy software and run sync.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Input value={connectorName} onChange={(e) => setConnectorName(e.target.value)} placeholder="Connector name" />
            <select
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
              value={softwareType}
              onChange={(e) => setSoftwareType(e.target.value)}
            >
              <option value="MARG_DIRECT_DB">Marg Direct DB</option>
              <option value="UNIVERSAL_DIRECT_DB">Universal Direct DB</option>
            </select>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => createConnector.mutate()} disabled={createConnector.isPending}>Create Connector</Button>
            <Badge variant="outline" className="self-center">
              Active: {activeConnector?.name || "None"}
            </Badge>
          </div>
          <p className="text-xs text-slate-500">
            Universal connector uses a field map in connector config so different pharmacy DB schemas can sync into one normalized format.
          </p>
          <div>
            <p className="text-sm font-semibold mb-2">Sync payload (JSON array)</p>
            <textarea
              className="w-full min-h-44 rounded-md border border-slate-200 p-3 text-sm font-mono"
              value={syncPayload}
              onChange={(e) => setSyncPayload(e.target.value)}
            />
          </div>
          <Button onClick={() => runSync.mutate()} disabled={runSync.isPending || !activeConnector}>
            Run Sync
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle>Live Alerts</CardTitle>
            <CardDescription>Low stock and near-expiry products.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.length === 0 && <p className="text-sm text-slate-500">No active alerts.</p>}
            {alerts.map((alert: any) => (
              <div key={alert.id} className="rounded-xl border border-slate-100 p-3 bg-slate-50">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-sm text-slate-900">{alert.stock?.productName}</p>
                  <Badge variant="outline" className={`border ${SEVERITY_COLOR[alert.severity] || ""}`}>
                    {alert.type} / {alert.severity}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 mt-1">{alert.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle>Best Distributor Matches</CardTitle>
            <CardDescription>Auto-ranked recommendations from live distributor inventory.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topMatches.length === 0 && <p className="text-sm text-slate-500">No matches yet.</p>}
            {topMatches.map((match: any) => (
              <div key={match.id} className="rounded-xl border border-slate-100 p-3">
                <p className="font-semibold text-sm">{match.stock?.productName}</p>
                <p className="text-xs text-slate-600">
                  {match.distributorInventory?.distributor?.companyName} | {match.distributorInventory?.distributor?.district}
                </p>
                <p className="text-xs text-slate-600">
                  PTR Rs {match.distributorInventory?.ptr?.toFixed(2)} | Stock {match.distributorInventory?.stock}
                </p>
                <Badge className="mt-2" variant="secondary">Score {match.score}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-100 shadow-sm">
        <CardHeader>
          <CardTitle>Retailer Stock Mirror</CardTitle>
          <CardDescription>Normalized stock data synced from your source software.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {stocksLoading ? (
            <div className="p-8 text-sm text-slate-500">Loading stocks...</div>
          ) : stocks.length === 0 ? (
            <div className="p-8 text-sm text-slate-500">No stock records yet. Run a sync.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/70 border-b">
                  <tr>
                    <th className="p-3 text-left font-semibold">Product</th>
                    <th className="p-3 text-left font-semibold">Batch</th>
                    <th className="p-3 text-left font-semibold">Qty</th>
                    <th className="p-3 text-left font-semibold">Expiry</th>
                    <th className="p-3 text-left font-semibold">Distributor</th>
                    <th className="p-3 text-left font-semibold">Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.map((item: any) => (
                    <tr key={item.id} className="border-b">
                      <td className="p-3 font-medium">{item.productName}</td>
                      <td className="p-3">{item.batchNumber || "-"}</td>
                      <td className="p-3">{item.quantity}</td>
                      <td className="p-3">{item.expiry ? new Date(item.expiry).toLocaleDateString() : "-"}</td>
                      <td className="p-3">{item.distributorName || "-"}</td>
                      <td className="p-3">{item.distributorContact || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
