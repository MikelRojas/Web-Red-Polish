import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import NavBar from '../../common/NavBar'
import { useAuth } from '../../common/AuthContext'
import MostrarCitas from '../../components/MostrarCitas'
import { useTranslation } from 'react-i18next';
import PopUpWindow from '../Pop-up_Window'

const UserManagement = () => {
  const navigate = useNavigate()
  const { user, token, login } = useAuth()
  const apiUrl = import.meta.env.VITE_IP_API;

  const [firstName, setFirstName] = useState(user?.name || '')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [correoPromoStatus, setCorreoPromoStatus] = useState<'success' | 'error' | null>(null)
  const [lastName, setLastName] = useState(user?.last_name || '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [popupData, setPopupData] = useState<{ title: string; message: string; onConfirm?: () => void }>({ title: '', message: '' })
  const [activeSection, setActiveSection] = useState<'info' | 'citas' | 'gestion' | 'promos' | 'ventas' | 'promosActivas' | 'notificaciones'>('info');

  const { setLanguage } = useAuth();

  const { t } = useTranslation('global');
  const showAlert = (title: string, message: string, onConfirm?: () => void) => {
    setPopupData({ title, message, onConfirm })
    setShowPopup(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const userEmail = user?.email
    
    if (!firstName.trim() || !lastName.trim()) {
      setError('Por favor, complete los campos que desea cambiar en su perfil')
      setSuccess(false)
      return
    }

    const updatedUser = {
      name: firstName,
      last_name: lastName,
      password: password || user?.password,
    }

    const fullUser = {
      id: user?.id,
      name: firstName,
      last_name: lastName,
      email: userEmail,
      password: password || user?.password,
      rol: user?.rol,
    }
    showAlert('Confirmación', '¿Seguro que quieres cambiar tus datos?', async () => {
      try {
        const response = await fetch(`${apiUrl}/api/users/update/${userEmail}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(updatedUser),
        })

        if (!response.ok) {
          const errorData = await response.json()
          setError(errorData.message || 'Error al actualizar los datos.')
          setSuccess(false)
          return
        }

        login(fullUser, token!)
        showAlert('Éxito', 'Tus cambios han sido efectuados correctamente')
        setError('')
        setSuccess(true)
      } catch (err) {
        console.error('❌ Error al hacer la petición:', err)
        setError('Error de conexión con el servidor.')
        showAlert('Fracaso', 'Tus cambios no han sido efectuados')
        setSuccess(false)
      }
    })
  }

  useEffect(() => {
    document.body.style.backgroundColor = '#ffffff'

    if (success) {
      const timer = setTimeout(() => {
        navigate('/')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [success, navigate])

  const [promotions, setPromotions] = useState<any[]>([])
  const [tieneNotificacion, setTieneNotificacion] = useState(false);


useEffect(() => {
  const fetchPromotions = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/promotions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        const errorText = await res.text()
        console.error(`❌ Error ${res.status}:`, errorText)
        return
      }

      const data = await res.json()
      setPromotions(data)
      if (user?.rol !== 'Administrador') {
        const notificacionesGuardadas = JSON.parse(localStorage.getItem(`notificaciones-${user.email}`) || '[]');
        const nuevasNotificaciones = [];

        const hoy = new Date();

        for (const promo of data) {
          const inicio = new Date(promo.start_date);
          const fin = new Date(promo.end_date);
          const yaExiste = notificacionesGuardadas.some((n: any) => n.id === promo.id);

          if (hoy >= inicio && hoy <= fin && !yaExiste) {
            nuevasNotificaciones.push({
              id: promo.id,
              mensaje: `🎉 ¡Aprovecha la nueva promoción "${promo.title}"! Vigente desde el ${promo.start_date.split('T')[0]} hasta el ${promo.end_date.split('T')[0]}. ¡No te la pierdas!`
            });
          }
        }

        if (nuevasNotificaciones.length > 0) {
          const todas = [...notificacionesGuardadas, ...nuevasNotificaciones];
          localStorage.setItem(`notificaciones-${user.email}`, JSON.stringify(todas));
          setTieneNotificacion(true);
        }
      }

    } catch (error) {
      console.error('❌ Error al obtener promociones:', error)
    }
  }

  fetchPromotions()
}, [apiUrl, token])

  const promocionesActivas = promotions.filter(promo => {
    const hoy = new Date()
    const inicio = new Date(promo.start_date)
    const fin = new Date(promo.end_date)

    return hoy >= inicio && hoy <= fin
  })
  

  const [newPromo, setNewPromo] = useState<{
    title: string;
    start_date: string;
    end_date: string;
    porcentage: number | '';
  }>({
    title: '',
    start_date: '',
    end_date: '',
    porcentage: '',
  });
  const [editingPromoId, setEditingPromoId] = useState<number | null>(null)


  const handlePromoSubmit = async () => {
  if (!newPromo.title || !newPromo.start_date || !newPromo.end_date || !newPromo.porcentage) {
    showAlert('Error', 'Por favor, completa todos los campos');
    return
  }

  const promoPayload = {
    title: newPromo.title,
    description: "Descuento Nuevo",
    porcentage: newPromo.porcentage,
    start_date: newPromo.start_date,
    end_date: newPromo.end_date
  }

  const method = editingPromoId ? 'PUT' : 'POST'
  const url = editingPromoId
    ? `${apiUrl}/api/promotions/${editingPromoId}`
    : `${apiUrl}/api/promotions`

  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(promoPayload)
    })

    if (!res.ok) {
      const text = await res.text()
      console.error(`❌ Error ${res.status}:`, text)
      showAlert('Error', 'Hubo un error creando/editando la promocion');
      return
    }

    showAlert('Exito', 'Promocion Guardada Correctamente');
    setNewPromo({ title: '', start_date: '', end_date: '', porcentage: '' })
    setEditingPromoId(null)

    await refreshPromotions()
  } catch (error) {
    console.error('❌ Error al guardar promoción:', error)
    showAlert('Error', 'La promocion no pudo ser guardada, intentalo de nuevo');
  }
}


  const deletePromo = async (id: number) => {
  try {
    const response = await fetch(`${apiUrl}/api/promotions/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      refreshPromotions(); 
    } else {
      console.error('Error al eliminar la promoción');
    }
  } catch (error) {
    console.error('Error en la petición DELETE:', error);
  }
};


const refreshPromotions = async () => {
  try {
    const res = await fetch(`${apiUrl}/api/promotions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      const text = await res.text()
      console.error(`❌ Error al refrescar promociones:`, text)
      return
    }

    const data = await res.json()
    setPromotions(data)
  } catch (error) {
    console.error('❌ Error al refrescar promociones:', error)
  }
}
  const [salesHistory, setSalesHistory] = useState<any[]>([]);

  useEffect(() => {
  const fetchSalesHistory = async () => {
    if (!user || !token) return;

    const endpoint = user.rol === 'Administrador'
      ? `${apiUrl}/api/compras/admin`
      : `${apiUrl}/api/compras/history/${user.email}`;

    try {
      const response = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Error al obtener historial de compras: ${errorText}`);
        return;
      }

      const data = await response.json();

      const mappedData = data.map((compra: any, index: number) => ({
        id: compra.idCompra || index,
        client: compra.cliente?.name || 'Desconocido',
        email: compra.cliente?.email || '—', 
        date: compra.fechaCompra || 'Fecha no disponible',
        description: compra.descripcion || '—',
        status: compra.estadoPago || 'Sin estado',
        total: compra.precioCompra || 0
      }));
      setSalesHistory(mappedData);
    } catch (error) {
      console.error('❌ Error al cargar historial de compras:', error);
    }
  };

  fetchSalesHistory();
}, [user, token, apiUrl]);

const enviarCorreoPromo = async (promoId: number) => {
  try {
    const res = await fetch(`${apiUrl}/api/promotions/send/${promoId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ Error al enviar correo: ${errorText}`);
      setCorreoPromoStatus('error');
      setTimeout(() => setCorreoPromoStatus(null), 2000);
      return;
    }

    setCorreoPromoStatus('success');
    setTimeout(() => setCorreoPromoStatus(null), 2000);
  } catch (error) {
    console.error('❌ Error al hacer la petición de envío de correo:', error);
    showAlert('Error', 'Error de conexion al enviar el correo');
  }
};


const confirmarCompra = async (idCompra: number) => {
  if (!user?.email || !token) return;

  const url = `${apiUrl}/api/payments/sinpe/confirm/compra/${idCompra}`;

  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ Error al confirmar la compra:', errorText);
      showAlert('Error', 'No se pudo confirmar la compra');
      return;
    }

    showAlert('Exito', 'La compra fue confirmada de manera exitosa');
    const fetchSalesHistory = async () => {
      const endpoint = user.rol === 'Administrador'
        ? `${apiUrl}/api/compras/admin`
        : `${apiUrl}/api/compras/history/${user.email}`;
      const response = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });
      const data = await response.json();
      const mappedData = data.map((compra: any, index: number) => ({
        id: compra.idCompra || index,
        client: compra.cliente?.name || 'Desconocido',
        email: compra.cliente?.email || '—',  // 🔥 AÑADIDO
        date: compra.fechaCompra || 'Fecha no disponible',
        description: compra.descripcion || '—',
        status: compra.estadoPago || 'Sin estado',
        total: compra.precioCompra || 0
      }));
      setSalesHistory(mappedData);
    };

    fetchSalesHistory();

  } catch (error) {
    console.error('❌ Error al hacer PUT:', error);
    showAlert('Error', 'No se logro obtener el historial de compras');
  }

};

return (
  <>
    <NavBar />

    <div className="container-fluid p-0">
      <div
        className="row g-0"
        style={{ minHeight: '100vh', backgroundColor: '#f4f5f7' }}
      >
        {/* Botón hamburguesa móvil */}
        <div className="d-md-none p-3">
          <button
            className="btn btn-dark w-100"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            ☰ {t('menu')}
          </button>
        </div>

        {/* Sidebar Responsive */}
        <div
          className={`
            col-12 col-md-auto
            ${isMobileMenuOpen ? 'd-block' : 'd-none'}
            d-md-block
          `}
          style={{
            width: '260px',
            backgroundColor: '#111111',
            color: '#ffffff',
          }}
        >
          <div className="p-4 d-flex flex-column">

            <h4 className="fw-bold mb-4">{t('profile')}</h4>

            {/* INFO */}
            <button
              className="btn btn-sm w-100 text-start mb-2"
              style={{
                backgroundColor: activeSection === 'info' ? '#7a0c0c' : 'transparent',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px'
              }}
              onClick={() => {
                setActiveSection('info')
                setIsMobileMenuOpen(false)
              }}
            >
              {t('info')}
            </button>

            {/* CITAS */}
            <button
              className="btn btn-sm w-100 text-start mb-2"
              style={{
                backgroundColor: activeSection === 'citas' ? '#7a0c0c' : 'transparent',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px'
              }}
              onClick={() => {
                setActiveSection('citas')
                setIsMobileMenuOpen(false)
              }}
            >
              {user?.rol === 'Administrador'
                ? t('appointments')
                : t('my_appointments')}
            </button>

            {/* GESTION */}
            <button
              className="btn btn-sm w-100 text-start mb-2"
              style={{
                backgroundColor: activeSection === 'gestion' ? '#7a0c0c' : 'transparent',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px'
              }}
              onClick={() => {
                setActiveSection('gestion')
                setIsMobileMenuOpen(false)
              }}
            >
              {t('user_management')}
            </button>

            {/* PROMOS ADMIN */}
            {user?.rol === 'Administrador' && (
              <button
                className="btn btn-sm w-100 text-start mb-2"
                style={{
                  backgroundColor: activeSection === 'promos' ? '#7a0c0c' : 'transparent',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px'
                }}
                onClick={() => {
                  setActiveSection('promos')
                  setIsMobileMenuOpen(false)
                }}
              >
                {t('promotions')}
              </button>
            )}

            {/* VENTAS */}
            <button
              className="btn btn-sm w-100 text-start mb-2"
              style={{
                backgroundColor: activeSection === 'ventas' ? '#7a0c0c' : 'transparent',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px'
              }}
              onClick={() => {
                setActiveSection('ventas')
                setIsMobileMenuOpen(false)
              }}
            >
              {user?.rol === 'Administrador'
                ? t('purchase_history')
                : t('my_purchase_history')}
            </button>

            {/* PROMOS ACTIVAS CLIENTE */}
            {user?.rol !== 'Administrador' && (
              <button
                className="btn btn-sm w-100 text-start mb-2"
                style={{
                  backgroundColor: activeSection === 'promosActivas' ? '#7a0c0c' : 'transparent',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px'
                }}
                onClick={() => {
                  setActiveSection('promosActivas')
                  setIsMobileMenuOpen(false)
                }}
              >
                {t('active_promotions')}
              </button>
            )}

            {/* NOTIFICACIONES */}
            {user?.rol !== 'Administrador' && (
              <button
                className="btn btn-sm w-100 text-start mb-2"
                style={{
                  backgroundColor: activeSection === 'notificaciones' ? '#7a0c0c' : 'transparent',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px'
                }}
                onClick={() => {
                  setActiveSection('notificaciones')
                  setTieneNotificacion(false)
                  setIsMobileMenuOpen(false)
                }}
              >
                {t('notifications')}
                {tieneNotificacion && (
                  <span
                    className="badge ms-2"
                    style={{
                      backgroundColor: '#7a0c0c',
                      color: '#fff'
                    }}
                  >
                    {t('new_notification')}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* CONTENIDO */}
        <div className="col p-4 p-md-5" style={{ backgroundColor: '#f9fafb' }}>

        {activeSection === 'info' && (
            <>
              <h2 
                className="fw-bold mb-4"
                style={{ 
                  color: '#1a1a1a',
                  letterSpacing: '0.5px'
                }}
              >{t('user_info_title')}</h2>
              <div className="fw-bold mb-4" style={{ color: '#333' }}>{t('user_name')}{user?.name}</div>
              <div className="fw-bold mb-4" style={{ color: '#333' }}>{t('user_last_name')}{user?.last_name}</div>
              <div className="fw-bold mb-4" style={{ color: '#333' }}>{t('user_email')}{user?.email}</div>
            </>
          )}

          {activeSection === 'citas' && <MostrarCitas />}
        
          {activeSection === 'gestion' && (
            <div 
              className="p-5 rounded-4 shadow-sm bg-white"
              style={{ 
                maxWidth: '650px',
                border: '1px solid #e5e5e5'
              }}
            >
              <h2 className="fw-bold mb-4" style={{ color: '#333' }}>{t('user_management')}</h2>
              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{t('update_success')}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label text-dark fw-semibold">{t('name')}</label>
                  <input type="text" 
                  className="form-control"
                  style={{
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    padding: '10px'
                  }}
                  value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="form-label text-dark fw-semibold">{t('last_name')}</label>
                  <input type="text" 
                  className="form-control"
                  style={{
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    padding: '10px'
                  }}
                  value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
                <div className="mb-4">
                  <label className="form-label text-dark fw-semibold">{t('new_password')}</label>
                  <div className="input-group">
                    <input type={showPassword ? 'text' : 'password'} 
                    className="form-control"
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                      padding: '10px'
                    }}
                    value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('new_password2')}/>
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <button type="submit" className="btn w-100 fw-bold"
                  style={{
                    backgroundColor: '#7a0c0c',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px'
                  }}>{t('save_changes')}
                </button>
              </form>
              <div className="mb-3">
                <label className="form-label text-dark fw-semibold">{t('language')}</label>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-primary fw-bold px-3"
                    onClick={() => setLanguage('es')}
                  >
                    {t('spanish')}
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary fw-bold px-3"
                    onClick={() => setLanguage('en')}
                  >
                    {t('english')}
                  </button>
                </div>
              </div>
            </div>
          )}

        {activeSection === 'promos' && (
          <div>
          {correoPromoStatus && (
          <div
            className={`alert ${correoPromoStatus === 'success' ? 'alert-success' : 'alert-danger'} d-flex align-items-center`}
            role="alert"
          >
            <span className="me-2">
              {correoPromoStatus === 'success' ? '✅' : '❌'}
            </span>
            {correoPromoStatus === 'success'
              ? 'Correo promocional enviado correctamente.'
              : 'No se pudo enviar el correo promocional.'}
          </div>
            )}
            <h2 className="fw-bold mb-4" style={{ color: '#333' }}>{t('promo_management')}</h2>
            <div className="table-responsive">
            <table className="table align-middle">
                <thead style={{ backgroundColor: '#111111', color: '#ffffff' }}>
                  <tr>
                    <th>{t('name')}</th>
                    <th>{t('start')}</th>
                    <th>{t('end')}</th>
                    <th>{t('discount')}</th>
                    <th>{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {promotions.map((promo) => (
                    <tr key={promo.id}>
                      <td>{promo.title}</td>
                      <td>{promo.start_date.split('T')[0]}</td>
                      <td>{promo.end_date.split('T')[0]}</td>
                      <td>{promo.porcentage !== undefined && promo.porcentage !== null ? `${promo.porcentage}%` : '—'}</td>
                      <td className="d-flex gap-1">
                        <button className="btn btn-sm btn-outline-primary" onClick={() => {
                          showAlert('Confirmación', '¿Seguro que deseas editar esta promoción?', () => {
                            setEditingPromoId(promo.id)
                            setNewPromo({ ...promo })
                          });
                        }}
                        >{t('edit')}</button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => {
                            showAlert('Confirmación', '¿Estás seguro que deseas eliminar esta promoción?', () => deletePromo(promo.id));
                          }}
                        >
                          {t('delete')}
                        </button>
                        {user?.rol === 'Administrador' && (
                        <button className="btn btn-sm btn-outline-primary" onClick={() => enviarCorreoPromo(promo.id)}>
                          {t('Enviar Correo')}
                        </button>
                      )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4">
              <h5 className='text-black'>{editingPromoId ? t('edit_promo') : t('new_promo')}</h5>
              <div className="row g-3">
                <div className="col-md-4">
                  <input type="text" className="form-control" placeholder={t('name')}
                    value={newPromo.title} onChange={(e) => setNewPromo({ ...newPromo, title: e.target.value })} />
                </div>
                <div className="col-md-2">
                  <input type="date" className="form-control" placeholder="Inicio"
                    value={newPromo.start_date} onChange={(e) => setNewPromo({ ...newPromo, start_date: e.target.value })} />
                </div>
                <div className="col-md-2">
                  <input type="date" className="form-control" placeholder="Fin"
                    value={newPromo.end_date} onChange={(e) => setNewPromo({ ...newPromo, end_date: e.target.value })} />
                </div>
                <div className="col-md-2">
                  <input 
                    type="number"
                    className="form-control"
                    placeholder="%"
                    value={newPromo.porcentage}
                    onChange={(e) =>
                      setNewPromo({ ...newPromo, porcentage: parseFloat(e.target.value) })
                    }
                  />
                </div>
                <div className="col-md-2">
                  <button className="btn btn-primary w-100 fw-bold"onClick={handlePromoSubmit}>
                    {editingPromoId ? t('save'): t('create')}
                  </button>
                </div>
                {editingPromoId && (
                <div className="col-md-2">
                  <button
                    className="btn btn-outline-danger w-100"
                  >
                    {t('assign_products')}
                  </button>
                </div>
              )}
              </div>
            </div>
          </div>
        )}
        {activeSection === 'ventas' && (
        <div>
          <h2 className="fw-bold mb-4" style={{ color: '#333' }}>
            {user?.rol === 'Administrador' ? 'Historial de Compras' : 'Mi Historial de Compras'}
          </h2>
          <div className="table-responsive">
          <table className="table align-middle">
            <thead style={{ backgroundColor: '#111111', color: '#ffffff' }}>
              <tr>
                <th>{t('client_name')}</th>
                <th>{t('email')}</th> {/* 🔥 AÑADIDO */}
                <th>{t('purchase_date')}</th>
                <th>{t('description')}</th>
                <th>{t('status')}</th>
                <th>{t('total')}</th>
              </tr>
            </thead>
            <tbody>
              {salesHistory.map((sale, index) => (
                <tr key={sale.id ?? `sale-${index}`}>
                  <td>{sale.client || t('unknown')}</td>
                  <td>{sale.email || '—'}</td> {/* 🔥 AÑADIDO */}
                  <td>{sale.date || t('no_date')}</td>
                  <td>{sale.description || '—'}</td>
                  <td>
                  <span className={`badge me-2`}
                  style={{
                    backgroundColor: sale.status === 'EXITOSO' || sale.status === 'CONFIRMADA'
                      ? '#0f5132'
                      : '#842029',
                    color: '#fff'
                  }}>
                    {sale.status || t('no_status')}
                  </span>
                  {user.rol === 'Administrador' && sale.status === 'PENDIENTE' && (
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => {
                        showAlert('Confirmación', '¿Deseas confirmar esta compra como pagada?', () => confirmarCompra(sale.id));
                      }}
                    >
                      {t('confirm_purchase')}
                    </button>
                  )}
                </td>
                  <td>
                    {sale.total !== undefined
                      ? `$${sale.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                      : '$0.00'}
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </div>
      )}
      {activeSection === 'promosActivas' && (
  <div>
    <h2 className="fw-bold mb-4" style={{ color: '#333' }}>{t('active_promotions')}</h2>
    {promocionesActivas.length === 0 ? (
      <p style={{ color: '#333' }}> {t('no_active_promos')}</p>
    ) : (
      <div className="table-responsive">
        <table className="table align-middle">
          <thead style={{ backgroundColor: '#111111', color: '#ffffff' }}>
            <tr>
              <th>{t('name')}</th>
              <th>{t('start')}</th>
              <th>{t('end')}</th>
              <th>{t('discount')}</th>
            </tr>
          </thead>
          <tbody>
            {promocionesActivas.map(promo => (
              <tr key={promo.id}>
                <td>{promo.title}</td>
                <td>{promo.start_date.split('T')[0]}</td>
                <td>{promo.end_date.split('T')[0]}</td>
                <td>{promo.porcentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
          )}
        </div>
      )}
      {activeSection === 'notificaciones' && (
      <div>
        <h2 className="fw-bold mb-4" style={{ color: '#333' }}>{t('notifications')}</h2>
        {(() => {
          const notifs = JSON.parse(localStorage.getItem(`notificaciones-${user?.email}`) || '[]');
          return notifs.length === 0 ? (
            <p style={{ color: '#333' }}> {t('no_notifications')}.</p>
          ) : (
            <ul className="list-group">
              {notifs.map((n: any) => (
                <li key={n.id} className="list-group-item d-flex justify-content-between align-items-center">
                  {n.mensaje}
                </li>
              ))}
            </ul>
          );
        })()}
      </div>
    )}
    {/* Ventana emergente de alerta */}
        <PopUpWindow
          show={showPopup}
          title={popupData.title}
          onClose={() => {
            setShowPopup(false)
          }}
          onConfirm={() => {
            setShowPopup(false)
            popupData.onConfirm?.()
          }}
        >
          <p>{popupData.message}</p>
        </PopUpWindow>

          <PopUpWindow
            show={showPopup}
            title={popupData.title}
            onClose={() => setShowPopup(false)}
            onConfirm={() => {
              setShowPopup(false)
              popupData.onConfirm?.()
            }}
          >
            <p>{popupData.message}</p>
          </PopUpWindow>

        </div>
      </div>
    </div>
  </>
)
}

export default UserManagement




