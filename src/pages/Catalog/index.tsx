import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../../common/NavBar'
import { useAuth } from '../../common/AuthContext'
import image from '../../assets/pulido.png'
import { useTranslation } from 'react-i18next';

const Catalog = () => {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([])
  const [promotions, setPromotions] = useState<any[]>([])
  const { t } = useTranslation('global');

  const navigate = useNavigate()
  const apiUrl = import.meta.env.VITE_IP_API

  useEffect(() => {
    document.body.style.backgroundColor = '#0f0f0f'

    if (user?.rol === 'Administrador') setIsAdmin(true)
    fetchProducts()
    fetchCategories()
    fetchPromotions()
  }, [user])

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/products/get_all`)
      const data = await res.json()
      setProducts(data)
      setFilteredProducts(data)
    } catch (err) {
      setProducts([getFallbackProduct()])
      setFilteredProducts([getFallbackProduct()])
    }
  }

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
      const res = await fetch(`${apiUrl}/api/promotions`)
      const data = await res.json()
      setPromotions(data)
    } catch (err) {
      console.error(err)
    }
  }

  const getFallbackProduct = () => ({
    id: 0,
    name: 'Cera Premium',
    description: 'Cera especial, rojo, 150ml',
    price: 2500,
    image: image,
    categoryId: 1,
  })

  const handleCategoryFilter = (id: number) => {
    const filtered = products.filter(p => p.categoryId === id)
    setFilteredProducts(filtered)
  }

  const clearFilter = () => {
    setFilteredProducts(products)
  }


  return (
  <>
    <NavBar />
    <div className="container mt-5">
      <div
        className="d-flex justify-content-between align-items-center mb-5 flex-wrap"
        style={{
          borderBottom: '1px solid #222',
          paddingBottom: '20px'
        }}
      >
        <div className="dropdown me-3 mb-2">
          <button
            className="btn dropdown-toggle"
            style={{
              backgroundColor: '#1a1a1a',
              color: '#ffffff',
              border: '1px solid #333',
              borderRadius: '8px',
              padding: '8px 16px',
              transition: 'all 0.3s ease'
            }}
            type="button"
            id="dropdownMenuButton"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            {t('filter_sort')}
          </button>
          <div
            className="dropdown-menu"
            style={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '8px'
            }}
          >
            <div className="dropdown-divider"></div>
            <button className="dropdown-item"
              style={{
                color: '#e5e5e5',
                backgroundColor: 'transparent'
              }} onClick={clearFilter}>{t('all_categories')}</button>
            {categories.map(cat => (
              <button
                key={cat.id}
                className="dropdown-item"
                style={{
                  color: '#e5e5e5',
                  backgroundColor: 'transparent'
                }}
                onClick={() => handleCategoryFilter(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {isAdmin && (
          <button className="btn"
          style={{
            backgroundColor: '#8B0000',
            color: '#fff',
            borderRadius: '8px',
            padding: '8px 18px',
            transition: 'all 0.3s ease'
          }} onClick={() => navigate('/add-product')}>
            {t('add_product')}
          </button>
        )}
      </div>

      {filteredProducts.length === 0 ? (
        <p
        className="text-center"
        style={{
          color: '#888',
          fontSize: '1rem'
        }}
      >{t('no_products')}</p>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-4">
          {filteredProducts.map((product) => {
            const promotion = promotions.find(p => p.id === product.promotionId)
            return (
              <div key={product.id} className="col">
                <div
                  className="card h-100"
                  style={{
                    backgroundColor: '#181818',
                    borderRadius: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    overflow: 'hidden',
                    border: '2px solid #2a2a2a',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.35)'
                  }}
                  onClick={() => navigate(`/product/${product.id}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px)'
                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.5)'
                    e.currentTarget.style.border = '1px solid #333'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.35)'
                    e.currentTarget.style.border = '1px solid #2a2a2a'
                  }}
                >
                  {promotion && (
                    <span className="badge bg-danger position-absolute top-0 start-0 m-2">
                      {promotion.title}
                    </span>
                  )}
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
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="img-fluid"
                      style={{ maxHeight: '100%', objectFit: 'contain' }}
                    />
                  </div>
                  <div
                    className="card-body d-flex flex-column"
                    style={{
                      color: '#f1f1f1'
                    }}
                  >
                    <h6
                      className="fw-semibold mb-2"
                      style={{ color: '#ffffff', fontSize: '0.95rem' }}
                    >{product.name}</h6>
                    <p
                      className="mb-2"
                      style={{
                        color: '#a1a1a1',
                        fontSize: '0.85rem',
                        minHeight: '40px'
                      }}
                    >{product.description}</p>
                    {promotion?.porcentage ? (
                      <div>
                        <span className="text-muted text-decoration-line-through me-2">
                          ${Math.round(product.price / (1 - promotion.porcentage / 100)).toLocaleString()}
                        </span>
                        <span className="fw-bold"
                          style={{ color: '#8B0000' }}>
                          ${product.price.toLocaleString()}
                        </span>
                      </div>
                    ) : (
                      <p className="mb-0 fw-bold">${product.price.toLocaleString()}</p>
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
export default Catalog
