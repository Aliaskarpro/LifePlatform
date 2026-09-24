import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Play, FileText, Download, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LessonDetailPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <Link to="/classes" className="inline-flex items-center text-sm text-slate-400 hover:text-white mb-4 transition-colors">
          <ArrowLeft size={16} className="mr-1" /> Back to Classes
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white">Advanced React Patterns</h1>
            <div className="flex gap-3 mt-2">
              <Badge variant="info">Advanced</Badge>
              <Badge variant="default">2 hours</Badge>
            </div>
          </div>
          <Button variant="outline" className="text-green-400 border-green-400 hover:bg-green-400/10">
            <CheckCircle size={18} className="mr-2" /> Mark Completed
          </Button>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-700/50 pb-2">
        <button className="text-indigo-400 font-medium px-2 py-1 border-b-2 border-indigo-500">Content</button>
        <button className="text-slate-400 hover:text-slate-200 px-2 py-1 border-b-2 border-transparent">Materials</button>
        <button className="text-slate-400 hover:text-slate-200 px-2 py-1 border-b-2 border-transparent">Homework</button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <div className="aspect-video bg-slate-900 border-b border-slate-700/50 flex items-center justify-center relative group cursor-pointer">
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
              <div className="h-16 w-16 rounded-full bg-indigo-600/90 flex items-center justify-center text-white z-10 group-hover:scale-110 transition-transform shadow-lg">
                <Play fill="currentColor" size={24} className="ml-1" />
              </div>
            </div>
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold text-white mb-4">Lesson Overview</h3>
              <div className="prose prose-invert max-w-none text-slate-300">
                <p>In this lesson, we will cover advanced patterns in React, including:</p>
                <ul>
                  <li>Compound Components</li>
                  <li>Control Props</li>
                  <li>Custom Hooks</li>
                  <li>Render Props</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Materials</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <a href="#" className="flex items-center p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors border border-slate-700/50 group">
                <FileText className="text-blue-400 mr-3" size={20} />
                <span className="flex-1 text-sm text-slate-200 group-hover:text-white">Presentation Slides.pdf</span>
                <Download size={16} className="text-slate-500 group-hover:text-white" />
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
