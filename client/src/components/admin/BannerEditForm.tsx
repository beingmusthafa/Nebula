import React, { useState, useRef } from "react";
import { Banner } from "../../pages/admin/Banners_admin";
import { toast } from "react-toastify";

interface Props {
  data: Banner;
  getData: () => void;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}
const BannerEditForm: React.FC<Props> = ({ setShow, data, getData }) => {
  const [error, setError] = useState("");
  const [image, setImage] = useState<File | null>(null);
  let linkRef = useRef<HTMLInputElement>(null);
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const toastId = toast.loading("Editing banner");
    try {
      const formData = new FormData();
      if (image) formData.append("image", image!);
      if (!linkRef.current?.value.trim()) throw new Error("No link provided");
      if (linkRef.current!.value.length < 10) throw new Error("Invalid link");
      if (linkRef.current!.value.length > 1000)
        throw new Error("Link too long");
      formData.append("link", linkRef.current!.value);
      const res = await fetch(
        import.meta.env.VITE_API_BASE_URL +
          "/api/admin/edit-banner/" +
          data._id,
        {
          headers: {
            "Authorization": "Bearer " + localStorage.getItem("token"),
          },
          method: "PUT",
          body: formData,
        }
      ).then((res) => res.json());
      toast.dismiss(toastId);
      if (!res.success) throw new Error(res.message);
      toast.success("Banner edited successfully");
      getData();
      setShow(false);
    } catch (error: any) {
      setError(error.message);
      console.log(error);
    }
  };
  return (
    <div className="flex w-full justify-center">
      <form
        className="_screen-center flex flex-col _no-scrollbar bg-white border-4 _border-blue-black-gradient gap-4 p-6 min-w-72"
        style={{ zIndex: 15 }}
      >
        <h1 className="_font-dm-display text-center text-lg">Edit banner</h1>
        {error && <p className="text-red-500 font-semibold my-4">{error}</p>}
        <img
          loading="lazy"
          className="mx-auto"
          src={image ? URL.createObjectURL(image) : data.image}
          alt=""
          height={60}
          width={180}
        />
        <input
          type="file"
          id="uploadBanner"
          className="w-32 font-semibold text-lg mx-auto mb-2 border border-black hidden"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            e.target.files && setImage(e.target.files[0])
          }
          accept="image/*"
        />
        <label
          htmlFor="uploadBanner"
          className="_fill-btn-black w-fit mx-auto mb-6"
        >
          Choose banner
        </label>
        <input
          className="border border-black p-2"
          defaultValue={data.link}
          ref={linkRef}
          type="text"
          placeholder="Redirect link"
        />
        <div className="flex w-full justify-evenly">
          <button
            type="button"
            onClick={() => setShow(false)}
            className="text-red-500 font-semibold"
          >
            Cancel
          </button>
          <button onClick={handleEdit} type="submit" className="_fill-btn-blue">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default BannerEditForm;
