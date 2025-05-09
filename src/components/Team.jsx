import Users from "./Users"
// import Logo from "../assets/svg/logo.svg"
import Logo from "../assets/images/logo2.png"
import BackButton from "./BackButton"
// import Settings from "./Settings"

const Team = () => {
  return (
    <>
      <div className="logo mt-3 mb-6">
        <img src={Logo} alt="Your Logo" width="300px" />
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
