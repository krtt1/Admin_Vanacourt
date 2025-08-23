"use client";

interface Props {
  title: string;
  amount: number;
  color?: "green" | "pink" | "orange";
}

const colorMap = {
  green: "bg-green-100 text-green-800",
  pink: "bg-pink-100 text-pink-800",
  orange: "bg-orange-100 text-orange-800",
};

const FinancialCard = ({ title, amount = 0, color = "green" }: Props) => {
  const classes = colorMap[color] || colorMap.green;

  return (
    <div className={`p-4 rounded-2xl shadow flex flex-col justify-between ${classes}`}>
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="mt-2 text-2xl font-bold">{Number(amount).toLocaleString()} บาท</p>
    </div>
  );
};

export default FinancialCard;
