import Users from "./Users"
import Logo from "../assets/svg/logo.svg"
import BackButton from "./BackButton"
// import Settings from "./Settings"


const Team = () => {
  return (
    <>
    <div className="logo">
      <img src={Logo} alt="Your Logo" width="500px" />
    </div>
    {/* <Settings /> */}
    <div>
      <Users></Users>
    </div>
    <BackButton></BackButton>
    </>
  )
}

export default Team
