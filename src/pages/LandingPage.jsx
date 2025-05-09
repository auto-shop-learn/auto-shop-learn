import RightBar from "../components/RightBar"
import Landing from "../assets/svg/landing.svg?react"

const LandingPage = () => {
  return (
    <div className="">
      {/* <div className="logo mt-3 mb-6">
              <img src={Logo} alt="Your Logo" width="300px" />
            </div> */}

      <Landing />
      <RightBar className="right-bar"/>
    </div>
  )
}

export default LandingPage
