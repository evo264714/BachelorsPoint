import { createContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '../firebase';
import Swal from 'sweetalert2';
import ClipLoader from 'react-spinners/ClipLoader'; // Importing the spinner

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(false); // Separate loading for role fetching
  const [registrationLoading, setRegistrationLoading] = useState(false); // Separate loading for registration

  // Helper function to fetch user role
  const fetchUserRole = async (email) => {
    try {
      setRoleLoading(true); // Start loading the role
  
      // Introduce a 3-second delay
      await new Promise((resolve) => setTimeout(resolve, 3000));
  
      const response = await fetch(`http://localhost:5000/user/${email}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch user role: ${response.statusText}`);
      }
      const data = await response.json();
      console.log(data);
      return data.role;
    } catch (error) {
      console.error('Error fetching user role:', error);
      Swal.fire('Error', 'Failed to fetch user role', 'error');
      return null;
    } finally {
      setRoleLoading(false); // Stop loading the role
    }
  };

  // Firebase auth listener to manage current user state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true); // Set loading state while checking authentication
      if (user) {
        const role = await fetchUserRole(user.email);
        setCurrentUser({ ...user, role });
      } else {
        setCurrentUser(null);
      }
      setLoading(false); // Stop loading when user state is determined
    });

    return () => unsubscribe();
  }, []);

  // Register a new user
  const register = async (name, email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;
  
      // Send the name and email to the backend to register the user in MongoDB
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
  
      if (response.ok) {
        const { role } = await response.json();
        console.log("User registered with role:", role);
  
        // Set the current user with the role returned from the backend
        setCurrentUser({ ...user, role });
        Swal.fire('Success', 'Registration successful!', 'success');
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      console.error('Error during registration:', error.message);
      Swal.fire('Error', error.message, 'error');
    }
  };

  // Login an existing user
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;
  
      // Fetch user role from MongoDB after successful Firebase login
      const role = await fetchUserRole(user.email); // Fetch the role using the helper
      setCurrentUser({ ...user, role });
      Swal.fire('Success', 'Logged in successfully!', 'success');
    } catch (error) {
      console.error('Error during login:', error.message);
      Swal.fire('Error', error.message, 'error');
    }
  };

  // Logout the current user
  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      Swal.fire('Success', 'Logged out successfully!', 'success');
    } catch (error) {
      console.error('Error during logout:', error.message);
      Swal.fire('Error', error.message, 'error');
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, register, login, logout }}>
      {/* Show spinner if any loading is happening */}
      {(loading || roleLoading || registrationLoading) ? (
        <div className="flex justify-center items-center h-screen">
          <ClipLoader size={50} color={"#123abc"} loading={true} /> {/* Spinner with customizable size and color */}
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export default AuthContext;
