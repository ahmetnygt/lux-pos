import { useState, useEffect } from 'react';
import axios from 'axios';

const MenuManager = () => {
    const [menu, setMenu] = useState([]);

    // Kategori Ekleme Stateleri
    const [newCatName, setNewCatName] = useState('');
    const [newCatColor, setNewCatColor] = useState('#F3D431'); // Varsayılan Lux Sarısı

    // Ürün Ekleme Stateleri
    const [selectedCatId, setSelectedCatId] = useState('');
    const [newProdName, setNewProdName] = useState('');
    const [newProdPrice, setNewProdPrice] = useState('');

    // Backend'den tüm menüyü çek
    const fetchMenu = async () => {
        try {
            console.log('Sistem Bilgisi: Güncel menü kataloğu sunucudan talep ediliyor...');
            const response = await axios.get('http://localhost:5000/api/menu');
            setMenu(response.data);
            // Eğer kategori varsa ve seçili kategori yoksa ilkini seçili yap
            if (response.data.length > 0 && !selectedCatId) {
                setSelectedCatId(response.data[0].id);
            }
        } catch (error) {
            console.error('Sistem Hatası: Menü kataloğu yüklenemedi.', error);
        }
    };

    useEffect(() => {
        fetchMenu();
    }, []);

    // Kategori Gönder
    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCatName) return;

        try {
            console.log(`Sistem Bilgisi: Yeni kategori ekleniyor. İsim: ${newCatName}`);
            await axios.post('http://localhost:5000/api/menu/category', {
                name: newCatName,
                color_code: newCatColor
            });
            setNewCatName('');
            fetchMenu();
        } catch (error) {
            console.error('Sistem Hatası: Kategori kayıt işlemi başarısız.', error);
        }
    };

    // Ürün Gönder
    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (!selectedCatId || !newProdName || !newProdPrice) return;

        try {
            console.log(`Sistem Bilgisi: Yeni ürün ekleniyor. Kategori ID: ${selectedCatId}, Ürün: ${newProdName}`);
            await axios.post('http://localhost:5000/api/menu/product', {
                category_id: selectedCatId,
                name: newProdName,
                price: parseFloat(newProdPrice)
            });
            setNewProdName('');
            setNewProdPrice('');
            fetchMenu();
        } catch (error) {
            console.error('Sistem Hatası: Ürün kayıt işlemi başarısız.', error);
        }
    };

    return (
        <div style={{ display: 'flex', gap: '30px', height: '100%' }}>

            {/* Sol Taraf: Kategoriler ve Kategori Ekleme */}
            <div style={{ flex: 1, backgroundColor: 'var(--surface-color)', padding: '20px', borderRadius: '8px', borderTop: '3px solid var(--primary-color)' }}>
                <h2 style={{ marginTop: 0, color: 'var(--text-color)' }}>KATEGORİLER</h2>

                <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <input
                        type="text"
                        placeholder="Kategori Adı (Örn: Kokteyller)"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        style={{ margin: 0, flex: 1 }}
                    />
                    <input
                        type="color"
                        value={newCatColor}
                        onChange={(e) => setNewCatColor(e.target.value)}
                        style={{ width: '50px', padding: '0', height: '45px', cursor: 'pointer', border: 'none', backgroundColor: 'transparent' }}
                        title="Kategori Rengi"
                    />
                    <button type="submit" style={{ width: 'auto', padding: '0 20px' }}>EKLE</button>
                </form>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '500px' }}>
                    {menu.map(cat => (
                        <div
                            key={cat.id}
                            onClick={() => setSelectedCatId(cat.id)}
                            style={{
                                padding: '15px',
                                backgroundColor: selectedCatId === cat.id ? '#2a2a2a' : '#111',
                                borderLeft: `5px solid ${cat.color_code}`,
                                borderRadius: '4px',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                            }}
                        >
                            <strong style={{ fontSize: '18px' }}>{cat.name}</strong>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sağ Taraf: Seçili Kategorinin Ürünleri ve Ürün Ekleme */}
            <div style={{ flex: 2, backgroundColor: 'var(--surface-color)', padding: '20px', borderRadius: '8px', borderTop: '3px solid #333' }}>
                <h2 style={{ marginTop: 0, color: 'var(--text-color)' }}>ÜRÜNLER VE FİYATLAR</h2>

                {menu.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>Önce sol taraftan bir kategori ekleyin.</p>
                ) : (
                    <>
                        <form onSubmit={handleAddProduct} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                            <input
                                type="text"
                                placeholder="Ürün Adı (Örn: Long Island)"
                                value={newProdName}
                                onChange={(e) => setNewProdName(e.target.value)}
                                style={{ margin: 0, flex: 2 }}
                            />
                            <input
                                type="number"
                                placeholder="Fiyat (₺)"
                                value={newProdPrice}
                                onChange={(e) => setNewProdPrice(e.target.value)}
                                style={{ margin: 0, flex: 1 }}
                                min="0"
                                step="0.01"
                            />
                            <button type="submit" style={{ width: 'auto', padding: '0 20px' }}>ÜRÜN EKLE</button>
                        </form>

                        {/* Ürün Listesi Tablosu */}
                        <div style={{ backgroundColor: '#0d0d0d', borderRadius: '6px', padding: '10px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #333', color: 'var(--text-muted)' }}>
                                        <th style={{ padding: '12px' }}>Ürün Adı</th>
                                        <th style={{ padding: '12px' }}>Fiyat</th>
                                        <th style={{ padding: '12px' }}>Durum</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {menu.find(c => c.id === selectedCatId)?.Products?.map(prod => (
                                        <tr key={prod.id} style={{ borderBottom: '1px solid #222' }}>
                                            <td style={{ padding: '12px', fontWeight: '500' }}>{prod.name}</td>
                                            <td style={{ padding: '12px', color: 'var(--primary-color)' }}>₺{parseFloat(prod.price).toFixed(2)}</td>
                                            <td style={{ padding: '12px' }}>
                                                <span style={{ backgroundColor: prod.is_active ? 'rgba(0, 255, 204, 0.1)' : 'rgba(255, 68, 68, 0.1)', color: prod.is_active ? '#00ffcc' : '#ff4444', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                                                    {prod.is_active ? 'Aktif' : 'Pasif'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {menu.find(c => c.id === selectedCatId)?.Products?.length === 0 && (
                                        <tr>
                                            <td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Bu kategoride henüz ürün yok.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>

        </div>
    );
};

export default MenuManager;