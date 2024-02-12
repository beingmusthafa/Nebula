import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Loading from "../../components/Loading";
import RatingStars from "../../components/RatingStars";
import { Link } from "react-router-dom";

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  rating: number;
  ratingCount: number;
  language: string;
  tutor: {
    name: string;
    image: string;
    bio: string;
  };
  benefits: string[];
  requirements: string[];
}
const Wishlist = () => {
  let [courses, setCourses] = useState<Course[]>([]);
  let [loading, setLoading] = useState<boolean>(true);
  console.log(courses);
  async function getWishlistCourses() {
    setLoading(true);
    const res = await fetch("/api/get-wishlist-courses").then((res) =>
      res.json()
    );
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
    } finally {
      setLoading(false);
    }
  }, []);
  const removeFromWishlist = async (id: string) => {
    try {
      const res = await fetch("/api/remove-from-wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: id,
        }),
      }).then((res) => res.json());
      if (!res.success) return toast.error(res.message);
      getWishlistCourses();
      toast.success(res.message);
    } catch (error) {
      console.log(error);
    }
  };
  const moveToCart = async (id: string) => {
    try {
      const res = await fetch("/api/add-to-cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: id,
        }),
      }).then((res) => res.json());
      if (!res.success) return toast.error(res.message);
      removeFromWishlist(id);
      toast.success(res.message);
    } catch (error) {
      console.log(error);
    }
  };
  return loading ? (
    <Loading />
  ) : courses.length > 0 ? (
    <div className="flex justify-evenly md:justify-start flex-wrap gap-8 p-8">
      {courses.map((course, i) => (
        <div key={i} className="flex flex-col items-start w-fit">
          <Link to={"/courses/course-details/" + course._id}>
            <img
              src={course.thumbnail}
              className="object-cover w-64 h-36"
              alt=""
            />
            <div className="font-bold text-lg text-wrap" style={{ width: 270 }}>
              {course.title}
            </div>
          </Link>
          {/* <div className="flex gap-2 items-center">
            <img
              src={course.tutor.image}
              alt=""
              className="w-6 h-6 rounded-full"
            />
            <p>{course.tutor.name}</p>
          </div> */}
          <div className="flex items-center">
            <span className="_font-tilt-warp mr-2 text-lg">
              {course.rating}
            </span>
            <RatingStars rating={course.rating} />({course.ratingCount})
          </div>
          <div className="flex justify-between w-64">
            <p className="font-bold text-lg">{course.price}</p>
            <div className="flex ">
              <button
                onClick={() => moveToCart(course._id)}
                className="_fill-btn-blue"
              >
                <i className="bx bx-cart-add text-lg"></i>
              </button>
              <button
                onClick={() => removeFromWishlist(course._id)}
                className="_fill-btn-blue ml-4"
              >
                <i className="bx bx-trash-alt text-lg"></i>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  ) : (
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
};

export default Wishlist;