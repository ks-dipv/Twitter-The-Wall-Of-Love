import React, { useEffect, useState } from "react";
import { BarChart, Users, FileText, MessageSquare } from "lucide-react";
import { Card, CardContent } from "../components/ui/card"; 
import CountUp from "react-countup";
import { Bar, BarChart as Chart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const Dashboard = () => {
  // State for dynamic data
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalWalls: 0,
    totalTweets: 0,
  });

  // Fetch counts from backend API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("https://your-backend-api.com/api/stats"); 
        const data = await response.json();

        setStats({
          totalUsers: data.totalUsers,
          totalWalls: data.totalWalls,
          totalTweets: data.totalTweets,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  const data = [
    { name: "Jan", walls: 50 },
    { name: "Feb", walls: 80 },
    { name: "Mar", walls: 100 },
    { name: "Apr", walls: 120 },
    { name: "May", walls: 140 },
    { name: "Jun", walls: 160 },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Users */}
        <Card className="p-4 flex items-center space-x-4 shadow-md">
          <Users className="h-6 w-6 text-blue-500" />
          <div>
            <p className="text-gray-600">Total Users</p>
            <p className="text-2xl font-semibold">
              <CountUp end={stats.totalUsers} duration={2} />
            </p>
          </div>
        </Card>

        {/* Total Walls */}
        <Card className="p-4 flex items-center space-x-4 shadow-md">
          <FileText className="h-6 w-6 text-green-500" />
          <div>
            <p className="text-gray-600">Total Walls</p>
            <p className="text-2xl font-semibold">
              <CountUp end={stats.totalWalls} duration={2} />
            </p>
          </div>
        </Card>

        {/* Total Tweets */}
        <Card className="p-4 flex items-center space-x-4 shadow-md">
          <MessageSquare className="h-6 w-6 text-purple-500" />
          <div>
            <p className="text-gray-600">Total Tweets</p>
            <p className="text-2xl font-semibold">
              <CountUp end={stats.totalTweets} duration={2} />
            </p>
          </div>
        </Card>
      </div>

      {/* Chart Section */}
      <div className="mt-6 p-4 bg-white rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Wall Creation Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <Chart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="walls" fill="#3b82f6" />
          </Chart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
