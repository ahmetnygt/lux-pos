import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import CheckoutModal from './CheckoutModal';

const PosPanel = ({ table, onClose, onUpdate }) => {
    const [order, setOrder] = useState(null);
    const [menu, setMenu] = useState([]);
    const [activeCategoryId, setActiveCategoryId] = useState(null);
    const [pendingItems, setPendingItems] = useState([]);
    const [showCheckout, setShowCheckout] = useState(false);

    const orderListRef = useRef(null);
    const user = JSON.parse(localStorage.getItem('lux_user') || '{}');

    const fetchOrder = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/orders/table/${table.id}`);
            setOrder(response.data);
        } catch (error) {
            console.error('Sistem Hatası: Adisyon verisi alınamadı.', error);
        }
    };

    const fetchMenu = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/menu');
            setMenu(response.data);
            if (response.data.length > 0 && !activeCategoryId) {
                setActiveCategoryId(response.data[0].id);
            }
        } catch (error) {
            console.error('Sistem Hatası: Menü yüklenemedi.', error);
        }
    };

    useEffect(() => {
        if (table) {
            fetchOrder();
            fetchMenu();
        }
    }, [table]);

    useEffect(() => {
        if (orderListRef.current) {
            orderListRef.current.scrollTo({ top: orderListRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [order, pendingItems]);

    const handleStageItem = (product) => {
        setPendingItems(prev => {
            const existingItem = prev.find(item => item.id === product.id);
            if (existingItem) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1, lineTotal: item.lineTotal + parseFloat(product.price) }
                        : item
                );
            }
            return [...prev, { ...product, uniqueId: Date.now(), quantity: 1, lineTotal: parseFloat(product.price) }];
        });
    };

    const handleRemovePending = (productId) => {
        setPendingItems(prev => {
            const existingItem = prev.find(item => item.id === productId);
            if (existingItem.quantity > 1) {
                return prev.map(item =>
                    item.id === productId
                        ? { ...item, quantity: item.quantity - 1, lineTotal: item.lineTotal - parseFloat(item.price) }
                        : item
                );
            }
            return prev.filter(item => item.id !== productId);
        });
    };

    const handleSendPendingOrders = async () => {
        if (pendingItems.length === 0) return;
        try {
            // SİSTEM BİLGİSİ: Amele gibi tek tek atmak yerine bütün sepeti tek pakette yolluyoruz
            await axios.post(`http://localhost:5000/api/orders/table/${table.id}/add-multiple`, {
                items: pendingItems,
                user_id: user.id
            });

            setPendingItems([]);
            fetchOrder();
            if (onUpdate) onUpdate(); // Haritadaki renkleri anında güncelle
        } catch (error) {
            console.error('Sistem Hatası', error);
            alert('Sipariş gönderilemedi!');
        }
    };

    const pendingTotal = pendingItems.reduce((acc, item) => acc + item.lineTotal, 0);
    const totalAmount = order ? parseFloat(order.total_amount) : 0;
    const paidAmount = order ? parseFloat(order.paid_amount || 0) : 0;
    const remaining = totalAmount - paidAmount;

    return (
        <div style={{ position: 'absolute', top: 0, right: 0, width: '900px', height: '100%', backgroundColor: 'var(--bg-color)', boxShadow: '-5px 0 20px rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column', zIndex: 1000, borderLeft: '2px solid var(--primary-color)' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', backgroundColor: 'var(--surface-color)', borderBottom: '1px solid #333' }}>
                <h2 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '24px' }}>{table.name} - ADİSYON</h2>
                <button onClick={onClose} style={{ width: 'auto', padding: '10px 20px', backgroundColor: '#ff4444', color: 'white' }}>KAPAT (X)</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'row', flex: 1, overflow: 'hidden' }}>

                {/* Sol Taraf: Adisyon */}
                <div style={{ flex: 1.2, padding: '20px', borderRight: '1px solid #333', display: 'flex', flexDirection: 'column', backgroundColor: '#0a0a0a' }}>
                    <div ref={orderListRef} style={{ flex: 1, overflowY: 'auto', paddingRight: '10px' }}>
                        <h3 style={{ color: 'var(--text-muted)', marginTop: 0, borderBottom: '1px dashed #333', paddingBottom: '10px', fontSize: '14px' }}>İŞLENEN SİPARİŞLER</h3>

                        {(!order || !order.OrderItems || order.OrderItems.length === 0) ? (
                            <p style={{ color: '#444', fontSize: '12px', fontStyle: 'italic' }}>Kayıtlı sipariş yok.</p>
                        ) : (
                            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0' }}>
                                {Object.values(order.OrderItems.reduce((acc, item) => {
                                    const key = `${item.product_id}-${item.status}`;
                                    if (!acc[key]) acc[key] = { ...item, totalQty: 0, sumPrice: 0 };
                                    acc[key].totalQty += item.quantity;
                                    acc[key].sumPrice += parseFloat(item.price);
                                    return acc;
                                }, {})).map(groupedItem => (
                                    <li key={`${groupedItem.product_id}-${groupedItem.status}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #222' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ color: groupedItem.status === 'Ödendi' ? '#555' : 'var(--text-color)', fontWeight: 'bold', fontSize: '14px', textDecoration: groupedItem.status === 'Ödendi' ? 'line-through' : 'none' }}>
                                                {groupedItem.totalQty}x {groupedItem.Product?.name}
                                            </span>
                                            {groupedItem.status === 'Ödendi' && (
                                                <span style={{ backgroundColor: 'rgba(0, 255, 204, 0.1)', color: '#00ffcc', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>ÖDENDİ</span>
                                            )}
                                        </div>
                                        <strong style={{ color: groupedItem.status === 'Ödendi' ? '#555' : 'var(--text-muted)', textDecoration: groupedItem.status === 'Ödendi' ? 'line-through' : 'none' }}>
                                            ₺{groupedItem.sumPrice.toFixed(2)}
                                        </strong>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {pendingItems.length > 0 && (
                            <>
                                <h3 style={{ color: '#00ffcc', margin: '10px 0', borderBottom: '1px dashed #00ffcc', paddingBottom: '10px', fontSize: '14px' }}>YENİ EKLENENLER</h3>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {pendingItems.map(item => (
                                        <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #222' }}>
                                            <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>{item.quantity}x {item.name}</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                <strong style={{ color: 'var(--primary-color)' }}>₺{item.lineTotal.toFixed(2)}</strong>
                                                <button onClick={() => handleRemovePending(item.id)} style={{ padding: '5px 12px', backgroundColor: '#ff4444', color: 'white', fontSize: '16px', fontWeight: 'bold', width: 'auto', borderRadius: '4px' }}>-</button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </div>

                    <div style={{ borderTop: '2px dashed var(--primary-color)', paddingTop: '15px', marginTop: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-muted)', marginBottom: '5px' }}>
                            <span>Adisyon Toplamı:</span><span>₺{totalAmount.toFixed(2)}</span>
                        </div>
                        {paidAmount > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#00ffcc', marginBottom: '5px' }}>
                                <span>Ödenen:</span><span>- ₺{paidAmount.toFixed(2)}</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 'bold', marginTop: '5px', paddingTop: '5px', borderTop: '1px solid #333' }}>
                            <span>KALAN:</span><span style={{ color: 'var(--primary-color)' }}>₺{(remaining + pendingTotal).toFixed(2)}</span>
                        </div>

                        {pendingItems.length > 0 ? (
                            <button onClick={handleSendPendingOrders} style={{ width: '100%', marginTop: '15px', backgroundColor: '#00ffcc', color: '#000', fontSize: '18px', padding: '15px', animation: 'pulse 1.5s infinite' }}>🚀 SİPARİŞİ GÖNDER</button>
                        ) : (
                            order && remaining > 0 && order.OrderItems.length > 0 && (
                                <button onClick={() => setShowCheckout(true)} style={{ width: '100%', marginTop: '15px', backgroundColor: '#ff4444', color: 'white', fontSize: '18px', padding: '15px', fontWeight: 'bold' }}>💳 HESABI KAPAT / ÖDEME AL</button>
                            )
                        )}
                    </div>
                </div>

                {/* Sağ Taraf: Menü */}
                <div style={{ flex: 2, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--surface-color)' }}>
                    <div style={{ display: 'flex', overflowX: 'auto', backgroundColor: '#111', padding: '10px', borderBottom: '1px solid #333' }}>
                        {menu.map(cat => (
                            <button key={cat.id} onClick={() => setActiveCategoryId(cat.id)} style={{ flex: '0 0 auto', width: 'auto', padding: '12px 20px', marginRight: '10px', backgroundColor: activeCategoryId === cat.id ? 'var(--primary-color)' : 'transparent', color: activeCategoryId === cat.id ? '#000' : 'var(--text-color)', border: `1px solid ${activeCategoryId === cat.id ? 'transparent' : '#333'}`, fontSize: '14px', fontWeight: 'bold' }}>{cat.name}</button>
                        ))}
                    </div>
                    <div style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '15px', overflowY: 'auto', alignContent: 'flex-start' }}>
                        {menu.find(c => c.id === activeCategoryId)?.Products?.map(prod => (
                            <button key={prod.id} onClick={() => handleStageItem(prod)} style={{ width: 'calc(33.333% - 10px)', height: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#222', border: '1px solid #444', borderRadius: '8px', padding: '10px' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '14px', textAlign: 'center', marginBottom: '8px' }}>{prod.name}</span>
                                <span style={{ color: 'var(--primary-color)', fontSize: '16px' }}>₺{parseFloat(prod.price).toFixed(2)}</span>
                            </button>
                        ))}
                    </div>
                </div>

            </div>

            {showCheckout && (
                <CheckoutModal
                    order={order} tableId={table.id} onClose={() => setShowCheckout(false)}
                    onSuccess={(isFullyPaid) => {
                        setShowCheckout(false);
                        if (onUpdate) onUpdate(); // SİSTEM BİLGİSİ: Tahsilat yapıldı, haritayı (renkleri) güncelle
                        if (isFullyPaid) onClose(); else fetchOrder();
                    }}
                />
            )}
        </div>
    );
};

export default PosPanel;