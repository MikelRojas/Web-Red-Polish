import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../../common/NavBar'
import { useAuth } from '../../common/AuthContext'
import { useTranslation } from 'react-i18next'

const AddService = () => {
  const { user, token } = useAuth()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [duration, setDuration] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const apiUrl = import.meta.env.VITE_IP_API
  const navigate = useNavigate()
  const { t } = useTranslation('global')

  useEffect(() => {

    const fetchCategories = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/categories/get_categories`)
        const data = await res.json()
        setCategories(data)
      } catch {
        setError('No se pudieron cargar las categorías.')
      }
    }

    fetchCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !description || !price || !duration || !categoryId || !imageUrl) {
      setError(t('error'))
      return
    }

    const serviceData = {
      name,
      categoryId: parseInt(categoryId),
      description,
      duration,
      price: parseFloat(price),
      imageUrl
    }

    try {
      const res = await fetch(`${apiUrl}/api/services/add/${user?.email}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(serviceData)
      })

      if (!res.ok) throw new Error()

      setSuccess(true)
      setTimeout(() => navigate('/services'), 2000)
    } catch {
      setError(t('addServiceError'))
    }
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (/^\d*\.?\d*$/.test(value)) setPrice(value)
  }

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (/^\d*$/.test(value)) setDuration(value)
  }

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return
    try {
      await fetch(`${apiUrl}/api/categories/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategory })
      })

      const updated = await fetch(`${apiUrl}/api/categories/get_categories`)
      const data = await updated.json()
      setCategories(data)

      setNewCategory('')
      setShowNewCategory(false)
    } catch {
      setError(t('categoryError'))
    }
  }

  return (
    <>
      <NavBar />

      <div
        className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
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
            padding: '40px',
            width: '100%',
            maxWidth: '520px',
            border: '1px solid #2a2a2a',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
          }}
        >
          <h2
            className="text-center mb-4 fw-bold"
            style={{ color: '#ffffff' }}
          >
            {t('addServiceTitle')}
          </h2>

          {error && (
            <div
              className="mb-3 text-center"
              style={{
                backgroundColor: '#1f1f1f',
                color: '#ff6b6b',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #333'
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              className="mb-3 text-center"
              style={{
                backgroundColor: '#1f1f1f',
                color: '#4ade80',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #333'
              }}
            >
              {t('addServiceSuccess')}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Inputs */}
            {[ 
              { label: t('name'), value: name, setter: setName },
              { label: t('description'), value: description, setter: setDescription }
            ].map((field, index) => (
              <div className="mb-3" key={index}>
                <label style={{ color: '#e5e5e5', fontWeight: 600 }}>
                  {field.label}
                </label>
                <input
                  type="text"
                  value={field.value}
                  onChange={(e) => field.setter(e.target.value)}
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
            ))}

            <div className="mb-3">
              <label style={{ color: '#e5e5e5', fontWeight: 600 }}>
                {t('price')}
              </label>
              <input
                type="text"
                value={price}
                onChange={handlePriceChange}
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

            <div className="mb-3">
              <label style={{ color: '#e5e5e5', fontWeight: 600 }}>
                {t('duration')} ({t('minutes')})
              </label>
              <input
                type="text"
                value={duration}
                onChange={handleDurationChange}
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

              <div className="d-flex gap-2">
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
                  {categories.map((cat: any) => (
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
                <div className="mt-2 d-flex gap-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Nueva categoría"
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

            <div className="mb-4">
              <label style={{ color: '#e5e5e5', fontWeight: 600 }}>
                {t('imageUrl')}
              </label>
              <input
                type="text"
                placeholder="https://..."
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

            <button
              type="submit"
              style={{
                backgroundColor: '#8B0000',
                border: 'none',
                borderRadius: '12px',
                padding: '12px',
                width: '100%',
                fontWeight: 600,
                color: '#fff',
                transition: 'all 0.3s ease'
              }}
            >
              {t('addServiceTitle')}
            </button>
          </form>

          <div className="mt-3 text-center">
            <button
              onClick={() => navigate('/services')}
              style={{
                background: 'transparent',
                border: '1px solid #333',
                color: '#ccc',
                borderRadius: '8px',
                padding: '6px 15px'
              }}
            >
              {t('cancel_add')}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default AddService