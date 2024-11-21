import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import moment from "moment";
import { FaSave, FaToggleOn, FaToggleOff, FaEdit } from "react-icons/fa";

const MealSummary = () => {
  const { roomId } = useParams();
  const { currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [mealData, setMealData] = useState({});
  const [isMealConfirmationOn, setIsMealConfirmationOn] = useState(true); // Default to true
  const [isLunchOn, setIsLunchOn] = useState(true); // Default to true
  const [isDinnerOn, setIsDinnerOn] = useState(true); // Default to true
  const [currentDay, setCurrentDay] = useState(moment().date());
  const [calendarLimit, setCalendarLimit] = useState([
    currentDay - 9,
    currentDay,
  ]);
  const [isMealSaved, setIsMealSaved] = useState(false); // Track which day has been saved
  const [isEditing, setIsEditing] = useState(false); // Track if the user is currently editing

  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);

  // Fetch room users and meal confirmation status
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/room/${roomId}/users`
        );
        const data = await response.json();
        setUsers(data.users);

        const mealStatusResponse = await fetch(
          `http://localhost:5000/room/${roomId}/meal-confirmation-status`
        );
        const mealStatus = await mealStatusResponse.json();
        setIsMealConfirmationOn(mealStatus.isMealConfirmationOn);
        setIsLunchOn(mealStatus.isLunchOn ?? true); // Default to true if not provided
        setIsDinnerOn(mealStatus.isDinnerOn ?? true); // Default to true if not provided
      } catch (error) {
        Swal.fire("Error", "Unable to fetch room data", "error");
      }
    };

    if (currentUser) {
      fetchRoomData();
    }
  }, [roomId, currentUser]);

  // Fetch meal summary data
  useEffect(() => {
    const fetchMealData = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/room/${roomId}/meal-summary`
        );
        const data = await response.json();

        const transformedData = {};
        data.meals.forEach((meal) => {
          const day = moment(meal.date).date();
          if (!transformedData[day]) transformedData[day] = {};
          transformedData[day][meal.userEmail] = {
            lunch: meal.lunch,
            dinner: meal.dinner,
          };
          // If the user has saved inputs, mark the day as saved
          if (meal.userEmail === currentUser.email) {
            setIsMealSaved(true);
          }
        });
        setMealData(transformedData);
      } catch (error) {
        Swal.fire("Error", "Unable to fetch meal summary", "error");
      }
    };
    fetchMealData();
  }, [roomId]);

  const handleMealInput = (day, userEmail, mealType, value) => {
    setMealData((prevData) => ({
      ...prevData,
      [day]: {
        ...(prevData[day] || {}),
        [userEmail]: {
          ...(prevData[day]?.[userEmail] || {}),
          [mealType]: value,
        },
      },
    }));
  };

  const handleSaveMealData = async (day) => {
    try {
      const mealEntry = {
        date: moment().date(day).format("YYYY-MM-DD"),
        userEmail: currentUser.email,
        mealData: {
          lunch: mealData[day]?.[currentUser.email]?.lunch || 0,
          dinner: mealData[day]?.[currentUser.email]?.dinner || 0,
        },
      };

      const response = await fetch(
        `http://localhost:5000/room/${roomId}/meal-summary`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mealEntry),
        }
      );

      if (response.ok) {
        Swal.fire("Success", "Meal data updated successfully", "success");
        setIsEditing(false); // Disable editing mode
        setIsMealSaved(true); // Mark the day as saved
      } else {
        const errorData = await response.json();
        Swal.fire(
          "Error",
          errorData.message || "Unable to save meal data",
          "error"
        );
      }
    } catch (error) {
      Swal.fire("Error", "An error occurred while saving meal data", "error");
    }
  };

  // const toggleMealConfirmation = async () => {
  //   try {
  //     const response = await fetch(
  //       `http://localhost:5000/room/${roomId}/toggle-meal-confirmation`,
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({ userEmail: currentUser.email }),
  //       }
  //     );
  //     const data = await response.json();
  //     if (response.ok) {
  //       setIsMealConfirmationOn(data.isMealConfirmationOn);
  //       Swal.fire(
  //         "Success",
  //         `Meal confirmation is now ${
  //           data.isMealConfirmationOn ? "enabled" : "disabled"
  //         }`,
  //         "success"
  //       );
  //     } else {
  //       Swal.fire(
  //         "Error",
  //         data.message || "Unable to toggle meal confirmation",
  //         "error"
  //       );
  //     }
  //   } catch (error) {
  //     Swal.fire("Error", "Unable to toggle meal confirmation", "error");
  //   }
  // };
  const toggleMealConfirmation = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/room/${roomId}/toggle-meal-confirmation`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userEmail: currentUser.email }),
        }
      );
      const data = await response.json();
  
      if (response.ok) {
        setIsMealConfirmationOn(data.isMealConfirmationOn);
  
        if (!data.isMealConfirmationOn) {
          // Meal has been turned off - handle default values for missing meals
          await handleDefaultMeals(); // Ensure real-time updates
        }
  
        Swal.fire(
          "Success",
          `Meal confirmation is now ${
            data.isMealConfirmationOn ? "enabled" : "disabled"
          }`,
          "success"
        );
      } else {
        Swal.fire(
          "Error",
          data.message || "Unable to toggle meal confirmation",
          "error"
        );
      }
    } catch (error) {
      Swal.fire("Error", "Unable to toggle meal confirmation", "error");
    }
  };
  

  const handleDefaultMeals = async () => {
    const date = moment().format("YYYY-MM-DD");
  
    try {
      const response = await fetch(`http://localhost:5000/room/${roomId}/users`);
      const data = await response.json();
      const users = data.users;
  
      for (const user of users) {
        const userEmail = user.email;
  
        try {
          const mealResponse = await fetch(
            `http://localhost:5000/room/${roomId}/meal-summary/${userEmail}/${date}`
          );
  
          // If meal data doesn't exist, proceed with default insertion
          if (mealResponse.status === 404) {
            const defaultMeal = {
              date,
              userEmail,
              mealData: {
                lunch: isLunchOn ? 1 : 0,
                dinner: isDinnerOn ? 1 : 0,
              },
              isDefault: true,
            };
  
            await fetch(`http://localhost:5000/room/${roomId}/meal-summary`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(defaultMeal),
            });
  
            console.log(`Default meal saved for ${userEmail}`);
  
            // Update mealData state with the default meal
            setMealData((prevData) => ({
              ...prevData,
              [moment(date).date()]: {
                ...(prevData[moment(date).date()] || {}),
                [userEmail]: {
                  lunch: isLunchOn ? 1 : 0,
                  dinner: isDinnerOn ? 1 : 0,
                },
              },
            }));
          }
        } catch (mealError) {
          console.error(`Failed to check meal data for ${userEmail}:`, mealError);
        }
      }
  
      console.log("Default meals saved successfully.");
      Swal.fire("Success", "Default meals saved successfully.", "success");
    } catch (error) {
      console.error("Failed to save default meals:", error);
      Swal.fire("Error", "Failed to save default meals", "error");
    }
  };
  
  
  
  
  
  const toggleLunch = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/room/${roomId}/toggle-lunch`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userEmail: currentUser.email }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setIsLunchOn(data.isLunchOn);
        Swal.fire(
          "Success",
          `Lunch is now ${data.isLunchOn ? "enabled" : "disabled"}`,
          "success"
        );
      } else {
        Swal.fire("Error", data.message || "Unable to toggle lunch", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Unable to toggle lunch", "error");
    }
  };

  const toggleDinner = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/room/${roomId}/toggle-dinner`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userEmail: currentUser.email }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setIsDinnerOn(data.isDinnerOn);
        Swal.fire(
          "Success",
          `Dinner is now ${data.isDinnerOn ? "enabled" : "disabled"}`,
          "success"
        );
      } else {
        Swal.fire("Error", data.message || "Unable to toggle dinner", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Unable to toggle dinner", "error");
    }
  };

  const renderCalendarRows = () => {
    return daysInMonth
      .slice(calendarLimit[0], calendarLimit[1] + 1)
      .map((day) => {
        const isCurrentDay = currentDay === day;

        return (
          <tr
            key={day}
            className={`${
              isCurrentDay
                ? "bg-gradient-to-r from-green-200 to-green-400 text-lg font-bold shadow-lg"
                : ""
            } transition-transform transform hover:scale-90 hover:bg-gray-200`}
          >
            <td className="border px-4 py-2 text-center">{day}</td>
            {users.map((user) => (
              <td key={user.email} className="border px-4 py-2 text-center">
                {isMealConfirmationOn &&
                isCurrentDay &&
                user.email === currentUser.email ? (
                  <>
                    <input
                      type="number"
                      placeholder="Lunch"
                      value={mealData[day]?.[user.email]?.lunch || ""}
                      onChange={(e) =>
                        handleMealInput(
                          day,
                          user.email,
                          "lunch",
                          e.target.value
                        )
                      }
                      className={`w-16 p-1 rounded-md border ${
                        isLunchOn ? "bg-white" : "bg-gray-200"
                      }`}
                      disabled={!isLunchOn || !isEditing}
                    />
                    <input
                      type="number"
                      placeholder="Dinner"
                      value={mealData[day]?.[user.email]?.dinner || ""}
                      onChange={(e) =>
                        handleMealInput(
                          day,
                          user.email,
                          "dinner",
                          e.target.value
                        )
                      }
                      className={`w-16 p-1 rounded-md border ml-2 ${
                        isDinnerOn ? "bg-white" : "bg-gray-200"
                      }`}
                      disabled={!isDinnerOn || !isEditing}
                    />
                  </>
                ) : (
                  <>
                    <span>
                      Lunch: {mealData[day]?.[user.email]?.lunch || 0}
                    </span>{" "}
                    /{" "}
                    <span>
                      Dinner: {mealData[day]?.[user.email]?.dinner || 0}
                    </span>
                  </>
                )}
              </td>
            ))}
            {isMealConfirmationOn && isCurrentDay && currentUser && (
              <td className="border px-4 py-2 text-center">
                {isEditing ? (
                  <button
                    className="bg-gradient-to-r from-blue-400 to-blue-600 text-white p-2 rounded-lg shadow-md hover:bg-blue-700 transition duration-200"
                    onClick={() => handleSaveMealData(day)}
                  >
                    <FaSave />
                  </button>
                ) : (
                  <button
                    className="bg-gradient-to-r from-purple-400 to-purple-600 text-white p-2 rounded-lg shadow-md hover:bg-yellow-700 transition duration-200"
                    onClick={() => setIsEditing(true)}
                  >
                    <FaEdit />
                  </button>
                )}
              </td>
            )}
          </tr>
        );
      });
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
        Meal Summary for Room {roomId}
      </h1>

      {currentUser?.role === roomId && (
        <div className="flex justify-center space-x-4 mb-6">
          <button
            className={`p-2 flex items-center justify-center text-white shadow-lg transition-transform transform hover:scale-105 ${
              isMealConfirmationOn
                ? "bg-gradient-to-r from-green-500 to-green-700"
                : "bg-gradient-to-r from-red-500 to-red-700"
            } rounded-full`}
            onClick={toggleMealConfirmation}
          >
            {isMealConfirmationOn ? (
              <>
                <FaToggleOn className="mr-2" />
                Turn Off Meal
              </>
            ) : (
              <>
                <FaToggleOff className="mr-2" />
                Turn On Meal
              </>
            )}
          </button>

          <button
            className={`p-2 flex items-center justify-center text-white shadow-lg transition-transform transform hover:scale-105 ${
              isLunchOn
                ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                : "bg-gradient-to-r from-gray-400 to-gray-600"
            } rounded-full`}
            onClick={toggleLunch}
          >
            {isLunchOn ? (
              <>
                <FaToggleOn className="mr-2" />
                Turn Off Lunch
              </>
            ) : (
              <>
                <FaToggleOff className="mr-2" />
                Turn On Lunch
              </>
            )}
          </button>

          <button
            className={`p-2 flex items-center justify-center text-white shadow-lg transition-transform transform hover:scale-105 ${
              isDinnerOn
                ? "bg-gradient-to-r from-blue-400 to-blue-600"
                : "bg-gradient-to-r from-gray-400 to-gray-600"
            } rounded-full`}
            onClick={toggleDinner}
          >
            {isDinnerOn ? (
              <>
                <FaToggleOn className="mr-2" />
                Turn Off Dinner
              </>
            ) : (
              <>
                <FaToggleOff className="mr-2" />
                Turn On Dinner
              </>
            )}
          </button>
        </div>
      )}

      {isMealConfirmationOn ? (
        <div className="text-center mb-4 text-green-600 font-semibold">
          The meal is now on, you can give your meals
        </div>
      ) : (
        <div className="text-center mb-4 text-red-600 font-semibold">
          The meal is now off
        </div>
      )}
      {!isLunchOn && (
        <div className="text-center mb-4 text-yellow-600 font-semibold">
          The Lunch meal is off for today
        </div>
      )}
      {!isDinnerOn && (
        <div className="text-center mb-4 text-blue-600 font-semibold">
          The Dinner meal is off for today
        </div>
      )}

      <table className="min-w-full bg-white border rounded-lg shadow-lg">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="border px-4 py-2">Date</th>
            {users.map((user) => (
              <th key={user.email} className="border px-4 py-2">
                {user.name}
              </th>
            ))}
            {isMealConfirmationOn && currentUser && (
              <th className="border px-4 py-2">Actions</th>
            )}
          </tr>
        </thead>
        <tbody>{renderCalendarRows()}</tbody>
      </table>

      {calendarLimit[1] < 30 && (
        <div className="text-center mt-6">
          <button
            onClick={() => setCalendarLimit([1, 30])}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white p-2 rounded-lg shadow-lg hover:bg-green-700 transition duration-200"
          >
            See All Days
          </button>
        </div>
      )}
    </div>
  );
};

export default MealSummary;
