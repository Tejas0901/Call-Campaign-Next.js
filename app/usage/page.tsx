"use client";

import PageHeader from "@/components/PageHeader";
import MainLayout from "@/components/layouts/MainLayout";
import { BarChart3, Phone, PhoneCall, Users, Activity, TrendingUp } from "lucide-react";

const usageData = [
  {
    title: "Total Calls",
    value: "2,842",
    change: "+12%",
    icon: Phone,
    color: "text-blue-500",
  },
  {
    title: "Completed Calls",
    value: "2,431",
    change: "+8%",
    icon: PhoneCall,
    color: "text-green-500",
  },
  {
    title: "Success Rate",
    value: "85.6%",
    change: "+3.2%",
    icon: TrendingUp,
    color: "text-orange-500",
  },
  {
    title: "Active Users",
    value: "142",
    change: "+5%",
    icon: Users,
    color: "text-purple-500",
  },
];

const usageHistory = [
  { date: "Dec 1", calls: 120 },
  { date: "Dec 2", calls: 195 },
  { date: "Dec 3", calls: 142 },
  { date: "Dec 4", calls: 210 },
  { date: "Dec 5", calls: 180 },
  { date: "Dec 6", calls: 240 },
  { date: "Dec 7", calls: 280 },
  { date: "Dec 8", calls: 220 },
  { date: "Dec 9", calls: 190 },
  { date: "Dec 10", calls: 260 },
  { date: "Dec 11", calls: 310 },
  { date: "Dec 12", calls: 290 },
  { date: "Dec 13", calls: 340 },
  { date: "Dec 14", calls: 285 },
  { date: "Dec 15", calls: 320 },
];

export default function UsagePage() {
  return (
    <MainLayout>
      <div className="p-6">
        <PageHeader 
          title="Usage" 
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {usageData.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{item.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{item.value}</p>
                    <p className="text-sm text-green-500 font-medium mt-1">{item.change}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-gray-100`}>
                    <Icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">Usage Overview</h2>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
                Daily
              </button>
              <button className="px-3 py-1 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
                Weekly
              </button>
              <button className="px-3 py-1 text-sm rounded-lg bg-orange-500 text-white">
                Monthly
              </button>
            </div>
          </div>
          
          <div className="h-64 flex items-end space-x-1">
            {usageHistory.map((item, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className="w-full bg-orange-500 rounded-t hover:bg-orange-600 transition-colors"
                  style={{ height: `${(item.calls / 400) * 100}%` }}
                ></div>
                <span className="text-xs text-gray-500 mt-2">{item.date}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calls Made</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Holiday Promotion</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">Dec 15, 2023</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">420</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">87%</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">Completed</span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Customer Survey</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">Dec 14, 2023</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">320</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">78%</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">Completed</span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Product Launch</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">Dec 13, 2023</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">580</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">92%</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700">Running</span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Follow-up Calls</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">Dec 12, 2023</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">210</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">65%</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">Scheduled</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}