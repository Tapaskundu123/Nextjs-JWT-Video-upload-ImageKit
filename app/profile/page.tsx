'use client'

import axios from "axios";
import { useRouter } from "next/navigation";
import { NextResponse } from "next/server";

export default function ProfilePage() {


    const router= useRouter();
    const handleLogout= async()=>{

        try {
            
            const response= await axios.get('/api/user/logout');

            if(response.status===200){

                router.push('/User/login');
            }
        } catch (error) {
            console.log(error.message);
            NextResponse.json({success:false,message:"swg"});
        }
    }
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-[350px] text-center">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-tr from-indigo-400 to-blue-500 flex items-center justify-center text-white text-3xl font-semibold shadow-md">
          T
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Tapas Kundu</h1>
        <p className="text-gray-500 text-sm mb-5">tapas@example.com</p>

        <div className="border-t border-gray-200 my-4"></div>

        <div className="space-y-2 text-left text-gray-600">
          <p>
            <span className="font-medium text-gray-800">Joined:</span> Nov 2025
          </p>
          <p>
            <span className="font-medium text-gray-800">Role:</span> Full Stack Developer
          </p>
          <p>
            <span className="font-medium text-gray-800">Location:</span> India 🇮🇳
          </p>
        </div>

        <button className="mt-6 w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-xl transition-all duration-200 shadow-md">
          Edit Profile
        </button>

        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}
