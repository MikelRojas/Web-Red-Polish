import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import NavBar from '../../common/NavBar'
import 'bootstrap/dist/css/bootstrap.min.css'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { isWeekend } from 'date-fns'
import SelectorHoras from '../../components/HorasDisponibles'
import { useTranslation } from 'react-i18next';

const Appointment = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const servicio = location.state?.servicio
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | null>(null)
  const [horaSeleccionada, setHoraSeleccionada] = useState<Date | null>(null)
  const [confirmado, setConfirmado] = useState(false)
  const [fechaConfirmada] = useState(false)
  const { t } = useTranslation('global');

  const esDiaValido = (date: Date) => !isWeekend(date)


  return (
    <>
      <NavBar />
  
      <div
        className="w-100 min-vh-100 d-flex justify-content-center align-items-start align-items-md-center px-3 py-5"
        style={{
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(4px)'
        }}
      >
        <div
          className="w-100"
          style={{
            backgroundColor: '#141414',
            borderRadius: '18px',
            padding: 'clamp(20px, 5vw, 40px)',
            maxWidth: '750px',
            border: '1px solid #2a2a2a',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
            position: 'relative'
          }}
        >
          {/* Back Button */}
          <div className="d-flex justify-content-end mb-3">
            <button
              onClick={() => navigate('/services')}
              style={{
                background: 'transparent',
                border: '1px solid #333',
                color: '#ccc',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '0.9rem'
              }}
            >
              {t('back')}
            </button>
          </div>
  
          {/* Title */}
          <h2
            className="fw-bold text-center mb-4"
            style={{
              color: '#ffffff',
              fontSize: 'clamp(1.4rem, 4vw, 2rem)'
            }}
          >
            {servicio.nombre}
          </h2>
  
          {/* Image */}
          {servicio.imagen && (
            <img
              src={servicio.imagen}
              alt={servicio.nombre}
              className="img-fluid mb-4"
              style={{
                maxHeight: '300px',
                width: '100%',
                objectFit: 'cover',
                borderRadius: '14px',
                border: '1px solid #2a2a2a'
              }}
            />
          )}
  
          {/* Info */}
          <div style={{ color: '#ddd', fontSize: '0.95rem' }}>
            <p>
              <strong style={{ color: '#fff' }}>{t('description')}:</strong><br />
              {servicio.descripcion}
            </p>
  
            <p>
              <strong style={{ color: '#fff' }}>{t('duration')}:</strong>{' '}
              {servicio.duracion} {t('minutes')}
            </p>
  
            <p>
              <strong style={{ color: '#fff' }}>{t('price')}:</strong>{' '}
              {servicio.precioFinal ? (
                <>
                  <span style={{ color: '#4ade80', fontWeight: 600 }}>
                    ${servicio.precioFinal}
                  </span>{' '}
                  <span
                    style={{
                      textDecoration: 'line-through',
                      color: '#888'
                    }}
                  >
                    ${servicio.precio}
                  </span>{' '}
                  <span style={{ color: '#8B0000', fontWeight: 600 }}>
                    {Math.round(servicio.porcentajeDescuento * 100)}%
                  </span>
                </>
              ) : (
                <span style={{ color: '#4ade80', fontWeight: 600 }}>
                  ${servicio.precio}
                </span>
              )}
            </p>
          </div>
  
          {/* Date Picker */}
          <div className="mt-4">
            <h4
              style={{
                color: '#ffffff',
                fontSize: 'clamp(1rem, 3vw, 1.2rem)'
              }}
            >
              {t('select_date')}
            </h4>
  
            <div
              className="mt-2 d-flex justify-content-center"
              style={{
                backgroundColor: '#1a1a1a',
                borderRadius: '12px',
                padding: '15px',
                border: '1px solid #333',
                overflowX: 'auto'
              }}
            >
              <DatePicker
                selected={fechaSeleccionada}
                onChange={(date) => {
                  if (date && !fechaConfirmada) {
                    const nuevaFecha = new Date(date)
                    nuevaFecha.setHours(8, 0, 0, 0)
                    setFechaSeleccionada(nuevaFecha)
                    setHoraSeleccionada(null)
                    setConfirmado(false)
                  }
                }}
                dateFormat="MMMM d, yyyy"
                minDate={new Date()}
                filterDate={esDiaValido}
                placeholderText="Selecciona una fecha"
                inline
                disabled={fechaConfirmada}
              />
            </div>
          </div>
  
          {/* Hours */}
          {fechaSeleccionada && (
            <div className="mt-4">
              <h4
                style={{
                  color: '#ffffff',
                  fontSize: 'clamp(1rem, 3vw, 1.2rem)'
                }}
              >
                {t('select_time')}
              </h4>
  
              <div
                className="mt-2"
                style={{
                  backgroundColor: '#1a1a1a',
                  borderRadius: '12px',
                  padding: '15px',
                  border: '1px solid #333'
                }}
              >
                <SelectorHoras
                  servicio={servicio}
                  fechaSeleccionada={fechaSeleccionada}
                  horaSeleccionada={horaSeleccionada}
                  setHoraSeleccionada={setHoraSeleccionada}
                />
              </div>
            </div>
          )}
  
          {/* Confirm Section */}
          <div className="mt-4 text-center">
            {horaSeleccionada && confirmado ? (
              <>
                <h5 style={{ color: '#4ade80' }}>
                  {t('confirmed_selection')}
                </h5>
  
                <p style={{ color: '#ccc', fontSize: '0.9rem' }}>
                  {horaSeleccionada.toLocaleString()}
                </p>
  
                <button
                  className="w-100 w-md-auto"
                  style={{
                    background: 'transparent',
                    border: '1px solid #444',
                    color: '#ccc',
                    borderRadius: '8px',
                    padding: '8px 18px',
                    marginBottom: '15px'
                  }}
                  onClick={() => setConfirmado(false)}
                >
                  {t('change_selection')}
                </button>
  
                <button
                  className="w-100 w-md-auto"
                  style={{
                    backgroundColor: '#8B0000',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 25px',
                    fontWeight: 600,
                    color: '#fff'
                  }}
                  onClick={() =>
                    navigate('/pay-service', {
                      state: {
                        servicio,
                        fechaSeleccionada: horaSeleccionada
                      }
                    })
                  }
                >
                  {t('go_to_pay')}
                </button>
              </>
            ) : (
              <button
                className="w-100 w-md-auto"
                style={{
                  backgroundColor: horaSeleccionada ? '#8B0000' : '#333',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 25px',
                  fontWeight: 600,
                  color: '#fff',
                  cursor: horaSeleccionada ? 'pointer' : 'not-allowed'
                }}
                onClick={() => {
                  if (horaSeleccionada) {
                    setConfirmado(true)
                  } else {
                    alert(t('invalid_time_alert'))
                  }
                }}
                disabled={!horaSeleccionada}
              >
                {t('confirm_selection')}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Appointment
