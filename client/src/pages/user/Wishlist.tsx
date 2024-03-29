import React, { useEffect, useState, useContext } from "react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import CourseSkeleton from "../../components/skeletons/CourseSkeleton";
import CourseCard from "../../components/CourseCard";
import ConfirmationPopup from "../../components/ConfirmationPopup";
import { CartWishlistContext } from "../../components/context/CartWishlistContext";
import ICourse from "../../interfaces/courses.interface";

const Wishlist = () => {
  const { cartCount, wishlistCount, setCartCount, setWishlistCount } =
    useContext(CartWishlistContext)!;
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selected, setSelected] = useState<ICourse | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  let skeletons = new Array(7).fill(0);
  async function getWishlistCourses() {
    setLoading(true);
    const res = await fetch(
      import.meta.env.VITE_API_BASE_URL + "/api/get-wishlist-courses",
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + localStorage.getItem("token"),
        },
      }
    ).then((res) => res.json());
    if (!res.success) return toast.error(res.message);
    setCourses(res.docs);
    setLoading(false);
  }
  useEffect(() => {
    try {
      getWishlistCourses();
      return () => {
        setCourses([]);
      };
    } catch {
      toast.error("Something went wrong");
    }
  }, []);
  const removeFromWishlist = async (id: string) => {
    try {
      const res = await fetch(
        import.meta.env.VITE_API_BASE_URL + "/api/remove-from-wishlist",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("token"),
          },
          body: JSON.stringify({
            courseId: id,
          }),
        }
      ).then((res) => res.json());
      if (!res.success) return toast.error(res.message);
      setWishlistCount((prev) => prev - 1);
      getWishlistCourses();
      toast.success(res.message);
    } catch (error) {
      console.log(error);
    }
  };
  const moveToCart = async (id: string) => {
    try {
      const res = await fetch(
        import.meta.env.VITE_API_BASE_URL + "/api/add-to-cart",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("token"),
          },
          body: JSON.stringify({
            courseId: id,
          }),
        }
      ).then((res) => res.json());
      if (!res.success) return toast.error(res.message);
      setCartCount((prev) => prev + 1);
      removeFromWishlist(id);
      toast.success(res.message);
    } catch (error) {
      console.log(error);
    }
  };
  if (loading) {
    return (
      <div className="flex md:flex-row flex-wrap justify-center md:justify-start h-full w-full gap-6 p-8">
        {skeletons.map((_, index) => (
          <CourseSkeleton key={index} />
        ))}
      </div>
    );
  }
  if (courses.length > 0) {
    return (
      <>
        <div className="flex justify-evenly md:justify-start flex-wrap gap-8 p-8">
          {courses.map((course, i) => (
            <CourseCard
              key={course._id}
              course={course}
              showTutor={false}
              extraElements={
                <div className="flex ">
                  <button
                    onClick={() => moveToCart(course._id)}
                    className="_fill-btn-blue"
                  >
                    <i className="bx bx-cart-add text-base"></i>
                  </button>
                  <button
                    onClick={() => {
                      setSelected(course);
                      setShowConfirm(true);
                    }}
                    className="_fill-btn-blue ml-4"
                  >
                    <i className="bx bx-trash-alt text-base"></i>
                  </button>
                </div>
              }
            />
          ))}
        </div>
        {showConfirm && (
          <ConfirmationPopup
            confirmText={`Remove this course from wishlist? :\n "${selected?.title}"`}
            onCancel={() => setShowConfirm(false)}
            onConfirm={() => removeFromWishlist(selected?._id!)}
          />
        )}
      </>
    );
  } else {
    return (
      <div className="flex w-full mt-52 items-center justify-center">
        <div className="flex flex-col">
          <img src="" alt="" />
          <p className="font-semibold text-lg">
            No courses in wishlist. <br className="block md:hidden" />
            <Link to={"/courses"} className="text-sky-600">
              Explore courses
            </Link>
          </p>
        </div>
      </div>
    );
  }
};

export default Wishlist;
