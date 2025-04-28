import { useState, useEffect } from "react"
import { db, auth } from "../config/firebase"
import { Auth } from "../components/auth"
import Sidebar from "../components/Sidebar"
import {
  getDocs,
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore"
import ExtLinkIcon from "../assets/svg/extLinkIcon.svg?react"
import DeleteIcon from "../assets/svg/deleteIcon.svg?react"
import EditIcon from "../assets/svg/editIcon.svg?react"
import Logo from "../assets/svg/logo.svg"
import { format } from "date-fns";
import { Link } from "react-router-dom"


const Inventory = () => {
  const [machineList, setMachineList] = useState([])

  const [newMachineType, setNewMachineType] = useState("")
  const [newMachineCost, setNewMachineCost] = useState("")

  const [updatedQuantity, setUpdatedQuantity] = useState("")
  const [updatedType, setUpdatedType] = useState("")
  const [updatedCost, setUpdatedCost] = useState("")

  const inventoryCollectionRef = collection(db, "inventory")

  const getMachineList = async () => {
    try {
      const data = await getDocs(inventoryCollectionRef)
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }))
      console.log(filteredData)
      setMachineList(filteredData)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    getMachineList()
  }, [])

  const onSubmitMachine = async (e) => {
    try {
      await addDoc(inventoryCollectionRef, {
        type: newMachineType,
        costPerMachine: newMachineCost,
        userId: auth?.currentUser?.uid,
      })
      getMachineList()
    } catch (error) {
      console.error(error)
    }
  }

  const deleteMachine = async (id) => {
    const machineDoc = doc(db, "inventory", id)
    await deleteDoc(machineDoc)
    getMachineList()
  }
  const updateMachine = async (id) => {
    const machineDoc = doc(db, "inventory", id)
    await updateDoc(machineDoc, {
      machineType: updatedType,
      costPerMachine: updatedCost,
      quantity: updatedQuantity,
    })
    getMachineList()
  }

  return (
    <>
      <div className="logo">
        <img src={Logo} alt="Your Logo" width="500px" />
      </div>
      <div className="flex">
        <Sidebar />
        <div className="container mx-auto py-4">
          <div className="flex items-center space-x-4">
            {/* <input
              className="p-2 border border-gray-300 rounded"
              placeholder="Machine type"
              onChange={(e) => setNewMachineType(e.target.value)}
            />
            <input
              className="p-2 border border-gray-300 rounded"
              placeholder="Cost"
              type="text"
              onChange={(e) => setNewMachineCost(e.target.value)}
            /> */}
              <Link to='/add-inventory'>
            <button
              className="p-2 bg-green-700 text-white rounded hover:bg-green-700"
              onClick={() => {
                // onSubmitMachine
              }}
            >
              + Add Machine
            </button>
              {/* <ExtLinkIcon fill="#ffffff" width={20} height={20} /> */}
            </Link>
            
          </div>
          <div className="mt-2">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-blue-200">
                  {/* <th className="p-0.5 border border-gray-300 w-1/3">Item ID</th>  */}
                  <th className="p-0.5 border border-gray-300 w-1/3">Type</th> 
                  <th className="p-0.5 border border-gray-300 w-1/3">Purchase Cost</th> 
                  <th className="p-0.5 border border-gray-300 w-1/3">Condition</th> 
                  <th className="p-0.5 border border-gray-300 w-1/3">Quantity</th> 
                  {/* <th className="p-0.5 border border-gray-300 w-1/3">Purchase Date</th>  */}
                  {/* <th className="p-0.5 border border-gray-300 w-1/3">Maintenance Schedule</th>  */}
                  {/* <th className="p-0.5 border border-gray-300 w-1/3">Last Maintenance Date</th>  */}
                  {/* <th className="p-0.5 border border-gray-300 w-1/3">Warranty End Date</th>  */}
                  {/* <th className="p-0.5 border border-gray-300 w-1/3">Last Update</th>  */}
                  <th className="p-0.5 border border-gray-300 w-1/3">Actions</th> 
                </tr>
              </thead>
              <tbody>
                {machineList.map((machine) => (
                  <tr key={machine.id}>
                    {/* <td className="p-0.5 border border-gray-300">{machine.itemID}</td>  */}
                    <td className="p-0.5 border border-gray-300">{machine.machineType}</td> 
                    <td className="p-0.5 border border-gray-300">{machine.costPerMachine}</td> 
                    <td className="p-0.5 border border-gray-300">{machine.condition}</td> 
                    <td className="p-0.5 border border-gray-300">{machine.quantity}</td>
                    {/* <td className="p-0.5 border border-gray-300">{machine.purchaseDate ? format(machine.purchaseDate.toDate(), "MM/dd/yyyy") : "N/A"}</td> */}
                    {/* <td className="p-0.5 border border-gray-300">{machine.maintenanceSchedule ? format(machine.maintenanceSchedule.toDate(), "MM/dd/yyyy") : "N/A"}</td> */}
                    {/* <td className="p-0.5 border border-gray-300">{machine.lastMaintenanceDate ? format(machine.lastMaintenanceDate.toDate(), "MM/dd/yyyy") : "N/A"}</td> */}
                    {/* <td className="p-0.5 border border-gray-300">{machine.warrantyEndDate ? format(machine.warrantyEndDate.toDate(), "MM/dd/yyyy") : "N/A"}</td> */}
                    {/* <td className="p-0.5 border border-gray-300">{machine.lastUpdate ? format(machine.lastUpdate.toDate(), "MM/dd/yyyy") : "N/A"}</td> */}
                    
                    <td className="p-0.5 border border-gray-300 flex space-x-2">
                      <div onClick={() => deleteMachine(machine.id)}>
                        <DeleteIcon fill="#ffffff" width="20px" height="20px" />
                      </div>
                      <div onClick={(e) => updateMachine(machine.id)}>
                        <EditIcon fill="#ffffff" width="20px" height="20px" />
                      </div>
                      {/* <input
                        className="p-0.5 border border-gray-300 rounded"
                        placeholder="New Type"
                        onChange={(e) => setUpdatedType(e.target.value)}
                      />
                      <input
                        className="p-0.5 border border-gray-300 rounded"
                        placeholder="New Cost"
                        onChange={(e) => setUpdatedCost(e.target.value)}
                      />
                      <input
                        className="p-0.5 border border-gray-300 rounded"
                        placeholder="New Quantity"
                        onChange={(e) => setUpdatedQuantity(e.target.value)}
                      /> */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}

export default Inventory
