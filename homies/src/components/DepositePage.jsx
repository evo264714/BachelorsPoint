// import React, { useEffect, useState, useContext } from "react";
// import { AuthContext } from "../context/AuthContext";
// import { useParams } from "react-router-dom";
// import moment from "moment";
// import Swal from "sweetalert2";

// const DepositePage = () => {
//   const { roomId } = useParams();
//   const { currentUser } = useContext(AuthContext);
//   const [users, setUsers] = useState([]);
//   const [deposits, setDeposits] = useState({});
//   const [isManager, setIsManager] = useState(false);
//   const [totalDeposit, setTotalDeposit] = useState(0);
//   const currentMonth = moment().format("MMMM YYYY");
//   const [inputValues, setInputValues] = useState({});

//   // Fetch room users and deposit data
//   useEffect(() => {
//     const fetchRoomDetails = async () => {
//       try {
//         const response = await fetch(
//           `http://localhost:5000/room/${roomId}/users`
//         );
//         const data = await response.json();
//         setUsers(data.users);

//         const managerStatus = currentUser.role === roomId;
//         setIsManager(managerStatus);

//         const depositResponse = await fetch(
//           `http://localhost:5000/room/${roomId}/deposits`
//         );
//         const depositData = await depositResponse.json();
//         setDeposits(groupDepositsByUser(depositData.deposits));
//         calculateTotalDeposit(depositData.deposits);
//       } catch (error) {
//         Swal.fire("Error", "Unable to fetch room or deposit data", "error");
//       }
//     };

//     fetchRoomDetails();
//   }, [roomId, currentUser]);

//   // Group deposits by user email
//   const groupDepositsByUser = (deposits) => {
//     return deposits.reduce((acc, deposit) => {
//       if (!acc[deposit.userEmail]) acc[deposit.userEmail] = [];
//       acc[deposit.userEmail].push(deposit);
//       return acc;
//     }, {});
//   };

//   // Handle adding a new deposit
//   const handleAddDeposit = (userEmail) => {
//     const value = inputValues[userEmail]?.trim();
//     if (!value) return;

//     const timestamp = moment().format("YYYY-MM-DD HH:mm:ss");
//     const newDeposit = { amount: parseFloat(value) || 0, timestamp };

//     setDeposits((prev) => {
//       const updatedDeposits = {
//         ...prev,
//         [userEmail]: [...(prev[userEmail] || []), newDeposit],
//       };
//       setInputValues((prev) => ({ ...prev, [userEmail]: "" })); // Clear input
//       return updatedDeposits;
//     });
//   };

//   // Calculate the total deposit amount
//   const calculateTotalDeposit = (deposits) => {
//     const total = deposits.reduce((sum, entry) => sum + entry.amount, 0);
//     setTotalDeposit(total);
//   };

//   // Save deposits to the backend
//   const handleSaveDeposits = async () => {
//     const depositEntries = Object.entries(deposits).flatMap(
//       ([userEmail, userDeposits]) =>
//         userDeposits.map((deposit) => ({
//           userEmail,
//           amount: deposit.amount,
//           timestamp: deposit.timestamp,
//         }))
//     );

//     if (depositEntries.length === 0) {
//       Swal.fire("Error", "No valid deposits to add", "error");
//       return;
//     }

//     try {
//       const response = await fetch(
//         `http://localhost:5000/room/${roomId}/deposits`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ deposits: depositEntries }),
//         }
//       );

//       if (response.ok) {
//         Swal.fire("Success", "Deposits updated successfully", "success");
//         calculateTotalDeposit(depositEntries);
//       } else {
//         const errorData = await response.json();
//         Swal.fire(
//           "Error",
//           errorData.message || "Failed to update deposits",
//           "error"
//         );
//       }
//     } catch (error) {
//       Swal.fire("Error", "An error occurred while updating deposits", "error");
//     }
//   };

//   return (
//     <div className="container mx-auto p-6">
//       <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
//         Deposits for {currentMonth}
//       </h1>
//       <table className="min-w-full bg-white border rounded-lg shadow-lg">
//         <thead className="bg-gray-800 text-white">
//           <tr>
//             <th className="border px-4 py-2">User</th>
//             <th className="border px-4 py-2">Deposits</th>
//             <th className="border px-4 py-2">Add Deposit</th>
//           </tr>
//         </thead>
//         <tbody>
//           {users.map((user) => (
//             <tr key={user.email}>
//               <td className="border px-4 py-2">{user.name}</td>
//               <td className="border px-4 py-2">
//                 <ul>
//                   {(deposits[user.email] || []).map((entry, index) => (
//                     <li key={index} className="flex justify-between">
//                       <span>{entry.amount} Taka</span>
//                       <span className="text-sm text-gray-500">
//                         {entry.timestamp}
//                       </span>
//                     </li>
//                   ))}
//                 </ul>
//               </td>
//               <td className="border px-4 py-2">
//                 {isManager && (
//                   <div className="flex space-x-2">
//                     <input
//                       type="number"
//                       value={inputValues[user.email] || ""}
//                       onChange={(e) =>
//                         setInputValues((prev) => ({
//                           ...prev,
//                           [user.email]: e.target.value,
//                         }))
//                       }
//                       placeholder="Enter amount"
//                       className="w-full p-2 border rounded-md"
//                     />
//                     <button
//                       onClick={() => handleAddDeposit(user.email)}
//                       className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-600 transition-transform transform hover:scale-105"
//                     >
//                       Save to {user.name}'s Deposit
//                     </button>
//                   </div>
//                 )}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//         <tfoot>
//           <tr>
//             <td className="border px-4 py-2 font-semibold">Total</td>
//             <td className="border px-4 py-2 font-semibold">
//               {totalDeposit} Taka
//             </td>
//             <td className="border px-4 py-2"></td>
//           </tr>
//         </tfoot>
//       </table>

//       {isManager && (
//         <div className="text-center mt-6">
//           <button
//             onClick={handleSaveDeposits}
//             className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-green-700 transition-transform transform hover:scale-105"
//           >
//             Save All Deposits
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default DepositePage;



import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useParams } from "react-router-dom";
import moment from "moment";
import Swal from "sweetalert2";
import { FaSave, FaUser } from "react-icons/fa";

const DepositePage = () => {
  const { roomId } = useParams();
  const { currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [deposits, setDeposits] = useState({});
  const [isManager, setIsManager] = useState(false);
  const [totalDeposit, setTotalDeposit] = useState(0);
  const currentMonth = moment().format("MMMM YYYY");

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/room/${roomId}/users`
        );
        const data = await response.json();
        console.log("Fetched users:", data.users);
        setUsers(data.users);

        const managerStatus = currentUser.role === roomId;
        setIsManager(managerStatus);

        const depositResponse = await fetch(
          `http://localhost:5000/room/${roomId}/deposits`
        );
        const depositData = await depositResponse.json();
        setDeposits(groupDepositsByUser(depositData.deposits));
        calculateTotalDeposit(depositData.deposits);
      } catch (error) {
        Swal.fire("Error", "Unable to fetch room or deposit data", "error");
      }
    };

    fetchRoomDetails();
  }, [roomId, currentUser]);

  const groupDepositsByUser = (deposits) =>
    deposits.reduce((acc, deposit) => {
      if (!acc[deposit.userEmail]) acc[deposit.userEmail] = [];
      acc[deposit.userEmail].push(deposit);
      return acc;
    }, {});

  const handleAddDeposit = (userEmail, value) => {
    const timestamp = moment().format("YYYY-MM-DD HH:mm:ss");
    const newDeposit = { amount: parseFloat(value) || 0, timestamp };

    setDeposits((prev) => ({
      ...prev,
      [userEmail]: [...(prev[userEmail] || []), newDeposit],
    }));
  };

  const calculateTotalDeposit = (deposits) =>
    setTotalDeposit(
      deposits.reduce((sum, entry) => sum + entry.amount, 0)
    );

  const handleSaveDeposits = async () => {
    const depositEntries = Object.entries(deposits).flatMap(
      ([userEmail, userDeposits]) =>
        userDeposits.map((deposit) => ({
          userEmail,
          amount: deposit.amount,
          timestamp: deposit.timestamp,
        }))
    );

    if (depositEntries.length === 0) {
      Swal.fire("Error", "No valid deposits to add", "error");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/room/${roomId}/deposits`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deposits: depositEntries }),
        }
      );

      if (response.ok) {
        Swal.fire("Success", "Deposits updated successfully", "success");
        calculateTotalDeposit(depositEntries);
      } else {
        const errorData = await response.json();
        Swal.fire("Error", errorData.message || "Failed to update deposits", "error");
      }
    } catch (error) {
      Swal.fire("Error", "An error occurred while updating deposits", "error");
    }
  };

  const getUserName = (user) =>
    user.name.includes("@") ? user.name.split("@")[0] : user.name;

  return (
    <div className="container mx-auto p-6 bg-gradient-to-r from-indigo-100 to-purple-300 rounded-lg shadow-lg">
      <h1 className="text-4xl font-extrabold text-center mb-8 text-purple-900">
        Deposits for {currentMonth}
      </h1>

      <table className="min-w-full bg-white border rounded-xl shadow-xl">
        <thead className="bg-gradient-to-r from-indigo-700 to-purple-600 text-white">
          <tr>
            <th className="border px-4 py-2">User</th>
            <th className="border px-4 py-2">Deposits</th>
            <th className="border px-4 py-2">Add Deposit</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.email} className="hover:bg-purple-100 transition">
              <td className="border px-4 py-2 flex items-center gap-2">
                <FaUser className="text-indigo-500" />
                {getUserName(user)}
              </td>
              <td className="border px-4 py-2">
                <ul>
                  {(deposits[user.email] || []).map((entry, index) => (
                    <li
                      key={index}
                      className="flex justify-between text-gray-700"
                    >
                      <span>{entry.amount} Taka</span>
                      <span className="text-sm text-gray-500">
                        {entry.timestamp}
                      </span>
                    </li>
                  ))}
                </ul>
              </td>
              <td className="border px-4 py-2">
                {isManager && (
                  <div className="flex flex-col gap-2">
                    <input
                      type="number"
                      placeholder="Enter amount"
                      className="w-full p-2 border rounded-md focus:ring focus:ring-indigo-300"
                      id={`input-${user.email}`}
                    />
                    <button
                      onClick={() => {
                        const inputElement = document.getElementById(
                          `input-${user.email}`
                        );
                        if (inputElement && inputElement.value.trim() !== "") {
                          handleAddDeposit(user.email, inputElement.value);
                          inputElement.value = "";
                        }
                      }}
                      className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-1 rounded-md hover:scale-105 transition-transform"
                    >
                      <FaSave className="inline mr-2" />
                      Save to {getUserName(user)}'s Deposit
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td className="border px-4 py-2 font-semibold">Total</td>
            <td className="border px-4 py-2 font-semibold">
              {totalDeposit} Taka
            </td>
            <td className="border px-4 py-2"></td>
          </tr>
        </tfoot>
      </table>

      {isManager && (
        <div className="text-center mt-8">
          <button
            onClick={handleSaveDeposits}
            className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-8 py-3 rounded-xl shadow-md hover:scale-105 transition-transform"
          >
            Save All Deposits
          </button>
        </div>
      )}
    </div>
  );
};

export default DepositePage;
