import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logoImg from '../assets/logo.png';

const MenuManagement = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('inventory');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

    const [ingredients, setIngredients] = useState([]);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    const [showIngredientModal, setShowIngredientModal] = useState(false);
    const [showProductModal, setShowProductModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);

    // Form State'leri (id varsa DÜZENLE moduna geçer)
    const [ingredientForm, setIngredientForm] = useState({ id: null, name: '', unit: 'cl', stock_amount: '', critical_level: '' });
    const [productForm, setProductForm] = useState({ id: null, name: '', price: '', category_id: '' });
    const [categoryForm, setCategoryForm] = useState({ id: null, name: '', color_code: '#F3D431' });

    const [selectedRecipeProduct, setSelectedRecipeProduct] = useState('');
    const [currentRecipe, setCurrentRecipe] = useState([]);
    const [recipeForm, setRecipeForm] = useState({ ingredient_id: '', amount_used: '' });

    const fetchData = async () => {
        try { const res = await axios.get('http://localhost:5000/api/ingredients'); setIngredients(res.data); } catch (e) { }
        try { const res = await axios.get('http://localhost:5000/api/products'); setProducts(res.data); } catch (e) { }
        try { const res = await axios.get('http://localhost:5000/api/categories'); setCategories(res.data); } catch (e) { }
    };

    useEffect(() => { fetchData(); }, []);

    const fetchRecipe = async (productId) => {
        if (!productId) { setCurrentRecipe([]); return; }
        try {
            const res = await axios.get(`http://localhost:5000/api/recipes/product/${productId}`);
            setCurrentRecipe(res.data.Ingredients || []);
        } catch (err) { setCurrentRecipe([]); }
    };

    useEffect(() => { fetchRecipe(selectedRecipeProduct); }, [selectedRecipeProduct]);

    // --- KAYIT VE GÜNCELLEME İŞLEMLERİ ---
    const handleIngredientSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { name: ingredientForm.name, unit: ingredientForm.unit, stock_amount: parseFloat(ingredientForm.stock_amount), critical_level: parseFloat(ingredientForm.critical_level) };
            if (ingredientForm.id) await axios.put(`http://localhost:5000/api/ingredients/${ingredientForm.id}`, payload);
            else await axios.post('http://localhost:5000/api/ingredients', payload);
            setShowIngredientModal(false); setIngredientForm({ id: null, name: '', unit: 'cl', stock_amount: '', critical_level: '' }); fetchData();
        } catch (err) { alert('İşlem başarısız!'); }
    };

    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        try {
            if (categoryForm.id) await axios.put(`http://localhost:5000/api/categories/${categoryForm.id}`, categoryForm);
            else await axios.post('http://localhost:5000/api/categories', categoryForm);
            setShowCategoryModal(false); setCategoryForm({ id: null, name: '', color_code: '#F3D431' }); fetchData();
        } catch (err) { alert('İşlem başarısız!'); }
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        if (!productForm.category_id) { alert('Kategori seç amk!'); return; }
        try {
            const payload = { name: productForm.name, price: parseFloat(productForm.price), category_id: productForm.category_id };
            if (productForm.id) await axios.put(`http://localhost:5000/api/products/${productForm.id}`, payload);
            else await axios.post('http://localhost:5000/api/products', payload);
            setShowProductModal(false); setProductForm({ id: null, name: '', price: '', category_id: '' }); fetchData();
        } catch (err) { alert('İşlem başarısız!'); }
    };

    const handleRecipeSubmit = async (e) => {
        e.preventDefault();
        if (!selectedRecipeProduct || !recipeForm.ingredient_id || !recipeForm.amount_used) return;
        try {
            await axios.post('http://localhost:5000/api/recipes', { product_id: selectedRecipeProduct, ingredient_id: recipeForm.ingredient_id, amount_used: parseFloat(recipeForm.amount_used) });
            setRecipeForm({ ingredient_id: '', amount_used: '' }); fetchRecipe(selectedRecipeProduct);
        } catch (err) { alert('Formül eklenemedi!'); }
    };

    // --- SİLME İŞLEMLERİ ---
    const del = async (url) => { if (window.confirm('Harbi siliyoruz bak, emin misin patron?')) { await axios.delete(url); fetchData(); } };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: 'white', position: 'relative' }}>
            <div style={{ backgroundColor: '#111', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--primary-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><img src={logoImg} alt="Lux" style={{ height: '35px' }} /><h2 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '20px' }}>MENÜ & STOK YÖNETİMİ</h2></div>
                <button onClick={() => navigate('/dashboard')} style={{ width: 'auto', backgroundColor: 'transparent', color: 'white', border: '1px solid #333', padding: '10px 20px', borderRadius: '8px' }}>PANELE DÖN</button>
            </div>

            <div style={{ display: 'flex', backgroundColor: '#111', borderBottom: '1px solid #222' }}>
                {['inventory', 'products', 'recipes'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: '20px', border: 'none', fontWeight: 'bold', backgroundColor: activeTab === tab ? '#1a1a1a' : 'transparent', color: activeTab === tab ? 'var(--primary-color)' : '#555', borderBottom: activeTab === tab ? '3px solid var(--primary-color)' : '3px solid transparent' }}>
                        {tab === 'inventory' ? '📦 HAMMADDELER (STOK)' : tab === 'products' ? '🍹 ÜRÜNLER (MENÜ)' : '📝 REÇETELER'}
                    </button>
                ))}
            </div>

            <div style={{ padding: '30px' }}>
                {/* --- STOK SEKMESİ --- */}
                {activeTab === 'inventory' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h3 style={{ color: 'white' }}>Depodaki Hammaddeler</h3>
                            <button onClick={() => { setIngredientForm({ id: null, name: '', unit: 'cl', stock_amount: '', critical_level: '' }); setShowIngredientModal(true); }} style={{ width: 'auto', backgroundColor: 'var(--primary-color)', color: '#000', padding: '10px 25px', borderRadius: '6px' }}>+ YENİ STOK EKLE</button>
                        </div>
                        {ingredients.length === 0 ? (<div style={{ textAlign: 'center', padding: '50px', color: '#555' }}>Depo boş.</div>) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#111', borderRadius: '12px', overflow: 'hidden' }}>
                                <thead><tr style={{ backgroundColor: '#1a1a1a', textAlign: 'left', color: 'var(--text-muted)' }}><th style={{ padding: '15px' }}>AD</th><th style={{ padding: '15px' }}>STOK</th><th style={{ padding: '15px' }}>BİRİM</th><th style={{ padding: '15px' }}>KRİTİK</th><th style={{ padding: '15px', textAlign: 'right' }}>İŞLEM</th></tr></thead>
                                <tbody>
                                    {ingredients.map(ing => (
                                        <tr key={ing.id} style={{ borderBottom: '1px solid #222' }}>
                                            <td style={{ padding: '15px', fontWeight: 'bold' }}>{ing.name}</td>
                                            <td style={{ padding: '15px', color: parseFloat(ing.stock_amount) <= parseFloat(ing.critical_level) ? '#ff4444' : '#00ffcc' }}>{parseFloat(ing.stock_amount).toFixed(2)}</td>
                                            <td style={{ padding: '15px', color: '#888' }}>{ing.unit}</td>
                                            <td style={{ padding: '15px', color: '#555' }}>{ing.critical_level}</td>
                                            <td style={{ padding: '15px', textAlign: 'right' }}>
                                                <button onClick={() => { setIngredientForm(ing); setShowIngredientModal(true); }} style={{ width: 'auto', background: 'none', color: 'var(--primary-color)', border: 'none', padding: '0 10px' }}>DÜZENLE</button>
                                                <button onClick={() => del(`http://localhost:5000/api/ingredients/${ing.id}`)} style={{ width: 'auto', background: 'none', color: '#ff4444', border: 'none', padding: '0' }}>SİL</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* --- MENÜ SEKMESİ --- */}
                {activeTab === 'products' && (
                    <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
                        <div style={{ width: '250px', backgroundColor: '#111', borderRadius: '12px', padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <h4 style={{ color: 'var(--text-muted)', margin: '0 0 10px 0', borderBottom: '1px dashed #333', paddingBottom: '10px' }}>KATEGORİLER</h4>
                            <button onClick={() => setSelectedCategoryFilter('all')} style={{ padding: '12px', textAlign: 'left', borderRadius: '8px', border: 'none', backgroundColor: selectedCategoryFilter === 'all' ? 'var(--primary-color)' : 'transparent', color: selectedCategoryFilter === 'all' ? '#000' : 'white' }}>TÜMÜ</button>
                            {categories.map(cat => (
                                <div key={cat.id} style={{ display: 'flex', gap: '5px' }}>
                                    <button onClick={() => setSelectedCategoryFilter(cat.id)} style={{ flex: 1, padding: '12px', textAlign: 'left', borderRadius: '8px', border: 'none', backgroundColor: selectedCategoryFilter === cat.id ? '#2a2a2a' : 'transparent', color: selectedCategoryFilter === cat.id ? 'var(--primary-color)' : 'var(--text-muted)', borderLeft: `4px solid ${cat.color_code}` }}>{cat.name}</button>
                                    <button onClick={() => { setCategoryForm(cat); setShowCategoryModal(true); }} style={{ width: 'auto', padding: '5px', background: 'none', color: '#888', border: 'none' }}>✎</button>
                                    <button onClick={() => del(`http://localhost:5000/api/categories/${cat.id}`)} style={{ width: 'auto', padding: '5px', background: 'none', color: '#ff4444', border: 'none' }}>✖</button>
                                </div>
                            ))}
                        </div>

                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <h3 style={{ color: 'white', margin: 0 }}>Menü Ürünleri</h3>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={() => { setCategoryForm({ id: null, name: '', color_code: '#F3D431' }); setShowCategoryModal(true); }} style={{ width: 'auto', backgroundColor: '#333', color: 'white', padding: '10px 20px', borderRadius: '6px' }}>+ KATEGORİ</button>
                                    <button onClick={() => { setProductForm({ id: null, name: '', price: '', category_id: selectedCategoryFilter !== 'all' ? selectedCategoryFilter : '' }); setShowProductModal(true); }} style={{ width: 'auto', backgroundColor: 'var(--primary-color)', color: '#000', padding: '10px 20px', borderRadius: '6px' }}>+ ÜRÜN</button>
                                </div>
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#111', borderRadius: '12px', overflow: 'hidden' }}>
                                <thead><tr style={{ backgroundColor: '#1a1a1a', textAlign: 'left', color: 'var(--text-muted)' }}><th style={{ padding: '15px' }}>ÜRÜN ADI</th><th style={{ padding: '15px' }}>FİYAT</th><th style={{ padding: '15px', textAlign: 'right' }}>İŞLEM</th></tr></thead>
                                <tbody>
                                    {products.filter(prod => selectedCategoryFilter === 'all' || prod.category_id === selectedCategoryFilter).map(prod => (
                                        <tr key={prod.id} style={{ borderBottom: '1px solid #222' }}>
                                            <td style={{ padding: '15px', fontWeight: 'bold', color: 'white' }}>{prod.name}</td>
                                            <td style={{ padding: '15px', color: 'var(--primary-color)' }}>₺{parseFloat(prod.price).toFixed(2)}</td>
                                            <td style={{ padding: '15px', textAlign: 'right' }}>
                                                <button onClick={() => { setProductForm(prod); setShowProductModal(true); }} style={{ width: 'auto', background: 'none', color: 'var(--primary-color)', border: 'none', padding: '0 10px' }}>DÜZENLE</button>
                                                <button onClick={() => del(`http://localhost:5000/api/products/${prod.id}`)} style={{ width: 'auto', background: 'none', color: '#ff4444', border: 'none', padding: '0' }}>SİL</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* --- REÇETE SEKMESİ --- */}
                {activeTab === 'recipes' && (
                    <div style={{ display: 'flex', gap: '30px' }}>
                        <div style={{ flex: 1, backgroundColor: '#111', padding: '25px', borderRadius: '12px' }}>
                            <h3 style={{ color: 'var(--primary-color)', marginTop: 0 }}>🔬 Formül Masası</h3>
                            <select value={selectedRecipeProduct} onChange={(e) => setSelectedRecipeProduct(e.target.value)} style={{ width: '100%', padding: '15px', backgroundColor: '#222', border: '1px solid #444', color: 'white', borderRadius: '6px', marginBottom: '20px' }}>
                                <option value="">-- Ürün Seç --</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            {selectedRecipeProduct && (
                                <form onSubmit={handleRecipeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <select required value={recipeForm.ingredient_id} onChange={(e) => setRecipeForm({ ...recipeForm, ingredient_id: e.target.value })} style={{ padding: '15px', backgroundColor: '#222', border: '1px solid #444', color: 'white', borderRadius: '6px' }}>
                                        <option value="">-- Hammadde --</option>
                                        {ingredients.map(ing => <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>)}
                                    </select>
                                    <input type="number" step="0.01" placeholder="Miktar (Örn: 5)" required value={recipeForm.amount_used} onChange={(e) => setRecipeForm({ ...recipeForm, amount_used: e.target.value })} style={{ padding: '15px', backgroundColor: '#222', border: '1px solid #444', color: 'white', margin: 0 }} />
                                    <button type="submit" style={{ backgroundColor: 'var(--primary-color)', color: '#000', padding: '15px' }}>+ EKLE</button>
                                </form>
                            )}
                        </div>
                        <div style={{ flex: 2, backgroundColor: '#111', padding: '25px', borderRadius: '12px' }}>
                            <h3 style={{ color: 'white', marginTop: 0 }}>Mevcut Formül</h3>
                            {currentRecipe.length === 0 ? <p style={{ color: '#555' }}>Reçete boş.</p> : (
                                <table style={{ width: '100%', backgroundColor: '#1a1a1a', borderRadius: '8px' }}>
                                    <tbody>
                                        {currentRecipe.map(ing => (
                                            <tr key={ing.id} style={{ borderBottom: '1px solid #222' }}>
                                                <td style={{ padding: '15px', fontWeight: 'bold' }}>{ing.name}</td>
                                                <td style={{ padding: '15px', color: '#ff4444' }}>- {parseFloat(ing.Recipe.amount_used).toFixed(2)} {ing.unit}</td>
                                                <td style={{ padding: '15px', textAlign: 'right' }}>
                                                    <button onClick={async () => { if (window.confirm('Sileyim mi?')) { await axios.delete(`http://localhost:5000/api/recipes/${selectedRecipeProduct}/${ing.id}`); fetchRecipe(selectedRecipeProduct); } }} style={{ width: 'auto', background: 'none', color: '#ff4444', border: 'none' }}>✖ SİL</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* --- MODALLAR --- */}
            {showIngredientModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: '#111', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '400px' }}>
                        <h2 style={{ color: 'white' }}>{ingredientForm.id ? 'Hammadde Düzenle' : 'Yeni Stok Ekle'}</h2>
                        <form onSubmit={handleIngredientSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <input type="text" placeholder="Adı" required value={ingredientForm.name} onChange={(e) => setIngredientForm({ ...ingredientForm, name: e.target.value })} style={{ margin: 0 }} />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input type="number" step="0.01" placeholder="Stok" required value={ingredientForm.stock_amount} onChange={(e) => setIngredientForm({ ...ingredientForm, stock_amount: e.target.value })} style={{ margin: 0 }} />
                                <select value={ingredientForm.unit} onChange={(e) => setIngredientForm({ ...ingredientForm, unit: e.target.value })} style={{ padding: '15px', backgroundColor: '#222', border: '1px solid #333', color: 'white' }}><option value="cl">cl</option><option value="adet">adet</option><option value="kg">kg</option><option value="gr">gr</option><option value="lt">lt</option></select>
                            </div>
                            <input type="number" step="0.01" placeholder="Kritik Seviye" required value={ingredientForm.critical_level} onChange={(e) => setIngredientForm({ ...ingredientForm, critical_level: e.target.value })} style={{ margin: 0 }} />
                            <div style={{ display: 'flex', gap: '10px' }}><button type="button" onClick={() => setShowIngredientModal(false)} style={{ backgroundColor: '#333', color: 'white' }}>İPTAL</button><button type="submit">KAYDET</button></div>
                        </form>
                    </div>
                </div>
            )}

            {showCategoryModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: '#111', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '400px' }}>
                        <h2 style={{ color: 'white' }}>{categoryForm.id ? 'Kategori Düzenle' : 'Yeni Kategori'}</h2>
                        <form onSubmit={handleCategorySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <input type="text" required value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} style={{ margin: 0 }} />
                            <input type="color" value={categoryForm.color_code} onChange={(e) => setCategoryForm({ ...categoryForm, color_code: e.target.value })} style={{ width: '100%', height: '50px', cursor: 'pointer', background: 'none', border: 'none', margin: 0 }} />
                            <div style={{ display: 'flex', gap: '10px' }}><button type="button" onClick={() => setShowCategoryModal(false)} style={{ backgroundColor: '#333', color: 'white' }}>İPTAL</button><button type="submit">KAYDET</button></div>
                        </form>
                    </div>
                </div>
            )}

            {showProductModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: '#111', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '400px' }}>
                        <h2 style={{ color: 'white' }}>{productForm.id ? 'Ürün Düzenle' : 'Yeni Ürün'}</h2>
                        <form onSubmit={handleProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <select required value={productForm.category_id} onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })} style={{ padding: '15px', backgroundColor: '#222', border: '1px solid #333', color: 'white' }}>
                                <option value="">Kategori Seç</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <input type="text" placeholder="Ürün Adı" required value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} style={{ margin: 0 }} />
                            <input type="number" step="0.01" placeholder="Fiyat" required value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} style={{ margin: 0 }} />
                            <div style={{ display: 'flex', gap: '10px' }}><button type="button" onClick={() => setShowProductModal(false)} style={{ backgroundColor: '#333', color: 'white' }}>İPTAL</button><button type="submit">KAYDET</button></div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default MenuManagement;