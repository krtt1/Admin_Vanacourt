"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const Agreement = () => {
  const router = useRouter();

  useEffect(() => {
    // เปิด PDF ในแท็บใหม่
    window.open("/rules.pdf", "_blank", "noopener,noreferrer");

    // กลับไปหน้า /admin
    router.push("/admin");
  }, [router]);

  return null; // ไม่ต้อง render อะไร
};

export default Agreement;
