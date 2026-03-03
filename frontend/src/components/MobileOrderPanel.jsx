import { useState, useEffect } from 'react';
import axios from 'axios';

const MobileOrderPanel = ({ table, onClose, onUpdate }) => {
    const [menu, setMenu] = useState([]);
    const [activeCategoryId, setActiveCategoryId] = useState(null);
    const [cart, setCart] = useState([]);
    const [existingOrder, setExistingOrder] = useState(null);

    // BÜTÜN BÜYÜ BURADA: Sekme motoru
    const [activeTab, setActiveTab] = useState('menu'); // 'menu' veya 'adisyon'

    const user = JSON.parse(localStorage.getItem('lux_user') || '{}');

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/menu');
                setMenu(res.data);
                if (res.data.length > 0) setActiveCategoryId(res.data[0].id);
            } catch (err) {
                console.error('Menü çekilemedi', err);
            }
        };

        const fetchExistingOrder = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/orders/table/${table.id}`);
                setExistingOrder(res.data);
            } catch (err) {
                // Masa boşsa 404 döner, sorun yok
            }
        };

        fetchMenu();
        fetchExistingOrder();
    }, [table.id]);

    const handleAddToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1, lineTotal: item.lineTotal + parseFloat(product.price) }
                        : item
                );
            }
            return [...prev, { ...product, quantity: 1, lineTotal: parseFloat(product.price) }];
        });
        if (navigator.vibrate) navigator.vibrate(50);
    };

    const handleRemoveFromCart = (productId) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === productId);
            if (existing.quantity > 1) {
                return prev.map(item =>
                    item.id === productId
                        ? { ...item, quantity: item.quantity - 1, lineTotal: item.lineTotal - parseFloat(item.price) }
                        : item
                );
            }
            return prev.filter(item => item.id !== productId);
        });
        if (navigator.vibrate) navigator.vibrate(50);
    };

    const handleSendOrder = async () => {
        if (cart.length === 0) return;
        try {
            await axios.post(`http://localhost:5000/api/orders/table/${table.id}/add-multiple`, {
                items: cart,
                user_id: user.id
            });

            setCart([]);
            if (onUpdate) onUpdate();
            onClose();
        } catch (err) {
            alert('Sipariş gönderilemedi!');
        }
    };

    const cartTotalAmount = cart.reduce((acc, item) => acc + item.lineTotal, 0);
    const cartTotalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

    // Mevcut ürünleri fiyatlarıyla grupluyoruz
    let groupedExisting = {};
    if (existingOrder && existingOrder.OrderItems) {
        groupedExisting = existingOrder.OrderItems.reduce((acc, item) => {
            const key = `${item.product_id}-${item.status}`;
            if (!acc[key]) acc[key] = { name: item.Product?.name, qty: 0, status: item.status, totalPrice: 0 };
            acc[key].qty += item.quantity;
            acc[key].totalPrice += parseFloat(item.price);
            return acc;
        }, {});
    }

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: '#0a0a0a', zIndex: 9999, display: 'flex', flexDirection: 'column'
        }}>

            {/* ÜST BİLGİ VE KAPATMA */}
            <div style={{ padding: '15px 20px', backgroundColor: '#111', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '20px' }}>{table.name}</h2>
                </div>
                <button onClick={onClose} style={{
                    backgroundColor: '#222', color: '#ff4444', border: '1px solid #ff4444',
                    width: '40px', height: '40px', borderRadius: '8px', fontWeight: 'bold', fontSize: '18px',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0
                }}>
                    X
                </button>
            </div>

            {/* SİSTEM BİLGİSİ: SEKMELER (TABS) */}
            <div style={{ display: 'flex', backgroundColor: '#111', borderBottom: '1px solid #333' }}>
                <button
                    onClick={() => setActiveTab('menu')}
                    style={{
                        flex: 1, padding: '15px', fontWeight: 'bold', fontSize: '14px', border: 'none',
                        backgroundColor: activeTab === 'menu' ? '#1a1a1a' : 'transparent',
                        color: activeTab === 'menu' ? 'var(--primary-color)' : 'var(--text-muted)',
                        borderBottom: activeTab === 'menu' ? '2px solid var(--primary-color)' : '2px solid transparent'
                    }}
                >
                    SİPARİŞ GİR
                </button>
                <button
                    onClick={() => setActiveTab('adisyon')}
                    style={{
                        flex: 1, padding: '15px', fontWeight: 'bold', fontSize: '14px', border: 'none',
                        backgroundColor: activeTab === 'adisyon' ? '#1a1a1a' : 'transparent',
                        color: activeTab === 'adisyon' ? 'var(--primary-color)' : 'var(--text-muted)',
                        borderBottom: activeTab === 'adisyon' ? '2px solid var(--primary-color)' : '2px solid transparent'
                    }}
                >
                    MEVCUT ADİSYON
                </button>
            </div>

            {/* ---------------- SİPARİŞ GİRME SEKMESİ ---------------- */}
            {activeTab === 'menu' && (
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                    {/* KATEGORİ SLIDER */}
                    <div style={{ display: 'flex', overflowX: 'auto', padding: '12px', backgroundColor: '#111', gap: '10px', flexShrink: 0, borderBottom: '1px solid #222' }}>
                        {menu.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategoryId(cat.id)}
                                style={{
                                    whiteSpace: 'nowrap', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', border: 'none',
                                    backgroundColor: activeCategoryId === cat.id ? 'var(--primary-color)' : '#222',
                                    color: activeCategoryId === cat.id ? '#000' : 'white'
                                }}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* ÜRÜN GRID */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '15px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', alignContent: 'start', paddingBottom: '100px' }}>
                        {menu.find(c => c.id === activeCategoryId)?.Products?.map(prod => {
                            const cartItem = cart.find(item => item.id === prod.id);
                            return (
                                <div key={prod.id} style={{ position: 'relative' }}>
                                    <button
                                        onClick={() => handleAddToCart(prod)}
                                        style={{
                                            width: '100%', height: '80px', backgroundColor: cartItem ? '#112211' : '#1a1a1a',
                                            border: `2px solid ${cartItem ? 'var(--primary-color)' : '#333'}`,
                                            borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                                            color: 'white', padding: '5px'
                                        }}
                                    >
                                        <span style={{ fontWeight: 'bold', fontSize: '14px', textAlign: 'center', marginBottom: '4px', lineHeight: '1.2' }}>{prod.name}</span>
                                        <span style={{ color: 'var(--primary-color)', fontSize: '13px' }}>₺{parseFloat(prod.price).toFixed(2)}</span>
                                    </button>
                                    {cartItem && (
                                        <div style={{ position: 'absolute', top: '-5px', right: '-5px', display: 'flex', alignItems: 'center', backgroundColor: 'var(--primary-color)', borderRadius: '20px', padding: '2px', boxShadow: '0 2px 5px rgba(0,0,0,0.8)' }}>
                                            <button onClick={(e) => { e.stopPropagation(); handleRemoveFromCart(prod.id); }} style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#ff4444', color: 'white', border: 'none', fontWeight: 'bold', fontSize: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>-</button>
                                            <span style={{ color: '#000', fontWeight: 'bold', margin: '0 8px', fontSize: '14px' }}>{cartItem.quantity}</span>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* ---------------- MEVCUT ADİSYON SEKMESİ ---------------- */}
            {activeTab === 'adisyon' && (
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px', backgroundColor: '#0a0a0a' }}>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px dashed #333' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 'bold' }}>MASA TOPLAMI:</span>
                        <span style={{ color: 'var(--primary-color)', fontSize: '26px', fontWeight: '900' }}>
                            ₺{existingOrder ? parseFloat(existingOrder.total_amount).toFixed(2) : '0.00'}
                        </span>
                    </div>

                    {Object.keys(groupedExisting).length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#555', marginTop: '50px', fontWeight: 'bold' }}>Masada henüz kayıtlı sipariş yok.</div>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {Object.values(groupedExisting).map((item, idx) => (
                                <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #1a1a1a' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ color: item.status === 'Ödendi' ? '#555' : '#fff', fontWeight: 'bold', fontSize: '15px', textDecoration: item.status === 'Ödendi' ? 'line-through' : 'none' }}>
                                            {item.qty}x {item.name}
                                        </span>
                                        {item.status === 'Ödendi' && <span style={{ fontSize: '10px', backgroundColor: '#112211', color: '#00ffcc', padding: '3px 6px', borderRadius: '4px', fontWeight: 'bold' }}>ÖDENDİ</span>}
                                    </div>
                                    <strong style={{ color: item.status === 'Ödendi' ? '#555' : 'var(--text-muted)', fontSize: '15px', textDecoration: item.status === 'Ödendi' ? 'line-through' : 'none' }}>
                                        ₺{item.totalPrice.toFixed(2)}
                                    </strong>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* ALT BAR (Sadece Sipariş Sekmesinde Görünür) */}
            {activeTab === 'menu' && cart.length > 0 && (
                <div style={{
                    position: 'fixed', bottom: 0, left: 0, width: '100%', backgroundColor: '#0a0a0a',
                    borderTop: '2px solid var(--primary-color)', padding: '10px 20px', boxSizing: 'border-box',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10000,
                    boxShadow: '0 -5px 20px rgba(0,0,0,0.9)'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 'bold' }}>SEPET ({cartTotalItems})</span>
                        <span style={{ color: 'var(--primary-color)', fontSize: '20px', fontWeight: '900' }}>₺{cartTotalAmount.toFixed(2)}</span>
                    </div>

                    <button
                        onClick={handleSendOrder}
                        style={{
                            backgroundColor: 'var(--primary-color)', color: '#000', padding: '10px 24px',
                            borderRadius: '8px', fontSize: '16px', fontWeight: '900', border: 'none',
                            marginLeft: 'auto', letterSpacing: '1px', width: "auto"
                        }}
                    >
                        GÖNDER
                    </button>
                </div>
            )}

        </div>
    );
};

export default MobileOrderPanel;