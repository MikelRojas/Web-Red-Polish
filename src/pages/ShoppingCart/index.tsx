import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import NavBar from '../../common/NavBar';
import { useAuth } from '../../common/AuthContext'
import { useNavigate } from 'react-router-dom';

import { useTranslation } from 'react-i18next';


const ShoppingCart: React.FC = () => {
  const [productos, setProductos] = useState<any[]>([]);
  const [seleccionados, setSeleccionados] = useState<{ [id: number]: number }>({});
  const apiUrl = import.meta.env.VITE_IP_API;
  const { user, token } = useAuth();
  const userEmail = user?.email
  const userId = user?.id
  const navigate = useNavigate();
  const { t } = useTranslation('global');



  const actualizarProductoEnCarrito = async (cartItemId: number, nuevaCantidad: number) => {
    if (!userEmail || !token) return;

    try {
      const res = await fetch(`${apiUrl}/api/cart/update/${cartItemId}/${nuevaCantidad}/${userEmail}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Error al actualizar producto en el carrito');

    } catch (err) {
      console.error('❌ Error actualizando producto:', err);
    }
  };

  const eliminarProductoDelCarrito = async (cartItemId: number) => {
    if (!userEmail || !token) return;

    try {
      const res = await fetch(`${apiUrl}/api/cart/remove/${cartItemId}/${userEmail}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Error al eliminar el producto');

      // Quitar el producto eliminado del estado local
      setProductos((prev) => prev.filter(p => p.cartItemId !== cartItemId));
      setSeleccionados((prev) => {
        const nuevo = { ...prev };
        const idProducto = productos.find(p => p.cartItemId === cartItemId)?.id;
        if (idProducto !== undefined) delete nuevo[idProducto];
        return nuevo;
      });

    } catch (err) {
      console.error('❌ Error al eliminar producto del carrito:', err);
    }
  };

 
  const vaciarCarrito = async () => {
    if (!userId || !userEmail || !token) return;

    try {
      const res = await fetch(`${apiUrl}/api/cart/clear/${userId}/${userEmail}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Error al vaciar el carrito');

      // Limpia el estado local del carrito
      setProductos([]);
      setSeleccionados({});

    } catch (err) {
      console.error('❌ Error al vaciar el carrito:', err);
    }
  };

  useEffect(() => {

    const fetchCartAndProducts = async () => {
      if (!userId || !userEmail || !token) return;

      try {
        // 1. Obtener los items del carrito
        const resCart = await fetch(`${apiUrl}/api/cart/items/${userId}/${userEmail}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!resCart.ok) throw new Error('Error al obtener carrito');
        const cartItems = await resCart.json();

        // 2. Obtener detalles de cada producto del carrito
        const productData = await Promise.all(
          cartItems.map(async (item: any) => {
            try {
              const resProduct = await fetch(`${apiUrl}/api/products/get/${item.productId}`);
              if (!resProduct.ok) throw new Error(`Producto ${item.productId} no encontrado`);
              const product = await resProduct.json();

              return {
                ...product,
                quantity: item.quantity, // Agregamos la cantidad desde el carrito
                cartItemId: item.id,     // Por si quieres eliminar/editar más adelante
              };
            } catch (err) {
              console.error(err);
              return null;
            }
          })
        );

        // 3. Filtramos productos válidos y actualizamos estado
        const validProducts = productData.filter((p) => p !== null);
        setProductos(validProducts);

        // Inicializar cantidades seleccionadas
        const inicialSeleccionados: { [id: number]: number } = {};
        validProducts.forEach((p) => {
          inicialSeleccionados[p.id] = p.quantity;
        });
        setSeleccionados(inicialSeleccionados);
      } catch (err) {
        console.error('❌ Error al obtener productos del carrito:', err);
      }
    };

    fetchCartAndProducts();
  }, [userId, userEmail, token]);



  const actualizarCantidad = (id: number, nuevaCantidad: number) => {
    if (nuevaCantidad < 0) return; 
    setSeleccionados((prev) => ({
      ...prev,
      [id]: nuevaCantidad,
    }));
  };

  const totalSeleccionados = productos.reduce((acc, p) => {
    if (p.id in seleccionados && seleccionados[p.id] > 0) {
      return acc + p.price * seleccionados[p.id];
    }
    return acc;
  }, 0);

  return (
    <>
      <NavBar />
  
      <div
        className="container py-5"
        style={{ color: "#ffffff" }}
      >
        <h2 className="text-center mb-5 fw-bold">
          🛒 {t('shopping')}
        </h2>
  
        {productos.length === 0 ? (
          <div
            style={{
              backgroundColor: "#141414",
              border: "1px solid #2a2a2a",
              borderRadius: "16px",
              padding: "40px",
              textAlign: "center",
              color: "#b0b0b0"
            }}
          >
            {t('no_products')}
          </div>
        ) : (
          <>
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {productos.map((producto) => (
                <div className="col" key={producto.id}>
                  <div
                    style={{
                      backgroundColor: "#141414",
                      borderRadius: "18px",
                      border: "1px solid #2a2a2a",
                      padding: "20px",
                      height: "100%",
                      transition: "0.3s ease"
                    }}
                  >
                    <div className="d-flex gap-3 align-items-start">
                      <img
                        src={producto.image}
                        alt={producto.name}
                        style={{
                          width: "70px",
                          height: "70px",
                          objectFit: "cover",
                          borderRadius: "12px"
                        }}
                      />
  
                      <div style={{ flex: 1 }}>
                        <h6 className="fw-bold mb-1">
                          {producto.name}
                        </h6>
  
                        <p
                          style={{
                            fontSize: "0.9rem",
                            color: "#b0b0b0",
                            marginBottom: "5px"
                          }}
                        >
                          {producto.description}
                        </p>
  
                        <p className="fw-bold mb-2">
                          ${producto.price.toFixed(2)}
                        </p>
  
                        <input
                          type="number"
                          min="0"
                          value={seleccionados[producto.id] ?? 0}
                          onChange={(e) =>
                            actualizarCantidad(producto.id, Number(e.target.value))
                          }
                          style={{
                            backgroundColor: "#1a1a1a",
                            border: "1px solid #333",
                            color: "#fff",
                            borderRadius: "8px",
                            padding: "6px",
                            width: "80px",
                            marginBottom: "10px"
                          }}
                        />
  
                        <div className="d-flex gap-2 flex-wrap">
                          <button
                            onClick={() =>
                              eliminarProductoDelCarrito(producto.cartItemId)
                            }
                            style={{
                              backgroundColor: "transparent",
                              border: "1px solid #8B0000",
                              color: "#ff4d4d",
                              borderRadius: "8px",
                              padding: "5px 10px",
                              fontSize: "0.8rem"
                            }}
                          >
                            {t('delete_p')}
                          </button>
  
                          <button
                            onClick={() =>
                              actualizarProductoEnCarrito(
                                producto.cartItemId,
                                seleccionados[producto.id]
                              )
                            }
                            disabled={
                              seleccionados[producto.id] === producto.quantity
                            }
                            style={{
                              backgroundColor: "#1f1f1f",
                              border: "1px solid #333",
                              color: "#fff",
                              borderRadius: "8px",
                              padding: "5px 10px",
                              fontSize: "0.8rem",
                              opacity:
                                seleccionados[producto.id] === producto.quantity
                                  ? 0.5
                                  : 1
                            }}
                          >
                            {t('save_changes')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
  
            {/* TOTAL */}
            <div
              className="mt-5 p-4 d-flex justify-content-between align-items-center"
              style={{
                backgroundColor: "#141414",
                borderRadius: "18px",
                border: "1px solid #2a2a2a"
              }}
            >
              <span
                style={{
                  fontSize: "1.2rem",
                  color: "#b0b0b0"
                }}
              >
                {t('total')}
              </span>
  
              <span
                style={{
                  fontSize: "1.4rem",
                  fontWeight: "bold"
                }}
              >
                ${totalSeleccionados.toFixed(2)}
              </span>
            </div>
  
            {/* ACTION BUTTONS */}
            <div className="text-center mt-4 d-flex justify-content-center gap-4 flex-wrap">
              <button
                onClick={vaciarCarrito}
                disabled={Object.keys(seleccionados).length === 0}
                style={{
                  backgroundColor: "transparent",
                  border: "1px solid #8B0000",
                  color: "#ff4d4d",
                  borderRadius: "10px",
                  padding: "10px 25px",
                  opacity:
                    Object.keys(seleccionados).length === 0 ? 0.5 : 1
                }}
              >
                {t('clear')}
              </button>
  
              <button
                disabled={Object.keys(seleccionados).length === 0}
                onClick={() =>
                  navigate('/pay-products', {
                    state: {
                      productosSeleccionados: productos.map(p => ({
                        id: p.id,
                        name: p.name,
                        price: p.price,
                        quantity: seleccionados[p.id],
                        image: p.image
                      })),
                      total: totalSeleccionados
                    }
                  })
                }
                style={{
                  backgroundColor: "#8B0000",
                  border: "none",
                  borderRadius: "10px",
                  padding: "10px 30px",
                  color: "#fff",
                  fontWeight: 600,
                  opacity:
                    Object.keys(seleccionados).length === 0 ? 0.5 : 1
                }}
              >
                {t('checkout')}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ShoppingCart;
