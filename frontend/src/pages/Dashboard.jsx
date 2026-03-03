import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logoImg from '../assets/logo.png';

const Dashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('lux_user') || '{}');

    const [stats, setStats] = useState({
        activeTables: 0,
        dailyRevenue: 0, // Bunu backend'de yazacağız, şimdilik UI'da duracak
        totalTables: 0
    });

    // Patron Kontrolü ve Basit Veri Çekimi
    useEffect(() => {
        if (user?.role !== 'Admin') {
            navigate('/');
            return;
        }

        const fetchStats = async () => {
            try {
                // Şimdilik sadece masaları çekip doluluk oranını buluyoruz
                const res = await axios.get('http://localhost:5000/api/tables');
                const tables = res.data;
                const active = tables.filter(t => t.status === 'Dolu').length;

                setStats(prev => ({ ...prev, activeTables: active, totalTables: tables.length }));
            } catch (err) {
                console.error('Veriler çekilemedi', err);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 5000); // 5 saniyede bir radarı yenile
        return () => clearInterval(interval);
    }, [navigate, user]);

    const handleLogout = () => {
        localStorage.removeItem('lux_user');
        navigate('/');
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>

            {/* ÜST BAR (Kokpit Navbar) */}
            <div style={{
                backgroundColor: '#111', padding: '15px 30px', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', borderBottom: '2px solid var(--primary-color)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <img src={logoImg} alt="Lux Logo" style={{ height: '40px' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h2 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '22px', letterSpacing: '2px' }}>YÖNETİM PANELİ</h2>
                        <span style={{ color: 'var(--text-muted)', fontSize: '12px', letterSpacing: '1px' }}>LUX CLUB MERKEZ KOMUTA</span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                        Hoş geldin, <strong style={{ color: 'white', textTransform: 'capitalize' }}>{user?.username}</strong>
                    </span>
                    <button
                        onClick={handleLogout}
                        style={{
                            backgroundColor: 'transparent', color: '#ff4444', border: '1px solid #ff4444',
                            padding: '8px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => { e.target.style.backgroundColor = '#ff4444'; e.target.style.color = '#fff'; }}
                        onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#ff4444'; }}
                    >
                        SİSTEMDEN ÇIK
                    </button>
                </div>
            </div>

            <div style={{ padding: '30px', flex: 1, display: 'flex', flexDirection: 'column', gap: '30px' }}>

                {/* ÖZET KARTLARI (Ciro, Masa Durumu vs.) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>

                    <div style={{ backgroundColor: '#111', padding: '25px', borderRadius: '12px', borderLeft: '4px solid #00ffcc', boxShadow: '0 5px 15px rgba(0,0,0,0.5)' }}>
                        <h3 style={{ color: 'var(--text-muted)', margin: '0 0 10px 0', fontSize: '14px' }}>AKTİF MASALAR</h3>
                        <div style={{ fontSize: '36px', color: 'white', fontWeight: '900' }}>
                            {stats.activeTables} <span style={{ fontSize: '18px', color: '#555' }}>/ {stats.totalTables}</span>
                        </div>
                    </div>

                    <div style={{ backgroundColor: '#111', padding: '25px', borderRadius: '12px', borderLeft: '4px solid var(--primary-color)', boxShadow: '0 5px 15px rgba(0,0,0,0.5)' }}>
                        <h3 style={{ color: 'var(--text-muted)', margin: '0 0 10px 0', fontSize: '14px' }}>GÜNLÜK CİRO (Canlı)</h3>
                        <div style={{ fontSize: '36px', color: 'var(--primary-color)', fontWeight: '900' }}>
                            ₺{stats.dailyRevenue.toFixed(2)}
                        </div>
                        <span style={{ color: '#555', fontSize: '12px' }}>*Backend entegrasyonu bekleniyor</span>
                    </div>

                    <div style={{ backgroundColor: '#111', padding: '25px', borderRadius: '12px', borderLeft: '4px solid #ffaa00', boxShadow: '0 5px 15px rgba(0,0,0,0.5)' }}>
                        <h3 style={{ color: 'var(--text-muted)', margin: '0 0 10px 0', fontSize: '14px' }}>SİSTEM DURUMU</h3>
                        <div style={{ fontSize: '24px', color: '#ffaa00', fontWeight: 'bold', marginTop: '10px' }}>
                            TÜM BİRİMLER AKTİF
                        </div>
                    </div>

                </div>

                {/* HIZLI ERİŞİM BUTONLARI (Operasyonlara Zıplama) */}
                <h2 style={{ color: 'white', borderBottom: '1px solid #333', paddingBottom: '10px', marginTop: '20px' }}>HIZLI ERİŞİM / OPERASYON</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>

                    <button
                        onClick={() => navigate('/pos')}
                        style={{
                            backgroundColor: '#1a1a1a', border: '1px solid #333', padding: '30px 20px', borderRadius: '12px',
                            color: 'var(--primary-color)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--primary-color)'; e.currentTarget.style.transform = 'translateY(-5px)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        <span style={{ fontSize: '40px' }}>💻</span>
                        <span style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '1px' }}>KASA / POS EKRANI</span>
                    </button>

                    <button
                        onClick={() => navigate('/garson')}
                        style={{
                            backgroundColor: '#1a1a1a', border: '1px solid #333', padding: '30px 20px', borderRadius: '12px',
                            color: 'white', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.borderColor = 'white'; e.currentTarget.style.transform = 'translateY(-5px)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        <span style={{ fontSize: '40px' }}>📱</span>
                        <span style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '1px' }}>SAHA OPERASYONU</span>
                    </button>

                    <button
                        onClick={() => navigate('/menu-management')} // SİSTEM BİLGİSİ: Adres bağlandı
                        style={{
                            backgroundColor: '#1a1a1a', border: '1px solid #333', padding: '30px 20px', borderRadius: '12px',
                            color: '#00ffcc', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.borderColor = '#00ffcc'; e.currentTarget.style.transform = 'translateY(-5px)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        <span style={{ fontSize: '40px' }}>📋</span>
                        <span style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '1px' }}>MENÜ & ÜRÜNLER</span>
                    </button>

                    <button
                        onClick={() => navigate('/personnel')}
                        style={{
                            backgroundColor: '#1a1a1a', border: '1px solid #333', padding: '30px 20px', borderRadius: '12px',
                            color: '#ffc107', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.borderColor = '#ffc107'; e.currentTarget.style.transform = 'translateY(-5px)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        <span style={{ fontSize: '40px' }}>👥</span>
                        <span style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '1px' }}>İNSAN KAYNAKLARI</span>
                    </button>

                </div>

            </div>
        </div>
    );
};

export default Dashboard;