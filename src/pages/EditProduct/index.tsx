import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import NavBar from '../../common/NavBar'
import { useAuth } from '../../common/AuthContext'
import { useTranslation } from 'react-i18next';

const EditProduct = () => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [promotionId, setPromotionId] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [categories, setCategories] = useState<{ id: number, name: string }[]>([])
  const [promotions, setPromotions] = useState<{ porcentage: number; id: number, title: string }[]>([])
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const { user, token } = useAuth()
  const [originalPrice, setOriginalPrice] = useState<number | null>(null)
  const { t } = useTranslation('global')

  const apiUrl = import.meta.env.VITE_IP_API
  const navigate = useNavigate()
  const { id } = useParams()

  useEffect(() => {
    document.body.style.backgroundColor = '#ffffff'
  }, [])

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/promotions`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        })
        const data = await res.json()
        setPromotions(data)
      } catch {
        setPromotions([])
      }
    }
    fetchPromotions()
  }, [apiUrl, token])

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/products/get/${id}`)
        const data = await res.json()

        setName(data.name)
        setDescription(data.description)
        setQuantity(data.stock.toString())
        setCategoryId(data.categoryId.toString())
        setImageUrl(data.image)

        if (data.promotionId) {
          setPromotionId(data.promotionId.toString())
        }

        setOriginalPrice(data.price)
        setPrice(data.price.toString())
      } catch {
        setError(t('error_loading_product'))
      }
    }

    fetchProduct()
  }, [apiUrl, id, t])

  useEffect(() => {
    fetch(`${apiUrl}/api/categories/get_categories`)
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(() => setCategories([]))
  }, [apiUrl])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !description || !price || !quantity || !categoryId || !imageUrl) {
      setError(t('error'))
      return
    }

    const productData = {
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(quantity),
      image: imageUrl,
      categoryId: parseInt(categoryId),
      promotionId: promotionId ? parseInt(promotionId) : null
    }

    const userEmail = user?.email

    try {
      const res = await fetch(`${apiUrl}/api/products/update/${id}/${userEmail}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(productData)
      })
      if (!res.ok) throw new Error()
      setSuccess(true)
      setTimeout(() => navigate('/catalog'), 3000)
    } catch {
      setError(t('error_editing'))
    }
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

  const inputStyle = {
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    color: '#fff',
    borderRadius: '10px',
    padding: '10px',
    width: '100%'
  }

  const primaryButton = {
    backgroundColor: '#8B0000',
    border: 'none',
    borderRadius: '12px',
    padding: '12px',
    width: '100%',
    fontWeight: 600,
    color: '#fff'
  }

  const secondaryButton = {
    background: 'transparent',
    border: '1px solid #333',
    color: '#ccc',
    borderRadius: '8px',
    padding: '6px 15px'
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
            maxWidth: '520px',
            border: '1px solid #2a2a2a',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
          }}
        >
          <h2 className="text-center mb-4 fw-bold" style={{ color: '#ffffff' }}>
            {t('edit_product')}
          </h2>

          {error && (
            <div style={{
              backgroundColor: '#1f1f1f',
              color: '#ff6b6b',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #333',
              marginBottom: '15px'
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              backgroundColor: '#1f1f1f',
              color: '#4ade80',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #333',
              marginBottom: '15px'
            }}>
              {t('success_edit')}
            </div>
          )}

          <form onSubmit={handleSubmit}>

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
                  style={inputStyle}
                />
              </div>
            ))}

            <div className="mb-3">
              <label style={{ color: '#e5e5e5', fontWeight: 600 }}>
                {t('price')}
              </label>
              <input
                type="number"
                value={price}
                placeholder={originalPrice !== null ? originalPrice.toString() : ''}
                onChange={(e) => setPrice(e.target.value)}
                required
                style={inputStyle}
              />
            </div>

            <div className="mb-3">
              <label style={{ color: '#e5e5e5', fontWeight: 600 }}>
                {t('quantity')}
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                style={inputStyle}
              />
            </div>

            <div className="mb-3">
              <label style={{ color: '#e5e5e5', fontWeight: 600 }}>
                {t('category')}
              </label>

              <div className="d-flex gap-2 flex-column flex-sm-row">
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                  style={{ ...inputStyle, flex: 1 }}
                >
                  <option value="">{t('selectCategory')}</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
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
                <div className="mt-2 d-flex gap-2 flex-column flex-sm-row">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    style={{ ...inputStyle, flex: 1 }}
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

            <div className="mb-3">
              <label style={{ color: '#e5e5e5', fontWeight: 600 }}>
                {t('promotion')}
              </label>
              <select
                value={promotionId}
                onChange={(e) => setPromotionId(e.target.value)}
                style={inputStyle}
              >
                <option value="">{t('no_promotion')}</option>
                {promotions.map(promo => (
                  <option key={promo.id} value={promo.id.toString()}>
                    {promo.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label style={{ color: '#e5e5e5', fontWeight: 600 }}>
                {t('imageUrl')}
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                required
                style={inputStyle}
              />
            </div>

            <button type="submit" style={primaryButton}>
              {t('save_changes')}
            </button>
          </form>

          <div className="mt-3 text-center">
            <button onClick={() => navigate('/catalog')} style={secondaryButton}>
              {t('cancel_add')}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default EditProduct