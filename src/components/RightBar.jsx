import { Link } from "react-router-dom";

const RightBar = () => {
  return (
    <div className="right-bar bg-black text-white p-4 flex flex-col items-center justify-center h-full">
      <div className="flex flex-col items-center justify-center flex-grow">
        <h1 className="text-4xl font-semibold mb-4">Get Started</h1>

        <div className="flex space-x-4 mb-4">
          <Link to="/sign-in">
            <button className="bg-green-700 hover:bg-green-700 text-white py-2 px-4 rounded">
              Log In
            </button>
          </Link>

          <Link to="/sign-up">
            <button className="bg-green-700 hover:bg-green-700 text-white py-2 px-4 rounded">
              Sign Up
            </button>
          </Link>
        </div>
      </div>

      <h2 className="text-xs mb-7">
        <Link to="/policy" className="text-white hover:underline">
          Terms and conditions | privacy policy
        </Link>
      </h2>
    </div>
  );
};

export default RightBar;
