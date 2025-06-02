import React, { useState } from "react";
import holidays from "../utils/holidays";

export default function AppointmentForm() {
  const [mainTZ, setMainTZ] = useState("America/New_York");
  const [dateTime, setDateTime] = useState("");
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState("");

  const timezones = [
    "America/New_York",
    "Europe/London",
    "Asia/Tokyo",
    "Australia/Sydney",
    "Asia/Dubai",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const selectedDate = new Date(dateTime);
    const isHoliday = holidays[mainTZ]?.some((d) => new Date(d).toDateString() === selectedDate.toDateString());
    if (isHoliday) {
      setError("Cannot book on a national holiday in selected timezone.");
      setSuccess("");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          timezone: mainTZ,
          dateTime,
          userEmail: email,
        }),
      });

      if (!response.ok) throw new Error("Failed to save appointment");
      setSuccess("Appointment successfully booked!");
      setError("");
      setTitle("");
      setEmail("");
      setDateTime("");
    } catch (err) {
      setError(err.message);
      setSuccess("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-100 p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-2">Book an Appointment</h2>

      <label className="block mb-1">Title:</label>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="mb-4 p-2 border rounded w-full"
      />

      <label className="block mb-1">Email:</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="mb-4 p-2 border rounded w-full"
      />

      <label className="block mb-1">Main Timezone:</label>
      <select value={mainTZ} onChange={(e) => setMainTZ(e.target.value)} className="mb-4 p-2 border rounded w-full">
        {timezones.map((tz) => (
          <option key={tz} value={tz}>{tz}</option>
        ))}
      </select>

      <label className="block mb-1">Select Date and Time:</label>
      <input
        type="datetime-local"
        value={dateTime}
        onChange={(e) => setDateTime(e.target.value)}
        required
        className="mb-4 p-2 border rounded w-full"
      />

      {error && <p className="text-red-600 mb-2">{error}</p>}
      {success && <p className="text-green-600 mb-2">{success}</p>}

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Book</button>
    </form>
  );
}
