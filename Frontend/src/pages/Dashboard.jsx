import { useEffect, useState } from "react";
import { Users, FileText, MessageSquare } from "lucide-react";
import { Card } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import {
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { getUser, totalData } from "../services/api";

const COLORS = ["#6ea7be", "#7997a3", "#1c5d77"];

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalWalls: 0,
    publicWalls: 0,
    privateWalls: 0,
    wallTrend: [],
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await totalData();
        setStats(response.data);
      } catch (err) {
        const errMsg =
          err.response && typeof err.response.data === "object"
            ? err.response.data.message || JSON.stringify(err.response.data)
            : err.message;
        setError(errMsg);
      } finally {
        setLoading(false);
      }
    };

    const fetchUser = async () => {
      try {
        const response = await getUser();
        setUser(response.data);
      } catch (err) {
        console.error("Error fetching user data", err);
      }
    };

    fetchStats();
    fetchUser();

    const dateInterval = setInterval(() => setCurrentDate(new Date()), 1000);
    return () => clearInterval(dateInterval);
  }, []);

  if (loading) return <Skeleton className="h-96 w-full" />;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  const publicPercentage = stats.totalWalls
    ? ((stats.publicWalls / stats.totalWalls) * 100).toFixed(1)
    : 0;
  const privatePercentage = stats.totalWalls
    ? ((stats.privateWalls / stats.totalWalls) * 100).toFixed(1)
    : 0;

  // Pie Chart Data
  const pieChartData = [
    { name: "Public Walls", value: stats.publicWalls },
    { name: "Private Walls", value: stats.privateWalls },
    { name: "Total Walls", value: stats.totalWalls },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Top Section: Profile & Date */}
      <div className="p-6 space-y-6 bg-gray-100 min-h-screen">
        {/* Profile & Date */}
        <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-lg">
          <div className="flex items-center space-x-4">
            <img
              src={user?.profile_pic || "/default-avatar.png"}
              alt="Profile"
              className="w-14 h-14 rounded-full border-2 border-blue-400"
            />
            <div>
              <p className="text-lg font-semibold text-gray-800">
                {user?.name || "Guest"}
              </p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
          <p className="text-gray-600 font-medium">
            {currentDate.toLocaleDateString()}{" "}
            {currentDate.toLocaleTimeString()}
          </p>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 text-center">
          Dashboard
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 flex items-center space-x-4 shadow-lg bg-white hover:shadow-xl transition">
            <Users className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-gray-600">Total Walls</p>
              <p className="text-3xl font-bold">{stats.totalWalls} </p>
            </div>
          </Card>
          <Card className="p-6 flex items-center space-x-4 shadow-lg bg-white hover:shadow-xl transition">
            <FileText className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-gray-600">Total Public Walls</p>
              <p className="text-3xl font-bold">{stats.publicWalls}</p>
            </div>
          </Card>
          <Card className="p-6 flex items-center space-x-4 shadow-lg bg-white hover:shadow-xl transition">
            <MessageSquare className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-gray-600">Total Private Walls</p>
              <p className="text-3xl font-bold">{stats.privateWalls}</p>
            </div>
          </Card>
        </div>

        {/* Percentage Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 flex items-center justify-between shadow-lg bg-white hover:shadow-xl transition">
            <div>
              <p className="text-gray-600">Public Walls Percentage</p>
              <p className="text-3xl font-bold text-black">
                {publicPercentage}%
              </p>
            </div>
          </Card>
          <Card className="p-6 flex items-center justify-between shadow-lg bg-white hover:shadow-xl transition">
            <div>
              <p className="text-gray-600">Private Walls Percentage</p>
              <p className="text-3xl font-bold text-black">
                {privatePercentage}%
              </p>
            </div>
          </Card>
        </div>

        {/* Pie Chart for Walls Distribution */}
        <Card className="p-4 bg-white rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Walls Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {pieChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
