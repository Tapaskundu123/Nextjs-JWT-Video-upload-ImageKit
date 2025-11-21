"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const router = useRouter();

  const [userData, setUserData] = useState(null); // <-- STATE

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/user/profileInfo");
        console.log(res.data);
        setUserData(res.data.user); // <-- SAVE TO STATE
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await axios.get("/api/user/logout");

      if (response.status === 200) {
        router.push("/User/login");
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // If data is loading
  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen text-xl">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-[350px] text-center">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-tr from-indigo-400 to-blue-500 flex items-center justify-center text-white text-3xl font-semibold shadow-md">
          {userData.email.charAt(0).toUpperCase()}
        </div>
        <p className="text-gray-500 text-sm mb-5">{userData.email}</p>

        <div className="border-t border-gray-200 my-4"></div>

        <div className="space-y-2 text-left text-gray-600">
          <p>
            <span className="font-medium text-gray-800">Joined:</span>{" "}
            {new Date(userData.createdAt).toDateString() || 'none'}
          </p>

          <p>
            <span className="font-medium text-gray-800">Role:</span> User
          </p>

          <p>
            <span className="font-medium text-gray-800">Location:</span> India 🇮🇳
          </p>
        </div>

        <Link href="/AllVideos">
  <span className="text-indigo-600 font-semibold hover:underline hover:text-indigo-800">
    All Videos
  </span>
</Link>
        <button className="mt-6 w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-xl transition-all duration-200 shadow-md">
          Edit Profile
        </button>

        <button
          onClick={handleLogout}
          className="mt-3 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl transition-all duration-200 shadow-md"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
