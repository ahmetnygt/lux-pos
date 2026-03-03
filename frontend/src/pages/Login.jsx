import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    const [userPin, setUserPin] = useState('');
    const [passPin, setPassPin] = useState('');
    const [activeField, setActiveField] = useState('user');
    const navigate = useNavigate();

    const handleNumpad = useCallback((num) => {
        if (activeField === 'user') {
            if (userPin.length < 4) {
                const newPin = userPin + num;
                setUserPin(newPin);
                if (newPin.length === 4) setActiveField('pass');
            }
        } else {
            if (passPin.length < 4) setPassPin(prev => prev + num);
        }
    }, [activeField, userPin, passPin]);

    const handleDelete = useCallback(() => {
        if (activeField === 'user') setUserPin(prev => prev.slice(0, -1));
        else setPassPin(prev => prev.slice(0, -1));
    }, [activeField]);

    const handleClear = useCallback(() => {
        if (activeField === 'user') setUserPin('');
        else setPassPin('');
    }, [activeField]);

    const handleLogin = useCallback(async () => {
        if (userPin.length !== 4 || passPin.length !== 4) {
            alert('PIN kodları 4 haneli olmalıdır!');
            return;
        }

        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', {
                user_pin: userPin,
                pass_pin: passPin
            });

            localStorage.setItem('lux_user', JSON.stringify(res.data));

            if (res.data.role === 'Garson') navigate('/garson');
            else if (res.data.role === 'Kasa') navigate('/pos');
            else navigate('/dashboard');

        } catch (err) {
            alert('Hatalı PIN! Tekrar dene.', err);
            setUserPin('');
            setPassPin('');
            setActiveField('user');
        }
    }, [userPin, passPin, navigate]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (/^[0-9]$/.test(e.key)) handleNumpad(e.key);
            else if (e.key === 'Backspace') handleDelete();
            else if (e.key === 'Escape' || e.key === 'Delete' || e.key === 'Clear') handleClear();
            else if (e.key === 'Enter') handleLogin();
            else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') setActiveField('pass');
            else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') setActiveField('user');
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleNumpad, handleDelete, handleClear, handleLogin]);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'radial-gradient(circle at center, #1a1a1a 0%, #000000 100%)',
            padding: '20px',
            boxSizing: 'border-box',
            fontFamily: 'sans-serif'
        }}>

            {/* SİSTEM BİLGİSİ: Responsive tasarım için içine CSS Media Query gömdük */}
            <style>
                {`
          .login-container {
            display: flex;
            flex-direction: row;
            background-color: #0a0a0a;
            padding: 40px;
            border-radius: 16px;
            box-shadow: 0 15px 50px rgba(0,0,0,0.8);
            width: 100%;
            max-width: 800px; /* PC'de yan yana durması için genişlettik */
            border: 1px solid #222;
            border-top: 4px solid var(--primary-color);
            gap: 40px;
          }
          .login-left {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .login-right {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .divider {
            width: 1px;
            background-color: #333;
          }
          /* MOBİL EKRANLAR İÇİN */
          @media (max-width: 768px) {
            .login-container {
              flex-direction: column;
              max-width: 400px;
              padding: 30px 20px;
              gap: 20px;
            }
            .divider {
              display: none; /* Mobilde aradaki çizgiyi yok et */
            }
          }
        `}
            </style>

            <div className="login-container">

                {/* SOL TARAF: Logolar ve PIN Kutuları */}
                <div className="login-left">
                    <div style={{ textAlign: 'center', marginBottom: '35px' }}>
                        <h1 style={{ color: 'var(--primary-color)', margin: 0, fontSize: '32px', letterSpacing: '2px' }}>LUX CLUB</h1>
                        <span style={{ color: 'var(--text-muted)', fontSize: '12px', letterSpacing: '4px' }}>SİSTEM GİRİŞİ</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
                        <div
                            onClick={() => setActiveField('user')}
                            style={{
                                padding: '15px', backgroundColor: '#111',
                                border: `2px solid ${activeField === 'user' ? 'var(--primary-color)' : '#222'}`,
                                borderRadius: '8px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '5px' }}>KULLANICI PİN</div>
                            <div style={{ fontSize: '32px', color: 'var(--primary-color)', letterSpacing: '12px', fontWeight: 'bold', height: '38px' }}>
                                {userPin.padEnd(4, '•')}
                            </div>
                        </div>

                        <div
                            onClick={() => setActiveField('pass')}
                            style={{
                                padding: '15px', backgroundColor: '#111',
                                border: `2px solid ${activeField === 'pass' ? '#ff4444' : '#222'}`,
                                borderRadius: '8px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '5px' }}>ŞİFRE PİN</div>
                            <div style={{ fontSize: '32px', color: '#ff4444', letterSpacing: '12px', fontWeight: 'bold', height: '38px' }}>
                                {'*'.repeat(passPin.length).padEnd(4, '•')}
                            </div>
                        </div>
                    </div>

                    {/* Mobilde alta, PC'de sola yaslanacak SİSTEME GİR butonu */}
                    <button
                        onClick={handleLogin}
                        style={{ width: '100%', padding: '18px', backgroundColor: 'var(--primary-color)', color: '#000', fontSize: '18px', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', letterSpacing: '1px' }}
                    >
                        SİSTEME GİR
                    </button>
                </div>

                {/* ORTA ÇİZGİ (Sadece PC'de görünür) */}
                <div className="divider"></div>

                {/* SAĞ TARAF: Numpad (Mobilde Alta İner) */}
                <div className="login-right">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                            <button
                                key={num}
                                onClick={() => handleNumpad(num.toString())}
                                style={{ padding: '15px', fontSize: '24px', fontWeight: 'bold', backgroundColor: '#1a1a1a', color: 'white', border: '1px solid #333', borderRadius: '8px', cursor: 'pointer' }}
                            >
                                {num}
                            </button>
                        ))}
                        <button onClick={handleClear} style={{ padding: '15px', fontSize: '20px', fontWeight: 'bold', backgroundColor: '#2a1111', color: '#ff4444', border: '1px solid #442222', borderRadius: '8px', cursor: 'pointer' }}>C</button>
                        <button onClick={() => handleNumpad('0')} style={{ padding: '15px', fontSize: '24px', fontWeight: 'bold', backgroundColor: '#1a1a1a', color: 'white', border: '1px solid #333', borderRadius: '8px', cursor: 'pointer' }}>0</button>
                        <button onClick={handleDelete} style={{ padding: '15px', fontSize: '20px', fontWeight: 'bold', backgroundColor: '#222', color: 'white', border: '1px solid #444', borderRadius: '8px', cursor: 'pointer' }}>⌫</button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Login;