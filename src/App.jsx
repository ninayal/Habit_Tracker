import AuthRoute from "@/components/AuthRoute"
import Layout from "@/components/Layout"
import ScrollToTop from "@/components/ScrollToTop"
import Dashboard from "@/pages/Dashboard"
import HabitsList from "@/pages/HabitsList"
import Landing from "@/pages/Landing"
import Profile from "@/pages/Profile"
import SignIn from "@/pages/SignIn"
import SignUp from "@/pages/SignUp"
import { initializeData } from "@/utils/initializeData"
import { storage, STORAGE_KEYS } from "@/utils/storage"
import { useEffect } from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"


function App() {
  // nếu sửa file mockData.js thì phải cmt initializeData và bật cmt để clear localStorage cũ 

  // localStorage.clear();
  useEffect(() => {
    initializeData();
  }, [])


  //mở console lên coi data được sửa chưa
  console.log("current-user: ", storage.get(STORAGE_KEYS.CURRENT_USER))
  console.log("habit: ", storage.get(STORAGE_KEYS.HABITS))

  return (
    <>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Landing />} />

          <Route element={<AuthRoute requireAuth={false} />}>
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
          </Route>

          <Route element={<Layout />}>
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route element={<AuthRoute />}>
            <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/all-habits" element={<HabitsList />}/>

            {/* <Route path="/statistics" element={}/> */}

            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
