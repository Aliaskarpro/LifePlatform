import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Search, Plus, Filter, Trash2, Edit2 } from 'lucide-react';
import { MOCK_SCHEDULE } from '../utils/mockData';

export const SchedulePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Schedule list</h1>
          <p className="text-slate-400 mt-1">Detailed view of your classes</p>
        </div>
        <Button><Plus size={18} className="mr-2" /> Add Lesson</Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row gap-4 justify-between border-b border-slate-700/50">
          <div className="flex space-x-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            {['All', 'Today', 'Tomorrow', 'This Week', 'Next Month'].map((f, i) => (
              <Badge key={f} variant={i === 0 ? 'default' : 'info'} className={i === 0 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 cursor-pointer hover:bg-slate-700'}>{f}</Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><Filter size={16} className="mr-2"/> Filter</Button>
            <Input placeholder="Search..." icon={<Search size={16} />} className="w-full sm:w-64" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/50 text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Date & Time</th>
                  <th className="px-6 py-4 font-medium">Lesson</th>
                  <th className="px-6 py-4 font-medium">Teacher</th>
                  <th className="px-6 py-4 font-medium">Duration</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {MOCK_SCHEDULE.map(s => (
                  <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(s.startTime).toLocaleDateString()} <br/>
                      <span className="text-slate-500">{new Date(s.startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-white">{s.title}<br/><span className="text-xs text-indigo-400">{s.levelName}</span></td>
                    <td className="px-6 py-4">{s.teacherName}</td>
                    <td className="px-6 py-4">2 hrs</td>
                    <td className="px-6 py-4"><Badge variant={s.status as any}>{s.status}</Badge></td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-400"><Edit2 size={16} /></Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-red-400"><Trash2 size={16} /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
