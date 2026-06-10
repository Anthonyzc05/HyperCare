import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../services/firebase";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const loginGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);

      console.log("Usuario:", result.user);

      await fetch("http://localhost:3000/api/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firebase_uid: result.user.uid,
          nombre: result.user.displayName,
          email: result.user.email,
          foto: result.user.photoURL,
        }),
      });

      alert(`Bienvenido ${result.user.displayName}`);

      navigate("/dashboard");

    } catch (error) {
      console.error("Error:", error);
      alert("Error al iniciar sesión");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <h1>Portal HTA</h1>

      <button
        onClick={loginGoogle}
        style={{
          padding: "12px 20px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Iniciar sesión con Google
      </button>
    </div>
  );
}

export default Login;