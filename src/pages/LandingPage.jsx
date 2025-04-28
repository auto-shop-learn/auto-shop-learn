import RightBar from "../components/RightBar"
import Landing from "../assets/svg/landing.svg?react"

const LandingPage = () => {
  return (
    <div className="">
      {/* <div className="logo">
        <img src={Logo} alt="Your Logo" width="500px" />
      </div> */}

      <Landing />
      <RightBar className="right-bar"/>
    </div>
  )
}

export default LandingPage
