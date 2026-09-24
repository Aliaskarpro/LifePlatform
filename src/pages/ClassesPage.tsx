import React from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const ClassesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Classes</h1>
        <p className="text-slate-400 mt-1">Browse your courses and lessons</p>
      </div>

      <div className="flex border-b border-slate-700">
        <button className="px-6 py-3 border-b-2 border-indigo-500 text-indigo-400 font-medium">Courses</button>
        <button className="px-6 py-3 border-b-2 border-transparent text-slate-400 hover:text-slate-200">All Lessons</button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map(i => (
          <Card key={i} className="overflow-hidden hover:border-indigo-500/50 transition-colors">
            <div className="h-32 bg-gradient-to-br from-indigo-600 to-purple-700"></div>
            <CardContent className="p-6 relative">
              <Badge className="absolute -top-3 left-6 bg-slate-900 border border-slate-700 text-white">Intermediate</Badge>
              <h3 className="text-xl font-bold text-white mt-2">Advanced Frontend {i}</h3>
              <p className="text-sm text-slate-400 mt-2 mb-4">Master modern web development with this comprehensive course covering advanced patterns.</p>
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Progress</span>
                  <span className="text-indigo-400">12 / 24 Lessons</span>
                </div>
                <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 w-1/2"></div>
                </div>
              </div>
              <Button className="w-full">Continue Learning</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
