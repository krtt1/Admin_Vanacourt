"user client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";



const LoginPage = () => {
    return (

        



        <div className="flex items-center justify-center min-h-screen w-full p-4 sm:p-6 lg:p-8 bg-gray-100">
            <div className="bg-white p-8 sm:p-10 rpunded-xl shadow-lg w-full max-w-md border border-gray-200">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">เข้าสู่ระบบ</h2>
                <form>
                    <div className="">
                        <label htmlFor="username" className="block text-gray-700 text-sm font-medium mb-2">
                            ชื่อผู้ใช้
                        </label>
                        <input 
                        type="text"
                        id="username"
                        name="username"
                        placeholder="ป้อนชื่อผู้ใช้"
                        className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
                        required
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">
                            รหัสผ่าน
                        </label>
                        <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="ป้อนรหัสผ่านของคุณ"
                        className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
                        required
                        />
                    </div>
                    <div className="">
                        <label className="flex items-center text-gray-600 text-sm">
                            <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"/>
                            <span className="ml-2">จดจำฉันไว้</span>
                        </label>
                        <a href="/admin" className="text-blue-600 hover:text-blue-800 text-sm font-medium transition duration-200 ease-in-out">ลืมรหัสผ่าน</a>
                    </div>
                    <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ease-in-out shadow-md"
                    >เข้าสู่ระบบ</button>
                </form>
                <div className="text-center mt-6 text-gray-600 text-sm">
                    ยังไม่มีบัญชี?
                    <a className="text-blue-600 hover:text-blue-800 font-medium transsition duration-200 ease-in-out">
                        ลงทะเบียนที่นี้
                    </a>
                </div>
            </div>
        </div>
    )
}

export default LoginPage