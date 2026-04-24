// app/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, X, Save, Sparkles } from "lucide-react";


interface WorkHistory {
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  description: string;
  achievements: string[];
}

interface Education {
  school: string;
  degree: string;
  field: string;
  endDate: string;
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [workHistory, setWorkHistory] = useState<WorkHistory[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [resumeText, setResumeText] = useState("");
  const [parsing, setParsing] = useState(false);
  

  // Load existing profile
  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        const profile = data.profile;
        
        setSummary(profile.summary || "");
        setSkills(profile.skills || []);
        setWorkHistory(profile.workHistory || []);
        setEducation(profile.education || []);
        setResumeText(profile.resumeText || "");
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
    setLoading(false);
  }

  async function saveProfile() {
    setSaving(true);
    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary,
          skills,
          workHistory,
          education,
          resumeText,
        }),
      });

      if (response.ok) {
        alert("✅ Profile saved successfully!");
      } else {
        const error = await response.json();
        alert("❌ Failed to save: " + error.error);
      }
    } catch (error) {
      alert("❌ Failed to save profile");
    }
    setSaving(false);
  }

  function addSkill() {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  }

  function removeSkill(skill: string) {
    setSkills(skills.filter((s) => s !== skill));
  }

  function addWorkHistory() {
    setWorkHistory([
      ...workHistory,
      {
        company: "",
        title: "",
        startDate: "",
        endDate: "",
        description: "",
        achievements: [],
      },
    ]);
  }

  function removeWorkHistory(index: number) {
    setWorkHistory(workHistory.filter((_, i) => i !== index));
  }

  function updateWorkHistory(index: number, field: keyof WorkHistory, value: any) {
    const updated = [...workHistory];
    updated[index] = { ...updated[index], [field]: value };
    setWorkHistory(updated);
  }

  function addEducation() {
    setEducation([
      ...education,
      {
        school: "",
        degree: "",
        field: "",
        endDate: "",
      },
    ]);
  }

  function removeEducation(index: number) {
    setEducation(education.filter((_, i) => i !== index));
  }

  function updateEducation(index: number, field: keyof Education, value: string) {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    setEducation(updated);
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
  
  async function parseResumeText() {
  if (!resumeText || resumeText.length < 50) {
    alert('Please paste your resume text first (at least 50 characters)');
    return;
  }

  setParsing(true);

  try {
    const response = await fetch('/api/parse-resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText }),
    });

    if (response.ok) {
      const parsed = await response.json();
      
      console.log('Parsed data:', parsed); // Debug
      
      // Auto-fill fields
      if (parsed.summary) {
        setSummary(parsed.summary);
      }
      
      if (parsed.skills && Array.isArray(parsed.skills) && parsed.skills.length > 0) {
        setSkills(parsed.skills);
      }
      
      if (parsed.workHistory && Array.isArray(parsed.workHistory) && parsed.workHistory.length > 0) {
        setWorkHistory(parsed.workHistory);
      }
      
      if (parsed.education && Array.isArray(parsed.education) && parsed.education.length > 0) {
        setEducation(parsed.education);
      }
      
      alert('✅ Resume parsed successfully!\n\n' +
            `Summary: ${parsed.summary ? 'Yes ✓' : 'No'}\n` +
            `Skills: ${parsed.skills?.length || 0} found\n` +
            `Work History: ${parsed.workHistory?.length || 0} jobs\n` +
            `Education: ${parsed.education?.length || 0} entries\n\n` +
            'Review the auto-filled fields below and make any edits needed.');
      
    } else {
      const error = await response.json();
      console.error('❌ API Error:', error);
      alert('❌ Failed to parse resume: ' + (error.error || 'Unknown error'));
    }
  } catch (error) {
    console.error('❌ Parse failed:', error);
    alert('❌ Failed to parse resume. Please check your connection and try again.');
  }

  setParsing(false);
}

  

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
          <p className="text-gray-600 mt-2">
            Fill out your profile to get personalized job recommendations
          </p>
        </div>

        <div className="space-y-6">

           {/* AI Resume Parser - TEXT PASTE ONLY */}
        <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader>
            <CardTitle className="flex items-center text-blue-900">
            <Sparkles className="h-5 w-5 mr-2" />
            AI Resume Parser
            </CardTitle>
            <CardDescription>
            Paste your resume and let AI auto-fill your profile in seconds
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {/* Instructions */}
            <div className="bg-white border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-900 mb-2">Quick Start:</p>
            <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                <li>Open your resume (Word or PDF)</li>
                <li>Select all text (Ctrl+A or Cmd+A) and copy (Ctrl+C or Cmd+C)</li>
                <li>Paste it in the text box below</li>
                <li>Click "Parse with AI"!</li>
            </ol>
            </div>

            {/* Text Input */}
            <div>
            <Label htmlFor="resume-input" className="text-base font-medium">
                Paste Your Resume Text
            </Label>
            <Textarea
                id="resume-input"
                placeholder="Copy and paste your entire resume here...

        Example:
        JOHN DOE
        Software Engineer | john@email.com

        SUMMARY
        Experienced developer with 5 years building web applications...

        SKILLS
        JavaScript, Python, React, Node.js, AWS...

        EXPERIENCE
        Senior Developer | Tech Corp | 2020-Present
        - Built scalable applications...
        "
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={12}
                className="font-mono text-sm mt-2"
            />
            <p className="text-xs text-gray-500 mt-1">
                {resumeText.length} characters
                {resumeText.length >= 50 ? " ✅" : " • Minimum 50 required"}
            </p>
            </div>

            {/* Parse Button */}
            <Button
            onClick={parseResumeText}
            disabled={parsing || !resumeText || resumeText.length < 50}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            size="lg"
            >
            {parsing ? (
                <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                AI is analyzing your resume...
                </>
            ) : (
                <>
                <Sparkles className="h-5 w-5 mr-2" />
                Parse Resume with AI
                </>
            )}
            </Button>

            {/* Demo Hint */}
            <div className="text-center">
            <p className="text-xs text-gray-500">
                Tip: The more detailed your resume, the better the results!
            </p>
            </div>
        </CardContent>
        </Card>
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Professional Summary</CardTitle>
              <CardDescription>A brief overview of your experience and goals</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="e.g., Full-stack developer with 3 years of experience building scalable web applications..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
              <CardDescription>Add your technical and soft skills</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Add a skill (e.g., React, Python, Leadership)"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addSkill()}
                />
                <Button onClick={addSkill}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <div
                    key={skill}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {skill}
                    <button onClick={() => removeSkill(skill)}>
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Work History */}
          <Card>
            <CardHeader>
              <CardTitle>Work History</CardTitle>
              <CardDescription>Your professional experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {workHistory.map((job, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">Position {index + 1}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeWorkHistory(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Company</Label>
                      <Input
                        placeholder="Tech Corp"
                        value={job.company}
                        onChange={(e) => updateWorkHistory(index, "company", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Job Title</Label>
                      <Input
                        placeholder="Software Engineer"
                        value={job.title}
                        onChange={(e) => updateWorkHistory(index, "title", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Start Date</Label>
                      <Input
                        type="month"
                        value={job.startDate}
                        onChange={(e) => updateWorkHistory(index, "startDate", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <Input
                        type="month"
                        value={job.endDate}
                        onChange={(e) => updateWorkHistory(index, "endDate", e.target.value)}
                        placeholder="Present"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Built web applications, led team of 3..."
                      value={job.description}
                      onChange={(e) => updateWorkHistory(index, "description", e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              ))}
              
              <Button onClick={addWorkHistory} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Work Experience
              </Button>
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle>Education</CardTitle>
              <CardDescription>Your academic background</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {education.map((edu, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">Education {index + 1}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEducation(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>School</Label>
                      <Input
                        placeholder="State University"
                        value={edu.school}
                        onChange={(e) => updateEducation(index, "school", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Degree</Label>
                      <Input
                        placeholder="Bachelor of Science"
                        value={edu.degree}
                        onChange={(e) => updateEducation(index, "degree", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Field of Study</Label>
                      <Input
                        placeholder="Computer Science"
                        value={edu.field}
                        onChange={(e) => updateEducation(index, "field", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Graduation Date</Label>
                      <Input
                        type="month"
                        value={edu.endDate}
                        onChange={(e) => updateEducation(index, "endDate", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <Button onClick={addEducation} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Education
              </Button>
            </CardContent>
          </Card>

          {/* Resume Text */}
          {/* <Card>
            <CardHeader>
              <CardTitle>Resume Text</CardTitle>
              <CardDescription>
                Paste your full resume text here (used for AI analysis)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Paste your entire resume here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={10}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card> */}

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={saveProfile} size="lg" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}