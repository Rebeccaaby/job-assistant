// app/applications/[id]/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  ArrowLeft,
  Copy,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface Application {
  id: string;
  jobTitle: string;
  company: string;
  jobUrl: string;
  jobDescription: string;
  matchScore: number;
  status: string;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
  tailoredAnswers: Record<string, any>;
  createdAt: string;
}

export default function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [application, setApplication] = useState<Application | null>(null);
  const [question, setQuestion] = useState("");
  const [generatedAnswer, setGeneratedAnswer] = useState("");
  const [reasoning, setReasoning] = useState("");

  useEffect(() => {
    loadApplication();
  }, [id]);

  async function loadApplication() {
    setLoading(true);
    try {
      const response = await fetch(`/api/applications/${id}`);
      if (response.ok) {
        const data = await response.json();
        setApplication(data.application);
      }
    } catch (error) {
      console.error("Failed to load application:", error);
    }
    setLoading(false);
  }

  async function generateAnswer() {
    if (!question.trim()) {
      alert("Please enter a question");
      return;
    }

    setGenerating(true);
    setGeneratedAnswer("");
    setReasoning("");

    try {
      const response = await fetch("/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: id,
          question: question.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedAnswer(data.answer);
        setReasoning(data.reasoning);
      } else {
        const error = await response.json();
        alert("❌ Failed to generate answer: " + error.error);
      }
    } catch (error) {
      alert("❌ Failed to generate answer");
    }

    setGenerating(false);
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    alert("✅ Copied to clipboard!");
  }

  function getScoreColor(score: number) {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  }

  const commonQuestions = [
    "Why are you interested in this role?",
    "What makes you a good fit for this position?",
    "What is your biggest strength?",
    "Describe a challenging project you worked on.",
    "Where do you see yourself in 5 years?",
    "Why do you want to work at this company?",
  ];

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

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Not Found</h2>
          <Button onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{application.jobTitle}</h1>
              <p className="text-xl text-gray-600 mt-2">{application.company}</p>
            </div>
            
            {application.jobUrl && (
              <Button variant="outline" asChild>
                <a href={application.jobUrl} target="_blank" rel="noopener noreferrer">
                  View Job Posting
                  <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </Button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Analysis Results */}
          <div className="lg:col-span-1 space-y-6">
            {/* Match Score */}
            <Card>
              <CardHeader>
                <CardTitle>Match Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className={`text-5xl font-bold ${getScoreColor(application.matchScore)}`}>
                    {application.matchScore}%
                  </div>
                </div>
                <Progress value={application.matchScore} className="h-3" />
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
                  {application.strengths.map((strength, index) => (
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
            {application.gaps.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-yellow-700">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Gaps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {application.gaps.map((gap, index) => (
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
                  {application.recommendations.map((rec, index) => (
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
          </div>

          {/* Right Column - Answer Generator */}
          <div className="lg:col-span-2 space-y-6">
            {/* Answer Generator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-blue-600" />
                  Generate Tailored Answers
                </CardTitle>
                <CardDescription>
                  Get AI-generated answers to common application questions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="question">Application Question</Label>
                  <Input
                    id="question"
                    placeholder="e.g., Why are you interested in this role?"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && generateAnswer()}
                  />
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Common Questions:</p>
                  <div className="flex flex-wrap gap-2">
                    {commonQuestions.map((q) => (
                      <Button
                        key={q}
                        variant="outline"
                        size="sm"
                        onClick={() => setQuestion(q)}
                      >
                        {q}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={generateAnswer}
                  disabled={generating || !question.trim()}
                  className="w-full"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Answer...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Answer
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Generated Answer */}
            {generatedAnswer && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle>Generated Answer</CardTitle>
                  <CardDescription>
                    Review and customize before using
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border">
                    <Textarea
                      value={generatedAnswer}
                      onChange={(e) => setGeneratedAnswer(e.target.value)}
                      rows={8}
                      className="border-0 p-0 focus-visible:ring-0"
                    />
                  </div>

                  {reasoning && (
                    <div className="bg-blue-100 rounded-lg p-3 text-sm text-blue-900">
                      <p className="font-medium mb-1">💡 Why this works:</p>
                      <p>{reasoning}</p>
                    </div>
                  )}

                  <Button
                    onClick={() => copyToClipboard(generatedAnswer)}
                    variant="outline"
                    className="w-full"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy to Clipboard
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                    {application.jobDescription}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}