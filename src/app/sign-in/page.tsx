"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// กำหนด URL ของ API ที่จะใช้ล็อกอิน
const API_URL = "http://localhost:5000/admin/login"; // URL ที่ถูกต้อง

const LoginPage = () => {
    // ใช้ useState เพื่อเก็บค่า username และ password
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    // ฟังก์ชันจัดการการล็อกอินเมื่อกดปุ่ม "เข้าสู่ระบบ"
    const handleLogin = async (e) => {
        e.preventDefault(); // ป้องกันการรีโหลดหน้าเมื่อกดปุ่ม

        // ตรวจสอบว่ามีข้อมูลครบถ้วนหรือไม่
        if (!username || !password) {
            setError("โปรดป้อนชื่อผู้ใช้และรหัสผ่าน");
            return;
        }

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    password
                }),
            });

            // ตรวจสอบว่าการเรียก API สำเร็จหรือไม่
            if (response.ok) {
                const data = await response.json();
                console.log("Login successful:", data);
                // Redirect ไปยังหน้า dashboard เมื่อล็อกอินสำเร็จ
                router.push("/dashboard");
            } else {
                // ถ้าล็อกอินไม่สำเร็จ ให้แสดงข้อความแจ้งเตือน
                // เพิ่มการตรวจสอบประเภทของข้อมูลที่ได้รับกลับมา
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const errorData = await response.json();
                    setError(errorData.message || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
                    console.error("Login failed:", errorData);
                } else {
                    // ถ้าไม่ใช่ JSON แสดงว่าเป็น HTML หรือข้อมูลรูปแบบอื่น
                    const errorText = await response.text();
                    setError("เกิดข้อผิดพลาดในการเชื่อมต่อ: กรุณาตรวจสอบการตั้งค่า Backend API");
                    console.error("Login error: Expected JSON, but received HTML. Response text:", errorText);
                }
            }
        } catch (err) {
            // ดักจับข้อผิดพลาดที่เกิดขึ้นระหว่างการเชื่อมต่อ
            setError("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
            console.error("Login error:", err);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen w-full p-4 sm:p-6 lg:p-8 bg-gray-100">
            <div className="bg-white p-8 sm:p-10 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">เข้าสู่ระบบ</h2>
                {error && <div className="text-red-500 text-center mb-4">{error}</div>}
                <form onSubmit={handleLogin}>
                    <div className="mb-4">
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
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
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
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ease-in-out shadow-md"
                    >เข้าสู่ระบบ</button>
                </form>
                <div className="text-center mt-6 text-gray-600 text-sm">
                    ยังไม่มีบัญชี?
                    <a className="text-blue-600 hover:text-blue-800 font-medium transition duration-200 ease-in-out">
                        ลงทะเบียนที่นี่
                    </a>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
