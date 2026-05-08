"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  UploadCloud, FileText, CheckCircle2, Loader2, AlertCircle,
  BookOpen, Clock, Target, TrendingUp, MessageSquare, Send, X,
  Hash, Calculator, BarChart2
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
  Legend, ScatterChart, Scatter, CartesianGrid, ZAxis
} from "recharts";
import { useChat } from "ai/react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AnalysisTopic {
  topic: string;
  frequency: number;
  weightage: number;
}

interface Paper {
  id: string;
  user_id: string;
  pdf_url: string;
  analysis_json: AnalysisTopic[] | null;
  created_at: string;
}

interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CHART_COLORS = ["#6366f1", "#06b6d4", "#10b981", "#8b5cf6", "#f43f5e", "#f59e0b"];

// ─── Toast Component ──────────────────────────────────────────────────────────

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border text-sm font-medium animate-in slide-in-from-right-5 duration-300 min-w-[280px] max-w-sm ${
            toast.type === "success"
              ? "bg-green-900/80 border-green-500/30 text-green-200 backdrop-blur-md"
              : toast.type === "error"
              ? "bg-red-900/80 border-red-500/30 text-red-200 backdrop-blur-md"
              : "bg-zinc-900/90 border-zinc-700 text-zinc-200 backdrop-blur-md"
          }`}
        >
          {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />}
          {toast.type === "error" && <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />}
          <span className="flex-1">{toast.message}</span>
          <button onClick={() => onDismiss(toast.id)} className="opacity-60 hover:opacity-100 transition-opacity">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Custom Recharts Tooltip ──────────────────────────────────────────────────

interface TooltipEntry {
  name?: string;
  value?: number;
  dataKey?: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg shadow-xl">
        <p className="text-zinc-300 font-medium">{label ?? payload[0].name}</p>
        <p className="text-indigo-400 font-bold">
          {payload[0].value}
          {payload[0].dataKey === "weightage" ? "%" : ""}
        </p>
      </div>
    );
  }
  return null;
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "analyzing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [userName, setUserName] = useState("Student");
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loadingPapers, setLoadingPapers] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const { messages, input, handleInputChange, handleSubmit, isLoading: isChatLoading } = useChat({
    api: "/api/chat",
    body: {
      context: papers.length > 0 ? papers[0].analysis_json : null,
    },
    onError: () => showToast("error", "Chat failed. Please try again."),
  });

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Toast helpers ────────────────────────────────────────────────────────────

  const showToast = useCallback((type: Toast["type"], message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Data Fetching ────────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchUserAndPapers = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const name = user.user_metadata?.full_name ?? user.user_metadata?.name;
        setUserName(name ? name.split(" ")[0] : (user.email?.split("@")[0] ?? "Student"));

        const { data, error } = await supabase
          .from("papers")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          showToast("error", "Failed to load your papers.");
        } else if (data) {
          setPapers(data as Paper[]);
        }
      }
      setLoadingPapers(false);
    };

    fetchUserAndPapers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // ── Drag & Drop ──────────────────────────────────────────────────────────────

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === "application/pdf") {
      setFile(dropped);
      setStatus("idle");
    } else {
      showToast("error", "Only PDF files are supported.");
    }
  }, [showToast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected?.type === "application/pdf") {
      setFile(selected);
      setStatus("idle");
    } else if (selected) {
      showToast("error", "Only PDF files are supported.");
    }
  };

  // ── File Processing ──────────────────────────────────────────────────────────

  const processFile = async () => {
    if (!file) return;

    try {
      setStatus("uploading");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authentication required. Please log in again.");

      const ext = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${ext}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("papers")
        .upload(filePath, file);

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      const { data: publicUrlData } = supabase.storage.from("papers").getPublicUrl(filePath);
      const pdf_url = publicUrlData.publicUrl;

      setStatus("analyzing");
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdf_url }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error ?? "Failed to analyze paper");

      setStatus("success");
      setFile(null);
      showToast("success", "Analysis complete! Your study planner is ready.");

      setTimeout(() => setStatus("idle"), 5000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      setStatus("error");
      setErrorMessage(message);
      showToast("error", message);
    }
  };

  // ── Derived Data ─────────────────────────────────────────────────────────────

  const latestPaper = papers[0] ?? null;
  const analysisData: AnalysisTopic[] = latestPaper?.analysis_json ?? [];
  const sortedTopics = [...analysisData].sort((a, b) => b.weightage - a.weightage);

  // ── KPI calculations ──
  const totalTopics = analysisData.length;
  const highestYieldTopic = sortedTopics[0]?.topic ?? "N/A";
  const averageWeightage = totalTopics > 0 
    ? (analysisData.reduce((acc, curr) => acc + curr.weightage, 0) / totalTopics).toFixed(1) 
    : "0";

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div className="flex flex-col flex-grow py-12 px-4 max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Welcome back, {userName}! 👋
          </h1>
          <p className="text-zinc-400">
            Upload a past paper to generate AI-powered insights and a personalized study plan.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ── Left Column: Upload ── */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div className="w-full bg-zinc-900/40 border border-zinc-800 rounded-3xl p-8 shadow-xl shadow-black/20">
              {/* Drop Zone */}
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all duration-200 ${
                  isDragging
                    ? "border-indigo-500 bg-indigo-500/10"
                    : "border-zinc-700 bg-zinc-900/50 hover:border-zinc-500 hover:bg-zinc-800/50"
                } ${status === "uploading" || status === "analyzing" ? "opacity-50 pointer-events-none" : ""}`}
              >
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={status === "uploading" || status === "analyzing"}
                />
                <div className="bg-zinc-800/80 p-4 rounded-full mb-4">
                  <UploadCloud className={`w-6 h-6 ${isDragging ? "text-indigo-400" : "text-zinc-400"}`} />
                </div>
                <h3 className="text-lg font-medium text-white mb-2 text-center">
                  {isDragging ? "Drop PDF here" : "Drag & Drop past paper"}
                </h3>
                <p className="text-zinc-400 text-sm text-center max-w-xs mb-4">
                  PDF format only. Powered by Gemini 1.5 Flash.
                </p>
                <span className="px-5 py-2 bg-zinc-800 text-white text-sm rounded-xl font-medium pointer-events-none">
                  Browse Files
                </span>
              </div>

              {/* Status Area */}
              <div className="mt-6 min-h-[100px] flex flex-col items-center justify-center">
                {file && status === "idle" && (
                  <div className="flex flex-col items-center w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex items-center gap-3 bg-zinc-800/50 border border-zinc-700 px-4 py-3 rounded-xl w-full mb-4">
                      <FileText className="text-indigo-400 w-6 h-6 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{file.name}</p>
                        <p className="text-xs text-zinc-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      onClick={processFile}
                      className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-900/20"
                    >
                      Analyze Paper
                    </button>
                  </div>
                )}

                {(status === "uploading" || status === "analyzing") && (
                  <div className="flex flex-col items-center animate-in fade-in duration-300 text-center">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
                    <h3 className="text-base font-medium text-white">
                      {status === "uploading" ? "Uploading to storage..." : "Analyzing with Gemini AI..."}
                    </h3>
                    <p className="text-zinc-400 text-xs mt-1">Please don&apos;t close this page.</p>
                  </div>
                )}

                {status === "success" && (
                  <div className="flex flex-col items-center animate-in zoom-in-95 duration-300 text-center">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-3">
                      <CheckCircle2 className="w-6 h-6 text-green-400" />
                    </div>
                    <h3 className="text-lg font-medium text-white">Analysis Complete!</h3>
                    <p className="text-zinc-400 text-sm mt-1">Scroll down to see your insights.</p>
                  </div>
                )}

                {status === "error" && (
                  <div className="flex flex-col items-center w-full animate-in fade-in duration-300">
                    <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 p-3 rounded-xl w-full text-red-400">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <p className="text-sm font-medium">{errorMessage}</p>
                    </div>
                    <button
                      onClick={() => setStatus("idle")}
                      className="mt-3 text-zinc-400 hover:text-white text-sm transition-colors"
                    >
                      Try again
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* About Section */}
            <div className="bg-gradient-to-br from-indigo-900/30 to-zinc-900/50 border border-indigo-800/30 rounded-3xl p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-3">Founder&apos;s Vision</p>
              <p className="text-zinc-300 text-sm leading-relaxed">
                &ldquo;ExamLens AI was built to level the playing field — giving every student the same unfair advantage that elite coaching centres charge thousands for. Understand the patterns, beat the exam.&rdquo;
              </p>
              <p className="mt-4 text-indigo-300 text-sm font-medium">— Abhijeet Kangane, Founder</p>
            </div>
          </div>

          {/* ── Right Column: Analytics & Planner ── */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            {loadingPapers ? (
              <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-zinc-900/20 border border-zinc-800/50 rounded-3xl">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              </div>
            ) : papers.length === 0 ? (
              <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-zinc-900/20 border border-zinc-800/50 border-dashed rounded-3xl p-8 text-center">
                <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-4">
                  <Target className="w-8 h-8 text-zinc-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Data Yet</h3>
                <p className="text-zinc-400 max-w-sm">
                  Upload your first past paper to generate AI analytics and build your smart study planner.
                </p>
              </div>
            ) : (
              <>
                {/* ── KPI Stat Cards ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Card 1 */}
                  <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-indigo-500/20"></div>
                    <div className="flex items-center gap-4 mb-3 relative z-10">
                      <div className="p-3 bg-zinc-800/80 rounded-2xl">
                        <Hash className="w-6 h-6 text-indigo-400" />
                      </div>
                      <h3 className="text-sm font-medium text-zinc-400">Total Topics Extracted</h3>
                    </div>
                    <p className="text-3xl font-bold text-white tracking-tight relative z-10">{totalTopics}</p>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-cyan-500/20"></div>
                    <div className="flex items-center gap-4 mb-3 relative z-10">
                      <div className="p-3 bg-zinc-800/80 rounded-2xl">
                        <Target className="w-6 h-6 text-cyan-400" />
                      </div>
                      <h3 className="text-sm font-medium text-zinc-400">Highest Yield Topic</h3>
                    </div>
                    <p className="text-xl font-bold text-white truncate relative z-10" title={highestYieldTopic}>{highestYieldTopic}</p>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-emerald-500/20"></div>
                    <div className="flex items-center gap-4 mb-3 relative z-10">
                      <div className="p-3 bg-zinc-800/80 rounded-2xl">
                        <Calculator className="w-6 h-6 text-emerald-400" />
                      </div>
                      <h3 className="text-sm font-medium text-zinc-400">Average Weightage</h3>
                    </div>
                    <p className="text-3xl font-bold text-white tracking-tight relative z-10">{averageWeightage}%</p>
                  </div>
                </div>

                {/* Analytics Overview */}
                <div className="w-full flex flex-col gap-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <TrendingUp className="text-indigo-400" /> Analytics Overview
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Topic Frequency Bar Chart */}
                    <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 shadow-lg">
                      <h3 className="text-sm font-medium text-zinc-400 mb-6">Topic Frequency</h3>
                      <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={analysisData} margin={{ top: 0, right: 0, left: -20, bottom: 40 }}>
                            <XAxis 
                              dataKey="topic" 
                              tick={{ fill: "#71717a", fontSize: 12 }} 
                              tickLine={false} 
                              axisLine={false} 
                              angle={-45} 
                              textAnchor="end"
                              interval={0}
                            />
                            <YAxis tick={{ fill: "#71717a", fontSize: 11 }} tickLine={false} axisLine={false} />
                            <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255, 255, 255, 0.1)" }} />
                            <Bar dataKey="frequency" fill="#6366f1" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Weightage Donut Chart */}
                    <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 shadow-lg flex flex-col">
                      <h3 className="text-sm font-medium text-zinc-400 mb-2">Topic Weightage (%)</h3>
                      <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={analysisData}
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="weightage"
                              nameKey="topic"
                              stroke="none"
                            >
                              {analysisData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Legend verticalAlign="middle" align="right" layout="vertical" wrapperStyle={{ fontSize: '12px', color: '#a1a1aa' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                  
                  {/* Golden Quadrant Scatter Plot */}
                  <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 shadow-lg">
                    <div className="flex items-center gap-2 mb-6">
                      <BarChart2 className="text-fuchsia-400 w-5 h-5" />
                      <h3 className="text-lg font-bold text-white">The Golden Quadrant</h3>
                    </div>
                    <p className="text-zinc-400 text-sm mb-6">
                      Identify high-frequency AND high-weightage topics instantly.
                    </p>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                          <XAxis 
                            type="number" 
                            dataKey="frequency" 
                            name="Frequency" 
                            tick={{ fill: "#71717a", fontSize: 12 }} 
                            axisLine={false} 
                            tickLine={false} 
                            label={{ value: "Frequency (Times Appeared)", position: "insideBottom", offset: -15, fill: "#a1a1aa", fontSize: 12 }} 
                          />
                          <YAxis 
                            type="number" 
                            dataKey="weightage" 
                            name="Weightage" 
                            tick={{ fill: "#71717a", fontSize: 12 }} 
                            axisLine={false} 
                            tickLine={false} 
                            label={{ value: "Weightage (%)", angle: -90, position: "insideLeft", fill: "#a1a1aa", fontSize: 12 }} 
                          />
                          <ZAxis type="category" dataKey="topic" name="Topic" />
                          <RechartsTooltip 
                            cursor={{ strokeDasharray: '3 3', stroke: '#52525b' }}
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg shadow-xl">
                                    <p className="text-zinc-300 font-medium mb-1">{data.topic}</p>
                                    <div className="flex flex-col gap-1 text-sm">
                                      <p className="text-indigo-400">Frequency: <span className="font-bold">{data.frequency}</span></p>
                                      <p className="text-fuchsia-400">Weightage: <span className="font-bold">{data.weightage}%</span></p>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Scatter data={analysisData} fill="#d946ef">
                            {analysisData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Scatter>
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Smart Study Planner */}
                <div className="w-full flex flex-col gap-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <BookOpen className="text-cyan-400" /> Prioritized Study Planner
                  </h2>
                  <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 shadow-lg">
                    <div className="space-y-4">
                      {sortedTopics.map((topic, index) => (
                        <div
                          key={index}
                          className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 relative overflow-hidden hover:border-indigo-500/30 transition-colors"
                        >
                          <div
                            className={`absolute left-0 top-0 bottom-0 w-1 ${
                              index === 0 ? "bg-red-500" : index === 1 ? "bg-orange-500" : index === 2 ? "bg-amber-500" : "bg-zinc-700"
                            }`}
                          />
                          <div className="flex-shrink-0 w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center font-bold text-lg text-white ml-2">
                            #{index + 1}
                          </div>
                          <div className="flex-grow">
                            <h4 className="text-lg font-semibold text-white">{topic.topic}</h4>
                            <div className="flex items-center gap-3 mt-1 text-sm text-zinc-400">
                              <span className="flex items-center gap-1">
                                <Target className="w-3.5 h-3.5" /> Worth {topic.weightage}%
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" /> Appeared {topic.frequency}×
                              </span>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            {index === 0 ? (
                              <span className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-xs font-medium">
                                Critical Focus
                              </span>
                            ) : index < 3 ? (
                              <span className="px-3 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full text-xs font-medium">
                                High Priority
                              </span>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Chat with ExamLens AI */}
                <div className="w-full flex flex-col gap-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <MessageSquare className="text-purple-400" /> Chat with ExamLens AI
                  </h2>
                  <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 shadow-lg flex flex-col h-[500px]">
                    <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
                      {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                          <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                          <p className="text-center text-sm">Ask anything about your exam topics, study strategies, or priorities.</p>
                        </div>
                      ) : (
                        messages.map((m: any) => (
                          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div
                              className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm leading-relaxed ${
                                m.role === "user"
                                  ? "bg-indigo-600 text-white"
                                  : "bg-zinc-800 text-zinc-200 border border-zinc-700/50"
                              }`}
                            >
                              {m.content}
                            </div>
                          </div>
                        ))
                      )}
                      {isChatLoading && (
                        <div className="flex justify-start">
                          <div className="bg-zinc-800 text-zinc-200 border border-zinc-700/50 rounded-2xl px-5 py-3 flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                            <span className="text-sm text-zinc-400">ExamLens is thinking…</span>
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    <form onSubmit={handleSubmit} className="relative mt-auto">
                      <input
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-5 py-4 pr-14 text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                        value={input}
                        onChange={handleInputChange}
                        placeholder="e.g., Why is Neural Networks ranked #1 this year?"
                      />
                      <button
                        type="submit"
                        disabled={isChatLoading || !input.trim()}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
