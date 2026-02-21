import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import NavBar from '../../common/NavBar';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAuth } from '../../common/AuthContext';
import { useTranslation } from 'react-i18next';
import PopUpWindow from '../Pop-up_Window';

const PayProduct = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { productosSeleccionados, total } = location.state || { productosSeleccionados: [], total: 0 };
  const { token, user, setIdTrans, setIsCompra } = useAuth();
  const apiUrl = import.meta.env.VITE_IP_API;

  const { t } = useTranslation('global');
  const [metodoPago, setMetodoPago] = useState<'transferencia' | 'sinpe' | null>(null);
  const [showSinpeModal, setShowSinpeModal] = useState(false);
  const [modalInfo, setModalInfo] = useState<{ show: boolean; title: string; content: string; onConfirm?: () => void }>({
    show: false,
    title: '',
    content: '',
  });

  useEffect(() => {
    document.body.style.backgroundColor = '#ffffff';
  }, []);

  const showAlert = (title: string, content: string, onConfirm?: () => void) => {
    setModalInfo({ show: true, title, content, onConfirm });
  };

  const procesarPagoSinpe = async () => {
    if (!token || !user?.email) return;

    try {
      const bodySinpe = {
        descripcion: 'Compra desde el carrito',
        fechaCompra: new Date().toISOString().split('T')[0],
        estadoPago: 'PENDIENTE',
        usuarioEmail: user.email
      };

      const response = await fetch(`${apiUrl}/api/payments/sinpe/pay/compra/${user.email}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(bodySinpe),
      });

      if (!response.ok) {
        const errorData = await response.json();
        showAlert('Error', errorData.message || 'No se pudo registrar el pago por SINPE.');
        return;
      }

      const mensaje = `Hola, deseo pagar por SINPE móvil los productos que compré en la página. Mi correo es: ${user.email}, Monto a Pagar es: ${total} dolares`;
      const mensajeCodificado = encodeURIComponent(mensaje);
      const whatsappUrl = `https://wa.me/50683582929?text=${mensajeCodificado}`;
      navigate('/');
      window.location.href = whatsappUrl;

    } catch (error) {
      console.error('Error al registrar pago por SINPE:', error);
      showAlert('Error', 'Ocurrió un error al registrar el pago por SINPE.');
    }
  };

  const handleConfirmacion = async () => {
    if (!token || !user?.email) {
      showAlert('Error de Autenticación', 'No se ha encontrado el token de autenticación o el correo del usuario.');
      return;
    }

    if (!metodoPago) {
      showAlert('Método de Pago', 'Selecciona un método de pago.');
      return;
    }

    if (metodoPago === 'sinpe') {
      setShowSinpeModal(true);
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/payments/pay/${user.email}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          descripcion: 'Compra desde el carrito',
          fechaCompra: new Date().toISOString().split('T')[0],
          estadoPago: 'PENDIENTE',
          usuarioEmail: user.email
        })
      });

      const result = await response.json();
      setIdTrans(result.id_compra);
      setIsCompra(true);

      if (typeof result.sessionUrl === 'string' && result.sessionUrl.startsWith("https://")) {
        window.location.href = result.sessionUrl;
      } else {
        showAlert('Error', 'URL inválida para redirección a PayPal.');
      }
    } catch (error) {
      console.error('Error al procesar la compra:', error);
      showAlert('Error', 'Ocurrió un error al procesar la compra. Inténtalo más tarde.');
    }
  };

  if (!productosSeleccionados || productosSeleccionados.length === 0) {
    return (
      <>
        <NavBar />
        <div className="container mt-5">{t('no_products')}</div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="container mt-5">
        <div className="card p-4 shadow-lg">
          <h2 className="text-dark mb-4 text-center">{t('confirm_title')}</h2>

          <h5 className="mb-3">{t('selected_products')}</h5>
          <ul className="list-group mb-3">
            {productosSeleccionados.map((prod: any, index: number) => (
              <li key={index} className="list-group-item d-flex justify-content-between">
                <span>{prod.name} x{prod.quantity}</span>
                <span>₡{(prod.price * prod.quantity).toLocaleString()}</span>
              </li>
            ))}
            <li className="list-group-item d-flex justify-content-between fw-bold">
              <span>{t('total')}</span>
              <span>₡{total.toLocaleString()}</span>
            </li>
          </ul>

          <hr />

          <div className="mb-3 mt-4">
            <label className="form-label fw-bold">{t('payment_method')}</label>
            <div className="form-check">
              <input type="radio" className="form-check-input" name="metodoPago" id="transferencia" onChange={() => setMetodoPago('transferencia')} />
              <label className="form-check-label" htmlFor="transferencia">{t('paypal')}</label>
            </div>
            <div className="form-check">
              <input type="radio" className="form-check-input" name="metodoPago" id="sinpe" onChange={() => setMetodoPago('sinpe')} />
              <label className="form-check-label" htmlFor="sinpe">{t('sinpe')}</label>
            </div>
          </div>

          {metodoPago === 'transferencia' && (
            <div className="alert alert-primary">
              {t('paypal_notice')} <strong>PayPal</strong> {t('paypal_notice2')}
            </div>
          )}

          {metodoPago === 'sinpe' && (
            <div className="alert alert-warning mt-4">
              <strong>Nota:</strong> Al presionar <strong>Confirmar compra</strong> se abrirá una ventana emergente con los pasos necesarios para continuar con su pago por SINPE móvil.
            </div>
          )}

          <div className="text-center mt-4">
            <button className="btn btn-success" onClick={handleConfirmacion}>
              {t('confirm_button')}
            </button>
          </div>
        </div>
      </div>

      <PopUpWindow
        show={showSinpeModal}
        title="Pago de Compra por Sinpe"
        onClose={() => setShowSinpeModal(false)}
        onConfirm={() => {
          setShowSinpeModal(false);
          procesarPagoSinpe();
        }}
      >
        <div className="bg-white text-dark p-2 rounded">
          <p className="fw-bold">
            Debe realizar una transferencia al número SINPE móvil:
          </p>
          <div className="border border-dark p-3 my-3 text-center fs-5 fw-bold">
            <p className="text-black pt-3">+506 83582929</p>
          </div>
          <p>
            Una vez realizado el pago, envíe el comprobante a través de WhatsApp. <br />
            El pedido quedará en estado <strong>PENDIENTE</strong> hasta confirmar el pago.
          </p>
        </div>
      </PopUpWindow>

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
    </>
  );
};

export default PayProduct;

