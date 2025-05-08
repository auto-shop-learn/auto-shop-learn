// Educators.jsx
import { useState, useEffect } from "react";
import { db } from "../config/firebase";
import { getDocs, collection } from "firebase/firestore";
import DeleteIcon from "../assets/svg/deleteIcon.svg?react";

const Educators = () => {
  const [users, setUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const usersCollectionRef = collection(db, "users");

  const fetchUsers = async () => {
    try {
      const data = await getDocs(usersCollectionRef);
      const allUsers = data.docs.map((doc) => ({
        ...doc.data(), id: doc.id, isSelected: false
      }));
      // Filter only educators (case-insensitive)
      setUsers(allUsers.filter((u) => u.role?.toLowerCase() === "educator"));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    setUsers((prev) => prev.map((u) => ({ ...u, isSelected: !selectAll })));
  };

  const handleSelection = (id) => {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, isSelected: !u.isSelected } : u));
  };

  return (
    <div className="container mx-auto py-4">
      <h2 className="text-xl font-semibold mb-4">Educators</h2>
      <table className="w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th>
              <input type="checkbox" onChange={handleSelectAll} checked={selectAll} />
            </th>
            <th>Name</th>
            <th>Email</th>
            <th>Department</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t">
              <td>
                <input type="checkbox" checked={user.isSelected} onChange={() => handleSelection(user.id)} />
              </td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.department}</td>
              <td>
                <div onClick={() => deleteUser(user.id)}>
                  <DeleteIcon width="20px" height="20px" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Educators;

