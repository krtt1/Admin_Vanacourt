import PaymentTable from "@/components/PaymentTable";

const PaymentPage = async () => {
  const adminId = "5779bb7e-5b77-4f0f-905b-4bde758059bf"; // TODO: replace with session user

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <h1 className="text-lg font-semibold mb-4">Payment Management</h1>
      <PaymentTable adminId={adminId} />
    </div>
  );
};

export default PaymentPage;