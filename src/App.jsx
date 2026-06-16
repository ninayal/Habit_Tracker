import AuthRoute from "@/components/AuthRoute";
import Layout from "@/components/Layout";
import ScrollToTop from "@/components/ScrollToTop";
import { CheckinProvider } from "@/context/CheckinContext";
import { HabitProvider } from "@/context/HabitContext";
import Dashboard from "@/pages/Dashboard";
import HabitsList from "@/pages/HabitsList";
import Landing from "@/pages/Landing";
import Profile from "@/pages/Profile";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import Statistics from "@/pages/Statistics";
import { initializeData } from "@/utils/initializeData";
import { storage, STORAGE_KEYS } from "@/utils/storage";
import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  // nếu sửa file mockData.js thì phải cmt initializeData và bật cmt để clear localStorage cũ

  // localStorage.clear();
  useEffect(() => {
    initializeData();
  }, []);

  //mở console lên coi data được sửa chưa
  console.log("current-user: ", storage.get(STORAGE_KEYS.CURRENT_USER));
  console.log("habit: ", storage.get(STORAGE_KEYS.HABITS));

  return (
    <>
      <BrowserRouter>
        <ScrollToTop />
        <ToastContainer position="top-right" />

        <HabitProvider>
          <CheckinProvider>
            <Routes>


              <Route element={<AuthRoute requireAuth={false} />}>
                <Route path="/" element={<Landing />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
              </Route>

              <Route element={<AuthRoute />}>
                <Route element={<Layout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/all-habits" element={<HabitsList />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/statistics" element={<Statistics />} />

                </Route>
              </Route>
            </Routes>
          </CheckinProvider>
        </HabitProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
