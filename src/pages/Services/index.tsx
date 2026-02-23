import { useState, useEffect } from 'react'
import NavBar from '../../common/NavBar'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Dropdown } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { Servicio, ServicioConPrecio } from '../../common/interfaces'
import { useAuth } from '../../common/AuthContext'
import { useTranslation } from 'react-i18next'

type Promotion = {
  id: number
  title: string
  porcentage?: number
}

const Services = () => {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [servicios, setServicios] = useState<ServicioConPrecio[]>([])
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([])
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null)
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const navigate = useNavigate()
  const apiUrl = import.meta.env.VITE_IP_API
  const { t } = useTranslation('global')

  useEffect(() => {
    document.body.style.background = '#0f0f0f'

    if (user?.rol === 'Administrador') {
      setIsAdmin(true)
    }

    fetchCategories()
    fetchPromotions()
  }, [user])

  useEffect(() => {
    fetchServices()
  }, [promotions])

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/categories/get_categories`)
      const data = await res.json()
      setCategories(data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchPromotions = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/promotions`)
      const data = await response.json()
      setPromotions(data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchServices = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/services/get_all`)
      const data = await res.json()

      const serviciosTransformados: ServicioConPrecio[] = data.map((serv: any) => {
        const id_promocion = serv.promotionId ? parseInt(serv.promotionId) : undefined
        const id_categoria = parseInt(serv.categoryId)

        const baseServicio: Servicio = {
          id: serv.id,
          nombre: serv.name,
          id_categoria,
          descripcion: serv.description,
          duracion: serv.duration,
          precio: serv.price,
          id_promocion,
          imagen: serv.imageUrl || '',
        }

        const promotion = promotions.find((promo) => promo.id === id_promocion)

        if (promotion && promotion.porcentage) {
          const descuento = promotion.porcentage
          const precioFinal = Math.round(serv.price * (1 - descuento / 100))
          return {
            ...baseServicio,
            precioFinal,
            porcentajeDescuento: descuento,
          }
        }

        return baseServicio
      })

      setServicios(serviciosTransformados)
    } catch (error) {
      console.error(error)
    }
  }

  const manejarAgendar = (servicio: ServicioConPrecio) => {
    navigate('/appointment', { state: { servicio } })
  }

  const manejarModificar = (servicio: ServicioConPrecio) => {
    navigate('/edit-service', { state: { servicio } })
  }

  const serviciosFiltrados = categoriaSeleccionada
    ? servicios.filter((s) => s.id_categoria === categoriaSeleccionada)
    : servicios

  return (
    <>
      <NavBar />

      <div
        className="container mt-5"
        style={{
          backgroundColor: '#141414',
          padding: '35px',
          borderRadius: '18px',
        }}
      >
        {/* Header */}
        <div
          className="d-flex justify-content-between align-items-center mb-5 flex-wrap"
          style={{
            borderBottom: '1px solid #222',
            paddingBottom: '20px',
          }}
        >
          <h4 className="fw-bold" style={{ color: '#ffffff' }}>
            {t('title_service')}
          </h4>

          <Dropdown className="mb-2">
            <Dropdown.Toggle
              style={{
                backgroundColor: '#1a1a1a',
                color: '#fff',
                border: '1px solid #333',
                borderRadius: '10px',
                padding: '8px 18px',
              }}
            >
              {t('filter_sort')}
            </Dropdown.Toggle>

            <Dropdown.Menu
              style={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #333',
              }}
            >
              <Dropdown.Item
                style={{ color: '#e5e5e5' }}
                onClick={() => setCategoriaSeleccionada(null)}
              >
                {t('all_categories')}
              </Dropdown.Item>

              {categories.map((cat) => (
                <Dropdown.Item
                  key={cat.id}
                  style={{ color: '#e5e5e5' }}
                  onClick={() => setCategoriaSeleccionada(cat.id)}
                >
                  {cat.name}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>

          {isAdmin && (
            <div className="d-flex gap-3 flex-wrap">
              <button
                className="btn"
                style={{
                  backgroundColor: '#8B0000',
                  color: '#fff',
                  borderRadius: '10px',
                  padding: '8px 18px',
                }}
                onClick={() => navigate('/add-service')}
              >
                {t('add_service')}
              </button>

              <button
                className="btn"
                style={{
                  backgroundColor: '#1f1f1f',
                  color: '#fff',
                  border: '1px solid #333',
                  borderRadius: '10px',
                  padding: '8px 18px',
                }}
                onClick={() => navigate('/edit-calendar')}
              >
                {t('edit_calendar')}
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        {serviciosFiltrados.length === 0 ? (
          <p className="text-center" style={{ color: '#888' }}>
            {t('no_services')}
          </p>
        ) : (
          <div className="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-4">
            {serviciosFiltrados.map((servicio) => {
              const promocion = promotions.find(
                (promo) => promo.id === servicio.id_promocion
              )

              return (
                <div key={servicio.id} className="col">
                  <div
                    className="card h-100 position-relative"
                    style={{
                      backgroundColor: '#181818',
                      borderRadius: '16px',
                      border: '1px solid #2a2a2a',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.35)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-6px)'
                      e.currentTarget.style.boxShadow =
                        '0 18px 35px rgba(0,0,0,0.55)'
                      e.currentTarget.style.border =
                        '1px solid rgba(139,0,0,0.4)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow =
                        '0 8px 20px rgba(0,0,0,0.35)'
                      e.currentTarget.style.border =
                        '1px solid #2a2a2a'
                    }}
                    onClick={() => {
                      if (!user) {
                        alert(t('login_required'))
                        return
                      }

                      if (isAdmin) manejarModificar(servicio)
                      else manejarAgendar(servicio)
                    }}
                  >
                    {promocion && (
                      <span className="badge bg-danger position-absolute top-0 start-0 m-2">
                        {promocion.title}
                      </span>
                    )}

                    <div
                      style={{
                        height: '190px',
                        backgroundColor: '#111',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '20px',
                        borderBottom: '1px solid #222',
                      }}
                    >
                      {servicio.imagen && (
                        <img
                          src={servicio.imagen}
                          alt={servicio.nombre}
                          style={{
                            maxHeight: '100%',
                            objectFit: 'contain',
                          }}
                        />
                      )}
                    </div>

                    <div
                      className="card-body d-flex flex-column"
                      style={{ color: '#f1f1f1' }}
                    >
                      <h6
                        className="fw-semibold mb-2"
                        style={{ color: '#fff' }}
                      >
                        {servicio.nombre}
                      </h6>

                      <p
                        style={{
                          color: '#a1a1a1',
                          fontSize: '0.85rem',
                          minHeight: '40px',
                        }}
                      >
                        {servicio.descripcion}
                      </p>

                      <p style={{ color: '#cfcfcf', fontSize: '0.85rem' }}>
                        <strong>{t('duration')}:</strong>{' '}
                        {servicio.duracion} min
                      </p>

                      {servicio.id_promocion &&
                      servicio.porcentajeDescuento ? (
                        <div>
                          <span className="text-muted text-decoration-line-through me-2">
                            $
                            {Math.round(
                              servicio.precio /
                                (1 - servicio.porcentajeDescuento / 100)
                            ).toLocaleString()}
                          </span>
                          <span
                            className="fw-bold"
                            style={{ color: '#8B0000' }}
                          >
                            ${servicio.precio.toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <p className="fw-bold">
                          ${servicio.precio.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}

export default Services