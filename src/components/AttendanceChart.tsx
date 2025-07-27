"use client";

import Image from "next/image";
import {
  BarChart,
  Bar,
  Rectangle,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  {
    name: "ม.ค.", 
    รายรับ: 45000, 
    รายจ่าย: 20000,
  },
  {
    name: "ก.พ.",
    รายรับ: 50000,
    รายจ่าย: 22000,
  },
  {
    name: "มี.ค.",
    รายรับ: 55000,
    รายจ่าย: 25000,
  },
  {
    name: "เม.ย.",
    รายรับ: 48000,
    รายจ่าย: 21000,
  },
  {
    name: "พ.ค.",
    รายรับ: 60000,
    รายจ่าย: 28000,
  },
  {
    name: "มิ.ย.",
    รายรับ: 52000,
    รายจ่าย: 23000,
  },
  {
    name: "ก.ค.",
    รายรับ: 58000,
    รายจ่าย: 26000,
  },
];

const AttendanceChart = () => {
  return (
    <div className="bg-white rounded-lg p-4 h-full">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">สรุปรายรับ-รายจ่าย</h1>
        <Image src="/moreDark.png" alt="ตัวเลือกเพิ่มเติม" width={20} height={20} /> 
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart width={500} height={300} data={data} barSize={20}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ddd" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tick={{ fill: "#d1d5db" }}
            tickLine={false}
          />
          <YAxis axisLine={false} tick={{ fill: "#d1d5db" }} tickLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: "10px", borderColor: "lightgray" }}
            formatter={(value, name) => [`${value.toLocaleString()} บาท`, name]} 
          />
          <Legend
            align="left"
            verticalAlign="top"
            wrapperStyle={{ paddingTop: "20px", paddingBottom: "20px" }} 
          />
          <Bar
            dataKey="รายรับ"
            fill="#66ff99" 
            legendType="circle"
            radius={[10, 10, 0, 0]}
          />
          <Bar
            dataKey="รายจ่าย" 
            fill="#ff5252" 
            legendType="circle"
            radius={[10, 10, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AttendanceChart;