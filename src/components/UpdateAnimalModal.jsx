import { useState } from "react";
import Modal from "react-modal";

Modal.setAppElement("#root"); // Set the root element for the modal

const modalStyle = {
  content: {
    width: "300px", // Adjust the width as needed
    height: "auto", // Allow the modal to expand vertically as needed
    margin: "auto", // Center the modal horizontally
    padding: "20px", // Add some padding to the modal content
  },
};

const labelStyle = {
  fontWeight: "bold",
  marginBottom: "5px",
};

const inputStyle = {
  width: "100%",
  padding: "0.5rem",
  border: "1px solid #ccc",
  borderRadius: "5px",
  marginBottom: "10px",
};

const UpdateAnimalModal = ({
  isOpen,
  onRequestClose,
  onUpdateAnimal,
  initialData,
}) => {
  const [updatedType, setUpdatedType] = useState(initialData.type);
  const [updatedColor, setUpdatedColor] = useState(initialData.color);
  const [updatedBreed, setUpdatedBreed] = useState(initialData.breed);
  const [updatedSpecies, setUpdatedSpecies] = useState(initialData.species);
  const [updatedAge, setUpdatedAge] = useState(initialData.age);

  const handleUpdate = () => {
    // Call the onUpdateAnimal function with updated data
    onUpdateAnimal({
      type: updatedType,
      color: updatedColor,
      breed: updatedBreed,
      species: updatedSpecies,
      age: updatedAge,
    });
    // Close the modal
    onRequestClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Update Animal"
      style={modalStyle}
    >
      <h2>Update Animal</h2>
      <div>
        <label style={labelStyle}>Type:</label>
        <input
          style={inputStyle}
          placeholder="New Type"
          value={updatedType}
          onChange={(e) => setUpdatedType(e.target.value)}
        />
      </div>
      <div>
        <label style={labelStyle}>Color:</label>
        <input
          style={inputStyle}
          placeholder="New Color"
          value={updatedColor}
          onChange={(e) => setUpdatedColor(e.target.value)}
        />
      </div>
      <div>
        <label style={labelStyle}>Breed:</label>
        <input
          style={inputStyle}
          placeholder="New Breed"
          value={updatedBreed}
          onChange={(e) => setUpdatedBreed(e.target.value)}
        />
      </div>
      <div>
        <label style={labelStyle}>Species:</label>
        <input
          style={inputStyle}
          placeholder="New Species"
          value={updatedSpecies}
          onChange={(e) => setUpdatedSpecies(e.target.value)}
        />
      </div>
      <div>
        <label style={labelStyle}>Age:</label>
        <input
          style={inputStyle}
          placeholder="New Age"
          value={updatedAge}
          onChange={(e) => setUpdatedAge(e.target.value)}
        />
      </div>
      <button onClick={handleUpdate}>Update</button>
    </Modal>
  );
};

export default UpdateAnimalModal;
