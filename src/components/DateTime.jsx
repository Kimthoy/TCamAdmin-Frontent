// src/components/DateTime.jsx
import React, { useState, useEffect } from "react";

export default function DateTime({ formatOptions }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // updates every second

    return () => clearInterval(timer); // cleanup on unmount
  }, []);

  return (
    <div className="text-gray-700 text-sm dark:text-gray-300 font-medium sm:flex hidden md:hidden lg:flex mx-3">
      {currentTime.toLocaleString("en-US", formatOptions)}
    </div>
  );
}
