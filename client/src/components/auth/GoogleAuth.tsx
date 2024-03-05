import { auth } from "../../config/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useDispatch } from "react-redux";
import { signIn } from "../../redux/user/userSlice";
import { useNavigate } from "react-router-dom";

const GoogleAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleGoogleAuth = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log(result);
      const res = await fetch(
        import.meta.env.VITE_API_BASE_URL + "/api/auth/google-auth",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: result.user.displayName,
            email: result.user.email,
          }),
        }
      ).then((res) => res.json());
      console.log("res", res);
      if (!res.success) return console.log(res.message);
      console.log(res.user);
      dispatch(signIn(res.user));
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <button type="button" onClick={handleGoogleAuth} className="_outline-btn ">
      Continue with <i className="bx bxl-google"></i>
    </button>
  );
};

export default GoogleAuth;
