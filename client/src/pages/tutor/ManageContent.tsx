import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import RatingStars from "../../components/RatingStars";
import Loading from "../../components/Loading";
import ChaptersAccordionSkeletion from "../../components/skeletons/ChaptersAccordionSkeletion";
import Accordions from "../../components/Accordions";
import chaptersData from "../../../testdata/chapters";
import AddVideoForm from "../../components/tutor/AddVideoForm";
import EditVideoForm from "../../components/tutor/EditVideoForm";
import AddExerciseForm from "../../components/tutor/AddExerciseForm";
import EditExerciseForm from "../../components/tutor/EditExerciseForm";
import AddChapterForm from "../../components/tutor/AddChapterForm";
import EditChapterForm from "../../components/tutor/EditChapterForm";
import ConfirmationPopup from "../../components/ConfirmationPopup";
interface Course {
  _id: string;
  title: string;
  rating: number;
  ratingCount: number;
  price: number;
  thumbnail: string;
  description: string;
  language: string;
  tutor: {
    name: string;
    image: string;
  };
}
interface Chapter {
  _id: string;
  title: string;
  order: number;
  videos: Video[];
  exercises: any[];
}
interface Video {
  _id: string;
  video: string;
  order: number;
  title: string;
  duration: number;
  chapter: string;
  course: string;
}
interface Exercise {
  _id: string;
  order: number;
  title: string;
  chapter: string;
  course: string;
  question: string;
  options: string[];
  answer: string;
}
const ManageContent = () => {
  const { id } = useParams();
  let [course, setCourse] = useState<Course | null>(null);
  let [chapters, setChapters] = useState<Chapter[]>([]);
  console.log(chapters);

  let [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  let [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  let [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  let [showAddChapterForm, setShowAddChapterForm] = useState(false);
  let [showEditChapterForm, setShowEditChapterForm] = useState(false);
  let [showAddVideoForm, setShowAddVideoForm] = useState(false);
  let [showEditVideoForm, setShowEditVideoForm] = useState(false);
  let [showAddExerciseForm, setShowAddExerciseForm] = useState(false);
  let [showEditExerciseForm, setShowEditExerciseForm] = useState(false);
  let [deleteItem, setDeleteItem] = useState<
    "chapter" | "video" | "exercise" | null
  >(null);
  let [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  let [loading, setLoading] = useState(true);
  const getData = async () => {
    const res = await fetch(`/api/get-course-details/${id}`).then((res) =>
      res.json()
    );
    if (!res.success) return toast.error(res.message);
    setCourse(res.doc);
    setChapters(res.chapters);
    setLoading(false);
  };
  useEffect(() => {
    getData();
  }, []);
  let accordionData: { title: JSX.Element; content: JSX.Element[] }[] = [];
  if (chapters) {
    chapters.forEach((chapter, i) => {
      let content: JSX.Element[] = [];
      chapter.videos?.forEach((video, i) => {
        content.push(
          <div
            key={video._id}
            className="flex justify-between w-11/12 py-2 border-t border-slate-600"
          >
            <div className="flex items-center">
              <i className="bx bx-movie-play text-xl text-slate-500 mr-2"></i>
              {video.title}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedChapter(chapter);
                  setSelectedVideo(video);
                  setDeleteItem("video");
                  setShowDeleteConfirm(true);
                }}
              >
                <i className="bx bx-trash-alt text-red-500 text-xl"></i>
              </button>

              <button
                onClick={() => {
                  setSelectedChapter(chapter);
                  setSelectedVideo(video);
                  setShowEditVideoForm(true);
                }}
              >
                <i className="bx bx-edit text-xl"></i>
              </button>
            </div>
          </div>
        );
      });
      chapter.exercises?.forEach((exercise, i) => {
        content.push(
          <div
            key={i}
            className="flex justify-between w-11/12 py-2 border-t border-slate-600"
          >
            <div className="flex items-center">
              <i className="bx bx-notepad text-xl text-slate-500 mr-2"></i>
              {`Exercise - ${i + 1}`}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedChapter(chapter);
                  setSelectedExercise(exercise);
                  setDeleteItem("exercise");
                  setShowDeleteConfirm(true);
                }}
              >
                <i className="bx bx-trash-alt text-red-500 text-xl"></i>
              </button>
              <button
                onClick={() => {
                  setSelectedChapter(chapter);
                  setSelectedExercise(exercise);
                  setShowEditExerciseForm(true);
                }}
              >
                <i className="bx bx-edit text-xl"></i>
              </button>
            </div>
          </div>
        );
      });
      const title = (
        <div className="flex w-full justify-between items-center">
          <p className="text-base">
            {chapter.order} : {chapter.title}
          </p>
          <div className="flex gap-4 mr-2 items-center">
            <button
              onClick={() => {
                setSelectedChapter(chapter);
                setShowAddVideoForm(true);
              }}
              className="flex items-center"
            >
              + <i className="bx bx-movie-play text-lg"></i>
            </button>
            <button
              onClick={() => {
                setSelectedChapter(chapter);
                setShowAddExerciseForm(true);
              }}
              className="flex items-center"
            >
              +<i className="bx bx-notepad text-lg"></i>
            </button>
            <button
              onClick={() => {
                setSelectedChapter(chapter);
                setShowEditChapterForm(true);
              }}
            >
              <i className="bx bx-edit text-xl"></i>
            </button>
            <button
              onClick={() => {
                setSelectedChapter(chapter);
                setDeleteItem("chapter");
                setShowDeleteConfirm(true);
              }}
            >
              <i className="bx bx-trash-alt text-red-500 text-xl"></i>
            </button>
          </div>
        </div>
      );
      accordionData.push({
        title,
        content,
      });
    });
  }
  const handleDelete = async () => {
    const toastId = toast.loading("Deleting " + deleteItem);
    try {
      let itemId;
      if (deleteItem === "chapter") itemId = selectedChapter?._id;
      else if (deleteItem === "video") itemId = selectedVideo?._id;
      else if (deleteItem === "exercise") itemId = selectedExercise?._id;
      const res = await fetch(`/api/tutor/delete-${deleteItem}/${itemId}`, {
        method: "DELETE",
      }).then((res) => res.json());
      toast.dismiss(toastId);
      if (!res.success) return toast.error(res.message);
      toast.success("deleted item successfullly");
    } catch (error) {
      console.log(error);
      toast.dismiss(toastId);
    } finally {
      setDeleteItem(null);
      setShowDeleteConfirm(false);
      getData();
    }
  };
  return course ? (
    <>
      {showAddChapterForm && (
        <AddChapterForm course={id!} setShow={setShowAddChapterForm} />
      )}
      {showEditChapterForm && (
        <EditChapterForm
          course={id!}
          setShow={setShowEditChapterForm}
          data={selectedChapter!}
        />
      )}
      {showAddVideoForm && (
        <AddVideoForm
          setShow={setShowAddVideoForm}
          course={id!}
          chapter={selectedChapter!._id}
        />
      )}
      {showEditVideoForm && (
        <EditVideoForm
          setShow={setShowEditVideoForm}
          course={id!}
          chapter={selectedChapter!._id}
          data={selectedVideo!}
        />
      )}
      {showAddExerciseForm && (
        <AddExerciseForm
          setShow={setShowAddExerciseForm}
          course={id!}
          chapter={selectedChapter!._id}
        />
      )}
      {showEditExerciseForm && (
        <EditExerciseForm
          setShow={setShowEditExerciseForm}
          data={selectedExercise!}
          course={id!}
          chapter={selectedChapter!._id}
        />
      )}
      {showDeleteConfirm && (
        <ConfirmationPopup
          isActionPositive={false}
          confirmText={`Delete this ${deleteItem}?${
            deleteItem === "chapter"
              ? " All content inside will be deleted"
              : ""
          }`}
          onCancel={() => {
            setDeleteItem(null);
            setShowDeleteConfirm(false);
          }}
          onConfirm={() => handleDelete()}
        />
      )}
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

        <div className="flex flex-col order-1 md:order-2">
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
      <div className="flex w-full p-4 justify-between mb-8">
        <div className="_font-dm-display text-xl w-fit">Course contents</div>
        <button
          onClick={() => setShowAddChapterForm(true)}
          className="_fill-btn-blue w-fit"
        >
          Add chapter
        </button>
      </div>
      <Accordions data={accordionData} />
    </>
  ) : (
    <Loading />
  );
};

export default ManageContent;