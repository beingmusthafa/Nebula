import React, { useEffect, useState } from "react";
import CourseCard from "../../components/CourseCard";
import CourseSkeleton from "../../components/skeletons/CourseSkeleton";
import { Link } from "react-router-dom";
import ICourse from "../../interfaces/courses.interface";

const Home = () => {
  const [images, setImages] = useState<
    { _id: string; image: string; link: string }[]
  >([]);
  const [lists, setLists] = useState<
    { category: string; courses: ICourse[] }[]
  >([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  let skeletons = new Array(7).fill(0);
  useEffect(() => {
    async function getSlides() {
      try {
        const res = await fetch(
          import.meta.env.VITE_API_BASE_URL + "/api/get-home-data",
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer " + localStorage.getItem("token"),
            },
          }
        ).then((res) => res.json());
        if (!res.success) throw new Error(res.message);
        setImages(res.banners);
        setLists(res.categories);
      } catch (error) {
        console.log(error);
      }
    }
    getSlides();
  }, []);
  useEffect(() => {
    if (images.length > 1) {
      const timer = setTimeout(() => {
        const nextIndex = (currentIndex + 1) % images.length;
        setCurrentIndex(nextIndex);
      }, 3000);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [currentIndex, images.length]);
  return (
    <>
      {images.length > 0 ? (
        <Link to={images[currentIndex]?.link}>
          <img
            className="w-full object-cover"
            src={images[currentIndex]?.image}
            alt="Banner"
          />
        </Link>
      ) : (
        <div className="w-full h-[30vh] md:h-[70vh] bg-slate-300 animate-pulse"></div>
      )}
      <Link
        to="/courses"
        className="_font-dm-display w-fit block mx-auto mt-4 _fill-btn-black2"
      >
        Explore courses
      </Link>
      {lists?.length > 0 ? (
        lists?.map(
          (list, i) =>
            list.courses.length > 0 && (
              <>
                <div key={list.category} className="_section-title">
                  {list.category} courses
                </div>
                <div className="flex gap-4 whitespace-nowrap overflow-x-auto px-6 _no-scrollbar bg-white">
                  {list?.courses?.map((course) => (
                    <CourseCard key={course._id} course={course} />
                  ))}
                </div>
              </>
            )
        )
      ) : (
        <div className="flex gap-4 whitespace-nowrap overflow-x-auto px-6 _no-scrollbar bg-white mt-10">
          {skeletons.map((_, index) => (
            <CourseSkeleton key={index} />
          ))}
        </div>
      )}
    </>
  );
};

export default Home;
