import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../../common/NavBar'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../common/AuthContext'
import { useTranslation } from 'react-i18next';
import PopUpWindow from '../Pop-up_Window'; 

const EditService = () => {
  const { user, token } = useAuth()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState('')
  const [originalPrice, setOriginalPrice] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [categories, setCategories] = useState<{ id: number, name: string }[]>([])
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [promotionId, setPromotionId] = useState('') // NUEVO
  const [promotions, setPromotions] = useState<{ id: number; porcentage: number; title: string }[]>([]) // NUEVO
  const location = useLocation()
  const servicio = location.state?.servicio
  const apiUrl = import.meta.env.VITE_IP_API
  const navigate = useNavigate()
  const userEmail = user?.email
  const { t } = useTranslation('global');

  const [modalInfo, setModalInfo] = useState<{ show: boolean; title: string; content: string; onConfirm?: () => void }>({
    show: false,
    title: '',
    content: '',
  });

  const showAlert = (title: string, content: string, onConfirm?: () => void) => {
    setModalInfo({ show: true, title, content, onConfirm });
  };

  useEffect(() => {
    if (!servicio) {
      setError(t('error_service_info'))
      return
    }
    setName(servicio.nombre)
    setDescription(servicio.descripcion)
    setDuration(servicio.duracion.toString())
    setCategoryId(servicio.id_categoria.toString())
    setImageUrl(servicio.imagen || '')
    setPromotionId(servicio.id_promocion)

    const fetchCategories = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/categories/get_categories`)
        if (!res.ok) throw new Error('Error al obtener categorías')
        const data = await res.json()
        setCategories(data)
      } catch (err) {
        setError(t('error_category_fetch'))
      }
    }

    fetchCategories()
  }, [servicio])

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        // 1. Llamas al endpoint y obtienes el JSON
        const res = await fetch(`${apiUrl}/api/promotions`)
        if (!res.ok) throw new Error('Error al obtener promociones')
        const data: { id: number; porcentage: number; title: string }[] = await res.json()

        // 2. Actualizas el estado con las promociones
        setPromotions(data)

        // 3. Si el servicio viene con una promoción asignada, la buscas en el array
        if (servicio.id_promocion) {
          const promo = data.find(p => p.id === servicio.id_promocion)

          if (promo) {

            const precioDesc = typeof servicio.precio === 'string'
              ? parseFloat(servicio.precio)
              : servicio.precio

            const precioOriginal = Math.round(
              precioDesc / (1 - promo.porcentage / 100)
            )

            setOriginalPrice(precioOriginal.toString());
          }
        }
        else{
          setOriginalPrice(servicio.precio.toString());
        }

      } catch (err) {
        console.error(err)
        setError(t('error_promotions_fetch'))
      }
    }


    if (servicio) {
    fetchPromotions()
    setPromotionId(servicio.id_promocion?.toString() || '')
  }
}, [servicio])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !description || !duration || !originalPrice || !categoryId || !imageUrl) {
      showAlert(t('error'), t('error'))
      return
    }

    const serviceData = {
      name,
      categoryId: parseInt(categoryId),
      description,
      duration,
      price: parseFloat(originalPrice),
      imageUrl: imageUrl,   
      promotionId: promotionId ? parseInt(promotionId) : null, 
    }
    try {
      const res = await fetch(`${apiUrl}/api/services/update/${servicio.id}/${userEmail}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
         },
        body: JSON.stringify(serviceData),
      })
      if (!res.ok) throw new Error('Error en la edición')
      setSuccess(true)
      setTimeout(() => navigate('/services'), 3000)
    } catch (err) {
      setError(t('error_editing_service'))
    }
  }

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return
    try {
      const res = await fetch(`${apiUrl}/api/categories/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategory })
      })
      if (!res.ok) throw new Error('Error al crear categoría')
      const updated = await fetch(`${apiUrl}/api/categories/get_categories`).then(res => res.json())
      setCategories(updated)
      setNewCategory('')
      setShowNewCategory(false)
    } catch {
      showAlert(t('error'), 'Error al crear la categoría.')
    }
  }

  const handleDeleteService = async () => {
   if (!userEmail || !token) return

    try {
      const res = await fetch(`${apiUrl}/api/services/delete/${servicio.id}/${userEmail}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!res.ok) throw new Error('Error al eliminar el servicio')

      showAlert(t('success'), t('success_delete_service'));
      navigate('/services')
    } catch (err) {
      console.error('❌ Error eliminando el servicio:', err)
      showAlert(t('error'), t('error_delete_service'));
    }
  }

  if (!servicio) {
    return (
      <>
        <NavBar />
        <div className="container text-center mt-5">
          <p className="text-muted">{t('loading_service')}</p>
        </div>
      </>
    )
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
            padding: 'clamp(20px, 5vw, 40px)',
            width: '100%',
            maxWidth: '600px',
            border: '1px solid #2a2a2a',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
          }}
        >
          <h2 className="text-center mb-4 fw-bold" style={{ color: '#ffffff' }}>
            {t('edit_service')}
          </h2>
  
          {error && (
            <div
              style={{
                backgroundColor: '#1f1f1f',
                color: '#ff6b6b',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #333',
                marginBottom: '15px',
                textAlign: 'center'
              }}
            >
              {error}
            </div>
          )}
  
          {success && (
            <div
              style={{
                backgroundColor: '#1f1f1f',
                color: '#4ade80',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #333',
                marginBottom: '15px',
                textAlign: 'center'
              }}
            >
              {t('success_service_edit')}
            </div>
          )}
  
          <form onSubmit={handleSubmit}>
  
            {/* Name */}
            <div className="mb-3">
              <label style={{ color: '#e5e5e5', fontWeight: 600 }}>
                {t('name')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  color: '#fff',
                  borderRadius: '10px',
                  padding: '10px',
                  width: '100%'
                }}
              />
            </div>
  
            {/* Description */}
            <div className="mb-3">
              <label style={{ color: '#e5e5e5', fontWeight: 600 }}>
                {t('description')}
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                style={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  color: '#fff',
                  borderRadius: '10px',
                  padding: '10px',
                  width: '100%'
                }}
              />
            </div>
  
            {/* Duration */}
            <div className="mb-3">
              <label style={{ color: '#e5e5e5', fontWeight: 600 }}>
                {t('duration')}
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
                style={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  color: '#fff',
                  borderRadius: '10px',
                  padding: '10px',
                  width: '100%'
                }}
              />
            </div>
  
            {/* Price */}
            <div className="mb-3">
              <label style={{ color: '#e5e5e5', fontWeight: 600 }}>
                {t('price')}
              </label>
              <input
                type="number"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                required
                style={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  color: '#fff',
                  borderRadius: '10px',
                  padding: '10px',
                  width: '100%'
                }}
              />
            </div>
  
            {/* Category */}
            <div className="mb-3">
              <label style={{ color: '#e5e5e5', fontWeight: 600 }}>
                {t('category')}
              </label>
  
              <div className="d-flex flex-column flex-md-row gap-2">
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                  style={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    color: '#fff',
                    borderRadius: '10px',
                    padding: '10px',
                    flex: 1
                  }}
                >
                  <option value="">{t('selectCategory')}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
  
                <button
                  type="button"
                  onClick={() => setShowNewCategory(!showNewCategory)}
                  style={{
                    backgroundColor: '#8B0000',
                    border: 'none',
                    color: '#fff',
                    borderRadius: '10px',
                    padding: '0 15px'
                  }}
                >
                  +
                </button>
              </div>
  
              {showNewCategory && (
                <div className="mt-3 d-flex flex-column flex-md-row gap-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    style={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333',
                      color: '#fff',
                      borderRadius: '10px',
                      padding: '10px',
                      flex: 1
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    style={{
                      backgroundColor: '#1f1f1f',
                      border: '1px solid #333',
                      color: '#fff',
                      borderRadius: '10px',
                      padding: '0 15px'
                    }}
                  >
                    {t('save')}
                  </button>
                </div>
              )}
            </div>
  
            {/* Promotion */}
            <div className="mb-3">
              <label style={{ color: '#e5e5e5', fontWeight: 600 }}>
                {t('promotion')}
              </label>
              <select
                value={promotionId}
                onChange={(e) => setPromotionId(e.target.value)}
                style={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  color: '#fff',
                  borderRadius: '10px',
                  padding: '10px',
                  width: '100%'
                }}
              >
                <option value="">{t('no_promotion')}</option>
                {promotions.map((promo) => (
                  <option key={promo.id} value={promo.id}>
                    {promo.title}
                  </option>
                ))}
              </select>
            </div>
  
            {/* Image */}
            <div className="mb-4">
              <label style={{ color: '#e5e5e5', fontWeight: 600 }}>
                {t('imageUrl')}
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                required
                style={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  color: '#fff',
                  borderRadius: '10px',
                  padding: '10px',
                  width: '100%'
                }}
              />
            </div>
  
            {/* Submit */}
            <button
              type="submit"
              style={{
                backgroundColor: '#8B0000',
                border: 'none',
                borderRadius: '12px',
                padding: '12px',
                width: '100%',
                fontWeight: 600,
                color: '#fff'
              }}
            >
              {t('save_changes')}
            </button>
          </form>
  
          {/* Bottom Buttons */}
          <div className="mt-4 d-flex flex-column flex-md-row justify-content-center gap-3">
            <button
              onClick={() => navigate('/services')}
              style={{
                background: 'transparent',
                border: '1px solid #333',
                color: '#ccc',
                borderRadius: '8px',
                padding: '8px 20px'
              }}
            >
              {t('cancel_add')}
            </button>
  
            <button
              onClick={handleDeleteService}
              style={{
                background: 'transparent',
                border: '1px solid #8B0000',
                color: '#ff4d4d',
                borderRadius: '8px',
                padding: '8px 20px'
              }}
            >
              {t('delete_service')}
            </button>
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
    </>
  )
}

export default EditService
