import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Registro.css";

function Registro() {

  const navigate = useNavigate();

  const [rol, setRol] = useState("");

  // Campos de PACIENTE
  const [dni, setDni] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [centroSalud, setCentroSalud] = useState("");

  // Campos de MEDICO
  // ANTES: estos inputs no tenían value/onChange, así que nunca se
  // guardaba nada (ni en el estado ni en la base de datos).
  const [cmp, setCmp] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [centroSaludMedico, setCentroSaludMedico] = useState("");
  const [telefonoMedico, setTelefonoMedico] = useState("");

  // Campos de ADMIN
  const [cargo, setCargo] = useState("");
  const [area, setArea] = useState("");
  const [telefonoAdmin, setTelefonoAdmin] = useState("");

  const [guardando, setGuardando] = useState(false);

  const guardarRegistro = async () => {

    if (!rol) {
      alert("Seleccione un rol");
      return;
    }

    // Validación mínima por rol antes de enviar
    if (rol === "PACIENTE" && !dni) {
      alert("El DNI es obligatorio");
      return;
    }

    if (rol === "MEDICO" && (!cmp || !especialidad || !centroSaludMedico)) {
      alert("CMP, especialidad y centro de salud son obligatorios");
      return;
    }

    if (rol === "ADMIN" && (!cargo || !area)) {
      alert("Cargo y área son obligatorios");
      return;
    }

    try {

      setGuardando(true);

      const firebase_uid = localStorage.getItem("firebase_uid");

      // Cuerpo base + campos propios de cada rol.
      // El backend ignora las llaves que no le correspondan a la tabla
      // que va a insertar, así que es seguro enviarlas todas juntas.
      const body = {
        firebase_uid,
        rol,
        // Paciente
        dni,
        telefono: rol === "MEDICO" ? telefonoMedico : rol === "ADMIN" ? telefonoAdmin : telefono,
        direccion,
        fecha_nacimiento: fechaNacimiento,
        centro_salud: rol === "MEDICO" ? centroSaludMedico : centroSalud,
        // Médico
        cmp,
        especialidad,
        // Admin
        cargo,
        area
      };

      const response = await fetch(
        "http://localhost:3000/api/usuarios/perfil",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body)
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

    } finally {

      setGuardando(false);

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
              value={cmp}
              onChange={(e) => setCmp(e.target.value)}
            />

            <input
              type="text"
              placeholder="Especialidad"
              value={especialidad}
              onChange={(e) => setEspecialidad(e.target.value)}
            />

            <input
              type="text"
              placeholder="Centro de Salud"
              value={centroSaludMedico}
              onChange={(e) => setCentroSaludMedico(e.target.value)}
            />

            <input
              type="text"
              placeholder="Teléfono"
              value={telefonoMedico}
              onChange={(e) => setTelefonoMedico(e.target.value)}
            />

          </>

        )}

        {rol === "ADMIN" && (

          <>

            <input
              type="text"
              placeholder="Cargo"
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
            />

            <input
              type="text"
              placeholder="Área"
              value={area}
              onChange={(e) => setArea(e.target.value)}
            />

            <input
              type="text"
              placeholder="Teléfono"
              value={telefonoAdmin}
              onChange={(e) => setTelefonoAdmin(e.target.value)}
            />

          </>

        )}

        <button
          onClick={guardarRegistro}
          disabled={guardando}
        >
          {guardando ? "Guardando..." : "Guardar y Continuar"}
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