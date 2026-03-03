import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logoImg from '../assets/logo.png';

const MenuManagement = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('inventory');

    // Veri State'leri
    const [ingredients, setIngredients] = useState([]);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    // Modal (Pop-up) State'leri
    const [showIngredientModal, setShowIngredientModal] = useState(false);
    const [ingredientForm, setIngredientForm] = useState({ name: '', unit: 'cl', stock_amount: '', critical_level: '' });

    // Verileri Çekme Motoru
    const fetchData = async () => {
        try {
            const [ingRes, prodRes, catRes] = await Promise.all([
                axios.get('http://localhost:5000/api/ingredients'),
                axios.get('http://localhost:5000/api/products'),
                axios.get('http://localhost:5000/api/categories')
            ]);
            setIngredients(ingRes.data);
            setProducts(prodRes.data);
            setCategories(catRes.data);
        } catch (err) {
            console.error('Veri çekme hatası', err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // SİSTEM BİLGİSİ: Hammadde (Stok) Kaydetme Motoru
    const handleIngredientSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/ingredients', {
                name: ingredientForm.name,
                unit: ingredientForm.unit,
                stock_amount: parseFloat(ingredientForm.stock_amount || 0),
                critical_level: parseFloat(ingredientForm.critical_level || 10)
            });

            setShowIngredientModal(false); // Modalı kapat
            setIngredientForm({ name: '', unit: 'cl', stock_amount: '', critical_level: '' }); // Formu temizle
            fetchData(); // Listeyi sike sike güncelle
        } catch (err) {
            alert('Hammadde eklenirken hata oluştu amk, backend çalışıyor mu bir bak!');
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: 'white', fontFamily: 'Montserrat, sans-serif', position: 'relative' }}>

            {/* ÜST BAR */}
            <div style={{ backgroundColor: '#111', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--primary-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <img src={logoImg} alt="Lux Logo" style={{ height: '35px' }} />
                    <h2 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '20px', letterSpacing: '2px' }}>MENÜ & STOK YÖNETİMİ</h2>
                </div>
                <button
                    onClick={() => navigate('/dashboard')}
                    style={{ backgroundColor: 'transparent', color: 'white', border: '1px solid #333', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                    PANELE DÖN
                </button>
            </div>

            {/* SEKMELER */}
            <div style={{ display: 'flex', backgroundColor: '#111', borderBottom: '1px solid #222' }}>
                {['inventory', 'products', 'recipes'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            flex: 1, padding: '20px', border: 'none', fontWeight: 'bold', cursor: 'pointer',
                            backgroundColor: activeTab === tab ? '#1a1a1a' : 'transparent',
                            color: activeTab === tab ? 'var(--primary-color)' : '#555',
                            borderBottom: activeTab === tab ? '3px solid var(--primary-color)' : '3px solid transparent',
                            transition: 'all 0.3s'
                        }}
                    >
                        {tab === 'inventory' ? '📦 HAMMADDELER (STOK)' : tab === 'products' ? '🍹 ÜRÜNLER (MENÜ)' : '📝 REÇETELER'}
                    </button>
                ))}
            </div>

            <div style={{ padding: '30px' }}>

                {/* --- HAMMADDE / STOK SEKMESİ --- */}
                {activeTab === 'inventory' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h3 style={{ color: 'white' }}>Depodaki Hammaddeler</h3>
                            <button
                                onClick={() => setShowIngredientModal(true)} // Tıklayınca zemberek gibi modal açılır
                                style={{ backgroundColor: 'var(--primary-color)', color: '#000', padding: '10px 25px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                                + YENİ STOK EKLE
                            </button>
                        </div>

                        {ingredients.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '50px', color: '#555', backgroundColor: '#111', borderRadius: '12px' }}>
                                Ulan depon tamtakır amına koyayım! Hemen sağ üstten yeni stok ekle.
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#111', borderRadius: '12px', overflow: 'hidden' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#1a1a1a', textAlign: 'left', color: 'var(--text-muted)' }}>
                                        <th style={{ padding: '15px' }}>AD</th>
                                        <th style={{ padding: '15px' }}>MEVCUT STOK</th>
                                        <th style={{ padding: '15px' }}>BİRİM</th>
                                        <th style={{ padding: '15px' }}>KRİTİK SEVİYE</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ingredients.map(ing => (
                                        <tr key={ing.id} style={{ borderBottom: '1px solid #222' }}>
                                            <td style={{ padding: '15px', fontWeight: 'bold' }}>{ing.name}</td>
                                            <td style={{ padding: '15px', color: parseFloat(ing.stock_amount) <= parseFloat(ing.critical_level) ? '#ff4444' : '#00ffcc', fontWeight: 'bold' }}>
                                                {parseFloat(ing.stock_amount).toFixed(2)}
                                            </td>
                                            <td style={{ padding: '15px', color: '#888' }}>{ing.unit}</td>
                                            <td style={{ padding: '15px', color: '#555' }}>{ing.critical_level}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* --- DİĞER SEKMELER (Şimdilik Görsellik) --- */}
                {activeTab === 'products' && (
                    <div style={{ textAlign: 'center', padding: '50px', color: '#555', backgroundColor: '#111', borderRadius: '12px' }}>
                        Buraya da ürün ekleme gelecek, bekle amk stokları bitirelim.
                    </div>
                )}

                {activeTab === 'recipes' && (
                    <div style={{ textAlign: 'center', padding: '100px', backgroundColor: '#111', borderRadius: '12px', border: '2px dashed #333' }}>
                        <h2 style={{ color: 'var(--primary-color)' }}>🔬 REÇETE LABORATUVARI</h2>
                        <p style={{ color: '#555' }}>Burada "Votka Enerji" seçip, içine 5cl Votka, 1 Adet Redbull gömeceğiz.</p>
                    </div>
                )}

            </div>

            {/* SİSTEM BİLGİSİ: HAMMADDE EKLEME MODALI (Karanlık ve jilet) */}
            {showIngredientModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div style={{ backgroundColor: '#111', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '400px', border: '1px solid #333', borderTop: '4px solid var(--primary-color)' }}>
                        <h2 style={{ color: 'white', marginTop: 0, marginBottom: '20px' }}>Yeni Hammadde Ekle</h2>

                        <form onSubmit={handleIngredientSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '5px', fontSize: '12px' }}>Hammadde Adı (Örn: Absolut Votka)</label>
                                <input
                                    type="text" required
                                    value={ingredientForm.name} onChange={(e) => setIngredientForm({ ...ingredientForm, name: e.target.value })}
                                    style={{ width: '100%', padding: '12px', backgroundColor: '#222', border: '1px solid #333', color: 'white', borderRadius: '6px', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '5px', fontSize: '12px' }}>Mevcut Stok</label>
                                    <input
                                        type="number" step="0.01" required
                                        value={ingredientForm.stock_amount} onChange={(e) => setIngredientForm({ ...ingredientForm, stock_amount: e.target.value })}
                                        style={{ width: '100%', padding: '12px', backgroundColor: '#222', border: '1px solid #333', color: 'white', borderRadius: '6px', boxSizing: 'border-box' }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '5px', fontSize: '12px' }}>Birim</label>
                                    <select
                                        value={ingredientForm.unit} onChange={(e) => setIngredientForm({ ...ingredientForm, unit: e.target.value })}
                                        style={{ width: '100%', padding: '12px', backgroundColor: '#222', border: '1px solid #333', color: 'white', borderRadius: '6px', boxSizing: 'border-box' }}
                                    >
                                        <option value="cl">cl (Santilitre)</option>
                                        <option value="adet">Adet</option>
                                        <option value="kg">kg (Kilogram)</option>
                                        <option value="gr">gr (Gram)</option>
                                        <option value="lt">lt (Litre)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '5px', fontSize: '12px' }}>Kritik Seviye (Uyarı Sınırı)</label>
                                <input
                                    type="number" step="0.01" required
                                    value={ingredientForm.critical_level} onChange={(e) => setIngredientForm({ ...ingredientForm, critical_level: e.target.value })}
                                    style={{ width: '100%', padding: '12px', backgroundColor: '#222', border: '1px solid #333', color: 'white', borderRadius: '6px', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button type="button" onClick={() => setShowIngredientModal(false)} style={{ flex: 1, padding: '12px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>İPTAL</button>
                                <button type="submit" style={{ flex: 2, padding: '12px', backgroundColor: 'var(--primary-color)', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>DEPOYA KAYDET</button>
                            </div>
                        </form>

                    </div>
                </div>
            )}

        </div>
    );
};

export default MenuManagement;