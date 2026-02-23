import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {useAuth} from "../../common/AuthContext.tsx";
import { Eye, EyeOff } from 'lucide-react';
import { useLoader } from '../../common/LoaderContext';

const Register = () => {
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('')
  const apiUrl = import.meta.env.VITE_IP_API;
  const { login } = useAuth();
  const { showLoader, hideLoader } = useLoader();


  useEffect(() => {
    document.body.style.backgroundColor = '#ffffff'
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Todos los campos son obligatorios.')
      return
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    const userData = {
      name: firstName,
      last_name: lastName,
      email: email,
      password: password
    }

    try {
      showLoader(); // ✅ Mostrar loader
      const response = await fetch(`${apiUrl}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.message || 'Error al registrar el usuario.')
        return
      }

      setError('')

      const loginData = {
        email,
        password,
      };

      const responselog = await fetch(`${apiUrl}/api/users/sign_in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      if (!responselog.ok) {
        const errorData = await responselog.json();
        setError(errorData.message || 'Error al iniciar sesion.')
        return;
      }

      const data = await responselog.json();

      login(data.user, data.token);

      setTimeout(() => {
        navigate('/')
      }, 3000)
    } catch (err) {
      console.log(err)
      setError('Error de conexión con el servidor.')
    }
    finally {
    hideLoader(); // ✅ Ocultar loader
  }
  }

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
          Crear Cuenta
        </h2>
  
        <form onSubmit={handleSubmit}>
          {/* FIRST NAME */}
          <div className="mb-3">
            <label className="mb-2" style={{ color: "#b0b0b0" }}>
              Nombre
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              style={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #333",
                color: "#fff",
                borderRadius: "10px",
                padding: "10px 14px",
                width: "100%"
              }}
            />
          </div>
  
          {/* LAST NAME */}
          <div className="mb-3">
            <label className="mb-2" style={{ color: "#b0b0b0" }}>
              Apellidos
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              style={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #333",
                color: "#fff",
                borderRadius: "10px",
                padding: "10px 14px",
                width: "100%"
              }}
            />
          </div>
  
          {/* EMAIL */}
          <div className="mb-3">
            <label className="mb-2" style={{ color: "#b0b0b0" }}>
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #333",
                color: "#fff",
                borderRadius: "10px",
                padding: "10px 14px",
                width: "100%"
              }}
            />
          </div>
  
          {/* PASSWORD */}
          <div className="mb-3">
            <label className="mb-2" style={{ color: "#b0b0b0" }}>
              Contraseña (mínimo 8 caracteres)
            </label>
  
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #333",
                  color: "#fff",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  width: "100%"
                }}
              />
  
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  color: "#999"
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
          </div>
  
          {/* CONFIRM PASSWORD */}
          <div className="mb-4">
            <label className="mb-2" style={{ color: "#b0b0b0" }}>
              Confirmar Contraseña
            </label>
  
            <div style={{ position: "relative" }}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #333",
                  color: "#fff",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  width: "100%"
                }}
              />
  
              <span
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  color: "#999"
                }}
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </span>
            </div>
          </div>
  
          {/* ERROR */}
          {error && (
            <div
              style={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #8B0000",
                color: "#ff4d4d",
                padding: "10px",
                borderRadius: "10px",
                marginBottom: "15px",
                fontSize: "0.9rem"
              }}
            >
              {error}
            </div>
          )}
  
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
              transition: "0.3s ease"
            }}
          >
            Registrarse
          </button>
        </form>
  
        {/* LINKS */}
        <div className="text-center mt-4" style={{ fontSize: "0.9rem" }}>
          <p style={{ color: "#b0b0b0" }}>
            ¿Ya tienes cuenta?{" "}
            <span
              onClick={() => navigate("/login")}
              style={{
                color: "#ffffff",
                cursor: "pointer",
                textDecoration: "underline"
              }}
            >
              Inicia sesión
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
    </div>
  );
}

export default Register
