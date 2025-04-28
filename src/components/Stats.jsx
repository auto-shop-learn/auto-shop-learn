import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { getDocs, collection } from "firebase/firestore";

const Stats = () => {
  const [livestockCount, setLivestockCount] = useState(0);
  const [cropCount, setCropCount] = useState(0);
  const [inventoryCount, setInventoryCount] = useState(0);
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const livestockCollection = collection(db, 'animals');
        const cropCollection = collection(db, 'crops');
        const inventoryCollection = collection(db, 'inventory');
        const userCollection = collection(db, 'users');

        const livestockData = await getDocs(livestockCollection);
        const cropData = await getDocs(cropCollection);
        const inventoryData = await getDocs(inventoryCollection);
        const userData = await getDocs(userCollection);

        setLivestockCount(livestockData.size);
        setCropCount(cropData.size);
        setInventoryCount(inventoryData.size);
        setUserCount(userData.size);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="h-32 w-44 border border-gray-300 p-4 rounded-lg bg-red-200">
        <h3 className="text-lg font-semibold">Livestock count</h3>
        <p className="text-3xl font-bold">{livestockCount}</p>
      </div>
      <div className="h-32 w-44 border border-gray-300 p-4 rounded-lg bg-green-200">
        <h3 className="text-lg font-semibold">Crop count</h3>
        <p className="text-3xl font-bold">{cropCount}</p>
      </div>
      <div className="h-32 w-44 border border-gray-300 p-4 rounded-lg bg-yellow-200 mb-0.5">
        <h3 className="text-lg font-semibold">Inventory count</h3>
        <p className="text-3xl font-bold">{inventoryCount}</p>
      </div>
      <div className="h-32 w-44 border border-gray-300 p-4 rounded-lg bg-blue-200 mt-0.5">
        <h3 className="text-lg font-semibold">User count</h3>
        <p className="text-3xl font-bold">{userCount}</p>
      </div>
    </div>
  );
};

export default Stats;
