import { useNavigate } from 'react-router-dom';
import TableMap from '../components/TableMap';
import logoImg from '../assets/logo.png';

const PosScreen = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('lux_user') || '{}');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', backgroundColor: 'var(--bg-color)' }}>

            {/* Üst Bar (Header) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 30px', backgroundColor: 'var(--surface-color)', borderBottom: '2px solid var(--primary-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <img src={logoImg} alt="Lux Logo" style={{ height: '40px' }} />
                    <h2 style={{ margin: 0, color: 'var(--primary-color)', letterSpacing: '2px' }}>OPERASYON / SATIŞ</h2>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Personel: <strong style={{ color: 'white', textTransform: 'capitalize' }}>{user.username}</strong></span>

                    {/* SİSTEM BİLGİSİ: Adminse panele döner, Kasaysa siktir olup çıkış yapar */}
                    {user.role === 'Admin' ? (
                        <button
                            onClick={() => navigate('/dashboard')}
                            style={{ padding: '8px 20px', backgroundColor: 'transparent', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            YÖNETİM PANELİNE DÖN
                        </button>
                    ) : (
                        <button
                            onClick={() => { localStorage.removeItem('lux_user'); navigate('/'); }}
                            style={{ padding: '8px 20px', backgroundColor: 'transparent', border: '1px solid #ff4444', color: '#ff4444', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            ÇIKIŞ YAP
                        </button>
                    )}
                </div>
            </div>

            {/* Ana Satış Haritası (isEditMode kapalı olarak çağırıyoruz) */}
            <div style={{ flex: 1, padding: '20px', overflow: 'hidden' }}>
                <TableMap isEditMode={false} />
            </div>

        </div>
    );
};

export default PosScreen;