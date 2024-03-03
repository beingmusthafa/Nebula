import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import RatingStars from "../../components/RatingStars";
import Accordions from "../../components/Accordions";
import ChaptersAccordionSkeletion from "../../components/skeletons/ChaptersAccordionSkeletion";
import CourseDetailsSkeleton from "../../components/skeletons/CourseDetailsSkeleton";
interface Course {
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  rating: number;
  language: string;
  tutor: {
    name: string;
    image: string;
    bio: string;
  };
  benefits: string[];
  requirements: string[];
}
interface Chapter {
  title: string;
  videos: { title: string; duration: string }[];
  exercises: { title: string; duration: string }[];
}
const Course_tutor = () => {
  const { id } = useParams();
  let [course, setCourse] = useState<Course | null>(null);
  let [loading, setLoading] = useState(true);
  let [chapters, setChapters] = useState<Chapter[] | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    try {
      setLoading(true);
      async function getCourse() {
        const res = await fetch(`/api/get-course-details/${id}`).then((res) =>
          res.json()
        );
        console.log(res);
        if (!res.success) return toast.error(res.message);
        setCourse(res.doc);
        setLoading(false);
      }
      getCourse();
    } catch (error) {
      console.log(error);
    }
  }, []);
  const accordionData: { title: string; content: JSX.Element[] }[] = [];
  if (chapters) {
    chapters.forEach((chapter, i) => {
      let content: JSX.Element[] = [];
      chapter.videos.forEach((video, i) => {
        content.push(
          <div key={i} className="flex justify-between w-11/12">
            <div className="flex items-center">
              <i className="bx bx-video text-xl text-slate-500 mr-2"></i>
              {video.title}
            </div>
            <p>{video.duration}</p>
          </div>
        );
      });
      chapter.exercises.forEach((exercise, i) => {
        content.push(
          <div key={i} className="flex justify-between w-11/12">
            <div className="flex items-center">
              <i className="bx bx-notepad text-xl text-slate-500 mr-2"></i>
              {`Exercise - ${i + 1}`}
            </div>
          </div>
        );
      });
      accordionData.push({
        title: `Chapter ${i + 1} - ${chapter.title}`,
        content,
      });
    });
  }
  return (
    <>
      {course ? (
        <>
          <div className="bg-gray-800 h-fit w-full flex  md:flex-row flex-col justify-center gap-20 p-10">
            <div className="flex flex-col text-white gap-2 order-2 md:order-1">
              <h1 className="_font-dm-display text-2xl">{course.title}</h1>
              <p className="text-wrap w-80 text-ellipsis overflow-hidden">
                {course.description}
              </p>
              <div className="flex">
                <p className="_font-tilt-warp text-lg mr-4">{course.rating}</p>
                <RatingStars rating={course.rating} starSize={1} />
              </div>
              <div className="flex gap-10">
                <div className="flex items-center text-base gap-2">
                  <i className="bx bx-time-five text-xl"></i>1 hour 10 minutes
                </div>
                <div className="flex items-center text-base gap-2">
                  <i className="bx bx-user-voice text-xl"></i>
                  {course.language}
                </div>
              </div>
            </div>

            <div className="flex flex-col order-1 md:order-2 md:sticky md:top-40">
              <img
                className="w-80 h-36 object-cover"
                src={course.thumbnail}
                alt=""
              />
              <Link
                to={"/tutor/edit-course/" + id}
                className="_fill-btn-blue text-center"
              >
                Edit course
              </Link>
            </div>
          </div>
          {course.benefits.length > 0 && (
            <>
              <h2 className="_section-title2">Course benefits</h2>
              <div className="flex flex-col items-start mx-auto px-10 gap-2">
                {course.benefits.map((benefit, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-base text-wrap overflow-hidden text-ellipsis"
                    style={{ maxWidth: "90%" }}
                  >
                    <i className="bx bx-check text-2xl text-green-600"></i>
                    {benefit}
                  </div>
                ))}
              </div>
            </>
          )}
          {course.requirements.length > 0 && (
            <>
              <h2 className="_section-title2">Pre-requisites</h2>
              <div className="flex flex-col items-start mx-auto px-10 gap-2">
                {course.requirements.map((requirement, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-base text-wrap overflow-hidden text-ellipsis"
                    style={{ maxWidth: "90%" }}
                  >
                    <i className="bx bx-info-circle text-2xl"></i>
                    {requirement}
                  </div>
                ))}
              </div>
            </>
          )}
          <div className="flex w-full p-4 justify-between">
            <div className="_font-dm-display text-xl w-fit">
              Course contents
            </div>
            <button className="_fill-btn-blue w-fit">Add chapter</button>
          </div>
        </>
      ) : (
        <CourseDetailsSkeleton />
      )}
      {chapters ? (
        <Accordions data={accordionData} />
      ) : (
        <ChaptersAccordionSkeletion />
      )}
    </>
  );
};

export default Course_tutor;