import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer, Slide } from "react-toastify";
import Header from "./components/Header";
import Loading from "./components/Loading";
import AdminAuth from "./components/auth/AdminAuth.tsx";
import NotFound from "./pages/error/NotFound.tsx";
import UserAuth from "./components/auth/UserAuth.tsx";
const TutorDashboard = lazy(() => import("./pages/tutor/TutorDashboard.tsx"));
const AddCourse = lazy(() => import("./pages/tutor/AddCourse.tsx"));
const CourseDetails = lazy(() => import("./pages/user/CourseDetails.tsx"));
const Home = lazy(() => import("./pages/user/Home.tsx"));
const SignUp = lazy(() => import("./pages/SignUp"));
const SignIn = lazy(() => import("./pages/SignIn"));
const AdminSignIn = lazy(() => import("./pages/AdminSignIn"));
const Cart = lazy(() => import("./pages/user/Cart.tsx"));
const Wishlist = lazy(() => import("./pages/user/Wishlist.tsx"));
const Users_admin = lazy(() => import("./pages/admin/Users_admin.tsx"));
const Courses_admin = lazy(() => import("./pages/admin/Courses_admin.tsx"));
const UserDetails_admin = lazy(
  () => import("./pages/admin/UserDetails_admin.tsx")
);
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Courses = lazy(() => import("./pages/user/Courses.tsx"));
const Categories_admin = lazy(
  () => import("./pages/admin/Categories_admin.tsx")
);
const EditCourse = lazy(() => import("./pages/tutor/EditCourse.tsx"));
const Course_tutor = lazy(() => import("./pages/tutor/Course_tutor.tsx"));
const ManageContent = lazy(() => import("./pages/tutor/ManageContent.tsx"));
const PaymentSuccess = lazy(() => import("./pages/user/PaymentSuccess.tsx"));
const PaymentFailure = lazy(() => import("./pages/user/PaymentFailure.tsx"));
import "react-toastify/dist/ReactToastify.css";
import HideAuth from "./components/auth/HideAuth.tsx";

const App = () => {
  return (
    <BrowserRouter>
      <Header />
      <ToastContainer transition={Slide} />
      <Routes>
        <Route
          path="/"
          element={
            <Suspense fallback={<Loading />}>
              <Home />
            </Suspense>
          }
        />
        <Route element={<HideAuth />}>
          <Route
            path="/sign-up"
            element={
              <Suspense fallback={<Loading />}>
                <SignUp />
              </Suspense>
            }
          />
          <Route
            path="/sign-in"
            element={
              <Suspense fallback={<Loading />}>
                <SignIn />
              </Suspense>
            }
          />
          <Route
            path="/admin-sign-in"
            element={
              <Suspense fallback={<Loading />}>
                <AdminSignIn />
              </Suspense>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <Suspense fallback={<Loading />}>
                <ForgotPassword />
              </Suspense>
            }
          />
        </Route>

        <Route
          path="/payment-success"
          element={
            <Suspense fallback={<Loading />}>
              <PaymentSuccess />
            </Suspense>
          }
        />
        <Route
          path="/payment-failure"
          element={
            <Suspense fallback={<Loading />}>
              <PaymentFailure />
            </Suspense>
          }
        />

        <Route
          path="/courses"
          element={
            <Suspense fallback={<Loading />}>
              <Courses />
            </Suspense>
          }
        />
        <Route
          path="/course-details/:id"
          element={
            <Suspense fallback={<Loading />}>
              <CourseDetails />
            </Suspense>
          }
        />
        <Route element={<UserAuth />}>
          <Route
            path="/cart"
            element={
              <Suspense fallback={<Loading />}>
                <Cart />
              </Suspense>
            }
          />
          <Route
            path="/wishlist"
            element={
              <Suspense fallback={<Loading />}>
                <Wishlist />
              </Suspense>
            }
          />
          <Route
            path="/tutor"
            element={
              <Suspense fallback={<Loading />}>
                <TutorDashboard />
              </Suspense>
            }
          />
          <Route
            path="/tutor/add-course"
            element={
              <Suspense fallback={<Loading />}>
                <AddCourse />
              </Suspense>
            }
          />
          <Route
            path="/tutor/edit-course/:id"
            element={
              <Suspense fallback={<Loading />}>
                <EditCourse />
              </Suspense>
            }
          />

          <Route
            path="/tutor/manage-course-content/:id"
            element={
              <Suspense fallback={<Loading />}>
                <ManageContent />
              </Suspense>
            }
          />

          <Route
            path="/tutor/course/:id"
            element={
              <Suspense fallback={<Loading />}>
                <Course_tutor />
              </Suspense>
            }
          />
        </Route>
        {/* Admin routes */}
        <Route path="/admin/*" element={<AdminAuth />}>
          <Route
            path="users"
            element={
              <Suspense fallback={<Loading />}>
                <Users_admin />
              </Suspense>
            }
          />
          <Route
            path="courses"
            element={
              <Suspense fallback={<Loading />}>
                <Courses_admin />
              </Suspense>
            }
          />
          <Route
            path="courses/categories"
            element={
              <Suspense fallback={<Loading />}>
                <Categories_admin />
              </Suspense>
            }
          />
          <Route
            path="users/user-details/:id"
            element={
              <Suspense fallback={<Loading />}>
                <UserDetails_admin />
              </Suspense>
            }
          />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
