import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import NavBar from '../../common/NavBar'
import { useAuth } from '../../common/AuthContext'
import image from '../../assets/pulido.png'
import { useTranslation } from 'react-i18next'
import PopUpWindow from '../Pop-up_Window'

const ProductView = () => {
  const { user, token } = useAuth()
  const [product, setProduct] = useState<any>(null)
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [popupData, setPopupData] = useState<{ title: string; message: string; onConfirm?: () => void }>({ title: '', message: '' })
  const [quantity, setQuantity] = useState(1)
  const { id } = useParams()
  const navigate = useNavigate()
  const apiUrl = import.meta.env.VITE_IP_API
  const userEmail = user?.email
  const { t } = useTranslation('global')

  useEffect(() => {
    if (user?.rol === 'Administrador') {
      setIsAdmin(true)
    }

    const fetchProduct = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/products/get/${id}`)
        if (!res.ok) throw new Error('Producto no encontrado')
        const data = await res.json()
        setProduct(data)
      } catch {
        setProduct({
          id: 0,
          name: 'Cera Premium',
          description: 'Cera especial, rojo, 150ml. Ideal para dar brillo profundo y proteger la pintura.',
          price: 2500,
          image: image,
          categoryId: 1,
        })
      }
    }

    fetchProduct()
  }, [id, user])

  const showAlert = (title: string, message: string, onConfirm?: () => void) => {
    setPopupData({ title, message, onConfirm })
    setShowPopup(true)
  }

  const handleAddToCart = async () => {
    const qty = Number(quantity)
    if (!qty || qty < 1) {
      showAlert('Cantidad inválida', 'Por favor ingrese una cantidad válida (mayor a 0).')
      return
    }

    if (!userEmail || !token || !user?.id) {
      showAlert('Inicio de sesión requerido', 'Debe iniciar sesión para añadir al carrito.')
      return
    }

    try {
      const res = await fetch(`${apiUrl}/api/cart/add/${userEmail}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          productId: product.id,
          quantity: qty,
        }),
      })

      if (!res.ok) throw new Error('Error al añadir al carrito')

      showAlert('Éxito', 'Producto añadido al carrito exitosamente')
    } catch (err) {
      console.error("❌ Error al añadir al carrito:", err)
      showAlert('Error', 'Ocurrió un error al añadir al carrito.')
    }
  }

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product?.categoryId) return

      try {
        const res = await fetch(`${apiUrl}/api/products/get_all`)
        const data = await res.json()
        const related = data.filter((p: any) => p.categoryId === product.categoryId && p.id !== product.id)
        setRelatedProducts(related)
      } catch (err) {
        console.error('❌ Error al obtener productos relacionados:', err)
      }
    }

    fetchRelatedProducts()
  }, [product])

  const handleDelete = async () => {
    if (!userEmail || !token) return

    try {
      const res = await fetch(`${apiUrl}/api/products/delete/${product.id}/${userEmail}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!res.ok) throw new Error('Error al eliminar producto')

      showAlert('Eliminado', 'Producto eliminado correctamente.', () => navigate('/catalog'))
    } catch (err) {
      console.error('❌ Error eliminando producto:', err)
      showAlert('Error', 'Hubo un error al eliminar el producto.')
    }
  }

  if (!product) {
    return (
      <>
        <NavBar />
        <div className="container text-center mt-5">
          <p className="text-muted">Cargando producto...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <NavBar />
  
      <div
        className="container py-5"
        style={{ color: "#ffffff" }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "transparent",
            border: "1px solid #333",
            color: "#ccc",
            borderRadius: "8px",
            padding: "6px 15px",
            marginBottom: "30px"
          }}
        >
          ⬅ {t('back')}
        </button>
  
        <div
          className="row align-items-center"
          style={{
            backgroundColor: "#141414",
            borderRadius: "20px",
            padding: "40px",
            border: "1px solid #2a2a2a",
            boxShadow: "0 20px 50px rgba(0,0,0,0.6)"
          }}
        >
          <div className="col-md-6 text-center mb-4 mb-md-0">
            <img
              src={product.image}
              alt={product.name}
              className="img-fluid"
              style={{
                maxHeight: "420px",
                objectFit: "contain"
              }}
            />
          </div>
  
          <div className="col-md-6">
            <h2 className="fw-bold mb-3">{product.name}</h2>
  
            <p style={{ color: "#b0b0b0" }}>
              {product.description}
            </p>
  
            <h3
              className="fw-bold my-4"
              style={{ color: "#ffffff" }}
            >
              ${product.price.toLocaleString()}
            </h3>
  
            {!isAdmin && (
              <>
                <label className="fw-bold mb-2">{t('quantity')}:</label>
  
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  style={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #333",
                    color: "#fff",
                    borderRadius: "10px",
                    padding: "10px",
                    width: "120px",
                    marginBottom: "20px"
                  }}
                />
  
                {user ? (
                  <button
                    onClick={handleAddToCart}
                    style={{
                      backgroundColor: "#8B0000",
                      border: "none",
                      borderRadius: "12px",
                      padding: "12px 30px",
                      fontWeight: 600,
                      color: "#fff",
                      transition: "0.3s ease"
                    }}
                  >
                    {t('add_to_cart')}
                  </button>
                ) : (
                  <div
                    style={{
                      backgroundColor: "#1f1f1f",
                      border: "1px solid #333",
                      padding: "10px",
                      borderRadius: "10px",
                      color: "#ffcc00",
                      marginTop: "10px"
                    }}
                  >
                    ⚠ {t('login_required_p')}
                  </div>
                )}
              </>
            )}
  
            {isAdmin && (
              <div className="d-flex flex-column gap-3 mt-3">
                <button
                  onClick={() => navigate(`/edit-product/${product.id}`)}
                  style={{
                    backgroundColor: "#1f1f1f",
                    border: "1px solid #333",
                    color: "#fff",
                    borderRadius: "10px",
                    padding: "10px"
                  }}
                >
                  ✏ {t('edit_p')}
                </button>
  
                <button
                  onClick={() => setShowConfirmModal(true)}
                  style={{
                    backgroundColor: "#8B0000",
                    border: "none",
                    borderRadius: "10px",
                    padding: "10px",
                    color: "#fff"
                  }}
                >
                  🗑 {t('delete_p')}
                </button>
              </div>
            )}
          </div>
        </div>
  
        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <div className="mt-5">
            <h4 className="fw-bold mb-4">{t('related_products')}</h4>
  
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-5 g-4">
              {relatedProducts.map((prod) => (
                <div key={prod.id} className="col">
                  <div
                    onClick={() => navigate(`/product/${prod.id}`)}
                    style={{
                      backgroundColor: "#141414",
                      borderRadius: "16px",
                      border: "1px solid #2a2a2a",
                      padding: "20px",
                      cursor: "pointer",
                      height: "100%",
                      transition: "0.3s ease"
                    }}
                  >
                    <div
                      className="d-flex justify-content-center align-items-center"
                      style={{ height: "150px" }}
                    >
                      <img
                        src={prod.image}
                        alt={prod.name}
                        style={{
                          maxHeight: "100%",
                          objectFit: "contain"
                        }}
                      />
                    </div>
  
                    <h6 className="fw-bold mt-3">{prod.name}</h6>
  
                    <p style={{ color: "#b0b0b0", fontSize: "0.9rem" }}>
                      {prod.description}
                    </p>
  
                    <p className="fw-bold mb-0">
                      ${prod.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
  
        {/* MODAL DELETE */}
        {showConfirmModal && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
            style={{
              background: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(4px)",
              zIndex: 1000
            }}
          >
            <div
              style={{
                backgroundColor: "#141414",
                borderRadius: "18px",
                padding: "30px",
                width: "100%",
                maxWidth: "400px",
                border: "1px solid #2a2a2a"
              }}
            >
              <h5 className="fw-bold mb-3">
                {t('confirm_delete_title')}
              </h5>
  
              <p style={{ color: "#b0b0b0" }}>
                {t('confirm_delete_message')}
              </p>
  
              <div className="d-flex justify-content-end gap-3 mt-4">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  style={{
                    background: "transparent",
                    border: "1px solid #333",
                    color: "#ccc",
                    borderRadius: "8px",
                    padding: "6px 15px"
                  }}
                >
                  {t('cancel')}
                </button>
  
                <button
                  onClick={handleDelete}
                  style={{
                    backgroundColor: "#8B0000",
                    border: "none",
                    borderRadius: "8px",
                    padding: "6px 15px",
                    color: "#fff"
                  }}
                >
                  {t('delete')}
                </button>
              </div>
            </div>
          </div>
        )}
  
        <PopUpWindow
          show={showPopup}
          title={popupData.title}
          onClose={() => {
            setShowPopup(false)
            popupData.onConfirm?.()
          }}
          onConfirm={() => {
            setShowPopup(false)
            popupData.onConfirm?.()
          }}
        >
          <p>{popupData.message}</p>
        </PopUpWindow>
      </div>
    </>
  )
}

export default ProductView
