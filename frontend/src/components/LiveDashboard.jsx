import { useState, useEffect } from 'react';
import axios from 'axios';

const LiveDashboard = () => {
    const [time, setTime] = useState(new Date());
    const [summary, setSummary] = useState(null);

    // Dijital Saat Motoru
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // İstihbarat ve Finans Motoru (Her 5 saniyede bir gizlice günceller)
    const fetchSummary = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/orders/summary/live');
            setSummary(res.data);
        } catch (err) {
            console.error('Özet verisi alınamadı', err);
        }
    };

    useEffect(() => {
        fetchSummary();
        const interval = setInterval(fetchSummary, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{
            position: 'absolute', top: 0, right: 0, width: '400px', height: '100%',
            backgroundColor: 'var(--surface-color)', borderLeft: '1px solid #333',
            display: 'flex', flexDirection: 'column', padding: '20px', zIndex: 10,
            boxShadow: '-5px 0 25px rgba(0,0,0,0.5)',
            boxSizing: 'border-box' // SİSTEM BİLGİSİ: Padding'in dışarı taşmasını engeller
        }}>

            {/* 1. SAAT VE TARİH BÖLÜMÜ */}
            <div style={{ textAlign: 'center', paddingBottom: '20px', borderBottom: '1px solid #333', marginBottom: '20px' }}>
                <div style={{ fontSize: '48px', fontWeight: 'bold', color: 'var(--primary-color)', letterSpacing: '2px', textShadow: '0 0 10px rgba(255, 204, 0, 0.3)' }}>
                    {time.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {time.toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* 2. KASA ÖZETİ (FİNANS VE DOLULUK) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>

                <div style={{ backgroundColor: '#111', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #ff4444', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Masa Doluluk</span>
                    <strong style={{ color: 'white', fontSize: '18px' }}>
                        {summary ? `${summary.tables.occupied} / ${summary.tables.total}` : '-'}
                    </strong>
                </div>

                <div style={{ backgroundColor: '#111', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #ffc107', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Açık Hesap (İçerideki)</span>
                    <strong style={{ color: '#ffc107', fontSize: '18px' }}>
                        ₺{summary ? summary.financials.openAmount.toFixed(2) : '0.00'}
                    </strong>
                </div>

                <div style={{ backgroundColor: '#111', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #00ffcc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Bugünün Hasılatı</span>
                    <strong style={{ color: '#00ffcc', fontSize: '20px' }}>
                        ₺{summary ? summary.financials.paidAmount.toFixed(2) : '0.00'}
                    </strong>
                </div>

            </div>

            {/* 3. CANLI İŞLEM AKIŞI (LOG) */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', backgroundColor: '#0a0a0a', borderRadius: '8px', border: '1px solid #222' }}>
                <div style={{ padding: '15px', borderBottom: '1px solid #222', backgroundColor: '#111', position: 'sticky', top: 0 }}>
                    <strong style={{ color: 'var(--text-color)', fontSize: '14px', letterSpacing: '1px' }}>⚡ CANLI İŞLEM AKIŞI</strong>
                </div>

                <ul style={{ listStyle: 'none', padding: '15px', margin: 0, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {!summary || summary.logs.length === 0 ? (
                        <li style={{ color: '#555', fontSize: '12px', textAlign: 'center' }}>Henüz hareket yok...</li>
                    ) : (
                        summary.logs.map(log => (
                            <li key={log.id} style={{ display: 'flex', gap: '10px', fontSize: '12px', alignItems: 'center' }}>
                                <span style={{ color: 'var(--primary-color)', minWidth: '40px' }}>
                                    {new Date(log.time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <strong style={{ color: 'white' }}>{log.table}</strong>
                                    {/* SİSTEM BİLGİSİ: Çizikleri siktir ettik, statüye göre jilet gibi renk ve font veriyoruz */}
                                    <span style={{
                                        color: log.status === 'Ödendi' ? '#00ffcc' : log.status === 'Kapatıldı' ? '#ff4444' : 'var(--text-muted)',
                                        fontWeight: log.status === 'Kapatıldı' ? 'bold' : 'normal',
                                        marginTop: '2px'
                                    }}>
                                        {log.message}
                                    </span>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>

        </div>
    );
};

export default LiveDashboard;