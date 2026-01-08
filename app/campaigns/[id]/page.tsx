"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Mail,
  MessageSquare,
  Clock,
  Users,
  TrendingUp,
  Eye,
  MousePointerClick,
  ShoppingCart,
} from "lucide-react";
import { campaignData } from "@/data/campaignData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import CandidatesTable, {
  CandidateRow,
} from "@/components/ui/candidates-table";

export default function CampaignDetailPage() {
  const params = useParams();
  const campaignId = parseInt(params.id as string);

  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [candidates, setCandidates] = useState<CandidateRow[]>([
    {
      id: "1",
      name: "Alice Johnson",
      phone: "+1 (555) 210-1122",
      email: "alice.johnson@example.com",
      resume: null,
      resumeFileName: "alice-johnson.pdf",
      role: "Sales Lead",
      company: "Acme Corp",
    },
    {
      id: "2",
      name: "Brian Lee",
      phone: "+1 (555) 455-7821",
      email: "brian.lee@example.com",
      resume: null,
      resumeFileName: "brian-lee.pdf",
      role: "Account Executive",
      company: "Northwind",
    },
    {
      id: "3",
      name: "Chloe Patel",
      phone: "+1 (555) 318-0044",
      email: "chloe.patel@example.com",
      resume: null,
      resumeFileName: "chloe-patel.pdf",
      role: "BDR",
      company: "Globex",
    },
    {
      id: "4",
      name: "Daniel Kim",
      phone: "+1 (555) 980-2211",
      email: "daniel.kim@example.com",
      resume: null,
      resumeFileName: "daniel-kim.pdf",
      role: "SDR",
      company: "Initech",
    },
    {
      id: "5",
      name: "Emma Garcia",
      phone: "+1 (555) 441-7788",
      email: "emma.garcia@example.com",
      resume: null,
      resumeFileName: "emma-garcia.pdf",
      role: "Marketing Ops",
      company: "Soylent",
    },
    {
      id: "6",
      name: "Felix Braun",
      phone: "+1 (555) 667-9023",
      email: "felix.braun@example.com",
      resume: null,
      resumeFileName: "felix-braun.pdf",
      role: "Product Marketing",
      company: "Umbrella",
    },
    {
      id: "7",
      name: "Grace Liu",
      phone: "+1 (555) 744-1199",
      email: "grace.liu@example.com",
      resume: null,
      resumeFileName: "grace-liu.pdf",
      role: "Customer Success",
      company: "Vehement",
    },
    {
      id: "8",
      name: "Hector Ramirez",
      phone: "+1 (555) 215-6644",
      email: "hector.ramirez@example.com",
      resume: null,
      resumeFileName: "hector-ramirez.pdf",
      role: "Sales Ops",
      company: "Stark Industries",
    },
    {
      id: "9",
      name: "Isabella Rossi",
      phone: "+1 (555) 839-7755",
      email: "isabella.rossi@example.com",
      resume: null,
      resumeFileName: "isabella-rossi.pdf",
      role: "AE",
      company: "Wayne Corp",
    },
    {
      id: "10",
      name: "Jack Wilson",
      phone: "+1 (555) 930-4433",
      email: "jack.wilson@example.com",
      resume: null,
      resumeFileName: "jack-wilson.pdf",
      role: "Outbound SDR",
      company: "Wonka Co",
    },
  ]);

  useEffect(() => {
    // Find the campaign with the matching ID
    const foundCampaign = campaignData.campaigns.find(
      (camp: any) => camp.id === campaignId
    );
    setCampaign(foundCampaign);
    setLoading(false);
  }, [campaignId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-semibold">Loading...</div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-semibold text-red-500">
          Campaign not found
        </div>
      </div>
    );
  }

  const getIconComponent = (icon: string) => {
    switch (icon) {
      case "Mail":
        return <Mail className="w-5 h-5 text-white" />;
      case "MessageSquare":
        return <MessageSquare className="w-5 h-5 text-white" />;
      default:
        return <Mail className="w-5 h-5 text-white" />;
    }
  };

  const statusStyles: Record<string, { container: string; dot: string }> = {
    Running: { container: "bg-green-50 text-green-700", dot: "bg-green-500" },
    Closed: { container: "bg-red-50 text-red-700", dot: "bg-red-500" },
    Paused: { container: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  };

  const statusClass = statusStyles[campaign.status] || {
    container: "bg-gray-50 text-gray-700",
    dot: "bg-gray-500",
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} />
      <div className="flex-1 flex flex-col">
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`w-14 h-14 ${campaign.iconBg} rounded-xl flex items-center justify-center`}
                >
                  {getIconComponent(campaign.icon)}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {campaign.name}
                  </h1>
                  <div className="flex items-center gap-3 mt-2">
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded-full flex items-center gap-1 ${statusClass.container}`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${statusClass.dot}`}
                      ></span>
                      {campaign.status}
                    </span>
                    <span className="text-gray-600">
                      {campaign.messagesCount} messages
                    </span>
                    <span className="text-gray-600">
                      {campaign.actionsCount} actions
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 max-w-2xl">{campaign.description}</p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {campaign.tags.map((tag: string, index: number) => (
                <Badge key={index} variant="secondary" className="px-3 py-1">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Delivered
                  </CardTitle>
                  <Mail className="w-4 h-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {campaign.metrics.delivered}
                  </div>
                  <p className="text-xs text-gray-500">
                    {campaign.metrics.deliveredPeriod}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Opened</CardTitle>
                  <Eye className="w-4 h-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {campaign.metrics.opened}
                  </div>
                  <p className="text-xs text-gray-500">
                    {campaign.metrics.openedPeriod}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Clicked</CardTitle>
                  <MousePointerClick className="w-4 h-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {campaign.metrics.clicked}
                  </div>
                  <p className="text-xs text-gray-500">
                    {campaign.metrics.clickedPeriod}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Converted
                  </CardTitle>
                  <ShoppingCart className="w-4 h-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {campaign.metrics.converted}
                  </div>
                  <p className="text-xs text-gray-500">
                    {campaign.metrics.convertedPeriod}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button variant="default">Edit Campaign</Button>
              <Button variant="outline">View Analytics</Button>
              <Button variant="outline">Export Data</Button>
            </div>

            {/* Candidates Table */}
            <div className="mt-10 bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Candidates
                  </h2>
                  <p className="text-sm text-gray-600">
                    Uploaded candidate data for this campaign
                  </p>
                </div>
                <span className="text-sm text-gray-500">10 total</span>
              </div>
              <div className="p-6">
                <CandidatesTable
                  data={candidates}
                  onDataChange={setCandidates}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
