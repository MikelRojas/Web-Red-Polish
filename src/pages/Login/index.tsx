import { useState,useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../common/AuthContext'
import PopUpWindow from '../Pop-up_Window';

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth();
  const apiUrl = import.meta.env.VITE_IP_API;

  const [modalInfo, setModalInfo] = useState<{ show: boolean; title: string; content: string; onConfirm?: () => void }>({
    show: false,
    title: '',
    content: '',
  });

  const showAlert = (title: string, content: string, onConfirm?: () => void) => {
    setModalInfo({ show: true, title, content, onConfirm });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      showAlert('Error', 'Todos los campos son obligatorios.');
      return;
    }

    const loginData = { email, password };

    try {
      const response = await fetch(`${apiUrl}/api/users/sign_in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        showAlert('Error', errorData.message || 'Error al iniciar sesión.');
        return;
      }

      const data = await response.json();
      login(data.user, data.token);
      navigate('/');
      setEmail('');
      setPassword('');
    } catch (err) {
      console.log(err)
      showAlert('Error', 'Contraseña o usuario incorrecto.');
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        backgroundColor: "#0f0f0f",
        padding: "20px"
      }}
    >
      <div
        style={{
          backgroundColor: "#141414",
          borderRadius: "22px",
          border: "1px solid #2a2a2a",
          padding: "45px 35px",
          width: "100%",
          maxWidth: "460px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.6)"
        }}
      >
        <h2
          className="text-center mb-4 fw-bold"
          style={{ letterSpacing: "1px" }}
        >
          Iniciar Sesión
        </h2>
  
        <form onSubmit={handleSubmit}>
          {/* EMAIL */}
          <div className="mb-4">
            <label className="mb-2" style={{ color: "#b0b0b0" }}>
              Correo electrónico
            </label>
  
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@correo.com"
              style={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #333",
                color: "#fff",
                borderRadius: "10px",
                padding: "12px 14px",
                width: "100%"
              }}
            />
          </div>
  
          {/* PASSWORD */}
          <div className="mb-4">
            <label className="mb-2" style={{ color: "#b0b0b0" }}>
              Contraseña
            </label>
  
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              style={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #333",
                color: "#fff",
                borderRadius: "10px",
                padding: "12px 14px",
                width: "100%"
              }}
            />
          </div>
  
          {/* BUTTON */}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "12px",
              border: "none",
              backgroundColor: "#8B0000",
              color: "#fff",
              fontWeight: 600,
              transition: "0.3s ease",
              boxShadow: "0 4px 15px rgba(139,0,0,0.4)"
            }}
          >
            Ingresar
          </button>
        </form>
  
        {/* LINKS */}
        <div className="text-center mt-4" style={{ fontSize: "0.9rem" }}>
          <p style={{ color: "#b0b0b0" }}>
            ¿No tienes una cuenta?{" "}
            <span
              onClick={() => navigate("/register")}
              style={{
                color: "#ffffff",
                cursor: "pointer",
                textDecoration: "underline"
              }}
            >
              Regístrate aquí
            </span>
          </p>
  
          <p style={{ color: "#b0b0b0" }}>
            ¿Olvidaste tu contraseña?{" "}
            <span
              onClick={() => navigate("/recover")}
              style={{
                color: "#ffffff",
                cursor: "pointer",
                textDecoration: "underline"
              }}
            >
              Recuperarla
            </span>
          </p>
  
          <p style={{ color: "#b0b0b0" }}>
            ¿Volver al inicio?{" "}
            <span
              onClick={() => navigate("/")}
              style={{
                color: "#ffffff",
                cursor: "pointer",
                textDecoration: "underline"
              }}
            >
              Ir al Home
            </span>
          </p>
        </div>
      </div>
  
      {modalInfo.show && (
        <PopUpWindow
          show={modalInfo.show}
          title={modalInfo.title}
          onClose={() => setModalInfo({ ...modalInfo, show: false })}
          onConfirm={() => {
            setModalInfo({ ...modalInfo, show: false });
            if (modalInfo.onConfirm) modalInfo.onConfirm();
          }}
        >
          <p>{modalInfo.content}</p>
        </PopUpWindow>
      )}
    </div>
  )
}

export default Login
