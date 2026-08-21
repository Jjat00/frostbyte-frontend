import React, { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Avatar del cliente (foto de Google con fallback a su inicial).
 * referrerPolicy evita el 403 de googleusercontent con referrer cruzado.
 */
const CustomerAvatar = ({ customer, className }) => {
  const [failed, setFailed] = useState(false);
  const initial = (customer?.first_name || customer?.full_name || "?")
    .trim()
    .charAt(0)
    .toUpperCase();

  if (!customer?.avatar_url || failed) {
    return (
      <span
        className={cn(
          "grid select-none place-items-center rounded-full border border-white/[0.14] bg-white/[0.06] font-medium text-light",
          className
        )}
      >
        {initial}
      </span>
    );
  }
  return (
    <img
      src={customer.avatar_url}
      alt=""
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={cn("rounded-full object-cover", className)}
    />
  );
};

export default CustomerAvatar;
