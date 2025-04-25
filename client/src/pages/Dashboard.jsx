import useAuth from "../hooks/useAuth.js"
import ProviderDashboard from "../components/ProviderDashboard";
import UserDashboard from "../components/UserDashboard.jsx";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <>
      {user.role === "provider" ? (
        <ProviderDashboard />
      ) : (
        <UserDashboard />
      )}
    </>
  );
};


export default Dashboard;
