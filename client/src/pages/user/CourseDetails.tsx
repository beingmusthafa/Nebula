import React from "react";
import RatingStars from "../../components/RatingStars";
import Accordions from "../../components/Accordions";
import { useParams } from "react-router-dom";
import courses from "../../../testdata/courses";
import chapters from "../../../testdata/chapters";

const CourseDetails = () => {
  const { id } = useParams();
  let course = courses[Number(id) - 1];
  console.log(course);
  const tutor = {
    bio: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sit similique, ducimus dolorum dolore, laboriosam magni, quae sapiente culpa soluta commodi autem nostrum modi aliquam! Nam, accusamus pariatur? Possimus, sint ratione",
    courseCount: 10,
    studentCount: 56700,
    rating: 4,
  };
  const accordionData: { title: string; content: JSX.Element[] }[] = [];
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
  return (
    <>
      <div className="bg-gray-800 h-fit w-full flex  md:flex-row flex-col justify-center gap-20 p-10">
        <div className="flex flex-col text-white gap-2 order-2 md:order-1">
          <h1 className="_font-dm-display text-2xl">{course.title}</h1>
          <p className="text-wrap w-80 text-ellipsis overflow-hidden">
            {course.description}
          </p>
          <div className="flex">
            <p className="_font-tilt-warp text-lg mr-4">3.7</p>
            <RatingStars rating={course.rating} starSize={1} />
          </div>
          <div className="flex gap-10">
            <div className="flex items-center text-base gap-2">
              <i className="bx bx-time-five text-xl"></i>1 hour 10 minutes
            </div>
            <div className="flex items-center text-base gap-2">
              <i className="bx bx-user-voice text-xl"></i>English
            </div>
          </div>
        </div>

        <div className="flex flex-col order-1 md:order-2 md:sticky md:top-40">
          <img
            className="w-80 h-36 object-cover"
            src={course.thumbnail}
            alt=""
          />
          <div className="flex mx-auto gap-4 mt-4">
            <button className="_fill-btn-blue">Add to cart</button>
            <button
              className="_fill-btn-blue"
              // onClick={addtoWishlist}
            >
              <i className="bx bx-heart text-xl"></i>
            </button>
            <button
              className="_fill-btn-blue"
              // onClick={removetoWishlist}
            >
              <i className="bx bxs-heart text-xl"></i>
            </button>
          </div>
        </div>
      </div>
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
        {/* ... rest of your code ... */}
      </div>
      <h1 className="_section-title2">Course contents</h1>
      <Accordions data={accordionData} />
      <div className="flex flex-col border-2 w-4/5 md:w-1/2 mx-auto mt-10 p-6 rounded-2xl border-slate-800">
        <h1 className="font-bold uppercase text-base mb-4">Tutor details</h1>
        <div className="flex items-start">
          <img
            src={course.tutor.image}
            className="w-32 h-32 mr-4 rounded-full"
            alt=""
          />
          <div className="flex flex-col">
            <p className="text-lg font-semibold">{course.tutor.name}</p>
            <p className="text-sm mb-4 text-slate-600">{tutor.bio}</p>
            <div className="flex items-center gap-2 font-semibold">
              <i className="bx bx-movie-play text-xl"></i>
              {tutor.courseCount} courses
            </div>
            <div className="flex items-center gap-2 font-semibold">
              <i className="bx bxs-graduation text-xl"></i>
              {tutor.studentCount} students
            </div>
            <div className="flex items-center gap-2 font-semibold">
              <i className="bx bx-star text-xl"></i>
              {tutor.rating}/5 average rating
            </div>
          </div>
        </div>
      </div>
    </> // This is the missing closing tag
  );
};

export default CourseDetails;
