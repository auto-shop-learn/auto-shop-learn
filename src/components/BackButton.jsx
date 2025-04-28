import {useNavigate} from "react-router-dom";

const BackButton = () => {
    const navigate = useNavigate();

    return (
      <button
        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
        onClick={() => {
          navigate("/settings");
        }}
      >
        Back
      </button>
    );
  }
  
  export default BackButton;
  