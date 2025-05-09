import Sidebar from "../components/Sidebar"
import Users from "../components/Users"
import Stats from "../components/Stats"
// import Logo from "../assets/svg/logo.svg";
import Logo from "../assets/images/logo2.png"
import Educators from "../components/Users"
import Employees from "../components/Users"

const Dashboard = () => {
  return (
    <>
      <div className="logo mt-3 mb-6">
        <img src={Logo} alt="Your Logo" width="300px" />
      </div>
      <div className="flex">
        <Sidebar />
        <div className="container mx-auto p-4 flex-1">
          <div className="flex space-x-4">
            <Stats />
          </div>
          <Users />
          <Employees />
          <Educators />
        </div>
      </div>
    </>
  )
}

export default Dashboard
