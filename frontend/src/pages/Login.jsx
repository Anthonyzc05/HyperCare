import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import doctor from "../assets/images/doctor.png";
import doctora from "../assets/images/doctora.png";
import sede from "../assets/images/sede.png";
import videoPortalHTA from "../videos/portalhta.mp4";
import logo from "../assets/images/logo.png";

import "../styles/Login.css";

/* ── Iconos de línea ── */
function IconUser(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5 20c0-3.6 3.1-6.4 7-6.4s7 2.8 7 6.4" />
    </svg>
  );
}
function IconStethoscope(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 4v5a4 4 0 0 0 8 0V4" />
      <path d="M9 13v2a5 5 0 0 0 10 0v-1.5" />
      <circle cx="20" cy="12.2" r="1.6" />
    </svg>
  );
}
function IconSettings(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 13a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V19a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H4a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3h0a1.7 1.7 0 0 0 1-1.5V4a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v0a1.7 1.7 0 0 0 1.5 1H20a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.6 1z" />
    </svg>
  );
}
function IconPin(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 21s-7-6.1-7-11a7 7 0 1 1 14 0c0 4.9-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.4" />
    </svg>
  );
}
function IconMail(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}
function IconPhone(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 4h3l1.5 4.5L7.5 10a11 11 0 0 0 6.5 6.5l1.5-2 4.5 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
    </svg>
  );
}
function IconClock(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}
function IconLogin(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
      <path d="M10 16l4-4-4-4" />
      <path d="M14 12H3" />
    </svg>
  );
}
function IconInfo(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <circle cx="12" cy="7.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconHelp(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.2a2.5 2.5 0 1 1 4.2 1.8c-.8.6-1.7 1-1.7 2.3" />
      <circle cx="12" cy="16.6" r="0.7" fill="currentColor" stroke="none" />
    </svg>
  );
}

const imagenes = [doctor, doctora, sede];

const overlayTexts = [
  { title: "Accede a todos tus resultados", desc: "Consulta información médica de manera rápida y segura." },
  { title: "Atención médica de calidad",    desc: "Médicos especializados en hipertensión arterial." },
  { title: "Encuentra tu sede más cercana", desc: "Sedes disponibles en toda Lima Metropolitana." },
];

function Login() {
  const navigate = useNavigate();
  const [actual, setActual] = useState(0);

  /* ── Slider automático ── */
  useEffect(() => {
    const intervalo = setInterval(() => {
      setActual((prev) => (prev + 1) % imagenes.length);
    }, 4000);
    return () => clearInterval(intervalo);
  }, []);

  /* ──  Mapa ── */
  useEffect(() => {

    function initLeafletMap() {
      const container = document.getElementById("leaflet-map");
      if (!container || !window.L) return;

      if (window._htaMap) {
        window._htaMap.remove();
        window._htaMap = null;
      }

      const sedes = [
        { lat: -12.1191, lng: -77.0308, nombre: "Sede Central",    direccion: "Av. Larco 345, Miraflores" },
        { lat: -12.0978, lng: -77.0365, nombre: "Sede San Isidro", direccion: "Calle Las Flores 120, San Isidro" },
        { lat: -11.9800, lng: -77.0900, nombre: "Sede Los Olivos", direccion: "Av. Universitaria 890, Los Olivos" },
      ];

      const map = window.L.map("leaflet-map", {
        center: [-12.1000, -77.0400],
        zoom: 12,
        scrollWheelZoom: false,
      });

      window._htaMap = map;

      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      const icono = window.L.divIcon({
        className: "",
        html: `<div style="
          width:14px;height:14px;
          background:#AC4736;
          border:2px solid #fff;
          border-radius:50%;
          box-shadow:0 0 0 3px rgba(172,71,54,0.22)
        "></div>`,
        iconSize:   [14, 14],
        iconAnchor: [7, 7],
      });

      sedes.forEach((s) => {
        window.L.marker([s.lat, s.lng], { icon: icono })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:'IBM Plex Sans',sans-serif;min-width:150px">
              <p style="font-weight:600;font-size:13px;margin:0 0 3px;color:#16304A">
                Portal HTA — ${s.nombre}
              </p>
              <p style="font-size:12px;color:#5B6B7A;margin:0">${s.direccion}</p>
            </div>
          `);
      });
    }

    if (!document.getElementById("leaflet-css")) {
      const link  = document.createElement("link");
      link.id     = "leaflet-css";
      link.rel    = "stylesheet";
      link.href   = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    if (window.L) {
      initLeafletMap();
      return;
    }

    if (!document.getElementById("leaflet-js")) {
      const script  = document.createElement("script");
      script.id     = "leaflet-js";
      script.src    = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => initLeafletMap();
      document.head.appendChild(script);
    }

    return () => {
      if (window._htaMap) {
        window._htaMap.remove();
        window._htaMap = null;
      }
    };
  }, []);

  /* ── Login con Google ── */
  const loginGoogle = async () => {

    try {

      const result = await signInWithPopup(auth, provider);

      localStorage.setItem(
        "firebase_uid",
        result.user.uid
      );

      // Registrar usuario si no existe
      await fetch(
        "http://localhost:3000/api/usuarios",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            firebase_uid: result.user.uid,
            nombre: result.user.displayName,
            email: result.user.email,
            foto: result.user.photoURL
          })
        }
      );

      // Obtener datos del usuario
      const response = await fetch(
        `http://localhost:3000/api/usuarios/${result.user.uid}`
      );

      const usuario = await response.json();

      console.log(usuario);

      // Perfil completo
      if (usuario.perfil_completo) {

        if (usuario.rol === "PACIENTE") {
          navigate("/dashboardPaciente");
        }

        else if (usuario.rol === "MEDICO") {
          navigate("/dashboardMedico");
        }

        else if (usuario.rol === "ADMIN") {
          navigate("/dashboardAdmin");
        }

      }

      // Perfil incompleto
      else {

        navigate("/registro");

      }

    }

    catch (error) {

      console.error(error);

      alert("Error al iniciar sesión");

    }

  };

  return (
    <div className="page-wrapper">

      {/*  MENÚ  */}
      <header className="site-header">
        <div className="site-header-logo">
          <img src={logo} alt="Portal HTA" className="login-nav-logo-icon" />
          <span className="login-nav-name">Portal HTA</span>
        </div>

        <nav className="site-nav">
          <a href="#login-section" className="site-nav-item">
            <span className="site-nav-icon"><IconLogin /></span>
            <span>Iniciar sesión</span>
          </a>
          <a href="#sobre-nosotros" className="site-nav-item">
            <span className="site-nav-icon"><IconInfo /></span>
            <span>Sobre nosotros</span>
          </a>
          <a href="#sedes" className="site-nav-item">
            <span className="site-nav-icon"><IconPin /></span>
            <span>Sedes</span>
          </a>
          <a href="#soporte" className="site-nav-item">
            <span className="site-nav-icon"><IconHelp /></span>
            <span>Soporte</span>
          </a>
        </nav>
      </header>

      {/*  LOGIN  */}
      <section className="login-hero" id="login-section">

        <div className="login-left">
          <span className="login-eyebrow">Acceso al portal</span>
          <h2 className="login-heading">Iniciar sesión</h2>

          <div className="login-card">
            <p className="login-description">
              Plataforma para el monitoreo y seguimiento de pacientes
              con Hipertensión Arterial.
            </p>

            <div className="roles">
              <div className="rol"><span className="rol-avatar"><IconUser /></span> Paciente</div>
              <div className="rol"><span className="rol-avatar"><IconStethoscope /></span> Doctor</div>
              <div className="rol"><span className="rol-avatar"><IconSettings /></span> Admin</div>
            </div>

            <button className="google-btn" onClick={loginGoogle}>
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continuar con Google
            </button>
          </div>
        </div>

        <div className="login-right">
          <div className="login-right-frame">
            {imagenes.map((img, i) => (
              <img
                key={i}
                src={img}
                alt="Portal HTA"
                className={`slider-image ${i === actual ? "active" : ""}`}
              />
            ))}

            <div className="slider-overlay">
              <h2>{overlayTexts[actual].title}</h2>
              <p>{overlayTexts[actual].desc}</p>
            </div>

            <div className="slider-dots">
              {imagenes.map((_, i) => (
                <button
                  key={i}
                  className={`dot ${i === actual ? "active" : ""}`}
                  onClick={() => setActual(i)}
                  aria-label={`Imagen ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SOBRE NOSOTROS*/}
      <section className="sobre-nosotros" id="sobre-nosotros">
        <div className="sobre-texto">
          <span className="section-eyebrow">Quiénes somos</span>
          <h2 className="section-heading">Sobre nosotros</h2>
          <p>
            Portal HTA es una plataforma digital diseñada para mejorar el seguimiento
            y control de pacientes con Hipertensión Arterial. Nuestro objetivo es
            facilitar la comunicación entre pacientes, médicos y administradores,
            brindando acceso seguro a información médica, resultados clínicos y
            herramientas de monitoreo en tiempo real.
          </p>
        </div>

        <div className="sobre-video-frame">
          <video
            className="sobre-video"
            src={videoPortalHTA}
            autoPlay
            muted
            loop
            playsInline
            controls
          />
        </div>
      </section>

      {/*  SEDES + MAPA */}
      <section className="sedes-section" id="sedes">
        <div className="sedes-map">
          <div className="sedes-map-frame">
            <div id="leaflet-map" className="leaflet-map-container" />
          </div>
        </div>

        <div className="sedes-texto">
          <p className="sedes-label">Conoce nuestras sedes</p>
          <h2 className="sedes-title">
            Más cerca de ti,<br />por tu salud
          </h2>
          <ul className="sedes-list">
            <li><IconPin className="sedes-icon" /> Sede Central — Miraflores</li>
            <li><IconPin className="sedes-icon" /> Sede San Isidro</li>
            <li><IconPin className="sedes-icon" /> Sede Los Olivos</li>
          </ul>
        </div>
      </section>

      {/*  Redes  */}
      <footer className="footer">

        <div className="footer-social">
          <a href="#" aria-label="X">𝕏</a>
          <a href="#" aria-label="Instagram">IG</a>
          <a href="#" aria-label="YouTube">YT</a>
          <a href="#" aria-label="LinkedIn">in</a>
        </div>

        <div className="footer-col">
          <h4>Función de Portal HTA</h4>
          <a href="#">Monitoreo de presión arterial</a>
          <a href="#">Gestión de citas médicas</a>
          <a href="#">Historial clínico digital</a>
          <a href="#">Descarga de resultados PDF</a>
          <a href="#">Alertas y recordatorios</a>
          <a href="#">Acceso seguro con Google</a>
        </div>

        <div className="footer-col" id="soporte">
          <h4>Soporte</h4>
          <p className="footer-subtitulo">Información de contacto</p>
          <p><IconMail className="footer-icon" /> soporte@portalhta.com</p>
          <p><IconPhone className="footer-icon" /> +51 999 999 999</p>
          <p><IconClock className="footer-icon" /> Lunes a Viernes, 08:00 AM – 06:00 PM</p>
        </div>

      </footer>

    </div>
  );
}

export default Login;