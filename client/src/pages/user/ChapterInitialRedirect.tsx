import React, { useState } from "react";
import Loading from "../../components/Loading";
import { useNavigate, useParams } from "react-router-dom";

const ChapterInitialRedirect = () => {
  const { courseId, chapterId } = useParams();
  const navigate = useNavigate();
  const handleRedirect = async () => {
    try {
      const res = await fetch(
        `/api/get-chapter-redirect-info/${courseId}/${chapterId}`
      ).then((res) => res.json());
      console.log({ res });
      if (!res.success) throw new Error(res.message);
      location.href = `/my-courses/learn/${courseId}/${chapterId}/${res.nextResource}/1`;
    } catch (error) {
      console.log(error);
    }
  };
  handleRedirect();
  return <Loading />;
};

export default ChapterInitialRedirect;
