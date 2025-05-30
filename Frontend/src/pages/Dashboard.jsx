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
import { toast, ToastContainer } from "react-toastify"; 

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
  const [statsError, setStatsError] = useState(null); 
  const [userError, setUserError] = useState(null); 
  const [currentTime, setCurrentTime] = useState(new Date());

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
        setStatsError(errMsg);
      }
    };

    const fetchUser = async () => {
      try {
        const response = await getUser();
        setUser(response.data);
      } catch (err) {
        const errMsg = "User not found. Please log in to continue.";
        setUserError(errMsg);
        toast.error(errMsg, {
          position: "top-right",
          autoClose: 5000,
        });
      }
    };

    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchUser()]);
      setLoading(false);
    };

    fetchData();

    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Clean up the interval when component unmounts
    return () => clearInterval(timeInterval);
  }, []);

  if (loading) return <Skeleton className="h-96 w-full" />;
  if (userError || statsError) {
    return (
      <div className="p-6 space-y-6">
        <p className="text-red-500 text-center text-lg">
          {userError || statsError}
        </p>
        <ToastContainer />
      </div>
    );
  }

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
  ];

  // Format date for better display
  const formattedDate = currentTime.toLocaleDateString();
  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="p-6 space-y-6">
      <div className="p-6 space-y-6 bg-gray-100 min-h-screen">
        {/* Profile & Date - Fixed layout */}
        <Card className="bg-white rounded-lg shadow-lg">
          <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
                <p className="text-sm text-gray-500 truncate max-w-xs">
                  {user?.email}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-600 font-medium whitespace-nowrap">
                {formattedDate}
              </p>
              <p className="text-gray-600 font-medium whitespace-nowrap">
                {formattedTime}
              </p>
            </div>
          </div>
        </Card>

        <h1 className="text-3xl font-bold text-gray-800 text-center">
          Dashboard
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 flex items-center space-x-4 shadow-lg bg-white hover:shadow-xl transition">
            <Users className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-gray-600">Total Walls</p>
              <p className="text-3xl font-bold">{stats.totalWalls}</p>
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
