import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../services/firebase";

function Login() {

  const loginGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);

      console.log(result.user);

      alert(`Bienvenido ${result.user.displayName}`);
    } catch (error) {
      console.error(error);
      alert("Error al iniciar sesión");
    }
  };

  return (
    <div>
      <h1>Portal HTA</h1>

      <button onClick={loginGoogle}>
        Iniciar sesión con Google
      </button>
    </div>
  );
}

export default Login;