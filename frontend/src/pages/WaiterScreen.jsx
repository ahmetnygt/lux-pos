import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import MobileOrderPanel from '../components/MobileOrderPanel'; // BUNU EKLE
import logoImg from '../assets/logo.png';

const WaiterScreen = () => {
    const [tables, setTables] = useState([]);
    const navigate = useNavigate();
    const [selectedTable, setSelectedTable] = useState(null); // Tıklanan masayı tutar

    const socket = io('http://localhost:5000');

    // Garson giriş yapmış mı kontrolü
    const user = JSON.parse(localStorage.getItem('lux_user'));

    // Masaları Çekme Motoru
    const fetchTables = async () => {
        try {
            // Kendi IP adresini (veya sunucu IP'sini) yazmayı unutma!
            const res = await axios.get('http://localhost:5000/api/tables');
            setTables(res.data);
        } catch (err) {
            console.error('Masalar çekilemedi', err);
        }
    };

    useEffect(() => {
        if (!user || user.role !== 'Garson') {
            navigate('/');
            return;
        }

        fetchTables();

        // Kasa masayı kapatırsa, garsonun ekranı anında tazelenir
        socket.on('updateTables', () => {
            fetchTables();
        });

        return () => {
            socket.off('updateTables');
        };
    }, [navigate, user]);

    const handleLogout = () => {
        localStorage.removeItem('lux_user');
        navigate('/');
    };
    const handleTableClick = (table) => {
        setSelectedTable(table); // Tıklanan masayı seç ve paneli aç
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: 'white', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif' }}>

            {/* ÜST BAR (Navbar) - SİSTEM BİLGİSİ: Logo ve Kare İkonlu Çıkış Eklendi */}
            <div style={{ backgroundColor: '#111', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--primary-color)', position: 'sticky', top: 0, zIndex: 10 }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <img src={logoImg} alt="Lux Logo" style={{ height: '35px' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Saha Operasyonu</span>
                        <strong style={{ color: 'white', fontSize: '14px', textTransform: 'capitalize' }}>{user?.username}</strong>
                    </div>
                </div>

                {/* Kare Çıkış İkonu (SVG) */}
                <button
                    onClick={handleLogout}
                    title="Çıkış Yap"
                    style={{
                        backgroundColor: '#1a1111', color: '#ff4444', border: '1px solid #441111',
                        width: '42px', height: '42px', borderRadius: '8px', display: 'flex',
                        justifyContent: 'center', alignItems: 'center', cursor: 'pointer'
                    }}
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                </button>
            </div>

            {/* MASALAR GRID (Izgara) SİSTEMİ */}
            <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>                {tables.map(table => {
                const isOccupied = table.status === 'Dolu';
                return (
                    <button
                        key={table.id}
                        onClick={() => handleTableClick(table)}
                        style={{
                            backgroundColor: isOccupied ? '#ff4444' : '#28a745', // Doluysa Kırmızı, Boşsa Yeşil
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            height: '120px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                            transition: 'transform 0.1s',
                            opacity: 0.95
                        }}
                    >
                        <span style={{ fontSize: '24px', marginBottom: '5px' }}>{table.name}</span>
                        <span style={{ fontSize: '12px', backgroundColor: 'rgba(0,0,0,0.3)', padding: '4px 8px', borderRadius: '4px' }}>
                            {isOccupied ? 'DOLU' : 'BOŞ'}
                        </span>
                    </button>
                )
            })}
            </div>
            {/* Seçili masa varsa Mobil Sipariş Panelini tam ekran aç */}
            {selectedTable && (
                <MobileOrderPanel
                    table={selectedTable}
                    onClose={() => setSelectedTable(null)}
                    onUpdate={fetchTables} // Sipariş atılınca masaları kırmızıya boyatır
                />
            )}
        </div>
    );
};

export default WaiterScreen;