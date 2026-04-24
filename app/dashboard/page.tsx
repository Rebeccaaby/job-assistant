// app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Briefcase, TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react";

interface Application {
  id: string;
  jobTitle: string;
  company: string;
  matchScore: number;
  status: string;
  createdAt: string;
  appliedDate: string | null;
}

interface Stats {
  total: number;
  notSubmitted: number;
  submitted: number;
  interviews: number;
  rejected: number;
  offers: number;
  avgMatchScore: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  async function loadApplications() {
    setLoading(true);
    try {
      const response = await fetch("/api/applications");
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to load applications:", error);
    }
    setLoading(false);
  }

  async function updateStatus(applicationId: string, newStatus: string) {
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          appliedDate: newStatus === "SUBMITTED" ? new Date().toISOString() : undefined,
        }),
      });

      if (response.ok) {
        loadApplications(); // Reload to update stats
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "NOT_SUBMITTED":
        return "bg-gray-100 text-gray-700";
      case "SUBMITTED":
        return "bg-blue-100 text-blue-700";
      case "INITIAL_RESPONSE":
        return "bg-purple-100 text-purple-700";
      case "INTERVIEW_REQUESTED":
        return "bg-yellow-100 text-yellow-700";
      case "ONSITE_REQUESTED":
        return "bg-orange-100 text-orange-700";
      case "OFFER_RECEIVED":
        return "bg-green-100 text-green-700";
      case "REJECTED_AFTER_APPLY":
      case "REJECTED_AFTER_INTERVIEW":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  function getStatusLabel(status: string) {
    return status.split("_").map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(" ");
  }

  function getScoreColor(score: number) {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Application Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Track and manage all your job applications
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <p className="text-xs text-gray-600">Total Applications</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-gray-600">{stats.notSubmitted}</div>
                <p className="text-xs text-gray-600">Not Submitted</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-600">{stats.submitted}</div>
                <p className="text-xs text-gray-600">Submitted</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-yellow-600">{stats.interviews}</div>
                <p className="text-xs text-gray-600">Interviews</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">{stats.offers}</div>
                <p className="text-xs text-gray-600">Offers</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                <p className="text-xs text-gray-600">Rejected</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-purple-600">{stats.avgMatchScore}%</div>
                <p className="text-xs text-gray-600">Avg Match</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Applications List */}
        {applications.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No applications yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start by analyzing your resume against a job description
              </p>
              <Button onClick={() => router.push("/analyze")}>
                Analyze Your First Job
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <Card key={app.id} className="hover:shadow-md transition-shadow">
                <CardContent className="py-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {app.jobTitle}
                        </h3>
                        <Badge className={getStatusColor(app.status)}>
                          {getStatusLabel(app.status)}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{app.company}</p>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          <span className={`font-medium ${getScoreColor(app.matchScore)}`}>
                            {app.matchScore}% Match
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            {new Date(app.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {app.appliedDate && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            <span>
                              Applied {new Date(app.appliedDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Select
                        value={app.status}
                        onValueChange={(value) => updateStatus(app.id, value)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NOT_SUBMITTED">Not Submitted</SelectItem>
                          <SelectItem value="SUBMITTED">Submitted</SelectItem>
                          <SelectItem value="INITIAL_RESPONSE">Initial Response</SelectItem>
                          <SelectItem value="INTERVIEW_REQUESTED">Interview Requested</SelectItem>
                          <SelectItem value="ONSITE_REQUESTED">Onsite Requested</SelectItem>
                          <SelectItem value="OFFER_RECEIVED">Offer Received</SelectItem>
                          <SelectItem value="REJECTED_AFTER_APPLY">Rejected (After Apply)</SelectItem>
                          <SelectItem value="REJECTED_AFTER_INTERVIEW">Rejected (After Interview)</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        onClick={() => router.push(`/applications/${app.id}`)}
                        variant="outline"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}