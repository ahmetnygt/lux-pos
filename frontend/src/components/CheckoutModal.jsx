import { useState } from 'react';
import axios from 'axios';

const CheckoutModal = ({ order, tableId, onClose, onSuccess }) => {
    const totalAmount = parseFloat(order.total_amount);
    const alreadyPaid = parseFloat(order.paid_amount || 0);
    const remaining = totalAmount - alreadyPaid;

    const [payAmount, setPayAmount] = useState(remaining.toFixed(2));
    const [selectedItems, setSelectedItems] = useState([]);

    // DİKKAT: Sadece henüz ÖDENMEMİŞ olanları çekiyoruz
    const unpaidItems = (order.OrderItems || []).filter(item => item.status !== 'Ödendi');

    const groupedItems = unpaidItems.reduce((acc, item) => {
        if (!acc[item.product_id]) {
            acc[item.product_id] = { product_id: item.product_id, name: item.Product?.name, price: parseFloat(item.price), items: [], totalQty: 0 };
        }
        acc[item.product_id].items.push(item);
        acc[item.product_id].totalQty += 1;
        return acc;
    }, {});

    const handleAdd = (group) => {
        const unselectedItem = group.items.find(item => !selectedItems.some(sel => sel.id === item.id));
        if (unselectedItem) {
            const newSelected = [...selectedItems, unselectedItem];
            setSelectedItems(newSelected);
            const sum = newSelected.reduce((acc, curr) => acc + parseFloat(curr.price), 0);
            setPayAmount(Math.min(sum, remaining).toFixed(2));
        }
    };

    const handleRemove = (group) => {
        const selectedItemIndex = selectedItems.findIndex(item => item.product_id === group.product_id);
        if (selectedItemIndex !== -1) {
            const newSelected = [...selectedItems];
            newSelected.splice(selectedItemIndex, 1);
            setSelectedItems(newSelected);
            const sum = newSelected.reduce((acc, curr) => acc + parseFloat(curr.price), 0);
            setPayAmount(Math.min(sum, remaining).toFixed(2));
        }
    };

    const handlePayment = async (method) => {
        if (parseFloat(payAmount) <= 0 || parseFloat(payAmount) > remaining) {
            alert('Geçersiz bir tutar girdiniz!'); return;
        }
        try {
            const res = await axios.post(`http://localhost:5000/api/orders/table/${tableId}/pay`, {
                pay_amount: payAmount,
                selected_item_ids: selectedItems.map(i => i.id),
                payment_method: method
            });

            if (res.data.isFullyPaid) {
                alert('Hesap tamamen kapatıldı!'); onSuccess(true);
            } else {
                alert(`Kısmi tahsilat başarılı! Kalan: ₺${res.data.remaining.toFixed(2)}`); onSuccess(false);
            }
        } catch (error) {
            alert('İşlem başarısız!');
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 10001, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ backgroundColor: 'var(--surface-color)', width: '90%', maxWidth: '900px', height: '80vh', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '2px solid var(--primary-color)' }}>
                <div style={{ padding: '20px', backgroundColor: '#111', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between' }}>
                    <h2 style={{ margin: 0, color: 'var(--primary-color)' }}>PARÇALI TAHSİLAT</h2>
                    <button onClick={onClose} style={{ background: 'transparent', color: '#ff4444', border: 'none', fontSize: '20px', fontWeight: 'bold' }}>X</button>
                </div>

                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                    <div style={{ flex: 1, padding: '20px', borderRight: '1px solid #333', overflowY: 'auto' }}>
                        <h3 style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: 0 }}>ÜRÜN SEÇEREK ÖDE</h3>
                        {Object.values(groupedItems).length === 0 && <p style={{ color: '#555' }}>Ödenecek ürün kalmadı.</p>}
                        {Object.values(groupedItems).map(group => {
                            const selectedCount = selectedItems.filter(i => i.product_id === group.product_id).length;
                            return (
                                <div key={group.product_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', marginBottom: '10px', backgroundColor: selectedCount > 0 ? 'rgba(0, 255, 204, 0.1)' : '#222', border: `1px solid ${selectedCount > 0 ? '#00ffcc' : '#444'}`, borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ color: selectedCount > 0 ? '#00ffcc' : 'var(--text-color)', fontWeight: 'bold', fontSize: '16px' }}>{group.totalQty}x {group.name}</span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>Birim: ₺{group.price.toFixed(2)}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <button onClick={() => handleRemove(group)} disabled={selectedCount === 0} style={{ padding: '8px 15px', backgroundColor: selectedCount === 0 ? '#333' : '#ff4444', color: 'white', borderRadius: '4px', fontWeight: 'bold', opacity: selectedCount === 0 ? 0.5 : 1 }}>-</button>
                                        <span style={{ fontWeight: 'bold', color: selectedCount > 0 ? '#00ffcc' : 'white', fontSize: '20px', width: '20px', textAlign: 'center' }}>{selectedCount}</span>
                                        <button onClick={() => handleAdd(group)} disabled={selectedCount === group.totalQty} style={{ padding: '8px 15px', backgroundColor: selectedCount === group.totalQty ? '#333' : '#00ffcc', color: '#000', borderRadius: '4px', fontWeight: 'bold', opacity: selectedCount === group.totalQty ? 0.5 : 1 }}>+</button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', backgroundColor: '#0a0a0a', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '18px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Adisyon Toplamı:</span><span>₺{totalAmount.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '18px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Ödenen:</span><span style={{ color: '#00ffcc' }}>₺{alreadyPaid.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '24px', fontWeight: 'bold', borderBottom: '2px dashed var(--primary-color)', paddingBottom: '20px' }}>
                            <span>KALAN:</span><span style={{ color: '#ff4444' }}>₺{remaining.toFixed(2)}</span>
                        </div>

                        <div style={{ marginBottom: '30px' }}>
                            <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '10px', fontSize: '14px' }}>ALINACAK TUTAR (₺)</label>
                            <input type="number" value={payAmount} onChange={(e) => { setPayAmount(e.target.value); setSelectedItems([]); }} style={{ width: '100%', padding: '20px', fontSize: '32px', textAlign: 'center', backgroundColor: '#111', color: 'var(--primary-color)', border: '1px solid #333', borderRadius: '8px' }} />
                        </div>

                        <div style={{ display: 'flex', gap: '15px', marginTop: 'auto' }}>
                            <button onClick={() => handlePayment('Kredi Kartı')} style={{ flex: 1, padding: '20px', backgroundColor: '#333', color: 'white', fontSize: '18px', fontWeight: 'bold', border: '1px solid #555' }}>💳 KREDİ KARTI</button>
                            <button onClick={() => handlePayment('Nakit')} style={{ flex: 1, padding: '20px', backgroundColor: '#00ffcc', color: '#000', fontSize: '18px', fontWeight: 'bold' }}>💵 NAKİT</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;