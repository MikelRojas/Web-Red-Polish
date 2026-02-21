import { useEffect, useState } from 'react'
import { useAuth } from '../common/AuthContext'
import { useTranslation } from 'react-i18next';
import PopUpWindow from '../pages/Pop-up_Window';

const Appoiment = () => {
  const { user, token } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const apiUrl = import.meta.env.VITE_IP_API;
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
    document.body.style.backgroundColor = '#ffffff'

    const fetchAppointments = async () => {
      try {
        const url =
          user.rol === 'Administrador'
            ? `${apiUrl}/api/citas/get_all`
            : `${apiUrl}/api/citas/get/${user.id}`;

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          showAlert('Error', 'Error al obtener las citas.');
          return;
        }

        const data = await response.json();
        setAppointments(data);
      } catch (err) {
        console.error(err);
        showAlert('Error', 'Error de red al obtener las citas.');
      }
    };

    if (user) {
      fetchAppointments();
    }
  }, [user]);


  const handleConfirm = async (citaId: number): Promise<boolean> => {
    try {
      const response = await fetch(`${apiUrl}/api/payments/sinpe/confirm/cita/${citaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) return false;

      const updated = await response.json();
      setAppointments(prev =>
          prev.map(cita =>
              cita.id === updated.id ? { ...cita, state: updated.state } : cita
          )
      );
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const handleCancel = async (citaId: number): Promise<boolean> => {
    try {
      const endpoint = user.rol === 'Administrador'
          ? `${apiUrl}/api/citas/cancel_admin/${citaId}/${user.email}`
          : `${apiUrl}/api/citas/cancel/${citaId}/${user.email}`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) return false;
      window.location.reload();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="fw-bold mb-4" style={{ color: '#333' }}>{t('my_appointments')}</h2>
      <table className="table table-bordered table-hover mt-3">
        <thead className="thead-dark">
          <tr>
            {user.rol === 'Administrador' && <th>{t('client')}</th>}
            <th>{t('service')}</th>
            <th>{t('date')}</th>
            <th>{t('hour')}</th>
            <th>{t('status')}</th>
            <th>{t('total')}</th>
            <th>{t('action')}</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((cita) => (
            <tr key={cita.id}>
              {user.rol === 'Administrador' && (
                <td>{cita.user.name} {cita.user.last_name}</td>
              )}
              <td>{cita.service.name}</td>
              <td>{cita.date}</td>
              <td>{cita.hour}</td>
              <td>{cita.state}</td>
              <td>${cita.service.price.toFixed(2)}</td>
              <td>
                {/* CONFIRMAR PAGO SOLO PARA ADMIN EN ESTADO PENDIENTE */}
                {user.rol === 'Administrador' && cita.state === 'PENDIENTE' && (
                    <button
                        className="btn btn-success btn-sm me-2"
                        onClick={() =>
                            showAlert(
                                '¿Confirmar cita?',
                                '¿Está seguro que desea confirmar esta cita?',
                                async () => {
                                  const success = await handleConfirm(cita.id);
                                  if (success) {
                                    showAlert(
                                      'Éxito',
                                      'La cita ha sido confirmada exitosamente.',
                                      () => window.location.reload()
                                    );
                                  } else {
                                    showAlert('Error', 'No se pudo confirmar la cita.');
                                  }
                                }
                            )
                        }
                    >
                      Confirmar pago
                    </button>
                )}

                {/* CANCELAR si está PENDIENTE o CONFIRMADA */}
                {(cita.state === 'PENDIENTE' || cita.state === 'CONFIRMADA') && (
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={() =>
                            showAlert(
                                '¿Cancelar cita?',
                                '¿Está seguro que desea cancelar esta cita?',
                                async () => {
                                  const success = await handleCancel(cita.id);
                                  if (success) {
                                    if (user.rol !== 'Administrador') {
                                      showAlert(
                                          'Cancelación pendiente',
                                          'Su cancelación está pendiente. Contacte al administrador al +506 8358 2929.'
                                      );
                                    } else {
                                      showAlert('Éxito', 'La cita ha sido cancelada exitosamente.');
                                    }
                                  } else {
                                    showAlert('Error', 'No se pudo cancelar la cita.');
                                  }
                                }
                            )
                        }
                    >
                      Cancelar
                    </button>
                )}

                {/* CONFIRMAR CANCELACIÓN si es CANCELADA PENDIENTE y el admin la ve */}
                {cita.state === 'CANCELADA PENDIENTE' && user.rol === 'Administrador' && (
                    <button
                        className="btn btn-warning btn-sm"
                        onClick={() =>
                            showAlert(
                                '¿Confirmar cancelación?',
                                '¿Desea confirmar la cancelación de esta cita?',
                                async () => {
                                  const success = await handleCancel(cita.id);
                                  if (success) {
                                    showAlert('Éxito', 'La cancelación fue confirmada.');
                                  } else {
                                    showAlert('Error', 'No se pudo confirmar la cancelación.');
                                  }
                                }
                            )
                        }
                    >
                      Confirmar cancelación
                    </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
    );
};

export default Appoiment;