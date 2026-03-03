import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logoImg from '../assets/logo.png';

const PersonnelManagement = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ id: null, name: '', surname: '', user_pin: '', pass_pin: '', role: 'Garson' });
    const [errorMsg, setErrorMsg] = useState('');

    const fetchUsers = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/users');
            setUsers(res.data);
        } catch (err) { console.error('Personel çekilemedi', err); }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (form.user_pin.length !== 4 || form.pass_pin.length !== 4) {
            setErrorMsg('PIN kodları tam 4 haneli olmak zorundadır!');
            return;
        }

        try {
            if (form.id) await axios.put(`http://localhost:5000/api/users/${form.id}`, form);
            else await axios.post('http://localhost:5000/api/users', form);

            setShowModal(false);
            setForm({ id: null, name: '', surname: '', user_pin: '', pass_pin: '', role: 'Garson' });
            fetchUsers();
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'İşlem başarısız oldu!');
        }
    };

    const handleDelete = async (id, role) => {
        if (role === 'Admin') {
            alert('Patron hesabını silemezsin amk, mekanı kime bırakıyorsun?');
            return;
        }
        if (window.confirm('Bu personeli harbi kovuyoruz, emin misin?')) {
            try {
                await axios.delete(`http://localhost:5000/api/users/${id}`);
                fetchUsers();
            } catch (err) { alert('Silinemedi!'); }
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: 'white', position: 'relative' }}>
            <div style={{ backgroundColor: '#111', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--primary-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <img src={logoImg} alt="Lux Logo" style={{ height: '35px' }} />
                    <h2 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '20px', letterSpacing: '2px' }}>İNSAN KAYNAKLARI</h2>
                </div>
                <button onClick={() => navigate('/dashboard')} style={{ width: 'auto', backgroundColor: 'transparent', color: 'white', border: '1px solid #333', padding: '10px 20px', borderRadius: '8px' }}>PANELE DÖN</button>
            </div>

            <div style={{ padding: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                    <h3 style={{ color: 'white', margin: 0 }}>Mekan Personel Listesi</h3>
                    <button onClick={() => { setForm({ id: null, name: '', surname: '', user_pin: '', pass_pin: '', role: 'Garson' }); setShowModal(true); }} style={{ width: 'auto', backgroundColor: 'var(--primary-color)', color: '#000', padding: '12px 25px', borderRadius: '6px', fontWeight: 'bold' }}>
                        + YENİ PERSONEL İŞE AL
                    </button>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#111', borderRadius: '12px', overflow: 'hidden' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#1a1a1a', textAlign: 'left', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '15px' }}>AD SOYAD</th>
                            <th style={{ padding: '15px' }}>YETKİ</th>
                            <th style={{ padding: '15px' }}>KULLANICI PİN</th>
                            <th style={{ padding: '15px' }}>ŞİFRE PİN</th>
                            <th style={{ padding: '15px', textAlign: 'right' }}>İŞLEM</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id} style={{ borderBottom: '1px solid #222' }}>
                                <td style={{ padding: '15px', fontWeight: 'bold' }}>{u.name} {u.surname}</td>
                                <td style={{ padding: '15px' }}>
                                    <span style={{
                                        padding: '5px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                                        backgroundColor: u.role === 'Admin' ? 'rgba(243, 212, 49, 0.1)' : u.role === 'Kasa' ? 'rgba(0, 255, 204, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                                        color: u.role === 'Admin' ? 'var(--primary-color)' : u.role === 'Kasa' ? '#00ffcc' : '#fff'
                                    }}>{u.role}</span>
                                </td>
                                <td style={{ padding: '15px', color: 'var(--primary-color)', letterSpacing: '2px', fontWeight: 'bold' }}>{u.user_pin}</td>
                                <td style={{ padding: '15px', color: '#ff4444', letterSpacing: '2px', fontWeight: 'bold' }}>{u.pass_pin}</td>
                                <td style={{ padding: '15px', textAlign: 'right' }}>
                                    <button onClick={() => { setForm(u); setShowModal(true); }} style={{ width: 'auto', background: 'none', color: 'var(--primary-color)', border: 'none', padding: '0 10px', fontWeight: 'bold' }}>DÜZENLE</button>
                                    <button onClick={() => handleDelete(u.id, u.role)} style={{ width: 'auto', background: 'none', color: '#ff4444', border: 'none', padding: '0', fontWeight: 'bold' }}>KOV (SİL)</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL */}
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: '#111', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '500px', borderTop: '4px solid var(--primary-color)' }}>
                        <h2 style={{ color: 'white', marginTop: 0, marginBottom: '20px' }}>{form.id ? 'Personel Düzenle' : 'Yeni Personel Kaydı'}</h2>

                        {errorMsg && <div style={{ backgroundColor: 'rgba(255,68,68,0.1)', color: '#ff4444', padding: '10px', borderRadius: '6px', marginBottom: '15px', border: '1px solid #ff4444', fontSize: '14px', textAlign: 'center' }}>{errorMsg}</div>}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input type="text" placeholder="Adı" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ margin: 0, flex: 1 }} />
                                <input type="text" placeholder="Soyadı" required value={form.surname} onChange={(e) => setForm({ ...form, surname: e.target.value })} style={{ margin: 0, flex: 1 }} />
                            </div>

                            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={{ padding: '15px', backgroundColor: '#222', border: '1px solid #333', color: 'white', borderRadius: '6px', outline: 'none' }}>
                                <option value="Garson">Saha Personeli (Garson)</option>
                                <option value="Kasa">Kasa Görevlisi</option>
                                <option value="Admin">Mekan Yöneticisi (Patron)</option>
                            </select>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '12px', marginBottom: '5px' }}>Kullanıcı PIN (Sisteme Giriş)</label>
                                    <input type="text" maxLength="4" pattern="\d{4}" placeholder="Örn: 1903" required value={form.user_pin} onChange={(e) => setForm({ ...form, user_pin: e.target.value.replace(/\D/g, '') })} style={{ margin: 0, color: 'var(--primary-color)', fontWeight: 'bold', letterSpacing: '2px', textAlign: 'center' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '12px', marginBottom: '5px' }}>Şifre PIN (Güvenlik)</label>
                                    <input type="text" maxLength="4" pattern="\d{4}" placeholder="Örn: 1453" required value={form.pass_pin} onChange={(e) => setForm({ ...form, pass_pin: e.target.value.replace(/\D/g, '') })} style={{ margin: 0, color: '#ff4444', fontWeight: 'bold', letterSpacing: '2px', textAlign: 'center' }} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ backgroundColor: '#333', color: 'white' }}>İPTAL</button>
                                <button type="submit">KAYDET</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PersonnelManagement;