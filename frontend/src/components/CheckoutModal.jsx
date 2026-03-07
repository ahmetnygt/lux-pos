import { useState } from 'react';
import axios from 'axios';

const CheckoutModal = ({ order, tableId, onClose, onRefresh, onSuccess }) => {
    const totalAmount = parseFloat(order.total_amount);
    const alreadyPaid = parseFloat(order.paid_amount || 0);
    const discountAmount = parseFloat(order.discount_amount || 0);
    const remaining = totalAmount - alreadyPaid - discountAmount;

    const [payAmount, setPayAmount] = useState(remaining.toFixed(2));
    const [selectedItems, setSelectedItems] = useState([]);

    // SİSTEM BİLGİSİ: İskonto State'leri (Yüzde veya Tutar)
    const [discountValue, setDiscountValue] = useState('');
    const [discountType, setDiscountType] = useState('amount'); // 'amount' (₺) veya 'percent' (%)

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

            // SİSTEM BİLGİSİ: Otomatik yazdırma kodlarını buradan sildik! 
            // Sadece ödemeyi alıp ekranı kapatıyor.

            if (res.data.isFullyPaid) onSuccess(true);
            else onSuccess(false);
        } catch (error) { alert('İşlem başarısız!'); }
    };

    // SİSTEM BİLGİSİ: Gelişmiş Zeki İskonto Motoru
    const handleApplyDiscount = async () => {
        const val = parseFloat(discountValue);
        if (!val || val <= 0) {
            alert('Mantıklı bir iskonto değeri gir amk!'); return;
        }

        // Yüzde ise kalanın üzerinden yüzdesini al, tutar ise direkt al
        let calculatedDiscount = val;
        if (discountType === 'percent') {
            calculatedDiscount = remaining * (val / 100);
        }

        if (calculatedDiscount <= 0 || calculatedDiscount > remaining) {
            alert('İskonto tutarı kalan hesaptan büyük olamaz!'); return;
        }

        try {
            const res = await axios.post(`http://localhost:5000/api/orders/table/${tableId}/discount`, {
                discount_amount: calculatedDiscount
            });
            setDiscountValue('');

            if (res.data.isFullyPaid) {
                alert('İskonto ile hesap tamamen sıfırlandı!');
                onSuccess(true);
            } else {
                onRefresh();
                setPayAmount((remaining - calculatedDiscount).toFixed(2));
            }
        } catch (error) { alert('İskonto uygulanamadı!'); }
    };

    const handleRemoveDiscount = async () => {
        try {
            await axios.post(`http://localhost:5000/api/orders/table/${tableId}/remove-discount`);
            onRefresh(); // Veriyi arkadan yenile
            setPayAmount((totalAmount - alreadyPaid).toFixed(2)); // Alınacak tutarı iskontosuz haline geri döndür
        } catch (error) {
            alert('İskonto silinemedi!');
        }
    };

    // NOT: En dıştaki div'in position özellikleri değiştirildi (scroll yapmasın diye top-bottom-left-right 0 verildi)
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 10001, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ backgroundColor: 'var(--surface-color)', width: '90%', maxWidth: '900px', maxHeight: '90vh', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '2px solid var(--primary-color)' }}>
                <div style={{ padding: '20px', backgroundColor: '#111', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, color: 'var(--primary-color)' }}>TAHSİLAT VE İSKONTO</h2>

                    {/* SİSTEM BİLGİSİ: O iğrenç uzayan buton tıraşlandı (width: auto) */}
                    <button onClick={onClose} style={{ width: 'auto', background: 'transparent', color: '#ff4444', border: 'none', fontSize: '24px', fontWeight: 'bold', cursor: 'pointer', padding: '0 10px', margin: 0 }}>✖</button>
                </div>

                <div style={{ display: 'flex', flex: 1, overflow: 'hidden', flexDirection: 'row' }}>

                    {/* Sol Taraf: Ürünler */}
                    <div style={{ flex: 1, padding: '20px', borderRight: '1px solid #333', overflowY: 'auto' }}>
                        <h3 style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: 0 }}>ÜRÜN SEÇEREK ÖDE</h3>
                        {Object.values(groupedItems).length === 0 && <p style={{ color: '#555' }}>Ödenecek ürün kalmadı.</p>}
                        {Object.values(groupedItems).map(group => {
                            const selectedCount = selectedItems.filter(i => i.product_id === group.product_id).length;
                            return (
                                <div key={group.product_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', marginBottom: '10px', backgroundColor: selectedCount > 0 ? 'rgba(0, 255, 204, 0.1)' : '#222', border: `1px solid ${selectedCount > 0 ? '#00ffcc' : '#444'}`, borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ color: selectedCount > 0 ? '#00ffcc' : 'var(--text-color)', fontWeight: 'bold', fontSize: '14px' }}>{group.totalQty}x {group.name}</span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>Birim: ₺{group.price.toFixed(2)}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <button onClick={() => handleRemove(group)} disabled={selectedCount === 0} style={{ padding: '8px 15px', width: 'auto', margin: 0, backgroundColor: selectedCount === 0 ? '#333' : '#ff4444', color: 'white', borderRadius: '4px', fontWeight: 'bold', opacity: selectedCount === 0 ? 0.5 : 1, cursor: 'pointer', border: 'none' }}>-</button>
                                        <span style={{ fontWeight: 'bold', color: selectedCount > 0 ? '#00ffcc' : 'white', fontSize: '18px', width: '20px', textAlign: 'center' }}>{selectedCount}</span>
                                        <button onClick={() => handleAdd(group)} disabled={selectedCount === group.totalQty} style={{ padding: '8px 15px', width: 'auto', margin: 0, backgroundColor: selectedCount === group.totalQty ? '#333' : '#00ffcc', color: '#000', borderRadius: '4px', fontWeight: 'bold', opacity: selectedCount === group.totalQty ? 0.5 : 1, cursor: 'pointer', border: 'none' }}>+</button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Sağ Taraf: Hesap ve Ödeme */}
                    <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', backgroundColor: '#0a0a0a', overflowY: 'auto' }}>

                        {/* İSKONTO ALANI (YÜZDE VE TUTAR DESTEKLİ) */}
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px dashed #333' }}>
                            <div style={{ display: 'flex', backgroundColor: '#222', borderRadius: '8px', border: '1px solid #444', overflow: 'hidden' }}>
                                <button
                                    onClick={() => setDiscountType('amount')}
                                    style={{ padding: '0 15px', width: 'auto', margin: 0, backgroundColor: discountType === 'amount' ? '#ffc107' : 'transparent', color: discountType === 'amount' ? '#000' : 'white', border: 'none', fontWeight: 'bold', borderRadius: 0 }}
                                >₺</button>
                                <button
                                    onClick={() => setDiscountType('percent')}
                                    style={{ padding: '0 15px', width: 'auto', margin: 0, backgroundColor: discountType === 'percent' ? '#ffc107' : 'transparent', color: discountType === 'percent' ? '#000' : 'white', border: 'none', fontWeight: 'bold', borderRadius: 0 }}
                                >%</button>
                            </div>

                            <input
                                type="number"
                                placeholder={discountType === 'percent' ? "Yüzde (%)" : "Tutar (₺)"}
                                value={discountValue} onChange={(e) => setDiscountValue(e.target.value)}
                                style={{ flex: 1, padding: '15px', backgroundColor: '#222', border: '1px solid #444', color: '#ffc107', borderRadius: '8px', fontSize: '16px', margin: 0, outline: 'none' }}
                            />

                            <button
                                onClick={handleApplyDiscount}
                                style={{ width: 'auto', padding: '0 20px', margin: 0, backgroundColor: '#ffc107', color: '#000', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
                            >
                                ✂️ DÜŞ
                            </button>
                        </div>

                        {/* HESAP ÖZETİ */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '16px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Adisyon Toplamı:</span><span>₺{totalAmount.toFixed(2)}</span>
                        </div>

                        {/* SİSTEM BİLGİSİ: Bozuk olan iskonto satırı jilet gibi onarıldı */}
                        {discountAmount > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '16px', alignItems: 'center' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Yapılan İskonto:</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {/* whiteSpace: 'nowrap' eklendi, asla kırılmaz */}
                                    <span style={{ color: '#ffc107', whiteSpace: 'nowrap', fontWeight: 'bold' }}>
                                        - ₺{discountAmount.toFixed(2)}
                                    </span>
                                    <button
                                        onClick={handleRemoveDiscount}
                                        style={{ background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer', padding: '0 0 0 5px', fontSize: '18px', fontWeight: '900', margin: 0, width: 'auto', display: 'flex', alignItems: 'center' }}
                                        title="İskontoyu Sıfırla"
                                    >
                                        ✖
                                    </button>
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '16px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Ödenen:</span><span style={{ color: '#00ffcc' }}>- ₺{alreadyPaid.toFixed(2)}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '26px', fontWeight: '900', borderBottom: '2px solid var(--primary-color)', paddingBottom: '20px' }}>
                            <span>KALAN:</span><span style={{ color: '#ff4444' }}>₺{remaining.toFixed(2)}</span>
                        </div>

                        {/* ÖDEME BUTONLARI */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '10px', fontSize: '14px', letterSpacing: '1px' }}>ALINACAK TUTAR (₺)</label>
                            <input type="number" value={payAmount} onChange={(e) => { setPayAmount(e.target.value); setSelectedItems([]); }} style={{ width: '100%', padding: '20px', fontSize: '32px', textAlign: 'center', backgroundColor: '#111', color: 'var(--primary-color)', border: '1px solid #333', borderRadius: '8px', boxSizing: 'border-box', margin: 0 }} />
                        </div>

                        <div style={{ display: 'flex', gap: '15px', marginTop: 'auto' }}>
                            <button onClick={() => handlePayment('Kredi Kartı')} style={{ flex: 1, padding: '20px 0', margin: 0, backgroundColor: '#222', color: 'white', fontSize: '16px', fontWeight: 'bold', border: '1px solid #444', borderRadius: '8px', cursor: 'pointer' }}>💳 KART</button>
                            <button onClick={() => handlePayment('Nakit')} style={{ flex: 1, padding: '20px 0', margin: 0, backgroundColor: '#00ffcc', color: '#000', fontSize: '16px', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>💵 NAKİT</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;