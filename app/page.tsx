// app/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigation } from "@/components/navigation";
import { ArrowRight, Target, Sparkles, TrendingUp, CheckCircle } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center py-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Land Your Dream Job with AI
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Get instant resume analysis, tailored application answers, and track your job search—all powered by AI.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/profile">
              <Button size="lg" className="text-lg">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/analyze">
              <Button size="lg" variant="outline" className="text-lg">
                Analyze Resume
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 py-16">
          <Card>
            <CardHeader>
              <Target className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Resume Analysis</CardTitle>
              <CardDescription>
                Get AI-powered match scores and actionable recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  Match score against job description
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  Identify your strengths and gaps
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  Get improvement recommendations
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Sparkles className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Tailored Answers</CardTitle>
              <CardDescription>
                Generate personalized responses to application questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  AI-crafted answers from your experience
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  Aligned with job requirements
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  Edit and refine as needed
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Application Dashboard</CardTitle>
              <CardDescription>
                Track all your applications in one place
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  Monitor application status
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  View analytics and insights
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  Stay organized and focused
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Quick Start */}
        <div className="bg-blue-600 text-white rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-lg mb-6 opacity-90">
            Create your profile in 5 minutes and start analyzing jobs
          </p>
          <Link href="/profile">
            <Button size="lg" variant="secondary" className="text-lg">
              Create Your Profile
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}