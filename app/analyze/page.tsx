// app/analyze/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, TrendingDown, Lightbulb, CheckCircle2, AlertCircle } from "lucide-react";

interface AnalysisResult {
  matchScore: number;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
  reasoning: string;
}

export default function AnalyzePage() {
  const router = useRouter();
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  
  // Form fields
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  // Add state
const [scraping, setScraping] = useState(false);

// Add this function
async function scrapeJobUrl() {
  if (!jobUrl) {
    alert('Please enter a job URL first');
    return;
  }

  setScraping(true);
  
  try {
    const response = await fetch('/api/scrape-job', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: jobUrl }),
    });

    if (response.ok) {
      const data = await response.json();
      setJobTitle(data.title || jobTitle);
      setCompany(data.company || company);
      setJobDescription(data.description || jobDescription);
      alert('✅ Job details extracted! Review and edit as needed.');
    } else {
      alert('⚠️ Could not scrape job. Please enter details manually.');
    }
  } catch (error) {
    alert('❌ Scraping failed. Please enter details manually.');
  }

  setScraping(false);
}

  async function handleAnalyze() {
    if (!jobTitle || !company || !jobDescription) {
      alert("Please fill in all required fields");
      return;
    }

    setAnalyzing(true);
    setResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle,
          company,
          jobUrl: jobUrl || `https://${company.toLowerCase()}.com/jobs`,
          jobDescription,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data.analysis);
        setApplicationId(data.application.id);
      } else {
        const error = await response.json();
        alert("❌ Analysis failed: " + error.error);
      }
    } catch (error) {
      alert("❌ Failed to analyze resume. Make sure you have created your profile first!");
    }

    setAnalyzing(false);
  }

  function getScoreColor(score: number) {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  }

  function getScoreLabel(score: number) {
    if (score >= 80) return "Excellent Match";
    if (score >= 60) return "Good Match";
    return "Needs Improvement";
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Resume Analyzer</h1>
          <p className="text-gray-600 mt-2">
            Analyze how well your resume matches a job description
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
                <CardDescription>Enter the job information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="jobTitle">Job Title *</Label>
                  <Input
                    id="jobTitle"
                    placeholder="e.g., Senior Full-Stack Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="company">Company *</Label>
                  <Input
                    id="company"
                    placeholder="e.g., Google"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>

                {/* Update the Job URL field */}
                <div>
                <Label htmlFor="jobUrl">Job URL</Label>
                <div className="flex gap-2">
                    <Input
                    id="jobUrl"
                    type="url"
                    placeholder="Enter the Job's URL"
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    className="flex-1"
                    />
                    <Button
                    type="button"
                    variant="outline"
                    onClick={scrapeJobUrl}
                    disabled={scraping || !jobUrl}
                    >
                    {scraping ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        "Auto-fill"
                    )}
                    </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                    Paste a job URL and click "Auto-fill" to extract details
                </p>
                </div>

                <div>
                  <Label htmlFor="jobDescription">Job Description *</Label>
                  <Textarea
                    id="jobDescription"
                    placeholder="Paste the full job description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={12}
                    className="font-mono text-sm"
                  />
                </div>

                <Button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="w-full"
                  size="lg"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Analyze Resume
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {analyzing && (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Analyzing Your Resume
                    </h3>
                    <p className="text-gray-600">
                      Our AI is comparing your profile against the job requirements...
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {result && (
              <>
                {/* Match Score */}
                <Card>
                  <CardHeader>
                    <CardTitle>Match Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <div className={`text-6xl font-bold ${getScoreColor(result.matchScore)}`}>
                        {result.matchScore}%
                      </div>
                      <p className="text-gray-600 mt-2">{getScoreLabel(result.matchScore)}</p>
                    </div>
                    <Progress value={result.matchScore} className="h-3" />
                  </CardContent>
                </Card>

                {/* Strengths */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-green-700">
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start">
                          <Badge variant="outline" className="mr-2 mt-0.5 bg-green-50 text-green-700 border-green-200">
                            ✓
                          </Badge>
                          <span className="text-sm text-gray-700">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Gaps */}
                {result.gaps.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-yellow-700">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        Areas for Improvement
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.gaps.map((gap, index) => (
                          <li key={index} className="flex items-start">
                            <Badge variant="outline" className="mr-2 mt-0.5 bg-yellow-50 text-yellow-700 border-yellow-200">
                              !
                            </Badge>
                            <span className="text-sm text-gray-700">{gap}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-blue-700">
                      <Lightbulb className="h-5 w-5 mr-2" />
                      Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <Badge variant="outline" className="mr-2 mt-0.5 bg-blue-50 text-blue-700 border-blue-200">
                            {index + 1}
                          </Badge>
                          <span className="text-sm text-gray-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Actions */}
                {applicationId && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="py-6">
                      <p className="text-sm text-gray-700 mb-4">
                        ✅ Application saved! View it in your dashboard or generate tailored answers.
                      </p>
                      <div className="flex gap-3">
                        <Button
                          onClick={() => router.push("/dashboard")}
                          variant="outline"
                          className="flex-1"
                        >
                          Go to Dashboard
                        </Button>
                        <Button
                          onClick={() => router.push(`/applications/${applicationId}`)}
                          className="flex-1"
                        >
                          Generate Answers
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {!analyzing && !result && (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Fill in the job details and click "Analyze Resume" to see your match score</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}