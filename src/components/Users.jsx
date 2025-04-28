import { useState, useEffect } from "react"
import { db } from "../config/firebase"
import { getDocs, collection } from "firebase/firestore"
import DeleteIcon from "../assets/svg/deleteIcon.svg?react"


const Users = () => {
  const [userList, setUserList] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [selectAll, setSelectAll] = useState(false)
  const [userCount, setUserCount] = useState(0)

  const usersCollectionRef = collection(db, "users")

  const getUserList = async () => {
    try {
      const data = await getDocs(usersCollectionRef)
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        isSelected: false, // Add isSelected property to track selection
      }))
      setUserList(filteredData)
      setUserCount(filteredData.length)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    getUserList()
  }, [])

  // Function to toggle individual user selection
  const handleUserSelection = (userId) => {
    const updatedUsers = userList.map((user) =>
      user.id === userId ? { ...user, isSelected: !user.isSelected } : user
    )
    setUserList(updatedUsers)
  }

  // Function to toggle select all
  const handleSelectAll = () => {
    setSelectAll(!selectAll)
    const updatedUsers = userList.map((user) => ({
      ...user,
      isSelected: !selectAll,
    }))
    setUserList(updatedUsers)
  }

  // Determine whether to show "All Selected" or "Select All" based on user selections
  const isAllSelected = userList.every((user) => user.isSelected)

  const getStatusCellStyle = (status) => {
    if (status === "active") {
      return "bg-green-200 text-green-700 rounded-full"
    } else if (status === "inactive") {
      return "bg-red-200 text-red-700 rounded-full"
    }
    // You can add additional conditions if needed
  }

  return (
    <div className="flex">
      <div className="container mx-auto py-4">
        <h1 className="text-2xl font-semibold mb-4 flex items-center">
          Team Members
          <span className="bg-green-200 text-green-700 px-1 py-1 ml-2 rounded-full text-sm">
            {userCount} users
          </span>
        </h1>
        <div className="mt-2">
          <table className="w-full border-collapse border border-gray-300 table-space-left">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border border-gray-300">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={isAllSelected}
                  />
                </th>
                <th className="p-2 border border-gray-300">Name</th>
                <th className="p-2 border border-gray-300">Role</th>
                <th className="p-2 border border-gray-300">Status</th>
                <th className="p-2 border border-gray-300">Email</th>
                <th className="p-2 border border-gray-300">Teams</th>
                <th className="p-2 border border-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {userList.map((user) => (
                <tr key={user.id}>
                  <td className="p-2 border border-gray-300">
                    <input
                      type="checkbox"
                      onChange={() => handleUserSelection(user.id)}
                      checked={user.isSelected}
                    />
                  </td>
                  <td className="p-2 border border-gray-300">{user.Name}</td>
                  <td className="p-2 border border-gray-300">{user.Role}</td>
                  <td
                    className={`p-2 border border-gray-300 ${getStatusCellStyle(
                      user.Status
                    )}`}
                  >
                    {user.Status}
                  </td>
                  <td className="p-2 border border-gray-300">{user.Email}</td>
                  <td className="p-2 border border-gray-300">{user.Teams}</td>
                  <td className="p-2 border border-gray-300">
                    <div onClick={() => deleteUser(animal.id)}>
                      <DeleteIcon fill="#ffffff" width="20px" height="20px" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Users
