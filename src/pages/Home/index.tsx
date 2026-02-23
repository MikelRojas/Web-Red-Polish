import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../common/NavBar';
import image from '../../assets/pulido.png';
import { FaFacebook, FaMapMarkerAlt, FaEnvelope, FaWhatsapp } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

function Homepage() {
  const [products, setProducts] = useState<any[]>([]);
  const [startIndex, setStartIndex] = useState(0);
  const [promotions, setPromotions] = useState<any[]>([]);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_IP_API;
  const { t } = useTranslation('global');

  useEffect(() => {
    document.body.style.backgroundColor = '#0f0f0f';
    fetchProducts();
    fetchPromotions();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/products/get_all`);
      if (!res.ok) throw new Error('Error al obtener productos');
      const data = await res.json();
      setProducts(Array.isArray(data) && data.length > 0 ? data : [getFallbackProduct()]);
    } catch (err) {
      console.error('❌ Error al obtener productos:', err);
      setProducts([getFallbackProduct()]);
    }
  };

  const fetchPromotions = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/promotions`);
      const data = await res.json();
      setPromotions(data);
    } catch (err) {
      console.error('❌ Error al obtener promociones:', err);
    }
  };

  const getFallbackProduct = () => ({
    id: 0,
    name: 'Cera Premium',
    description: 'Cera especial, rojo, 150ml',
    price: 2500,
    image: image,
  });

  const nextSlide = () => {
    if (startIndex + 1 < products.length) {
      setStartIndex(startIndex + 1);
    }
  };

  const prevSlide = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1);
    }
  };

  const visibleProducts = products.slice(startIndex, startIndex + 6);

  return (
    <>
      <NavBar />

      {/* Sección de fondo */}
      <div
        className="position-relative d-flex justify-content-center align-items-center text-center"
        style={{
          height: '420px',
          backgroundImage: `url(${image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          overflow: 'hidden'
        }}
      >
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0.6))'
          }}
        />

        <div className="position-relative px-3">
          <h1
            className="fw-bold text-uppercase mb-3"
            style={{
              letterSpacing: '3px',
              fontSize: '3rem',
              color: '#ffffff'
            }}
          >
            RED POLISH
          </h1>

          <div
            style={{
              width: '80px',
              height: '3px',
              backgroundColor: '#8B0000',
              margin: '0 auto 20px auto'
            }}
          />

          <p
            style={{
              maxWidth: '750px',
              margin: '0 auto',
              fontSize: '1.1rem',
              color: '#d1d1d1'
            }}
          >
            {t('slogan')}
          </p>
        </div>
      </div>

      <div className="container my-5">
        <div className="text-center mb-5">
        <p
          className="lh-lg"
          style={{
            fontSize: '1.05rem',
            color: '#cfcfcf',
            maxWidth: '850px',
            margin: '0 auto'
          }}
        >
            {t('description_home')}
            <br />
            <br />
            {t('des')}
            {t('des2')}
          </p>
        </div>

        {/* Carrusel real */}
        <div className="mb-5">
        <h3
          className="fw-bold text-center mb-4 text-uppercase"
          style={{
            letterSpacing: '2px',
            color: '#ffffff'
          }}
        >
            {t('recommended_products')}
          </h3>
          <div
            style={{
              width: '60px',
              height: '3px',
              backgroundColor: '#8B0000',
              margin: '0 auto 30px auto'
            }}
          />
          <div className="d-flex align-items-center justify-content-between">
            <button className="btn btn-outline-dark me-2" onClick={prevSlide}>
              &lt;
            </button>
            <div className="d-flex overflow-hidden" style={{ gap: '1rem', flex: 1 }}>
              {visibleProducts.map((product) => {
                const promo = promotions.find((p) => p.id === product.promotionId);
                const oldPrice = promo?.porcentage
                  ? Math.round(product.price / (1 - promo.porcentage / 100))
                  : null;

                return (
                  <div
                    key={product.id}
                    className="card position-relative"
                    style={{
                      width: '100%',
                      maxWidth: '240px',
                      minHeight: '350px',
                      backgroundColor: '#1a1a1a',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                  
                      /* 🔥 NUEVO */
                      border: '1px solid #2a2a2a',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.45)',
                      transition: 'transform 0.35s ease, box-shadow 0.35s ease, border 0.35s ease',
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
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    {promo && (
                      <span className="badge bg-danger position-absolute top-0 start-0 m-2">
                        {promo.title}
                      </span>
                    )}
                    <div
                      style={{
                        width: '100%',
                        height: '190px',
                        backgroundColor: '#111',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '15px',
                        borderTopLeftRadius: '12px',
                        borderTopRightRadius: '12px',
                        borderBottom: '1px solid #222'
                      }}
                    >
                      <img
                        src={product.image || image}
                        alt={product.name}
                        style={{
                          maxHeight: '100%',
                          maxWidth: '100%',
                          objectFit: 'contain'
                        }}
                      />
                    </div>
                    <div
                      className="card-body d-flex flex-column"
                      style={{
                        padding: '18px',
                        color: '#f1f1f1'
                      }}
                    >
                      <h6
                        className="fw-semibold mb-2"
                        style={{
                          fontSize: '0.95rem',
                          color: '#ffffff'
                        }}
                      >{product.name}</h6>
                      <p
                        className="mb-2"
                        style={{
                          fontSize: '0.8rem',
                          color: '#a1a1a1',
                          minHeight: '38px'
                        }}
                      >{product.description}</p>
                      {promo?.porcentage ? (
                        <div>
                          <span className="text-muted text-decoration-line-through me-2">
                            ${oldPrice?.toLocaleString()}
                          </span>
                          <span
                            className="fw-bold"
                            style={{ color: '#8B0000' }}
                          >
                            ${product.price.toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <p
                          className="mb-0 fw-bold"
                          style={{
                            color: '#ffffff',
                            fontSize: '0.95rem'
                          }}
                        >
                          ${product.price.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <button 
            className="btn"
            style={{
              backgroundColor: '#1a1a1a',
              color: '#ffffff',
              border: '1px solid #333',
              transition: 'all 0.3s ease'
            }} onClick={nextSlide}>
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          backgroundColor: '#111',
          borderTop: '1px solid #222'
        }}
        className="py-5"
      >
        <div className="container">
          <h3 className="text-center fw-bold mb-4">{t('contact_us')}</h3>
          <div className="row row-cols-1 row-cols-md-2 g-4">
            <div className="d-flex align-items-start gap-3">
              <FaMapMarkerAlt className="fs-3 text-danger" />
              <div>
                <p className="mb-1 fw-semibold">{t('location')}</p>
                <p>Quesada, San Carlos, Costa Rica</p>
              </div>
            </div>
            <div className="d-flex align-items-start gap-3">
              <FaWhatsapp className="fs-4" style={{ color: '#8B0000' }} />
              <div>
                <p className="mb-1 fw-semibold">{t('Whatsapp')}</p>
                <a href="https://wa.me/50683582929" className="text-white">
                  WhatsApp
                </a>
              </div>
            </div>
            <div className="d-flex align-items-start gap-3">
              <FaEnvelope className="fs-4" style={{ color: '#8B0000' }} />
              <div>
                <p className="mb-1 fw-semibold">{t('email')}</p>
                <a href="mailto:agenda@redpolishcr.com" className="text-white">
                  agenda@redpolishcr.com
                </a>
              </div>
            </div>
            <div className="d-flex align-items-start gap-3">
              <FaFacebook className="fs-4" style={{ color: '#8B0000' }}/>
              <div>
                <p className="mb-1 fw-semibold">Facebook</p>
                <a
                  href="https://www.facebook.com/share/19EaKxAE8s/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white"
                >
                  Red Polish Costa Rica
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Homepage;
