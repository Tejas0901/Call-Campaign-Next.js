import MainLayout from "@/components/layouts/MainLayout"
import PageHeader from "@/components/PageHeader"
import StatCard from "@/components/StatCard"
import { dashboardData } from "@/data/dashboardData"
import { Phone, PhoneCall, CheckCircle, TrendingUp } from "lucide-react"

export default function Dashboard() {
  return (
    <MainLayout>
      <PageHeader title="Dashboard" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Campaigns"
          value={dashboardData.stats.totalCampaigns}
          icon={<Phone className="w-5 h-5" />}
          trend="+12%"
          trendUp={true}
        />
        <StatCard
          title="Active Calls"
          value={dashboardData.stats.activeCalls}
          icon={<PhoneCall className="w-5 h-5" />}
          trend="+8%"
          trendUp={true}
        />
        <StatCard
          title="Completed Calls"
          value={dashboardData.stats.completedCalls}
          icon={<CheckCircle className="w-5 h-5" />}
          trend="+23%"
          trendUp={true}
        />
        <StatCard
          title="Conversion Rate"
          value={`${dashboardData.stats.conversionRate}%`}
          icon={<TrendingUp className="w-5 h-5" />}
          trend="+5%"
          trendUp={true}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Calls
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dashboardData.recentActivity.map((activity, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{activity.campaign}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        activity.status === "Running" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {activity.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{activity.calls}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{activity.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  )
}
