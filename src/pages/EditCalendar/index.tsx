import { useState, useEffect } from 'react'
import NavBar from '../../common/NavBar'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../common/AuthContext'
import PopUpWindow from '../Pop-up_Window'; 

interface CitaOcupada {
  fecha: string
  hora: string
  duracion: string
}

const EditCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedHours, setSelectedHours] = useState<number[]>([])
  const [saved, setSaved] = useState(false)
  const [rangosNoDisponibles, setRangosNoDisponibles] = useState<[Date, Date][]>([])

  const { user, token} = useAuth(); 
  const navigate = useNavigate()
  const { t } = useTranslation('global')
  const apiUrl = import.meta.env.VITE_IP_API

  const hours = Array.from({ length: 10 }, (_, i) => i + 8) // 8 a 17

  const [modalInfo, setModalInfo] = useState<{ show: boolean; title: string; content: string; onConfirm?: () => void }>({
    show: false,
    title: '',
    content: '',
  });

  const showAlert = (title: string, content: string, onConfirm?: () => void) => {
    setModalInfo({ show: true, title, content, onConfirm });
  };


  const handleHourToggle = (hour: number) => {
    setSelectedHours(prev =>
      prev.includes(hour) ? prev.filter(h => h !== hour) : [...prev, hour]
    )
  }

  const isHoraOcupada = (hour: number) => {
    if (!selectedDate) return false

    const dateToCheck = new Date(selectedDate)
    dateToCheck.setHours(hour, 0, 0, 0)

    return rangosNoDisponibles.some(([inicio, fin]) =>
      dateToCheck >= inicio && dateToCheck < fin
    )
  }

  useEffect(() => {

    const fetchHorasOcupadas = async () => {
      if (!selectedDate) return

      const fechaISO = selectedDate.toISOString().split('T')[0]

      try {
        const response = await fetch(`${apiUrl}/api/citas/busy?fecha=${fechaISO}`)
        if (!response.ok) throw new Error('Error al obtener datos de disponibilidad')

        const data: CitaOcupada[] = await response.json()

        const rangos = data.map(cita => {
          const inicio = new Date(`${cita.fecha}T${cita.hora}`)
          const fin = new Date(inicio.getTime() + parseInt(cita.duracion) * 60000)
          return [inicio, fin] as [Date, Date]
        })

        setRangosNoDisponibles(rangos)
      } catch (error) {
        console.error('Error al obtener horas no disponibles:', error)
        setRangosNoDisponibles([])
      }
    }

    fetchHorasOcupadas()
  }, [selectedDate])

  const handleSave = async () => {
    if (!selectedDate || selectedHours.length === 0) {
      showAlert('Datos faltantes', t('alert_missing'));
      return
    }

    const dateStr = selectedDate.toISOString().split('T')[0]
    const email = user.email 
    let successCount = 0

    try {
      for (const hour of selectedHours) {
        const hourStr = `${hour.toString().padStart(2, '0')}:00`

        const url = `${apiUrl}/api/citas/busy_day/add/${email}?fecha=${dateStr}&hour=${hourStr}`

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (!response.ok) throw new Error(`Fallo al guardar ${hourStr}`)
        successCount++
      }

      if (successCount === selectedHours.length) {
        showAlert('Éxito', '✅ Todas las horas fueron ocupadas con éxito');
      } else {
        showAlert('Advertencia', '⚠️ Algunas horas no pudieron ocuparse');
      }

      setSaved(true)
      setTimeout(() => {
        setSaved(false)
        navigate('/services')
      }, 3000)

    } catch (error) {
      console.error('❌ Error al bloquear horas:', error)
      showAlert('Error', 'Hubo un error al guardar la disponibilidad.');
    }
  }

  return (
    <>
      <NavBar />
  
      <div
        className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center px-3"
        style={{
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000
        }}
      >
        <div
          style={{
            backgroundColor: '#141414',
            borderRadius: '18px',
            padding: 'clamp(25px, 5vw, 40px)',
            width: '100%',
            maxWidth: '520px',
            border: '1px solid #2a2a2a',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
          }}
        >
          <h2 className="text-center mb-4 fw-bold" style={{ color: '#ffffff' }}>
            {t('title_calendar')}
          </h2>
  
          {saved && (
            <div
              style={{
                backgroundColor: '#1f1f1f',
                color: '#4ade80',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #333',
                textAlign: 'center',
                marginBottom: '15px'
              }}
            >
              {t('saved')}
            </div>
          )}
  
          {/* Date Picker */}
          <div className="mb-4">
            <label style={{ color: '#e5e5e5', fontWeight: 600 }}>
              {t('select_date_c')}
            </label>
  
            <DatePicker
              selected={selectedDate}
              onChange={date => {
                setSelectedDate(date)
                setSelectedHours([])
              }}
              dateFormat="yyyy-MM-dd"
              minDate={new Date()}
              className="form-control"
              placeholderText="Haz clic para elegir una fecha"
              style={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #333',
                color: '#fff'
              }}
            />
          </div>
  
          {/* Hours */}
          {selectedDate && (
            <div className="mb-4">
              <label style={{ color: '#e5e5e5', fontWeight: 600 }}>
                {t('available_hours')}
              </label>
  
              <div className="d-flex flex-wrap gap-2 mt-3">
                {hours.map(hour => {
                  const ocupado = isHoraOcupada(hour)
                  const selected = selectedHours.includes(hour)
  
                  return (
                    <button
                      key={hour}
                      type="button"
                      onClick={() => !ocupado && handleHourToggle(hour)}
                      disabled={ocupado}
                      style={{
                        backgroundColor: ocupado
                          ? '#2a2a2a'
                          : selected
                          ? '#8B0000'
                          : 'transparent',
                        border: ocupado
                          ? '1px solid #333'
                          : selected
                          ? '1px solid #8B0000'
                          : '1px solid #444',
                        color: ocupado
                          ? '#666'
                          : selected
                          ? '#fff'
                          : '#ddd',
                        borderRadius: '8px',
                        padding: '6px 14px',
                        cursor: ocupado ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {hour}:00
                    </button>
                  )
                })}
              </div>
            </div>
          )}
  
          {/* Save Button */}
          <button
            onClick={handleSave}
            style={{
              backgroundColor: '#8B0000',
              border: 'none',
              borderRadius: '12px',
              padding: '12px',
              width: '100%',
              fontWeight: 600,
              color: '#fff',
              marginBottom: '15px'
            }}
          >
            {t('save_c')}
          </button>
  
          {/* Cancel */}
          <div className="text-center">
            <button
              onClick={() => navigate('/services')}
              style={{
                background: 'transparent',
                border: '1px solid #333',
                color: '#ccc',
                borderRadius: '8px',
                padding: '6px 18px'
              }}
            >
              {t('cancel_add')}
            </button>
          </div>
        </div>
  
        {modalInfo.show && (
          <PopUpWindow
            show={modalInfo.show}
            title={modalInfo.title}
            onClose={() => setModalInfo({ ...modalInfo, show: false })}
            onConfirm={() => {
              setModalInfo({ ...modalInfo, show: false })
              if (modalInfo.onConfirm) modalInfo.onConfirm()
            }}
          >
            <p>{modalInfo.content}</p>
          </PopUpWindow>
        )}
      </div>
    </>
  )
}

export default EditCalendar
