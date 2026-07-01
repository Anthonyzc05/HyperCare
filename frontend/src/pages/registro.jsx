import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Registro.css";

function Registro() {

  const navigate = useNavigate();

  const [rol, setRol] = useState("");
  const [dni, setDni] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [centroSalud, setCentroSalud] = useState("");

  const guardarRegistro = async () => {

    if (!rol) {
      alert("Seleccione un rol");
      return;
    }

    try {

      const firebase_uid = localStorage.getItem("firebase_uid");

      const response = await fetch(
        "http://localhost:3000/api/usuarios/perfil",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            firebase_uid,
            rol,
            dni,
            telefono,
            direccion,
            fecha_nacimiento: fechaNacimiento,
            centro_salud: centroSalud
          })
        }
      );

      const data = await response.json();

      console.log(data);

      alert("Datos guardados correctamente");

      if (rol === "PACIENTE") {
        navigate("/dashboardPaciente");
      }

      if (rol === "MEDICO") {
        navigate("/dashboardMedico");
      }

      if (rol === "ADMIN") {
        navigate("/dashboardAdmin");
      }

    } catch (error) {

      console.error(error);

      alert("Error al guardar");

    }

  };

  return (

    <div className="registro-container">

      <div className="registro-card">

        <h1>Completa tu Perfil</h1>

        <p>
          Selecciona tu rol y completa la información solicitada.
        </p>

        <select
          value={rol}
          onChange={(e) => setRol(e.target.value)}
        >
          <option value="">Seleccione un rol</option>

          <option value="PACIENTE">
            Paciente
          </option>

          <option value="MEDICO">
            Médico
          </option>

          <option value="ADMIN">
            Administrador
          </option>

        </select>

        {rol === "PACIENTE" && (

          <>

            <input
              type="text"
              placeholder="DNI"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
            />

            <input
              type="text"
              placeholder="Teléfono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />

            <input
              type="text"
              placeholder="Dirección"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
            />

            <input
              type="date"
              value={fechaNacimiento}
              onChange={(e) => setFechaNacimiento(e.target.value)}
            />

            <select
              value={centroSalud}
              onChange={(e) => setCentroSalud(e.target.value)}
            >

              <option value="">
                Seleccione un Centro de Salud
              </option>

              <option value="Hospital Nacional Dos de Mayo">
                Hospital Nacional Dos de Mayo
              </option>

              <option value="Hospital Cayetano Heredia">
                Hospital Cayetano Heredia
              </option>

              <option value="Hospital Edgardo Rebagliati">
                Hospital Edgardo Rebagliati
              </option>

              <option value="Hospital Arzobispo Loayza">
                Hospital Arzobispo Loayza
              </option>

              <option value="Hospital María Auxiliadora">
                Hospital María Auxiliadora
              </option>

            </select>

          </>

        )}

        {rol === "MEDICO" && (

          <>

            <input
              type="text"
              placeholder="CMP"
            />

            <input
              type="text"
              placeholder="Especialidad"
            />

            <input
              type="text"
              placeholder="Centro de Salud"
            />

          </>

        )}

        {rol === "ADMIN" && (

          <>

            <input
              type="text"
              placeholder="Cargo"
            />

            <input
              type="text"
              placeholder="Área"
            />

          </>

        )}

        <button
          onClick={guardarRegistro}
        >
          Guardar y Continuar
        </button>

        <button
          type="button"
          onClick={() => navigate("/dashboard")}
        >
          Omitir por ahora
        </button>

      </div>

    </div>

  );

}

export default Registro;