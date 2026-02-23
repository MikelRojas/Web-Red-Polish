import {useLocation, useNavigate} from 'react-router-dom';
import { useState, useEffect } from 'react';
import NavBar from '../../common/NavBar';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAuth } from '../../common/AuthContext'
import { useTranslation } from 'react-i18next';
import PopUpWindow from '../Pop-up_Window'; 

const PayService = () => {
  const location = useLocation();
  const { servicio, fechaSeleccionada } = location.state || {};
  const { user ,token } = useAuth();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_IP_API;
  const { t } = useTranslation('global');

  const [metodoPago] = useState<'sinpe'>('sinpe');

  const [showSinpeModal, setShowSinpeModal] = useState(false); 
  const [modalInfo, setModalInfo] = useState<{ show: boolean; title: string; content: string; onConfirm?: () => void }>({
    show: false,
    title: '',
    content: '',
  });

  const showAlert = (title: string, content: string, onConfirm?: () => void) => {
    setModalInfo({ show: true, title, content, onConfirm });
  };

  const procesarPagoSinpe = async () => {
    if (!token || !user?.email) return;

    const fecha = fechaSeleccionada.toISOString().split('T')[0];
    const hora = fechaSeleccionada.toTimeString().slice(0, 5);

    try {
      const bodySinpe = {
          date: fecha,
          hour: hora,
          serviceId: servicio.id,
        };

        const response = await fetch(`${apiUrl}/api/payments/sinpe/pay/cita/${user.email}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(bodySinpe)
        });

        if (!response.ok) {
          const json = await response.json();
          console.error('❌ Error JSON:', json);
          throw new Error(json.message || 'Error desconocido');
        }

      const mensaje = `Hola, deseo pagar por SINPE móvil el servicio que reservé. Mi correo es: ${user.email}, Monto a pagar: ${servicio.precio} dólares.`;
      const mensajeCodificado = encodeURIComponent(mensaje);
      const whatsappUrl = `https://wa.me/50683582929?text=${mensajeCodificado}`;
      navigate('/');
      window.location.href = whatsappUrl;
    } catch (error: any) {
  console.error('❌ Error al registrar pago por SINPE:', error);

  // Intenta extraer mensaje si es un Error de tipo Response o JSON fallido
  if (error instanceof Error) {
    showAlert('Error', error.message || 'Ocurrió un error al registrar el pago por SINPE.');
  } else {
    showAlert('Error', 'Ocurrió un error desconocido al registrar el pago por SINPE.');
  }
}

  };


  useEffect(() => {
    document.body.style.backgroundColor = '#ffffff'
  }, [])


  const handleConfirmacion = () => {
    if (!token || !user?.email) {
      showAlert('Error', 'No se encontró autenticación.');
      return;
    }
  
    if (!servicio || !fechaSeleccionada) {
      showAlert('Error', 'Faltan datos del servicio o fecha.');
      return;
    }
  
    setShowSinpeModal(true);
  };

  if (!servicio || !fechaSeleccionada) {
    return (
      <>
        <NavBar />
        <div className="container mt-5">{t('missing_data')}</div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="container mt-5">
        <div className="card p-4 shadow-lg">
          <h2 className="text-dark mb-4 text-center">{t('confirm_title_s')}</h2>

          <p><strong>{t('service')}:</strong> {servicio.nombre}</p>
          <p><strong>{t('price')}:</strong> ${servicio.precio.toLocaleString()}</p>
          <p><strong>{t('description')}:</strong> {servicio.descripcion}</p>
          <p><strong>{t('date')}:</strong> {fechaSeleccionada.toLocaleDateString()}</p>
          <p><strong>{t('hour')}:</strong> {fechaSeleccionada.toLocaleTimeString()}</p>

          <hr />

          {/* Pago */}
          <div className="alert alert-warning mt-4">
            <strong>Pago por SINPE móvil</strong><br />
            Al presionar <strong>Confirmar cita</strong> se mostrarán las instrucciones para realizar el pago.
          </div>

          {metodoPago === 'sinpe' && (
            <div className="alert alert-warning mt-4">
              <strong>Nota:</strong> Al presionar <strong>Confirmar cita</strong> se abrirá una ventana emergente con los pasos necesarios para continuar con su pago por SINPE móvil.
            </div>
          )}

          <div className="text-center">
            <button className="btn btn-primary" onClick={handleConfirmacion}>
              {t('confirm_button_s')}
            </button>
          </div>
        </div>
      </div>
      <PopUpWindow
        show={showSinpeModal}
        title="Pago de Cita por Sinpe"
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

export default PayService;
