import MainLayout from "@/components/layouts/MainLayout"
import PageHeader from "@/components/PageHeader"
import StatCard from "@/components/StatCard"
import { analyticsData } from "@/data/analyticsData"
import { Phone, CheckCircle, XCircle, BarChart3 } from "lucide-react"

export default function Analytics() {
  return (
    <MainLayout>
      <PageHeader title="Analytics" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Calls" value={analyticsData.summary.totalCalls} icon={<Phone className="w-5 h-5" />} />
        <StatCard
          title="Answered Calls"
          value={analyticsData.summary.answeredCalls}
          icon={<CheckCircle className="w-5 h-5" />}
        />
        <StatCard
          title="Missed Calls"
          value={analyticsData.summary.missedCalls}
          icon={<XCircle className="w-5 h-5" />}
        />
        <StatCard
          title="Avg Duration"
          value={analyticsData.summary.avgDuration}
          icon={<BarChart3 className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Call Performance Chart</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Chart Placeholder</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Chart Placeholder</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Campaign Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivered
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Answered
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversion Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analyticsData.campaignPerformance.map((campaign, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{campaign.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{campaign.delivered}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{campaign.answered}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{campaign.conversionRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  )
}
